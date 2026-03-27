import { AI_PROVIDERS } from '../config/models'

function ProviderModelSelector({
  provider,
  onProviderChange,
  model,
  models,
  onModelChange,
  ollamaBaseUrl,
  onOllamaBaseUrlChange,
  modelWarning,
}) {
  const isOllama = provider === AI_PROVIDERS.OLLAMA

  return (
    <div className="selector-grid">
      <label>
        Provider
        <select value={provider} onChange={(event) => onProviderChange(event.target.value)}>
          <option value={AI_PROVIDERS.OLLAMA}>Ollama (Local)</option>
          <option value={AI_PROVIDERS.GEMINI}>Gemini</option>
        </select>
      </label>

      <label>
        Model
        <select value={model} onChange={(event) => onModelChange(event.target.value)}>
          {models.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      {isOllama ? (
        <label className="full-row">
          Ollama Base URL
          <input
            type="url"
            value={ollamaBaseUrl}
            onChange={(event) => onOllamaBaseUrlChange(event.target.value)}
            placeholder="http://localhost:11434"
          />
        </label>
      ) : null}

      {modelWarning ? <p className="warning full-row">{modelWarning}</p> : null}
    </div>
  )
}

export default ProviderModelSelector
