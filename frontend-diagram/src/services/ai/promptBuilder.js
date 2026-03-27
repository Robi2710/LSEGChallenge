const TYPE_INSTRUCTIONS = {
  svg: `Return ONLY a valid SVG code block wrapped in triple backticks with "svg" language tag.
Rules:
- Include viewBox="0 0 800 600" and width/height attributes
- Use simple shapes: rect for boxes, line/path for arrows, text for labels
- Keep all SVG tags properly closed
- Use stroke="#333" and fill colors for visibility
- Font size 14-16px for readable text
- No markdown, comments, or explanations outside the code block`,
}

export function buildDiagramPrompt(userPrompt, diagramType) {
  const outputRule = TYPE_INSTRUCTIONS[diagramType] || TYPE_INSTRUCTIONS.svg

  return [
    'You are an expert SVG diagram generator.',
    'Your task: Create a clean, simple, and valid SVG diagram.',
    '',
    outputRule,
    '',
    'Output format:',
    '```svg',
    '<svg viewBox="0 0 800 600" width="800" height="600" xmlns="http://www.w3.org/2000/svg">',
    '  <!-- Your SVG content here -->',
    '</svg>',
    '```',
    '',
    `User request: ${userPrompt}`,
  ].join('\n')
}
