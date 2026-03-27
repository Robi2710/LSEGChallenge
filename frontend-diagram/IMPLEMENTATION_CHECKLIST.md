# Frontend Diagram - Implementation Checklist

## ✅ OWNER A: Frontend Shell + UX Orchestration

### Core Layout & Structure
- ✅ 2-panel layout (left input, right preview)
- ✅ App header with title and description
- ✅ Panel components with proper styling
- ✅ Mobile responsiveness (stack on small screens)

### Input Controls
- ✅ Description textarea with placeholder
- ✅ Generate button with loading state
- ✅ Clear button to reset output
- ✅ Button disabled while generating
- ✅ Provider/Model selector integration (BONUS - Owner B component)

### App State Management
- ✅ `prompt` state
- ✅ `loading` (isGenerating) state
- ✅ `error` state
- ✅ `parsedCode` (svgCode) state
- ✅ Local storage persistence for provider/model selection

### UX Features
- ✅ Empty state guidance text
- ✅ Loading indicator/message during generation
- ✅ Error states visible and readable
- ✅ Raw response debug panel (bonus)
- ✅ SVG preview rendering

---

## ✅ OWNER B: Prompt, API, Parser Pipeline

### Prompt Builder
- ✅ Builds strict prompt for SVG-only output
- ✅ Includes instruction: "Return only one fenced ```svg block"
- ✅ No markdown/explanations enforced
- ✅ Output rule for SVG diagram type

### API Client Module
- ✅ Gemini provider client (`geminiClient.js`)
  - ✅ API key from environment
  - ✅ Temperature setting (0.2)
  - ✅ Model selection support
  - ✅ Abort signal support
- ✅ Ollama provider client (`ollamaClient.js`)
  - ✅ Base URL configuration
  - ✅ Model fetching endpoint
  - ✅ Generate endpoint with streaming=false
  - ✅ Fallback models if connection fails
  - ✅ Abort signal support

### Provider Router
- ✅ `generateDiagram()` function routes to correct provider
- ✅ Validates prompt length (min 10 chars)
- ✅ Handles unsupported providers

### Parser & Normalizer
- ✅ `extractFencedDiagram()` function
- ✅ Handles raw `<svg>...</svg>` format
- ✅ Extracts from fenced blocks: ```svg...```
- ✅ Validates SVG has opening/closing tags
- ✅ Returns explicit error messages for invalid outputs
- ✅ Trims and normalizes whitespace

### Error Handling
- ✅ Empty API response
- ✅ Network/connection failures
- ✅ Invalid model output (no SVG found)
- ✅ Malformed SVG blocks
- ✅ Distinguished user-friendly error messages

### Integration Contract
- ✅ Type system defined in `types.js`
- ✅ Success result: `{ ok: true, raw, diagramType, error: null }`
- ✅ Failure result: `{ ok: false, raw: '', diagramType: null, error: { message, details } }`

---

## ✅✋ OWNER C: Renderer + SVG Safety Layer

### Renderer Component (SvgRenderer.jsx)
- ✅ States implemented:
  - ✅ Empty state
  - ✅ Rendering state
  - ✅ Success state
  - ✅ Error state
- ✅ Display error message in error state
- ✅ SafeInnerHTML rendering via `dangerouslySetInnerHTML`

### SVG Validation (utils/svg.js)
- ✅ `validateSvgCode()` function
  - ✅ Checks for opening `<svg` tag
  - ✅ Checks for closing `</svg>` tag
  - ✅ Non-empty validation
  - ✅ Returns specific error messages
- ✅ `normalizeSvgCode()` function (trim)

### Rendering Features
- ✅ Large SVG scrolling support (overflow: auto)
- ✅ SVG responsive sizing (max-width: 100%)
- ✅ Consistent styling across regenerations
- ✅ Error border styling (red border for errors)

### CSS Styling (App.css)
- ✅ `.svg-stage` with proper overflow handling
- ✅ `.render-state` for empty/loading/error states
- ✅ `.render-state-error` with error colors
- ✅ SVG centering with `margin: 0 auto`

---

## ❌ MISSING FEATURES (Critical)

### Owner C - Missing Utility Features
- ❌ **Copy SVG button** (copy to clipboard functionality)
- ❌ **Download SVG button** (download as `.svg` file)
- ❌ **Copy/Download success feedback** (toast/notification)
- ❌ **Download naming strategy** (e.g., `diagram-TIMESTAMP.svg`)

### Owner C - Enhancement
- ❌ **Improved error messages** for malformed SVG
  - Current: "Extracted SVG block is malformed"
  - Suggest: More specific validation errors (missing viewBox, invalid attributes, etc.)

### General - Optional Enhancements
- ❌ **Diagram type selector** (currently hardcoded to SVG)
- ❌ **Undo/History** of previous generations
- ❌ **Keyboard shortcuts** (Ctrl+Enter to generate)
- ❌ **Settings panel** for advanced options
- ❌ **Dark mode** toggle
- ❌ **Export formats** (PNG, PDF - would need backend)

---

## Environment Variables Required

### For Gemini Provider
- ✅ `VITE_GEMINI_API_KEY` - Set in `.env`
- ✅ `VITE_GEMINI_MODEL` - Optional, defaults to `gemini-2.0-flash`

### For Ollama Provider
- ✅ `VITE_OLLAMA_BASE_URL` - Optional, defaults to `http://localhost:11434`
- ✅ `VITE_OLLAMA_MODEL` - Optional, defaults to `qwen2.5:7b`

### For Default Provider
- ✅ `VITE_DEFAULT_PROVIDER` - Optional, defaults to `ollama`

---

## Summary

| Category | Status | %Complete |
|----------|--------|-----------|
| **Owner A** | ✅ COMPLETE | 100% |
| **Owner B** | ✅ COMPLETE | 100% |
| **Owner C** | ✋ PARTIAL | 85% |
| **Core Features** | ✅ COMPLETE | 100% |
| **Utility Features** | ❌ MISSING | 0% |
| **Overall** | ✅ MOSTLY DONE | **95%** |

---

## Priority: What to Implement Next

### 🔴 High Priority (For complete MVP)
1. **Add Copy SVG button** in SvgRenderer or output panel
2. **Add Download SVG button** with proper naming
3. **Add copy/download success feedback**

### 🟡 Medium Priority (Polish)
1. Better error messages for SVG validation
2. Loading spinner/animation improvements
3. Keyboard shortcuts (Ctrl+Enter)

### 🟢 Low Priority (Nice-to-have)
1. Dark mode support
2. Generation history
3. Advanced settings panel
