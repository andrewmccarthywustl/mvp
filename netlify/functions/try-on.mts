import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

const MODEL = 'gemini-3.1-flash-image-preview'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`
const TRY_ON_CAP = Number(process.env.TRY_ON_CAP ?? '10')
const TRY_ON_IP_CAP = Number(process.env.TRY_ON_IP_CAP ?? '10')
const TRY_ON_COOKIE = 'tryon_usage'
const TRY_ON_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365
const ipTryOnCounts = new Map<string, number>()

type TryOnUsageState = {
  userId: string
  count: number
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {}

  return cookieHeader.split(';').reduce<Record<string, string>>((acc, pair) => {
    const [rawName, ...rawValueParts] = pair.trim().split('=')
    if (!rawName || rawValueParts.length === 0) return acc
    acc[rawName] = rawValueParts.join('=')
    return acc
  }, {})
}

function signUsagePayload(payloadBase64: string, secret: string): string {
  return createHmac('sha256', secret).update(payloadBase64).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer)
}

function readUsageCookie(cookieHeader: string | undefined, secret: string): TryOnUsageState {
  const rawCookie = parseCookies(cookieHeader)[TRY_ON_COOKIE]
  if (!rawCookie) {
    return { userId: randomUUID(), count: 0 }
  }

  const [payloadBase64, signature] = rawCookie.split('.')
  if (!payloadBase64 || !signature) {
    return { userId: randomUUID(), count: 0 }
  }

  const expectedSignature = signUsagePayload(payloadBase64, secret)
  if (!safeEqual(signature, expectedSignature)) {
    return { userId: randomUUID(), count: 0 }
  }

  try {
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8')
    const payload = JSON.parse(payloadJson) as Partial<TryOnUsageState>
    const parsedCount = Number(payload.count)
    if (!payload.userId || !Number.isFinite(parsedCount) || parsedCount < 0) {
      return { userId: randomUUID(), count: 0 }
    }

    return {
      userId: payload.userId,
      count: Math.floor(parsedCount),
    }
  } catch {
    return { userId: randomUUID(), count: 0 }
  }
}

function buildUsageCookie(state: TryOnUsageState, secret: string, secure: boolean): string {
  const payloadBase64 = Buffer.from(JSON.stringify(state), 'utf8').toString('base64url')
  const signature = signUsagePayload(payloadBase64, secret)
  const secureDirective = secure ? '; Secure' : ''
  return `${TRY_ON_COOKIE}=${payloadBase64}.${signature}; Max-Age=${TRY_ON_COOKIE_MAX_AGE_SECONDS}; Path=/; HttpOnly; SameSite=Lax${secureDirective}`
}

function jsonResponse(body: Record<string, unknown>, status: number, cookie?: string): Response {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cookie) headers['Set-Cookie'] = cookie
  return new Response(JSON.stringify(body), { status, headers })
}

function normalizeIp(ip?: string): string {
  if (!ip) return 'unknown'
  return ip.replace(/^::ffff:/, '').trim()
}

function getClientIp(request: Request): string {
  const netlifyIp = request.headers.get('x-nf-client-connection-ip')
  if (netlifyIp) return normalizeIp(netlifyIp)

  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return normalizeIp(first)
  }

  return 'unknown'
}

export default async (request: Request) => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY
  if (!GEMINI_API_KEY) {
    return jsonResponse({ error: 'GEMINI_API_KEY is not configured' }, 500)
  }

  const { dressImagePath, personImageBase64 } = await request.json() as {
    dressImagePath: string
    personImageBase64?: string
  }

  if (!dressImagePath) {
    return jsonResponse({ error: 'dressImagePath is required' }, 400)
  }

  const usageState = readUsageCookie(request.headers.get('cookie') ?? undefined, GEMINI_API_KEY)
  const isSecureRequest = new URL(request.url).protocol === 'https:'
  const clientIp = getClientIp(request)
  const ipUsed = ipTryOnCounts.get(clientIp) ?? 0

  if (ipUsed >= TRY_ON_IP_CAP) {
    return jsonResponse({
      error: `IP limit reached. This IP can run up to ${TRY_ON_IP_CAP} try-ons.`,
      ip: clientIp,
      limit: TRY_ON_IP_CAP,
      used: ipUsed,
      remaining: 0,
    }, 429, buildUsageCookie(usageState, GEMINI_API_KEY, isSecureRequest))
  }

  if (usageState.count >= TRY_ON_CAP) {
    return jsonResponse({
      error: `Try-on limit reached. Each user can run up to ${TRY_ON_CAP} try-ons.`,
      limit: TRY_ON_CAP,
      used: usageState.count,
      remaining: 0,
    }, 429, buildUsageCookie(usageState, GEMINI_API_KEY, isSecureRequest))
  }

  const siteOrigin = new URL(request.url).origin

  // Fetch dress image from the site's own CDN
  const dressResponse = await fetch(`${siteOrigin}${dressImagePath}`)
  if (!dressResponse.ok) {
    return jsonResponse({ error: `Dress image not found: ${dressImagePath}` }, 404)
  }
  const dressBuffer = await dressResponse.arrayBuffer()
  const dressBase64 = Buffer.from(dressBuffer).toString('base64')
  const dressMime = dressImagePath.endsWith('.jpg') || dressImagePath.endsWith('.jpeg')
    ? 'image/jpeg'
    : 'image/png'

  let personBase64: string
  let personMime: string

  if (personImageBase64) {
    personBase64 = personImageBase64
    personMime = 'image/jpeg'
  } else {
    const personResponse = await fetch(`${siteOrigin}/sample-image.jpg`)
    if (!personResponse.ok) {
      return jsonResponse({ error: 'Sample person image not found' }, 404)
    }
    const personBuffer = await personResponse.arrayBuffer()
    personBase64 = Buffer.from(personBuffer).toString('base64')
    personMime = 'image/jpeg'
  }

  const prompt = 'Put this dress on this person. Generate a photorealistic image of this person wearing this dress. Keep the person\'s pose, body, and background the same. Only change their outfit to the dress shown.'

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: personMime,
              data: personBase64,
            },
          },
          {
            inlineData: {
              mimeType: dressMime,
              data: dressBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: '3:4',
      },
    },
  }

  const updatedUsageState: TryOnUsageState = {
    userId: usageState.userId,
    count: usageState.count + 1,
  }
  ipTryOnCounts.set(clientIp, ipUsed + 1)
  const usageCookie = buildUsageCookie(updatedUsageState, GEMINI_API_KEY, isSecureRequest)

  try {
    const response = await fetch(`${ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      return jsonResponse({ error: 'Gemini API request failed', details: errorText }, response.status, usageCookie)
    }

    const data = await response.json()

    const parts = data.candidates?.[0]?.content?.parts
    if (!parts) {
      return jsonResponse({ error: 'No content in Gemini response' }, 500, usageCookie)
    }

    const imagePart = parts.find((p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData)
    if (!imagePart?.inlineData) {
      return jsonResponse({ error: 'No image in Gemini response' }, 500, usageCookie)
    }

    const { mimeType, data: imageData } = imagePart.inlineData
    return jsonResponse({
      image: `data:${mimeType};base64,${imageData}`,
      usage: {
        limit: TRY_ON_CAP,
        used: updatedUsageState.count,
        remaining: Math.max(TRY_ON_CAP - updatedUsageState.count, 0),
      },
    }, 200, usageCookie)
  } catch (err) {
    console.error('Try-on error:', err)
    return jsonResponse({ error: 'Internal server error' }, 500, usageCookie)
  }
}
