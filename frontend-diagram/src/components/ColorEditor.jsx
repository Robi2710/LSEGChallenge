function ColorEditor({ value, onChange }) {
  if (!value) {
    return null
  }

  function handleColorChange(key, nextColor) {
    onChange({
      ...value,
      [key]: nextColor,
    })
  }

  return (
    <div className="editor-panel">
      <h3>Colors</h3>
      <div className="editor-grid">
        <label>
          Fill
          <input
            type="color"
            value={value.fill || '#000000'}
            onChange={(event) => handleColorChange('fill', event.target.value)}
          />
        </label>
        <label>
          Stroke
          <input
            type="color"
            value={value.stroke || '#000000'}
            onChange={(event) => handleColorChange('stroke', event.target.value)}
          />
        </label>
      </div>
    </div>
  )
}

export default ColorEditor
