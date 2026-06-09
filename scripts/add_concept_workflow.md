# AI Agent Runbook: Add Physics Concept Workflow

This runbook guides you, the AI agent, to automatically add a new concept to the Physics Notebook while fully complying with all rules, styles, accessibility guidelines, and templates.

---

## Step 1: Read the Checklist
Open and read [CONCEPTS_CHECKLIST.md](file:///Users/eswarprasaath/Documents/AI%20Playground/Physics-Notebook/CONCEPTS_CHECKLIST.md).
- Find the first unchecked concept (e.g., `- [ ] Rotational Dynamics` or `- [ ] Oscillations and Harmonic Motion`).
- Record the exact name of the concept.

## Step 2: Web Search & Verification
Use the `search_web` tool to search for the physics concept.
- Gather accurate mathematical formulations, equations, and constants.
- Verify physical laws and definitions to ensure complete accuracy.
- Formulate a clear, elegant real-world analogy.
- Define 1-3 interactive variables (e.g., mass, velocity, angle, coefficient) with ranges, steps, units, and default values.

## Step 3: Generate the Concept HTML Page
Create the concept file under `Concepts/<concept-slug>.html` (where `<concept-slug>` is a URL-friendly name, e.g. `rotational-dynamics.html`).
- **Template**: Strictly follow the structure in [CONCEPT_PATTERN.md](file:///Users/eswarprasaath/Documents/AI%20Playground/Physics-Notebook/CONCEPT_PATTERN.md).
- **Aesthetic**: Minimalist academic design. Use vector-like drawing (lines, circles, simple arcs) on canvas. No cartoon representations.
- **Color Sync**: Strictly bind all colors to the theme-derived CSS variables fetched from custom properties (`this.accent`, `this.accentSecondary`, `this.color`, `this.bg`). Do not hardcode hex/RGB values.
- **Layout**: Use the top of the canvas for a clean horizontal status/dashboard bar of values (group at `y = 20 * scale` to `70 * scale`). Keep motion paths low (e.g., `trackY` at `0.44` to `0.52` of canvas height) to prevent overlapping.
- **Typography & Scale**: Use responsive font scaling in the canvas loop (using `this.scale` for high-DPI scaling):
  ```javascript
  let fontSize = 15 * this.scale;
  if (this.canvas.width < 750 * this.scale) fontSize = 13 * this.scale;
  if (this.canvas.width < 600 * this.scale) fontSize = 11 * this.scale;
  if (this.canvas.width < 450 * this.scale) fontSize = 9.5 * this.scale;
  this.ctx.font = `700 ${fontSize}px 'JetBrains Mono', monospace`;
  ```
- **Controls**: Place input sliders *above* the canvas simulation on mobile/tablet responsive views. Ensure controls and canvas fit within the device viewport together.
- **Local Fonts**: Do not include any remote Google Fonts links. Shared typography is loaded locally from `css/common.css`.

## Step 4: Register in `index.html`
Open [index.html](file:///Users/eswarprasaath/Documents/AI%20Playground/Physics-Notebook/index.html).
1. **Add Data Entry**: Insert the new concept metadata into the `DATA` array:
   ```javascript
   {
       id: 'concept-id',
       title: 'Concept Title',
       domain: 'Domain Name',
       desc: 'Short description for the card.',
       type: 'concept-type',
       href: 'Concepts/concept-slug.html'
   }
   ```
2. **Add Visualization Class**: Implement a simplified mini-simulation class for the dashboard card by extending `BaseVisual`.
3. **Link Class in switch-case**: Add the new case to the `renderGrid` method's switch statement to map `concept-type` to your new class.
4. **Register the Domain (if new)**:
   - Check the existing `<div class="filter-group">` filter chips. The current parent domains exposed as chips are: `Mechanics`, `Waves`, `Electromagnetism`, `Quantum`.
   - If the new concept belongs to a domain **not yet listed as a filter chip** (e.g., Thermodynamics, Relativity, Atomic/Nuclear, Condensed Matter, Astrophysics), add a new `<button class="filter-chip">` for it inside `#filterContainer`.
   - Also update the **Domains Overlay** (`#domainsOverlay`) — find the matching `<section class="domain-section">` for that domain and add the new concept as a new `<li class="concept-item concept-item--live">` entry with a link to its live page. Change the section's badge from `domain-badge--new` to `domain-badge--active` once it has at least one live concept.

## Step 5: Verify & Run Accessibility Checks
1. Run a local development server if it isn't running: `python3 -m http.server 8000`.
2. Run the static accessibility script:
   ```bash
   python3 scripts/check_static_accessibility.py
   ```
   Ensure there are no failures (e.g., target="_blank" links missing rel="noopener noreferrer", AI buttons missing labels, or remote Google font links).
3. Run browser accessibility checks:
   ```bash
   npm test
   ```
4. Verify keyboard accessibility and responsive scaling.

## Step 6: Mark Completed
Update [CONCEPTS_CHECKLIST.md](file:///Users/eswarprasaath/Documents/AI%20Playground/Physics-Notebook/CONCEPTS_CHECKLIST.md) to mark the concept as checked:
`- [x] Concept Name`
