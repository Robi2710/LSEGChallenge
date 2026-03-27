import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import ProviderModelSelector from './components/ProviderModelSelector'
import SvgRenderer from './components/SvgRenderer'
import {
  AI_PROVIDERS,
  DEFAULT_OLLAMA_BASE_URL,
  DEFAULT_PROVIDER,
  GEMINI_DEFAULT_MODELS,
  OLLAMA_FALLBACK_MODELS,
  getDefaultModelForProvider,
} from './config/models'
import { generateDiagram } from './services/ai/providerRouter'
import { fetchOllamaModels } from './services/ai/providers/ollamaClient'
import { extractFencedDiagram } from './utils/parser'

function getSavedProvider() {
  const savedProvider = localStorage.getItem('diagram-provider')

  if (savedProvider && Object.values(AI_PROVIDERS).includes(savedProvider)) {
    return savedProvider
  }

  return DEFAULT_PROVIDER
}

function getSavedModel(initialProvider) {
  const savedModel = localStorage.getItem('diagram-model')

  if (savedModel) {
    return savedModel
  }

  return getDefaultModelForProvider(initialProvider)
}

function App() {
  const [prompt, setPrompt] = useState(
    'Draw a simple architecture with frontend, backend, and database boxes connected by arrows.',
  )
  const [provider, setProvider] = useState(getSavedProvider)
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState(DEFAULT_OLLAMA_BASE_URL)
  const [ollamaModels, setOllamaModels] = useState(OLLAMA_FALLBACK_MODELS)
  const [modelWarning, setModelWarning] = useState('')
  const [model, setModel] = useState(() => getSavedModel(getSavedProvider()))

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rawResponse, setRawResponse] = useState('')
  const [parsedCode, setParsedCode] = useState('')

  const abortRef = useRef(null)

  const availableModels = useMemo(() => {
    if (provider === AI_PROVIDERS.GEMINI) {
      return GEMINI_DEFAULT_MODELS
    }

    return ollamaModels
  }, [ollamaModels, provider])

  const trimmedPromptLength = prompt.trim().length
  const canGenerate = !loading && trimmedPromptLength >= 10

  const previewStatus = loading
    ? 'rendering'
    : error
      ? 'error'
      : parsedCode
        ? 'success'
        : 'empty'

  const previewStatusLabel =
    previewStatus === 'rendering'
      ? 'Generating'
      : previewStatus === 'error'
        ? 'Needs attention'
        : previewStatus === 'success'
          ? 'Ready'
          : 'Idle'


  useEffect(() => {
    localStorage.setItem('diagram-provider', provider)
    localStorage.setItem('diagram-model', model)
  }, [provider, model])

  useEffect(() => {
    if (provider !== AI_PROVIDERS.OLLAMA) {
      return
    }

    let isMounted = true

    async function loadModels() {
      const response = await fetchOllamaModels(ollamaBaseUrl)

      if (!isMounted) {
        return
      }

      setOllamaModels(response.models)
      setModelWarning(response.warning || '')

      if (!response.models.includes(model)) {
        setModel(response.models[0])
      }
    }

    loadModels()

    return () => {
      isMounted = false
    }
  }, [provider, ollamaBaseUrl, model])

  function resetOutput() {
    setError('')
    setRawResponse('')
    setParsedCode('')
  }

  async function handleGenerate() {
    resetOutput()
    setLoading(true)

    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    const result = await generateDiagram({
      provider,
      prompt,
      diagramType: 'svg',
      model,
      baseUrl: ollamaBaseUrl,
      signal: controller.signal,
    })

    if (!result.ok) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    setRawResponse(result.raw)

    const parsed = extractFencedDiagram(result.raw, 'svg')

    if (!parsed.ok) {
      setError(parsed.error)
      setLoading(false)
      return
    }

    setParsedCode(parsed.code)
    setLoading(false)
  }

  function handleProviderChange(nextProvider) {
    setProvider(nextProvider)
    setModel(getDefaultModelForProvider(nextProvider))
  }

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">AI Diagram Studio</p>
          <h1>SVG Diagram Generator</h1>
          <p>Prompt a model, parse fenced SVG output, and preview the final diagram.</p>
        </div>

        <div className="header-badges" aria-label="Current session information">
          <span className="badge">Output: SVG</span>
          <span className="badge badge-provider">Provider: {provider}</span>
        </div>
      </header>

      <section className="workspace">
        <div className="panel panel-input">
          <div className="panel-section">
            <h2>1. Setup model</h2>
            <p>Choose your provider and model before generation.</p>

            <ProviderModelSelector
              provider={provider}
              onProviderChange={handleProviderChange}
              model={model}
              models={availableModels}
              onModelChange={setModel}
              ollamaBaseUrl={ollamaBaseUrl}
              onOllamaBaseUrlChange={setOllamaBaseUrl}
              modelWarning={modelWarning}
            />
          </div>

          <div className="panel-section panel-section-grow">
            <div className="section-heading">
              <h2>2. Describe the diagram</h2>
              <span>{trimmedPromptLength} chars</span>
            </div>

            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe your diagram request..."
            />

            <p className={trimmedPromptLength < 10 ? 'hint hint-warning' : 'hint'}>
              Use at least 10 characters so generation can start.
            </p>
          </div>

          <div className="actions">
            <button onClick={handleGenerate} disabled={!canGenerate}>
              {loading ? 'Generating...' : '3. Generate SVG'}
            </button>
            <button className="secondary" onClick={resetOutput} disabled={loading}>
              Clear Output
            </button>
          </div>
        </div>

        <div className="panel panel-preview">
          <div className="section-heading section-heading-preview">
            <div>
              <h2>Preview</h2>
              <p>Parsed SVG output is rendered live.</p>
            </div>
            <span className={`status-pill status-${previewStatus}`}>{previewStatusLabel}</span>
          </div>

          <SvgRenderer svgCode={parsedCode} status={previewStatus} error={error} />

          {rawResponse ? (
            <details className="raw-output" open={Boolean(error)}>
              <summary>Raw model response</summary>
              <pre>{rawResponse}</pre>
            </details>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export default App
