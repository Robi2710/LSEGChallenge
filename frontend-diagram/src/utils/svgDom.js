const EDITABLE_TAGS = new Set([
  'rect',
  'circle',
  'ellipse',
  'line',
  'text',
  'polygon',
  'polyline',
  'path',
  'g',
])

const FORBIDDEN_TAGS = new Set(['script', 'foreignObject', 'iframe', 'object', 'embed'])
const EDITABLE_SELECTOR = 'rect, circle, ellipse, line, text, polygon, polyline, path, g'
const ARROW_HINT_RE = /(arrow|edge|connector|link)/i

function parseNumber(value, fallback = 0) {
  const next = Number.parseFloat(value)
  return Number.isFinite(next) ? next : fallback
}

function parsePoints(points) {
  if (!points) return []

  const tokens = points
    .trim()
    .replace(/,/g, ' ')
    .split(/\s+/)
    .map((token) => Number.parseFloat(token))
    .filter((token) => Number.isFinite(token))

  const output = []
  for (let i = 0; i < tokens.length - 1; i += 2) {
    output.push([tokens[i], tokens[i + 1]])
  }

  return output
}

function formatPoints(points) {
  return points.map(([x, y]) => `${x},${y}`).join(' ')
}

function getBBoxSafe(element) {
  if (!element || typeof element.getBBox !== 'function') {
    return null
  }

  try {
    return element.getBBox()
  } catch {
    return null
  }
}

function expandBox(box, padding) {
  return {
    x: box.x - padding,
    y: box.y - padding,
    width: box.width + padding * 2,
    height: box.height + padding * 2,
  }
}

function pointInBox(point, box) {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  )
}

function boxesIntersect(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

function getBoxCenter(box) {
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  }
}

function parsePathEndpoints(d) {
  if (!d || typeof d !== 'string') {
    return []
  }

  const numbers = d
    .match(/-?\d*\.?\d+/g)
    ?.map((part) => Number.parseFloat(part))
    .filter((value) => Number.isFinite(value))

  if (!numbers || numbers.length < 4) {
    return []
  }

  return [
    { x: numbers[0], y: numbers[1] },
    { x: numbers[numbers.length - 2], y: numbers[numbers.length - 1] },
  ]
}

function getConnectorPoints(element) {
  if (!element) {
    return []
  }

  const tagName = element.tagName.toLowerCase()

  if (tagName === 'line') {
    return [
      { x: parseNumber(element.getAttribute('x1')), y: parseNumber(element.getAttribute('y1')) },
      { x: parseNumber(element.getAttribute('x2')), y: parseNumber(element.getAttribute('y2')) },
    ]
  }

  if (tagName === 'polyline' || tagName === 'polygon') {
    const points = parsePoints(element.getAttribute('points'))
    if (points.length < 2) {
      return []
    }

    const first = points[0]
    const last = points[points.length - 1]
    return [
      { x: first[0], y: first[1] },
      { x: last[0], y: last[1] },
    ]
  }

  if (tagName === 'path') {
    return parsePathEndpoints(element.getAttribute('d'))
  }

  return []
}

function isConnectorElement(element) {
  if (!element) {
    return false
  }

  const tagName = element.tagName.toLowerCase()
  const hasMarker = Boolean(element.getAttribute('marker-end') || element.getAttribute('marker-start'))
  const hint = `${element.id || ''} ${element.getAttribute('class') || ''}`
  const fill = (element.getAttribute('fill') || '').toLowerCase()
  const looksStroked = fill === 'none' || fill === ''

  if (hasMarker || ARROW_HINT_RE.test(hint)) {
    return true
  }

  if (tagName === 'line') {
    return true
  }

  if ((tagName === 'path' || tagName === 'polyline') && looksStroked) {
    return true
  }

  return false
}

function uniqueElements(elements) {
  return [...new Set(elements.filter(Boolean))]
}

function hasUnsafeAttribute(name) {
  return /^on/i.test(name)
}

function sanitizeNode(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return
  }

  const element = node
  const tagName = element.tagName.toLowerCase()

  if (FORBIDDEN_TAGS.has(tagName)) {
    element.remove()
    return
  }

  const attributes = [...element.attributes]

  for (const attr of attributes) {
    const attrName = attr.name.toLowerCase()
    const value = (attr.value || '').trim()

    if (hasUnsafeAttribute(attrName)) {
      element.removeAttribute(attr.name)
      continue
    }

    if ((attrName === 'href' || attrName === 'xlink:href') && /^javascript:/i.test(value)) {
      element.removeAttribute(attr.name)
    }
  }

  const children = [...element.children]
  for (const child of children) {
    sanitizeNode(child)
  }
}

