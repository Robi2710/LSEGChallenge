export function createSuccessResult(raw, diagramType) {
  return {
    ok: true,
    raw,
    diagramType,
    error: null,
  }
}

export function createFailureResult(message, details = null) {
  return {
    ok: false,
    raw: '',
    diagramType: null,
    error: {
      message,
      details,
    },
  }
}
