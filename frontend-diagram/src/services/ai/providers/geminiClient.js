import { buildDiagramPrompt } from '../promptBuilder'
import { createFailureResult, createSuccessResult } from '../types'

export async function generateWithGemini({ prompt, diagramType, model, signal }) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    return createFailureResult('Missing VITE_GEMINI_API_KEY in env configuration.')
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: buildDiagramPrompt(prompt, diagramType),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
          },
        }),
        signal,
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg =
        errorData?.error?.message ||
        `Gemini API error: ${response.status} ${response.statusText}`
      return createFailureResult(errorMsg)
    }

    const data = await response.json()
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.text ||
      ''

    if (!text) {
      return createFailureResult('Gemini returned empty response.')
    }

    return createSuccessResult(text, diagramType)
  } catch (error) {
    if (error.name === 'AbortError') {
      return createFailureResult('Generation was cancelled.')
    }
    return createFailureResult('Gemini request failed: ' + error.message)
  }
}
