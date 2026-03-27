import { useRef, useState } from 'react'

const INITIAL_DRAG = {
  active: false,
  pointerId: null,
  start: { x: 0, y: 0 },
  last: { x: 0, y: 0 },
}

export function useDragState() {
  const dragRef = useRef(INITIAL_DRAG)
  const [isDragging, setIsDragging] = useState(false)

  function startDrag(pointerId, startPoint) {
    dragRef.current = {
      active: true,
      pointerId,
      start: startPoint,
      last: startPoint,
    }
    setIsDragging(true)
  }

  function updateDrag(point, pointerId) {
    const current = dragRef.current

    if (!current.active || current.pointerId !== pointerId) {
      return null
    }

    const delta = {
      dx: point.x - current.last.x,
      dy: point.y - current.last.y,
      totalDx: point.x - current.start.x,
      totalDy: point.y - current.start.y,
    }

    dragRef.current = {
      ...current,
      last: point,
    }

    return delta
  }

  function endDrag(pointerId = null) {
    const current = dragRef.current

    if (!current.active) {
      return false
    }

    if (pointerId !== null && current.pointerId !== pointerId) {
      return false
    }

    dragRef.current = INITIAL_DRAG
    setIsDragging(false)
    return true
  }

  return {
    isDragging,
    dragRef,
    startDrag,
    updateDrag,
    endDrag,
  }
}
