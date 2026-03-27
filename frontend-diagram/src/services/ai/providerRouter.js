import { AI_PROVIDERS } from '../../config/models'
import { generateWithGemini } from './providers/geminiClient'
import { generateWithOllama } from './providers/ollamaClient'
import { createFailureResult } from './types'

export async function generateDiagram({
  provider,
  prompt,
  diagramType,
  model,
  baseUrl,
  signal,
}) {
  if (!prompt || prompt.trim().length < 10) {
    return createFailureResult('Prompt must be at least 10 characters.')
  }

  if (provider === AI_PROVIDERS.GEMINI) {
    return generateWithGemini({ prompt, diagramType, model, signal })
  }

  if (provider === AI_PROVIDERS.OLLAMA) {
    return generateWithOllama({ prompt, diagramType, model, baseUrl, signal })
  }

  return createFailureResult(`Unsupported provider: ${provider}`)
}
