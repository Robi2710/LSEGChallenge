# Team Implementation Guide (SVG-Only Diagram Generator)

This guide defines exactly what each teammate should build, how parts connect, and how to integrate safely under time pressure.

## Project Scope

Build a web app where a user writes a diagram description, AI returns SVG, and the app validates and renders that SVG.

Current status:
- Owner C foundation is implemented (SVG renderer UI, validation, preview, copy/download)
- Next steps are to complete Owner A and Owner B layers and integrate all pieces

## Shared Architecture (End-to-End)

1. User enters text description.
2. UI sends request to generation pipeline.
3. AI responds with fenced or raw SVG.
4. Parser extracts/normalizes SVG string.
5. Renderer validates and displays SVG.
6. User can copy or download the result.

Data contract between layers:

```ts
type DiagramPayload = {
  type: 'svg'
  code: string // complete <svg>...</svg>
}
```

---

## Owner A (Frontend Shell + UX Orchestration)

### Mission
Build the user-facing app flow and orchestrate interactions between input, generation, and rendering.

### What Owner A should implement

1. App layout and page structure
- Keep a 2-panel layout:
  - Left: prompt input and controls
  - Right: rendered SVG preview (already scaffolded by Owner C)
- Ensure mobile responsiveness (stack panels on small screens)

2. Generation controls
- Description textarea (natural language prompt)
- `Generate` button
- Optional `Clear` button
- Disabled state while generation is in progress

3. View model state (top-level app state)
- `promptText: string`
- `isGenerating: boolean`
- `generationError: string`
- `svgCode: string`

4. Action wiring
- On `Generate`, call Owner B service with `promptText`
- On success, pass returned SVG to Owner C renderer input state
- On failure, show readable error without crashing UI

5. UX polish
- Empty state guidance text
- Loading indicator/message while waiting for AI
- Basic inline status messages for success/error

### Files Owner A should focus on
- `src/App.jsx` (container/orchestration)
- `src/App.css` (layout, controls, responsive behavior)

### Owner A definition of done
- User can type a description and click generate
- Button lock/loading prevents duplicate clicks
- Successful response shows rendered diagram in preview
- Error states are visible and actionable

---

## Owner B (Prompt, API, Parser Pipeline)

### Mission
Implement reliable SVG generation from AI and return parser-safe output for the UI.

### What Owner B should implement

1. Prompt builder
- Build a strict prompt that asks for SVG only.
- Enforce: “Return only SVG markup, no markdown, no explanation.”
- Include style guidance for readable diagram output:
  - clear boxes
  - arrows
  - labels
  - viewBox and dimensions

2. API client module
- Create a dedicated module (ex: `src/services/generateSvg.js`)
- Accept `promptText` input
- Call Anthropic API endpoint (or SDK) with required headers/key
- Return raw text output from the model

3. Parser + normalizer
- Handle cases:
  - raw `<svg>...</svg>`
  - fenced block:
    ```svg
    <svg>...</svg>
    ```
- Extract only SVG markup string
- Trim and normalize whitespace
- Throw explicit errors if SVG cannot be extracted

4. Error handling strategy
- Distinguish user-friendly errors:
  - empty prompt
  - network/API failure
  - invalid model output (no SVG)
- Return errors up to App layer; do not silently swallow failures

5. Integration contract with Owner C
- Always return:
  - `type: 'svg'`
  - `code: '<svg ...>...</svg>'`
- Ensure final output includes opening and closing `<svg>` tags

### Files Owner B should create
- `src/services/generateSvg.js`
- `src/utils/parser.js` (if separate parser preferred)
- Optional constants file for model/prompt settings

### Owner B definition of done
- Given a valid text description, API returns parseable SVG payload
- Invalid outputs produce explicit parser errors
- Consumer (Owner A) can call one function and receive consistent data

---

## Owner C (Renderer + SVG Safety Layer) — Already Started

### Mission
Convert valid SVG strings into consistent, user-friendly visual output.

### What is already implemented
- `src/components/SvgRenderer.jsx`
  - states: empty, rendering, success, error
- `src/utils/svg.js`
  - `normalizeSvgCode`
  - `validateSvgCode`
- SVG preview area + copy/download actions in `App.jsx`

### What Owner C should finalize/improve

1. Renderer hardening
- Keep validation strict:
  - non-empty
  - includes `<svg` and `</svg>`
- Improve error messages for malformed output (actionable wording)

2. Rendering consistency
- Ensure large SVGs scale and scroll correctly
- Ensure rendering behaves after repeated regenerate cycles

3. Utility robustness
- Copy action success/failure feedback
- Download naming strategy (e.g., `diagram.svg`)

4. Integration support
- Help Owner A/B wire payload directly into `renderedSvg`
- Validate handoff contract during integration testing

### Files Owner C owns
- `src/components/SvgRenderer.jsx`
- `src/utils/svg.js`
- Renderer-related sections of `src/App.css`

### Owner C definition of done
- Any valid SVG payload renders reliably
- Invalid SVG clearly fails with visible error state
- Copy/download are stable across multiple generations

---

## Integration Plan (All Teammates)

1. Branch strategy
- `feat/owner-a-ui-orchestration`
- `feat/owner-b-api-parser`
- `feat/owner-c-renderer`

2. Merge order
- Merge Owner B service + parser first (or behind feature flag/stub)
- Merge Owner A orchestration next
- Merge Owner C refinements last (small surface conflicts)

3. Integration checkpoints
- Checkpoint 1: Mock SVG payload flows through UI to renderer
- Checkpoint 2: Live API generation connected
- Checkpoint 3: Full E2E with copy/download and error handling

4. Manual test matrix
- Valid prompt → valid SVG → renders
- Empty prompt → user-facing validation error
- API fail → visible network error state
- Model returns non-SVG text → parser error state
- Very large SVG → still viewable with scroll/scale

---

## Fast Operating Rules for the Team

- Keep modules isolated (UI vs generation vs rendering).
- Never break the `DiagramPayload` contract.
- Prefer clear errors over silent fallbacks.
- Commit small, focused changes; integrate frequently.
- Do one final full-flow demo before handoff.

## Suggested Daily Handshake (2 minutes each sync)

- What I finished
- What I’m building next
- What contract/input I need from teammates
- Any blocker needing immediate pairing
