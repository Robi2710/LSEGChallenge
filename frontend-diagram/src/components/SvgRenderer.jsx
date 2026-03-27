function SvgRenderer({ svgCode, status, error }) {
  if (status === 'empty') {
    return (
      <div className="render-state">
        <h2>No diagram yet</h2>
        <p>Generate or paste SVG code to preview it here.</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="render-state render-state-error" role="alert">
        <h2>SVG render failed</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (status === 'rendering') {
    return (
      <div className="render-state">
        <h2>Rendering diagram…</h2>
        <p>Preparing SVG preview.</p>
      </div>
    )
  }

  return (
    <div
      className="svg-stage"
      aria-label="SVG diagram preview"
      dangerouslySetInnerHTML={{ __html: svgCode }}
    />
  )
}

export default SvgRenderer
