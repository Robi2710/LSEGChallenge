# Diagram Generator App Backlog (3-Person Team, 3-Hour Sprint)

This backlog is designed for a rapid team build of an AI-powered diagram generator that takes user text input and returns either SVG or Mermaid diagrams.

## Sprint Goal

Deliver a working app where a user can:
- Enter a diagram description
- Select output type (`SVG` or `Mermaid`)
- Generate via AI model
- View rendered output with useful error/loading states

## Team Roles

- **Teammate A**: Frontend shell + integration support
- **Teammate B**: AI prompt/API pipeline
- **Teammate C**: Diagram rendering pipeline

## Prioritized Backlog

### P0 — Must Have

- [ ] **Project setup and app shell** (**Owner: A**, ~25 min)
  - Initialize Vite + React app
  - Set up base layout (input panel + output panel)
  - Add `.env` support and starter config
  - Create shared types/constants (diagram mode, API settings)

- [ ] **Prompt builder + AI API integration** (**Owner: B**, ~60 min)
  - Implement prompt builder from user input + diagram type
  - Add Anthropic API call (`/v1/messages` via SDK)
  - Enforce response format: fenced `svg` or `mermaid` code only
  - Add loading and error states in generation flow

- [ ] **Response parsing and normalization** (**Owner: B**, ~20 min)
  - Extract fenced block safely
  - Strip fences and return raw diagram code
  - Handle malformed outputs gracefully with clear error messages

- [ ] **Renderer implementation (SVG + Mermaid)** (**Owner: C**, ~60 min)
  - SVG render path (`innerHTML`/safe container)
  - Mermaid render path (`mermaid.render`)
  - Toggle renderer by selected output type
  - Add renderer-level fallback UI for invalid diagram syntax

- [ ] **End-to-end integration and merge** (**Owner: All**, ~25 min)
  - Connect input → API → parser → renderer
  - Resolve merge conflicts quickly
  - Confirm both output modes work on sample prompts

### P1 — Should Have (If Time Allows)

- [ ] **UX polish** (**Owners: A + C**, ~30 min)
  - Copy code button
  - Download output (`.svg` or `.mmd/.txt`)
  - Better empty/loading/error states
  - Responsive layout tweaks

- [ ] **Reliability hardening** (**Owner: B**, ~20 min)
  - Input validation (min/max prompt length)
  - Basic retry option for transient API errors
  - Friendly rate-limit messaging

### P2 — Nice to Have

- [ ] Prompt templates (architecture diagram, sequence diagram, ERD)
- [ ] Generation history (last 3 outputs)
- [ ] Dark mode toggle

## Suggested 3-Hour Timeline

- **0:00–0:20**: Setup and skeleton (A), API scaffolding (B), renderer scaffold (C)
- **0:20–1:30**: Core feature implementation in parallel
- **1:30–2:15**: Integrate all parts and fix breakages
- **2:15–2:45**: Polish + hardening
- **2:45–3:00**: Demo prep + deploy

## Definition of Done

- User can generate diagrams from text input in both `SVG` and `Mermaid` modes
- App shows clear loading and error feedback
- At least 3 test prompts validated per mode
- App is deployable and demo-ready

## Demo Checklist

- [ ] One SVG architecture prompt works end-to-end
- [ ] One Mermaid sequence or ERD prompt works end-to-end
- [ ] Error state is demonstrated (bad prompt or malformed output)
- [ ] Copy/download feature works (if implemented)

