export function extractFencedDiagram(rawResponse, diagramType) {
  if (!rawResponse || !rawResponse.trim()) {
    return {
      ok: false,
      code: '',
      error: 'AI response was empty.',
    }
  }

  const fencePattern = new RegExp(
    '^```' + diagramType + '\\n([\\s\\S]*?)\\n```$',
    'im',
  )
  const match = rawResponse.match(fencePattern)

  if (!match) {
    return {
      ok: false,
      code: '',
      error: `No fenced ${diagramType} block found in model response.`,
    }
  }

  const code = (match[1] || '').trim()

  if (!code) {
    return {
      ok: false,
      code: '',
      error: `${diagramType.toUpperCase()} block is empty.`,
    }
  }

  if (diagramType === 'svg' && !/^<svg[\s\S]*<\/svg>$/i.test(code)) {
    return {
      ok: false,
      code: '',
      error: 'Extracted SVG block is malformed.',
    }
  }

  return {
    ok: true,
    code,
    error: null,
  }
}
