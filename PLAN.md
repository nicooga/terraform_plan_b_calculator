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

### 0. 🏗️ Project Scaffolding

Bootstrap the project so all subsequent phases have a working foundation to build on.

- Initialize the project with `pnpm create vite` using the Solid + TypeScript template
- Install dependencies
- Verify the dev server starts and renders a basic page
- Commit the clean scaffold as the baseline

**📄 Deliverable:** A running Vite + Solid.js + TypeScript project with no application code yet.

---

### 1. 🧠 Design

Understand the domain well enough to define the core TypeScript types that will guide all subsequent work. Key questions to answer:

- What are the items in the game, and how are they categorized?
- What does a crafting recipe look like (inputs, outputs, quantities, ratios)?
- What buildings exist, and what recipes does each one handle?
- How do we represent a "build requirement" (the calculator's output)?
- **Terminal nodes:** `Item` carries a `raw: boolean` flag — raw items have no recipe and terminate graph traversal
- **Acyclicity:** the recipe graph must be a DAG; enforce this with a cycle-detection pass (e.g. DFS with a visited set) rather than assuming it
- **Quantity units:** the data model stores rates as `batchesPerYear`; the UI layer is responsible for converting to whatever unit is most readable (items/year, items/day, batches/year) — keep the conversion trivial and in one place

**📄 Deliverable:** `src/types.ts` — canonical types for `Item`, `Recipe`, `Building`, and `BuildRequirement` (and any supporting types). Types must be grounded in real game data, not assumptions.

---

### 2. 📊 Data

Research and encode all crafting recipes from the game by scraping the wiki. Each recipe must capture inputs, outputs, ratios, and the building that produces it.

#### ⚠️ Pre-flight check

Before writing the scraper, manually browse the wiki to verify recipe pages have consistent, parseable structure. If the wiki data is too inconsistent or sparse, encoding recipes by hand may be faster than scraping.


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
- **Fractions:** carry fractional building counts through the entire chain; never ceil mid-calculation — only at the display layer
- **Byproduct crediting:** optional mode — when enabled, surplus outputs from multi-output recipes are credited and reduce upstream demand for those items
- **Multiple recipe paths:** `calculate` accepts an optional `recipeSelections` map (`ItemId → RecipeId`) to resolve ambiguity; defaults to the first recipe if unspecified

**📄 Deliverables:**

- `src/calculator.ts` — two pure functions:
  - `getAmbiguousItems(itemId) → ItemId[]` — returns all items in the chain that have multiple recipe paths; the UI calls this first to render recipe pickers before calculating
  - `calculate(itemId, quantity, recipeSelections?) => BuildRequirement[]` — walks the recipe graph and returns one `BuildRequirement` per recipe step
- `src/calculator.test.ts` — unit tests covering single-step recipes, multi-step chains, raw resources (no recipe), and items with multiple recipe paths

---

### 4. 🖥️ UI

Build the player-facing interface. Keep it minimal and keyboard-friendly.

- Item selector (searchable dropdown or autocomplete)
- Quantity input (in items/year)
- Results panel with two views: per-recipe breakdown and aggregated summary by building type
- Building counts shown as fractionals — the user decides whether to ceil; a tooltip or label clarifies that the value means "at least N buildings needed"
- For items with multiple recipe paths: a per-item recipe picker so the user can switch between options
- Byproduct crediting toggle (checkbox with a clear description of what it does)
- Basic keyboard navigation (tab through fields, submit on Enter)

#### Mockup

**Step 1 — Input**
```
┌──────────────────────────────────────┐
│  Item     [ High-Tech Parts      ▾ ] │
│  Quantity [ 30 ________________ ]    │
│                                      │
│  [ Calculate ]                       │
└──────────────────────────────────────┘
```

**Step 2 — Recipe pickers (only shown for ambiguous items)**
```
┌──────────────────────────────────────┐
│  Steel Bar   (●) Factory             │
│              ( ) Recycling Center    │
│                                      │
│  Polymer Bar (●) Factory             │
│              ( ) Recycling Center    │
│                                      │
│  [x] Credit byproducts               │
│      Surplus outputs reduce upstream │
│      demand for the same item        │
└──────────────────────────────────────┘
```

**Step 3 — Results**
```
┌──────────────────────────────────────┐
│  [ Summary ] [ Breakdown ]           │
├──────────────────────────────────────┤
│  Summary                             │
│  ×6.5  Factory                       │
│  ×9    Extractor                     │
│  ×6    Atmospheric Extractor         │
├──────────────────────────────────────┤
│  Breakdown                           │
│  ×1.5  Factory     Al + Poly → Hi-Tech Parts  │
│  ×2    Factory     Iron Ore  → Aluminum Bar   │
│  ×3    Factory     Carbon    → Polymer Bar    │
│  ×9    Extractor   → Iron Ore                 │
│  ×6    Atm. Extr.  → Carbon                   │
│                                      │
│  * fractional count = minimum needed │
└──────────────────────────────────────┘
```

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
