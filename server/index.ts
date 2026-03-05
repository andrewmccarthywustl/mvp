import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'

dotenv.config()

const app = express()
const PORT = 3001

app.set('trust proxy', true)
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const TRY_ON_CAP = Number(process.env.TRY_ON_CAP ?? '10')
const TRY_ON_IP_CAP = Number(process.env.TRY_ON_IP_CAP ?? '10')
const TRY_ON_COOKIE = 'tryon_usage'
const TRY_ON_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365
const MODEL = 'gemini-3.1-flash-image-preview'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`
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

function normalizeIp(ip?: string): string {
  if (!ip) return 'unknown'
  return ip.replace(/^::ffff:/, '').trim()
}

function getClientIp(forwardedFor: string | undefined, fallbackIp: string | undefined): string {
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return normalizeIp(first)
  }
  return normalizeIp(fallbackIp)
}

app.post('/api/try-on', async (req, res) => {
  if (!GEMINI_API_KEY) {
    res.status(500).json({ error: 'GEMINI_API_KEY is not configured' })
    return
  }

  const { dressImagePath, personImageBase64 } = req.body as {
    dressImagePath: string
    personImageBase64?: string
  }

  if (!dressImagePath) {
    res.status(400).json({ error: 'dressImagePath is required' })
    return
  }

  const usageState = readUsageCookie(req.headers.cookie, GEMINI_API_KEY)
  const isSecureRequest = req.secure || req.headers['x-forwarded-proto'] === 'https'
  const forwardedFor = typeof req.headers['x-forwarded-for'] === 'string' ? req.headers['x-forwarded-for'] : undefined
  const clientIp = getClientIp(forwardedFor, req.ip)
  const ipUsed = ipTryOnCounts.get(clientIp) ?? 0

  if (ipUsed >= TRY_ON_IP_CAP) {
    res.setHeader('Set-Cookie', buildUsageCookie(usageState, GEMINI_API_KEY, isSecureRequest))
    res.status(429).json({
      error: `IP limit reached. This IP can run up to ${TRY_ON_IP_CAP} try-ons.`,
      ip: clientIp,
      limit: TRY_ON_IP_CAP,
      used: ipUsed,
      remaining: 0,
    })
    return
  }

  if (usageState.count >= TRY_ON_CAP) {
    res.setHeader('Set-Cookie', buildUsageCookie(usageState, GEMINI_API_KEY, isSecureRequest))
    res.status(429).json({
      error: `Try-on limit reached. Each user can run up to ${TRY_ON_CAP} try-ons.`,
      limit: TRY_ON_CAP,
      used: usageState.count,
      remaining: 0,
    })
    return
  }

  const publicDir = path.resolve(process.cwd(), 'public')
  const dressPath = path.join(publicDir, dressImagePath)

  if (!fs.existsSync(dressPath)) {
    res.status(404).json({ error: `Dress image not found: ${dressImagePath}` })
    return
  }

  let personBase64: string
  let personMime: string

  if (personImageBase64) {
    personBase64 = personImageBase64
    personMime = 'image/jpeg'
  } else {
    const personPath = path.join(publicDir, 'sample-image.jpg')
    if (!fs.existsSync(personPath)) {
      res.status(404).json({ error: 'Sample person image not found' })
      return
    }
    personBase64 = fs.readFileSync(personPath).toString('base64')
    personMime = 'image/jpeg'
  }

  const dressBase64 = fs.readFileSync(dressPath).toString('base64')
  const dressMime = dressImagePath.endsWith('.jpg') || dressImagePath.endsWith('.jpeg')
    ? 'image/jpeg'
    : 'image/png'

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
  res.setHeader('Set-Cookie', usageCookie)

  try {
    const response = await fetch(`${ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      res.status(response.status).json({ error: 'Gemini API request failed', details: errorText })
      return
    }

    const data = await response.json()

    const parts = data.candidates?.[0]?.content?.parts
    if (!parts) {
      res.status(500).json({ error: 'No content in Gemini response' })
      return
    }

    const imagePart = parts.find((p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData)
    if (!imagePart?.inlineData) {
      res.status(500).json({ error: 'No image in Gemini response' })
      return
    }

    const { mimeType, data: imageData } = imagePart.inlineData
    res.json({
      image: `data:${mimeType};base64,${imageData}`,
      usage: {
        limit: TRY_ON_CAP,
        used: updatedUsageState.count,
        remaining: Math.max(TRY_ON_CAP - updatedUsageState.count, 0),
      },
    })
  } catch (err) {
    console.error('Try-on error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
