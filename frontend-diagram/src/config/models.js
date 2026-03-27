export const AI_PROVIDERS = {
  GEMINI: 'gemini',
  OLLAMA: 'ollama',
}

export const GEMINI_DEFAULT_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
]

export const OLLAMA_FALLBACK_MODELS = ['qwen2.5:7b', 'qwen2.5:3b']

export const DEFAULT_OLLAMA_BASE_URL =
  import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434'

export const DEFAULT_PROVIDER =
  import.meta.env.VITE_DEFAULT_PROVIDER || AI_PROVIDERS.OLLAMA

export const DEFAULT_GEMINI_MODEL =
  import.meta.env.VITE_GEMINI_MODEL || GEMINI_DEFAULT_MODELS[0]

export const DEFAULT_OLLAMA_MODEL =
  import.meta.env.VITE_OLLAMA_MODEL || OLLAMA_FALLBACK_MODELS[0]

export function getDefaultModelForProvider(provider) {
  if (provider === AI_PROVIDERS.GEMINI) {
    return DEFAULT_GEMINI_MODEL
  }

  return DEFAULT_OLLAMA_MODEL
}
