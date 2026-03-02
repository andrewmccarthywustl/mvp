import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const MODEL = 'gemini-3.1-flash-image-preview'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

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
    res.json({ image: `data:${mimeType};base64,${imageData}` })
  } catch (err) {
    console.error('Try-on error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
