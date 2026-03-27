function TextPositionEditor({ value, onChange }) {
  if (!value) {
    return null
  }

  function handleInputChange(key, nextValue) {
    const numeric = Number.parseFloat(nextValue)

    if (!Number.isFinite(numeric)) {
      return
    }

    onChange({
      ...value,
      [key]: numeric,
    })
  }

  return (
    <div className="editor-panel">
      <h3>Text Position</h3>
      <div className="editor-grid">
        <label>
          X
          <input
            type="number"
            step="1"
            value={Number.isFinite(value.x) ? value.x : 0}
            onChange={(event) => handleInputChange('x', event.target.value)}
          />
        </label>
        <label>
          Y
          <input
            type="number"
            step="1"
            value={Number.isFinite(value.y) ? value.y : 0}
            onChange={(event) => handleInputChange('y', event.target.value)}
          />
        </label>
      </div>
    </div>
  )
}

export default TextPositionEditor
