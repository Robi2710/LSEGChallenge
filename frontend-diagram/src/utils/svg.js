export function normalizeSvgCode(raw) {
  return raw.trim()
}

export function validateSvgCode(raw) {
  const svg = normalizeSvgCode(raw)

  if (!svg) {
    return 'Please provide SVG code.'
  }

  if (!svg.startsWith('<svg') || !svg.includes('</svg>')) {
    return 'Output must be a complete SVG element with opening and closing tags.'
  }

  return null
}
