import type { Context } from "@netlify/functions"

const MODEL = 'gemini-3.1-flash-image-preview'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

export default async (request: Request, context: Context) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { dressImagePath, personImageBase64 } = await request.json() as {
    dressImagePath: string
    personImageBase64?: string
  }

  if (!dressImagePath) {
    return new Response(JSON.stringify({ error: 'dressImagePath is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const siteOrigin = new URL(request.url).origin

  // Fetch dress image from the site's own CDN
  const dressResponse = await fetch(`${siteOrigin}${dressImagePath}`)
  if (!dressResponse.ok) {
    return new Response(JSON.stringify({ error: `Dress image not found: ${dressImagePath}` }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
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
      return new Response(JSON.stringify({ error: 'Sample person image not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
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

  try {
    const response = await fetch(`${ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      return new Response(JSON.stringify({ error: 'Gemini API request failed', details: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()

    const parts = data.candidates?.[0]?.content?.parts
    if (!parts) {
      return new Response(JSON.stringify({ error: 'No content in Gemini response' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const imagePart = parts.find((p: { inlineData?: { mimeType: string; data: string } }) => p.inlineData)
    if (!imagePart?.inlineData) {
      return new Response(JSON.stringify({ error: 'No image in Gemini response' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { mimeType, data: imageData } = imagePart.inlineData
    return new Response(JSON.stringify({ image: `data:${mimeType};base64,${imageData}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Try-on error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
