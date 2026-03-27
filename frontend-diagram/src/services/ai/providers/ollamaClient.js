import { OLLAMA_FALLBACK_MODELS } from '../../../config/models'
import { buildDiagramPrompt } from '../promptBuilder'
import { createFailureResult, createSuccessResult } from '../types'

export async function fetchOllamaModels(baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/tags`)

    if (!response.ok) {
      throw new Error(`Failed to list Ollama models (${response.status})`)
    }

    const data = await response.json()
    const modelNames = (data.models || []).map((model) => model.name).filter(Boolean)

    if (modelNames.length === 0) {
      return {
        models: OLLAMA_FALLBACK_MODELS,
        warning: 'No installed Ollama models found. Using fallback list.',
      }
    }

    return { models: modelNames, warning: null }
  } catch (error) {
    return {
      models: OLLAMA_FALLBACK_MODELS,
      warning:
        'Could not reach Ollama model list. Ensure Ollama is running locally, then retry.',
      details: error.message,
    }
  }
}

export async function generateWithOllama({
  prompt,
  diagramType,
  model,
  baseUrl,
  signal,
}) {
  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: buildDiagramPrompt(prompt, diagramType),
        stream: false,
      }),
      signal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      return createFailureResult('Ollama generation failed.', {
        status: response.status,
        response: errorText,
      })
    }

    const data = await response.json()
    return createSuccessResult(data.response || '', diagramType)
  } catch (error) {
    return createFailureResult(
      'Could not connect to Ollama. Start Ollama and verify the base URL.',
      error.message,
    )
  }
}
