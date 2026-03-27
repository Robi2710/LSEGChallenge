import { useMemo, useState } from 'react'
import './App.css'
import SvgRenderer from './components/SvgRenderer'
import { normalizeSvgCode, validateSvgCode } from './utils/svg'

const SAMPLE_SVG = `<svg width="640" height="280" viewBox="0 0 640 280" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="180" height="80" rx="10" fill="#EEF2FF" stroke="#4F46E5" stroke-width="2"/>
  <text x="110" y="68" text-anchor="middle" font-family="Arial" font-size="14" fill="#1E1B4B">User Input</text>
  <rect x="230" y="20" width="180" height="80" rx="10" fill="#ECFDF5" stroke="#059669" stroke-width="2"/>
  <text x="320" y="68" text-anchor="middle" font-family="Arial" font-size="14" fill="#064E3B">AI Model</text>
  <rect x="440" y="20" width="180" height="80" rx="10" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
  <text x="530" y="68" text-anchor="middle" font-family="Arial" font-size="14" fill="#78350F">SVG Output</text>
  <line x1="200" y1="60" x2="230" y2="60" stroke="#334155" stroke-width="2"/>
  <polygon points="230,60 220,55 220,65" fill="#334155"/>
  <line x1="410" y1="60" x2="440" y2="60" stroke="#334155" stroke-width="2"/>
  <polygon points="440,60 430,55 430,65" fill="#334155"/>
  <rect x="230" y="150" width="180" height="80" rx="10" fill="#F8FAFC" stroke="#475569" stroke-width="2"/>
  <text x="320" y="198" text-anchor="middle" font-family="Arial" font-size="14" fill="#0F172A">Renderer (Owner C)</text>
  <line x1="320" y1="100" x2="320" y2="150" stroke="#334155" stroke-width="2"/>
  <polygon points="320,150 315,140 325,140" fill="#334155"/>
</svg>`

function App() {
  const [input, setInput] = useState(SAMPLE_SVG)
  const [renderedSvg, setRenderedSvg] = useState('')
  const [error, setError] = useState('')
  const [isRendering, setIsRendering] = useState(false)

  const status = useMemo(() => {
    if (isRendering) {
      return 'rendering'
    }

    if (error) {
      return 'error'
    }

    if (!renderedSvg) {
      return 'empty'
    }

    return 'success'
  }, [error, isRendering, renderedSvg])

  function handleRender() {
    setError('')
    setIsRendering(true)

    const validationError = validateSvgCode(input)
    if (validationError) {
      setIsRendering(false)
      setRenderedSvg('')
      setError(validationError)
      return
    }

    const svg = normalizeSvgCode(input)
    setRenderedSvg(svg)
    setIsRendering(false)
  }

  async function handleCopy() {
    if (!renderedSvg) {
      return
    }

    await navigator.clipboard.writeText(renderedSvg)
  }

  function handleDownload() {
    if (!renderedSvg) {
      return
    }

    const blob = new Blob([renderedSvg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'diagram.svg'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>SVG Diagram Renderer</h1>
        <p>Owner C workspace for rendering and validating generated SVG diagrams.</p>
      </header>

      <section className="workspace">
        <div className="panel panel-input">
          <h2>SVG Input</h2>
          <p>Paste generated SVG from the model and render it.</p>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="<svg>...</svg>"
            spellCheck={false}
          />
          <div className="actions">
            <button type="button" onClick={handleRender}>
              Render SVG
            </button>
            <button type="button" onClick={handleCopy} disabled={!renderedSvg}>
              Copy
            </button>
            <button type="button" onClick={handleDownload} disabled={!renderedSvg}>
              Download
            </button>
          </div>
        </div>

        <div className="panel panel-preview">
          <h2>Preview</h2>
          <SvgRenderer svgCode={renderedSvg} status={status} error={error} />
        </div>
      </section>
    </main>
  )
}

export default App