export function parseAndSanitizeSvg(svgCode) {
  if (!svgCode || !svgCode.trim()) {
    return {
      ok: false,
      error: 'SVG is empty.',
      svg: '',
    }
  }

  const parser = new DOMParser()
  const documentNode = parser.parseFromString(svgCode, 'image/svg+xml')
  const parserError = documentNode.querySelector('parsererror')

  if (parserError) {
    return {
      ok: false,
      error: 'SVG parsing failed. The generated SVG is not valid XML.',
      svg: '',
    }
  }

  const root = documentNode.documentElement

  if (!root || root.tagName.toLowerCase() !== 'svg') {
    return {
      ok: false,
      error: 'Parsed output is not an SVG root element.',
      svg: '',
    }
  }

  sanitizeNode(root)

  return {
    ok: true,
    error: null,
    svg: root.outerHTML,
  }
}

export function setupEditableElements(svgElement) {
  if (!svgElement) return

  const editable = svgElement.querySelectorAll(EDITABLE_SELECTOR)

  editable.forEach((element, index) => {
    element.setAttribute('data-editable', 'true')

    if (!element.getAttribute('data-edit-id')) {
      element.setAttribute('data-edit-id', `${element.tagName.toLowerCase()}-${index}`)
    }
  })
}

export function getEditableElementFromTarget(target, svgRoot) {
  if (!target || !svgRoot) {
    return null
  }

  if (!(target instanceof Element)) {
    return null
  }

  const candidate = target.closest('[data-editable="true"]')

  if (!candidate || !svgRoot.contains(candidate)) {
    return null
  }

  return candidate
}

export function toSvgPoint(svgElement, clientX, clientY) {
  if (!svgElement || typeof svgElement.createSVGPoint !== 'function') {
    return { x: clientX, y: clientY }
  }

  const point = svgElement.createSVGPoint()
  point.x = clientX
  point.y = clientY

  const matrix = svgElement.getScreenCTM()

  if (!matrix) {
    return { x: clientX, y: clientY }
  }

  const transformed = point.matrixTransform(matrix.inverse())
  return {
    x: transformed.x,
    y: transformed.y,
  }
}

function applyTransformTranslation(element, dx, dy) {
  const baseTransform = element.getAttribute('data-base-transform')

  if (baseTransform === null) {
    element.setAttribute('data-base-transform', element.getAttribute('transform') || '')
    element.setAttribute('data-offset-x', '0')
    element.setAttribute('data-offset-y', '0')
  }

  const offsetX = parseNumber(element.getAttribute('data-offset-x')) + dx
  const offsetY = parseNumber(element.getAttribute('data-offset-y')) + dy

  element.setAttribute('data-offset-x', `${offsetX}`)
  element.setAttribute('data-offset-y', `${offsetY}`)

  const base = element.getAttribute('data-base-transform') || ''
  const nextTransform = `${base} translate(${offsetX} ${offsetY})`.trim()
  element.setAttribute('transform', nextTransform)
}

export function moveElementBy(element, dx, dy) {
  if (!element || !Number.isFinite(dx) || !Number.isFinite(dy)) {
    return
  }

  const tagName = element.tagName.toLowerCase()

  if (!EDITABLE_TAGS.has(tagName)) {
    return
  }

  switch (tagName) {
    case 'rect': {
      const x = parseNumber(element.getAttribute('x')) + dx
      const y = parseNumber(element.getAttribute('y')) + dy
      element.setAttribute('x', `${x}`)
      element.setAttribute('y', `${y}`)
      break
    }
    case 'circle':
    case 'ellipse': {
      const cx = parseNumber(element.getAttribute('cx')) + dx
      const cy = parseNumber(element.getAttribute('cy')) + dy
      element.setAttribute('cx', `${cx}`)
      element.setAttribute('cy', `${cy}`)
      break
    }
    case 'line': {
      const x1 = parseNumber(element.getAttribute('x1')) + dx
      const y1 = parseNumber(element.getAttribute('y1')) + dy
      const x2 = parseNumber(element.getAttribute('x2')) + dx
      const y2 = parseNumber(element.getAttribute('y2')) + dy
      element.setAttribute('x1', `${x1}`)
      element.setAttribute('y1', `${y1}`)
      element.setAttribute('x2', `${x2}`)
      element.setAttribute('y2', `${y2}`)
      break
    }
    case 'text': {
      const x = parseNumber(element.getAttribute('x')) + dx
      const y = parseNumber(element.getAttribute('y')) + dy
      element.setAttribute('x', `${x}`)
      element.setAttribute('y', `${y}`)
      break
    }
    case 'polygon':
    case 'polyline': {
      const points = parsePoints(element.getAttribute('points'))
      if (points.length === 0) {
        applyTransformTranslation(element, dx, dy)
        break
      }

      const nextPoints = points.map(([x, y]) => [x + dx, y + dy])
      element.setAttribute('points', formatPoints(nextPoints))
      break
    }
    case 'path':
    case 'g':
    default:
      applyTransformTranslation(element, dx, dy)
      break
  }
}

