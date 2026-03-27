import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import ProviderModelSelector from './components/ProviderModelSelector'
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

function App() {
  const [prompt, setPrompt] = useState(
    'Draw a simple architecture with frontend, backend, and database boxes connected by arrows.',
  )
  const [provider, setProvider] = useState(DEFAULT_PROVIDER)
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState(DEFAULT_OLLAMA_BASE_URL)
  const [ollamaModels, setOllamaModels] = useState(OLLAMA_FALLBACK_MODELS)
  const [modelWarning, setModelWarning] = useState('')
  const [model, setModel] = useState(getDefaultModelForProvider(DEFAULT_PROVIDER))

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

  useEffect(() => {
    const savedProvider = localStorage.getItem('diagram-provider')
    const savedModel = localStorage.getItem('diagram-model')

    if (savedProvider && Object.values(AI_PROVIDERS).includes(savedProvider)) {
      setProvider(savedProvider)
    }

    if (savedModel) {
      setModel(savedModel)
    }
  }, [])

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
        <h1>Diagram Generator</h1>
        <p>Generate fenced SVG code using Gemini or local Ollama models.</p>
      </header>

      <section className="workspace">
        <div className="panel panel-input">
          <h2>Input</h2>
          <p>Describe the diagram and choose provider/model before generating.</p>

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

          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe your diagram request..."
          />

          <div className="actions">
            <button onClick={handleGenerate} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Diagram'}
            </button>
            <button className="secondary" onClick={resetOutput} disabled={loading}>
              Clear Output
            </button>
          </div>
        </div>

        <div className="panel panel-preview">
          <h2>Output</h2>
          <p>Parser output is shown below. SVG is rendered live.</p>

          {loading ? (
            <div className="render-state">
              <h3>Generating</h3>
              <p>Waiting for model response...</p>
            </div>
          ) : null}

          {!loading && error ? (
            <div className="render-state render-state-error">
              <h3>Generation Failed</h3>
              <p>{error}</p>
            </div>
          ) : null}

          {!loading && !error && !parsedCode ? (
            <div className="render-state">
              <h3>No diagram yet</h3>
              <p>Generate a diagram to preview parsed output.</p>
            </div>
          ) : null}

          {!loading && !error && parsedCode ? (
            <div className="svg-stage" dangerouslySetInnerHTML={{ __html: parsedCode }} />
          ) : null}

          {rawResponse ? (
            <details className="raw-output">
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
