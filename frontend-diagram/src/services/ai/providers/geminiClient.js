import { GoogleGenAI } from '@google/genai'
import { buildDiagramPrompt } from '../promptBuilder'
import { createFailureResult, createSuccessResult } from '../types'

function getGeminiClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    return {
      client: null,
      error: 'Missing VITE_GEMINI_API_KEY in frontend env configuration.',
    }
  }

  return {
    client: new GoogleGenAI({ apiKey }),
    error: null,
  }
}

export async function generateWithGemini({ prompt, diagramType, model, signal }) {
  const { client, error } = getGeminiClient()

  if (error || !client) {
    return createFailureResult(error || 'Gemini client is unavailable.')
  }

  try {
    const response = await client.models.generateContent({
      model,
      contents: buildDiagramPrompt(prompt, diagramType),
      config: {
        temperature: 0.2,
      },
      signal,
    })

    return createSuccessResult(response.text || '', diagramType)
  } catch (requestError) {
    return createFailureResult('Gemini generation failed.', requestError.message)
  }
}
