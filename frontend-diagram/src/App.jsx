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
import {
  copySvgToClipboard,
  downloadSvg,
  generateDefaultFilename,
} from './utils/export'

const CHAT_STORAGE_KEY = 'diagram-chat-history'

function createMessage(role, content) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  }
}

function loadStoredChatHistory() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        (item.role === 'user' || item.role === 'assistant') &&
        typeof item.content === 'string',
    )
  } catch {
    return []
  }
}

function buildChatPrompt(messages, latestRequest, currentSvg) {
  const recent = messages.slice(-8)
  const conversation = recent
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join('\n')

  const svgContext = currentSvg
    ? [`Current SVG diagram to modify if user asks for changes:`, '```svg', currentSvg, '```'].join('\n')
    : 'No existing SVG diagram yet. Create a new one from the request.'

  return [
    'You are an SVG diagram assistant in a chat session.',
    'Use the conversation context and latest user request to produce one updated diagram.',
    'Return only one fenced ```svg block and no extra text.',
    '',
    'Conversation context:',
    conversation || 'No prior chat history.',
    '',
    svgContext,
    '',
    `Latest user request: ${latestRequest}`,
  ].join('\n')
}

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
<<<<<<< HEAD
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState(() => loadStoredChatHistory())
  const [provider, setProvider] = useState(DEFAULT_PROVIDER)
=======
  const [prompt, setPrompt] = useState(
    'Draw a simple architecture with frontend, backend, and database boxes connected by arrows.',
  )
  const [provider, setProvider] = useState(getSavedProvider)
>>>>>>> 242aeb79a0ebca65930f616a551aa96c85b706bf
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState(DEFAULT_OLLAMA_BASE_URL)
  const [ollamaModels, setOllamaModels] = useState(OLLAMA_FALLBACK_MODELS)
  const [modelWarning, setModelWarning] = useState('')
  const [model, setModel] = useState(() => getSavedModel(getSavedProvider()))

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rawResponse, setRawResponse] = useState('')
  const [parsedCode, setParsedCode] = useState('')
  const [outputFilename, setOutputFilename] = useState(generateDefaultFilename())
  const [feedback, setFeedback] = useState('')

  const abortRef = useRef(null)
  const feedbackTimeoutRef = useRef(null)
  const chatScrollRef = useRef(null)

  const availableModels = useMemo(() => {
    if (provider === AI_PROVIDERS.GEMINI) {
      return GEMINI_DEFAULT_MODELS
    }

    return ollamaModels
  }, [ollamaModels, provider])

  const trimmedPromptLength = prompt.trim().length
  const canGenerate = !loading && trimmedPromptLength >= 10

<<<<<<< HEAD
    if (savedProvider && Object.values(AI_PROVIDERS).includes(savedProvider)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProvider(savedProvider)
    }
=======
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
>>>>>>> 242aeb79a0ebca65930f616a551aa96c85b706bf


  useEffect(() => {
    localStorage.setItem('diagram-provider', provider)
    localStorage.setItem('diagram-model', model)
  }, [provider, model])

  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatMessages.slice(-60)))
  }, [chatMessages])

  useEffect(() => {
    if (!chatScrollRef.current) {
      return
    }

    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
  }, [chatMessages, loading])

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
    setOutputFilename(generateDefaultFilename())
    setFeedback('')
  }

  function showFeedback(message, duration = 2000) {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current)
    }

    setFeedback(message)
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback('')
    }, duration)
  }

  async function handleCopySvg() {
    if (!parsedCode) return
    const success = await copySvgToClipboard(parsedCode)
    if (success) {
      showFeedback('✓ SVG copied to clipboard!')
    } else {
      showFeedback('✗ Failed to copy SVG')
    }
  }

  function handleDownloadSvg() {
    if (!parsedCode) return
    const success = downloadSvg(parsedCode, outputFilename)
    if (success) {
      showFeedback(`✓ Downloaded as ${outputFilename}.svg`)
    } else {
      showFeedback('✗ Failed to download SVG')
    }
  }

  async function handleSendMessage() {
    const nextMessageContent = chatInput.trim()

    if (!nextMessageContent || loading) {
      return
    }

    setChatInput('')
    setError('')
    setFeedback('')
    setRawResponse('')
    setLoading(true)

    const userMessage = createMessage('user', nextMessageContent)
    const nextHistory = [...chatMessages, userMessage]
    setChatMessages(nextHistory)

    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    const prompt = buildChatPrompt(nextHistory, nextMessageContent, parsedCode)

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
      setChatMessages((prev) => [
        ...prev,
        createMessage('assistant', `Generation failed: ${result.error.message}`),
      ])
      setLoading(false)
      return
    }

    setRawResponse(result.raw)

    const parsed = extractFencedDiagram(result.raw, 'svg')

    if (!parsed.ok) {
      setError(parsed.error)
      setChatMessages((prev) => [...prev, createMessage('assistant', `Parse error: ${parsed.error}`)])
      setLoading(false)
      return
    }

    setParsedCode(parsed.code)
    setChatMessages((prev) => [
      ...prev,
      createMessage('assistant', 'Updated diagram generated. You can ask for further modifications.'),
    ])
    setLoading(false)
  }

  function clearChatHistory() {
    setChatMessages([])
  }

  function handleComposerKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
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
<<<<<<< HEAD
          <h2>Chat</h2>
          <p>Chat with the AI to create and refine your SVG diagram. History is saved locally.</p>
=======
          <div className="panel-section">
            <h2>1. Setup model</h2>
            <p>Choose your provider and model before generation.</p>
>>>>>>> 242aeb79a0ebca65930f616a551aa96c85b706bf

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

<<<<<<< HEAD
          <div ref={chatScrollRef} className="chat-thread" aria-live="polite">
            {chatMessages.length === 0 ? (
              <div className="chat-empty">Start by describing a diagram. Follow-up messages can modify it.</div>
            ) : (
              chatMessages.map((message) => (
                <article key={message.id} className={`chat-message chat-message-${message.role}`}>
                  <header>
                    <strong>{message.role === 'user' ? 'You' : 'Assistant'}</strong>
                  </header>
                  <p>{message.content}</p>
                </article>
              ))
            )}

            {loading ? <div className="chat-typing">Assistant is generating updated SVG...</div> : null}
          </div>

          <textarea
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Type a new diagram request or a modification (Shift+Enter for newline)..."
          />

          <div className="actions">
            <button onClick={handleSendMessage} disabled={loading || !chatInput.trim()}>
              {loading ? 'Generating...' : 'Send'}
            </button>
            <button className="secondary" onClick={clearChatHistory} disabled={loading}>
              Clear Chat
=======
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
>>>>>>> 242aeb79a0ebca65930f616a551aa96c85b706bf
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

<<<<<<< HEAD
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
            <div>
              <div className="output-controls">
                <input
                  type="text"
                  className="filename-input"
                  value={outputFilename}
                  onChange={(e) => setOutputFilename(e.target.value)}
                  placeholder="diagram"
                  title="Filename for download (without .svg extension)"
                />
                <button className="control-btn copy-btn" onClick={handleCopySvg}>
                  📋 Copy SVG
                </button>
                <button className="control-btn download-btn" onClick={handleDownloadSvg}>
                  ⬇️ Download
                </button>
              </div>

              {feedback && <div className="feedback-message">{feedback}</div>}

              <div className="svg-stage" dangerouslySetInnerHTML={{ __html: parsedCode }} />
            </div>
          ) : null}
=======
          <SvgRenderer svgCode={parsedCode} status={previewStatus} error={error} />
>>>>>>> 242aeb79a0ebca65930f616a551aa96c85b706bf

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
