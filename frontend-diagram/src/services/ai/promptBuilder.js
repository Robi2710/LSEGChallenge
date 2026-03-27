const TYPE_INSTRUCTIONS = {
  svg: 'Return only one fenced ```svg code block containing valid SVG markup.',
}

export function buildDiagramPrompt(userPrompt, diagramType) {
  const outputRule = TYPE_INSTRUCTIONS[diagramType] || TYPE_INSTRUCTIONS.svg

  return [
    'You are a diagram code generator.',
    outputRule,
    'Do not include explanations, comments, markdown headings, or extra text.',
    'Keep output concise and renderable.',
    '',
    `User request: ${userPrompt}`,
  ].join('\n')
}
