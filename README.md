# Diagram Generator (SVG-Only) — Project Overview

This repository contains a team-built AI diagram generator focused on **SVG output only**.

The latest and authoritative implementation breakdown is documented in:

- [`frontend-diagram/TEAM_IMPLEMENTATION_GUIDE.md`](./frontend-diagram/TEAM_IMPLEMENTATION_GUIDE.md)

## Current Direction

- Output format: **SVG only**
- Core flow: prompt input → AI generation → SVG parsing/normalization → rendering
- Team ownership split across Owner A (UI orchestration), Owner B (API + parser), Owner C (renderer)

## Current Frontend Status

The `frontend-diagram` app includes a working Owner C renderer foundation:

- SVG input editor
- SVG validation (`<svg ...></svg>` requirement)
- render states (empty, rendering, success, error)
- preview panel
- copy/download utilities

See details in:
- [`frontend-diagram/README.md`](./frontend-diagram/README.md)

## Team Execution Source of Truth

Use the team guide for:

- exact owner responsibilities (A/B/C)
- integration contracts (`type: 'svg'`, `code: string`)
- merge order and integration checkpoints
- manual test matrix and delivery criteria

Primary guide:
- [`frontend-diagram/TEAM_IMPLEMENTATION_GUIDE.md`](./frontend-diagram/TEAM_IMPLEMENTATION_GUIDE.md)

## Quick Start

```bash
cd frontend-diagram
npm install
npm run dev
```

## Build

```bash
npm run build
```