export function readTextPosition(element) {
  if (!element || element.tagName.toLowerCase() !== 'text') {
    return null
  }

  return {
    x: parseNumber(element.getAttribute('x')),
    y: parseNumber(element.getAttribute('y')),
  }
}

export function updateTextPosition(element, nextPosition) {
  if (!element || element.tagName.toLowerCase() !== 'text' || !nextPosition) {
    return
  }

  if (Number.isFinite(nextPosition.x)) {
    element.setAttribute('x', `${nextPosition.x}`)
  }

  if (Number.isFinite(nextPosition.y)) {
    element.setAttribute('y', `${nextPosition.y}`)
  }
}

function normalizeColor(value, fallback) {
  if (!value || value === 'none') {
    return fallback
  }

  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value)) {
    return value
  }

  return fallback
}

export function readElementColors(element) {
  if (!element) {
    return null
  }

  const fill = normalizeColor(element.getAttribute('fill'), '#000000')
  const stroke = normalizeColor(element.getAttribute('stroke'), '#000000')

  return { fill, stroke }
}

export function updateElementColors(element, colors) {
  if (!element || !colors) {
    return
  }

  if (colors.fill) {
    element.setAttribute('fill', colors.fill)
  }

  if (colors.stroke) {
    element.setAttribute('stroke', colors.stroke)
  }
}

export function buildSelectionInfo(element) {
  if (!element) {
    return null
  }

  return {
    id: element.getAttribute('data-edit-id') || '',
    tagName: element.tagName.toLowerCase(),
    textPosition: readTextPosition(element),
    colors: readElementColors(element),
  }
}

export function getDragTargetsForElement(svgRoot, selectedElement) {
  if (!svgRoot || !selectedElement) {
    return []
  }

  const selectedTag = selectedElement.tagName.toLowerCase()

  if (selectedTag === 'text' || selectedTag === 'g') {
    return [selectedElement]
  }

  const selectedBox = getBBoxSafe(selectedElement)

  if (!selectedBox || (selectedBox.width === 0 && selectedBox.height === 0)) {
    return [selectedElement]
  }

  const expanded = expandBox(selectedBox, 28)
  const dragTargets = [selectedElement]

  const allTexts = [...svgRoot.querySelectorAll('text[data-editable="true"]')]
  for (const textElement of allTexts) {
    if (selectedElement.contains(textElement) || textElement.contains(selectedElement)) {
      continue
    }

    const textBox = getBBoxSafe(textElement)
    if (!textBox) {
      continue
    }

    const center = getBoxCenter(textBox)
    if (pointInBox(center, expanded)) {
      dragTargets.push(textElement)
    }
  }

  const maybeConnectors = [...svgRoot.querySelectorAll('line, path, polyline, polygon')]
  for (const connector of maybeConnectors) {
    if (connector === selectedElement || !isConnectorElement(connector)) {
      continue
    }

    const points = getConnectorPoints(connector)
    if (points.some((point) => pointInBox(point, expanded))) {
      dragTargets.push(connector)
      continue
    }

    const connectorBox = getBBoxSafe(connector)
    if (connectorBox && boxesIntersect(connectorBox, expanded)) {
      dragTargets.push(connector)
    }
  }

  return uniqueElements(dragTargets)
}

export function serializeSvg(svgElement) {
  if (!svgElement) return ''

  const clone = svgElement.cloneNode(true)

  clone
    .querySelectorAll(
      '[data-base-transform], [data-offset-x], [data-offset-y], [data-editable], [data-edit-id], [data-selected]',
    )
    .forEach((element) => {
      element.removeAttribute('data-base-transform')
      element.removeAttribute('data-offset-x')
      element.removeAttribute('data-offset-y')
      element.removeAttribute('data-editable')
      element.removeAttribute('data-edit-id')
      element.removeAttribute('data-selected')
    })

  return clone.outerHTML
}
