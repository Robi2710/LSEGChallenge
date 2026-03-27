import { useRef, useState } from 'react'

function SvgRenderer({ svgCode, status, error }) {
  const svgContainerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })

  function handleMouseDown(e) {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  function handleMouseMove(e) {
    if (!isDragging || !svgContainerRef.current) return

    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y

    setPanOffset((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  function handleMouseUp() {
    setIsDragging(false)
  }

  function handleReset() {
    setPanOffset({ x: 0, y: 0 })
  }

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
    <div>
      <div
        ref={svgContainerRef}
        className="svg-stage"
        aria-label="SVG diagram preview"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
        dangerouslySetInnerHTML={{ __html: svgCode }}
      />
      {(panOffset.x !== 0 || panOffset.y !== 0) && (
        <button className="reset-pan-btn" onClick={handleReset} title="Reset position">
          Reset Zoom/Pan
        </button>
      )}
    </div>
  )
}

export default SvgRenderer
