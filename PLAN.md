# 🪐 Terraform Plan B Calculator

## 🎯 Objective

A calculator for the game *Terraform Plan B* that understands item crafting ratios and tells the player exactly which production buildings to build and how many.

## 🚀 Mission

Provide an online interface where the player selects an item and a target quantity, and receives back a breakdown of the crafting buildings required to produce it.

## ✅ MVP

- 🌐 Online interface
- ⌨️ Basic keyboard navigation
- ⚖️ Correct item ratios
- 🎨 Minimal UI

---

## 🛠️ Tech Stack

- **⚡ Framework:** Solid.js — React-like JSX and API, but fine-grained reactivity (no VDOM). Components render once; only dependent DOM nodes update on state change.
- **📦 Build tool:** Vite — fast dev server, zero config
- **🔷 Language:** TypeScript
- **🎨 Styling:** Plain CSS / CSS modules — keeps things minimal and dependency-free

---

## 📋 Phases

### 1. 🧠 Design

Understand the domain well enough to define the core TypeScript types that will guide all subsequent work. Key questions to answer:

- What are the items in the game, and how are they categorized?
- What does a crafting recipe look like (inputs, outputs, quantities, ratios)?
- What buildings exist, and what recipes does each one handle?
- How do we represent a "build requirement" (the calculator's output)?

**📄 Deliverable:** `src/types.ts` — canonical types for `Item`, `Recipe`, `Building`, and `BuildRequirement` (and any supporting types). Types must be grounded in real game data, not assumptions.

---

### 2. 📊 Data

Research and encode all crafting recipes from the game by scraping the wiki. Each recipe must capture inputs, outputs, ratios, and the building that produces it.

#### 🕷️ Scraper script (`scripts/scrape.ts`)

A Node.js/TypeScript script that fetches recipe data from the wiki and writes it to disk.

Requirements:
- **Idempotent** — running it multiple times produces the same output; safe to re-run at any time
- **Resilient** — retries failed requests with exponential backoff; skips and logs individual page failures without aborting the whole run
- **Fast** — fetches pages concurrently with a controlled concurrency limit (e.g. p-limit)
- **Cached** — saves raw HTML responses to a local cache dir so re-runs don't re-fetch unchanged pages
- **Typed output** — writes `src/data/recipes.ts` conforming to the types from Phase 1
- **Validated** — parses and validates each scraped recipe against the TypeScript types before writing; reports any schema mismatches

#### Running the scraper

```bash
pnpm scrape          # full run (uses cache where available)
pnpm scrape --fresh  # bust cache and re-fetch everything
```

**📄 Deliverables:**
- `scripts/scrape.ts` — the scraper
- `src/data/recipes.ts` — complete, typed recipe dataset produced by the scraper

---

### 3. 🔢 Calculator Logic

Implement the core calculation: given an item and a target quantity, compute the required buildings.

- Walk the recipe graph for the requested item
- Account for building throughput and crafting ratios
- Return a structured `BuildRequirement[]` result
- Cover edge cases: items with multiple recipe paths, raw resources with no recipe

**📄 Deliverable:** `src/calculator.ts` — a pure function `calculate(item, quantity) => BuildRequirement[]`.

---

### 4. 🖥️ UI

Build the player-facing interface. Keep it minimal and keyboard-friendly.

- Item selector (searchable dropdown or autocomplete)
- Quantity input
- Results panel showing building types and counts
- Basic keyboard navigation (tab through fields, submit on Enter)

**📄 Deliverable:** A working single-page app wired to the calculator logic.

---

### 5. 🚢 Integration & Polish

Connect all layers and ensure the app is ready to ship.

- Wire UI to calculator
- Handle loading, empty, and error states
- Cross-browser smoke test
- Deploy to GitHub Pages via a GitHub Actions workflow that builds and publishes on every push to `main`

**📄 Deliverables:**
- `.github/workflows/deploy.yml` — CI/CD pipeline that builds and deploys to GitHub Pages
- Live, publicly accessible URL 🎉
