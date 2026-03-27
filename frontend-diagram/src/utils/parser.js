export function extractFencedDiagram(rawResponse, diagramType) {
  if (!rawResponse || !rawResponse.trim()) {
    return {
      ok: false,
      code: '',
      error: 'AI response was empty.',
    }
  }

  // Try multiple fence patterns to handle variations
  const patterns = [
    new RegExp(`^\`\`\`${diagramType}\\n([\\s\\S]*?)\\n\`\`\`$`, 'im'),
    new RegExp(`\`\`\`${diagramType}\\n([\\s\\S]*?)\\n\`\`\``, 'i'),
    new RegExp(`<${diagramType}[\\s\\S]*<\\/${diagramType}>`, 'i'),
  ]

  let match = null
  let code = ''

  for (const pattern of patterns) {
    match = rawResponse.match(pattern)
    if (match) {
      code = (match[1] || match[0] || '').trim()
      break
    }
  }

  if (!code) {
    return {
      ok: false,
      code: '',
      error: `No valid ${diagramType} block found in model response.`,
    }
  }

  if (diagramType === 'svg' && !/^<svg[\s\S]*<\/svg>$/i.test(code)) {
    return {
      ok: false,
      code: '',
      error:
        'Invalid SVG: missing opening <svg> or closing </svg> tag. Check model output quality.',
    }
  }

  return {
    ok: true,
    code,
    error: null,
  }
}
