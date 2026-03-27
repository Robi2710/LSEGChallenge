import { useEffect, useMemo, useRef, useState } from 'react'
import { useDragState } from '../hooks/useDragState'
import TextPositionEditor from './TextPositionEditor'
import ColorEditor from './ColorEditor'
import {
  buildSelectionInfo,
  getEditableElementFromTarget,
  getDragTargetsForElement,
  moveElementBy,
  parseAndSanitizeSvg,
  serializeSvg,
  setupEditableElements,
  toSvgPoint,
  updateElementColors,
  updateTextPosition,
} from '../utils/svgDom'

function EditableSvgStage({ svgCode, onChange }) {
  const stageRef = useRef(null)
  const selectedRef = useRef(null)
  const pointerRef = useRef(null)
  const dragTargetsRef = useRef([])
  const lastCommittedRef = useRef('')

  const { isDragging, startDrag, updateDrag, endDrag } = useDragState()

  const [renderSvg, setRenderSvg] = useState('')
  const [stageError, setStageError] = useState('')
  const [selection, setSelection] = useState(null)
  const [selectionBox, setSelectionBox] = useState(null)

  useEffect(() => {
    if (svgCode && svgCode === lastCommittedRef.current) {
      return
    }

    const parsed = parseAndSanitizeSvg(svgCode)

    if (!parsed.ok) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStageError(parsed.error)
      setRenderSvg('')
      setSelection(null)
      setSelectionBox(null)
      selectedRef.current = null
      return
    }

    setStageError('')
    setRenderSvg(parsed.svg)
  }, [svgCode])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !renderSvg) {
      return
    }

    stage.innerHTML = renderSvg

    const svgElement = stage.querySelector('svg')
    if (!svgElement) {
      return
    }

    setupEditableElements(svgElement)
    selectedRef.current = null
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelection(null)
    setSelectionBox(null)
  }, [renderSvg])

  function getSvgElement() {
    return stageRef.current?.querySelector('svg') || null
  }

  function updateSelectionBox(element) {
    const stage = stageRef.current
    const svg = getSvgElement()

    if (!stage || !svg || !element) {
      setSelectionBox(null)
      return
    }

    try {
      const stageRect = stage.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()

      setSelectionBox({
        left: elementRect.left - stageRect.left,
        top: elementRect.top - stageRect.top,
        width: Math.max(elementRect.width, 8),
        height: Math.max(elementRect.height, 8),
      })
    } catch {
      setSelectionBox(null)
    }
  }

  function emitSvgChange(svgElement) {
    if (!svgElement || typeof onChange !== 'function') {
      return
    }

    const nextSvg = serializeSvg(svgElement)
    lastCommittedRef.current = nextSvg
    onChange(nextSvg)
  }

  function applySelection(element) {
    if (selectedRef.current) {
      selectedRef.current.removeAttribute('data-selected')
    }

    selectedRef.current = element

    if (!element) {
      setSelection(null)
      setSelectionBox(null)
      return
    }

    element.setAttribute('data-selected', 'true')
    const info = buildSelectionInfo(element)
    setSelection(info)
    updateSelectionBox(element)
  }

  function handlePointerDown(event) {
    const svg = getSvgElement()
    if (!svg) {
      return
    }

    const selectedElement = getEditableElementFromTarget(event.target, svg)

    if (!selectedElement) {
      dragTargetsRef.current = []
      applySelection(null)
      return
    }

    const pointer = toSvgPoint(svg, event.clientX, event.clientY)
    pointerRef.current = selectedElement
    dragTargetsRef.current = getDragTargetsForElement(svg, selectedElement)
    startDrag(event.pointerId, pointer)

    applySelection(selectedElement)

    if (stageRef.current && typeof stageRef.current.setPointerCapture === 'function') {
      try {
        stageRef.current.setPointerCapture(event.pointerId)
      } catch {
        // pointer capture may fail on some SVG targets; dragging still works in-bounds
      }
    }

    event.preventDefault()
  }

  function handlePointerMove(event) {
    const svg = getSvgElement()
    if (!svg || !pointerRef.current) {
      return
    }

    const point = toSvgPoint(svg, event.clientX, event.clientY)
    const delta = updateDrag(point, event.pointerId)

    if (!delta) {
      return
    }

    if (delta.dx === 0 && delta.dy === 0) {
      return
    }

    const targets = dragTargetsRef.current.length > 0 ? dragTargetsRef.current : [pointerRef.current]

    for (const element of targets) {
      moveElementBy(element, delta.dx, delta.dy)
    }

    updateSelectionBox(pointerRef.current)
    setSelection(buildSelectionInfo(pointerRef.current))

    event.preventDefault()
  }

  function handlePointerUp(event) {
    const ended = endDrag(event.pointerId)
    if (!ended) {
      return
    }

    if (stageRef.current && typeof stageRef.current.releasePointerCapture === 'function') {
      try {
        stageRef.current.releasePointerCapture(event.pointerId)
      } catch {
        // ignore release errors for stale pointer captures
      }
    }

    const svg = getSvgElement()
    if (svg && pointerRef.current) {
      updateSelectionBox(pointerRef.current)
      emitSvgChange(svg)
    }

    pointerRef.current = null
    dragTargetsRef.current = []
  }

  function handleTextPositionChange(nextPosition) {
    const svg = getSvgElement()
    const target = selectedRef.current

    if (!svg || !target) {
      return
    }

    updateTextPosition(target, nextPosition)
    setSelection(buildSelectionInfo(target))
    updateSelectionBox(target)
    emitSvgChange(svg)
  }

  function handleColorChange(nextColors) {
    const svg = getSvgElement()
    const target = selectedRef.current

    if (!svg || !target) {
      return
    }

    updateElementColors(target, nextColors)
    setSelection(buildSelectionInfo(target))
    emitSvgChange(svg)
  }

  const stageClassName = useMemo(() => {
    if (isDragging) {
      return 'editable-svg-stage is-dragging'
    }

    return 'editable-svg-stage'
  }, [isDragging])

  if (stageError) {
    return (
      <div className="render-state render-state-error" role="alert">
        <h3>SVG parse failed</h3>
        <p>{stageError}</p>
      </div>
    )
  }

  return (
    <div className="editable-svg-wrap">
      <div
        ref={stageRef}
        className={stageClassName}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />

      {selectionBox ? (
        <div
          className="selection-box"
          style={{
            left: `${selectionBox.left}px`,
            top: `${selectionBox.top}px`,
            width: `${selectionBox.width}px`,
            height: `${selectionBox.height}px`,
          }}
        />
      ) : null}

      {selection ? (
        <div className="editors-row">
          <div className="editor-panel">
            <h3>Selection</h3>
            <p>{selection.tagName}</p>
          </div>
          {selection.tagName === 'text' ? (
            <TextPositionEditor value={selection.textPosition} onChange={handleTextPositionChange} />
          ) : null}
          <ColorEditor value={selection.colors} onChange={handleColorChange} />
        </div>
      ) : (
        <p className="selection-hint">Click an SVG shape to select and drag. Text exposes X/Y controls.</p>
      )}
    </div>
  )
}

export default EditableSvgStage
