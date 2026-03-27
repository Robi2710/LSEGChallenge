# Diagram Generator (SVG-Only) 📊

This repository contains a team-built AI diagram generator focused **strictly on SVG output**. The project is structured to facilitate teamwork, clearly dividing responsibilities across various architectural components.

## 🚀 Project Overview

The main goal of this application is to take a text *prompt* from the user, process it using AI to generate a diagram, and parse the raw output to render it strictly as a valid SVG element.

### 🔄 Core Flow:
1. **Prompt input** - The user enters the desired description.
2. **AI generation** - A model processes the request.
3. **SVG Parsing & Normalization** - The raw response is filtered to extract valid `<svg>` code.
4. **Rendering** - Visual display of the diagram in the interface.

---

## 🎨 Example Prompt & Output

Here is an example of what the AI can generate based on text prompts:

> **Prompt:** *“Give me a diagram for my AI-use case: the user query is sent to a prompt guardrail node, and then it goes to make an LLM API call through gateway. If successful, it goes through an output guardrail to the user.”*

[<img width="2757" height="1539" alt="image" src="https://github.com/user-attachments/assets/73711d07-91b0-4e91-9449-98e2418dbf1b" />](https://cdn.discordapp.com/attachments/1487010544987930734/1487057782564720650/image.png?ex=69c7c1fb&is=69c6707b&hm=a6e9562f65f78e016fa514fb42199d404e4ea051793774c0d044808a4000d090&)

---

## 🛠️ Current Frontend Status

The main application is located in the `frontend-diagram` directory and already includes the foundation for the rendering system:

* **SVG input editor**
* **SVG validation** (ensures the presence of `<svg ...></svg>` tags)
* **Render states** (empty, rendering, success, error)
* **Preview panel**
* **Copy and download utilities** for the generated diagram.

---

## 👥 Team Organization & Responsibilities

The project uses a split ownership model to streamline parallel development:

* **Owner A**: UI orchestration
* **Owner B**: API integration and text parsing mechanism
* **Owner C**: Renderer system

> 📌 **Team Execution Source of Truth:**
> For exact technical details regarding responsibilities, integration contracts (e.g., `type: 'svg'`, `code: string`), merge order, and testing criteria, the team must consult the main guide: [`frontend-diagram/TEAM_IMPLEMENTATION_GUIDE.md`](./frontend-diagram/TEAM_IMPLEMENTATION_GUIDE.md).

---

## 💻 Tech Stack

* **JavaScript** (Core logic)
* **CSS** (Styling)
* **HTML** (Structure)
* **NPM / Node.js** (Package management and local environment)

---

## ⚙️ Quick Start

To run the project locally, make sure you have [Node.js](https://nodejs.org/) installed, open a terminal, and follow these steps:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Robi2710/LSEGChallenge.git](https://github.com/Robi2710/LSEGChallenge.git)
   cd LSEGChallenge/frontend-diagram
   npm install
   npm run dev
