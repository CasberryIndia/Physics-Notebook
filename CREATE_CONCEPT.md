# AI Agent Runbook: Add Physics Concept Workflow

This runbook guides you, the AI agent, to automatically add a new concept to the Physics Notebook while fully complying with all rules, styles, accessibility guidelines, and templates.

---

## Step 1: Read the Checklist & Avoid Duplicates
Open and read [CONCEPTS_CHECKLIST.md](file:///Users/eswarprasaath/Documents/AI%20Playground/Physics-Notebook/CONCEPTS_CHECKLIST.md).
- Find the first unchecked concept (e.g., `- [ ] Rotational Dynamics` or `- [ ] Oscillations and Harmonic Motion`).
- Record the exact name of the concept and its corresponding domain.
- **CRITICAL**: Before proceeding, check `index.html` (specifically the `DATA` array and the Domains Overlay) and the `Concepts/` directory to see what concepts are already implemented in that domain. Ensure the new concept does not overlap or duplicate an existing simulation or page. If it is already implemented, check it off the checklist and find the next unchecked concept.


## Step 2: Web Search & Verification
Use the `search_web` tool to search for the physics concept.
- Gather accurate mathematical formulations, equations, and constants.
- Verify physical laws and definitions to ensure complete accuracy.
- Formulate a clear, elegant real-world analogy.
- Define 1-3 interactive variables (e.g., mass, velocity, angle, coefficient) with ranges, steps, units, and default values.

## Step 3: Generate the Concept HTML Page
Create the concept file under `Concepts/<concept-slug>.html` (where `<concept-slug>` is a URL-friendly name, e.g. `rotational-dynamics.html`).
- **Sections**: All concepts must have at least three highly informative and interactive sections (each with its own interactive canvas simulation and controls) to deeply explore the concept, matching the depth of `Concepts/newtons-laws-of-motion.html`. Do not stop after creating just one section.
- **Template**: Strictly follow the structure in [CONCEPT_PATTERN.md](file:///Users/eswarprasaath/Documents/AI%20Playground/Physics-Notebook/CONCEPT_PATTERN.md).
- **Aesthetic**: Minimalist academic design. Use vector-like drawing (lines, circles, simple arcs) on canvas. No cartoon representations.
- **Color Sync & Dark Mode**: Strictly bind all colors to the theme-derived CSS variables fetched from custom properties (`this.accent`, `this.accentSecondary`, `this.color`, `this.bg`). Do not hardcode hex/RGB values. Ensure the simulations look great and are perfectly legible in both light and dark modes.
- **Layout**: Use the top of the canvas for a clean horizontal status/dashboard bar of values (group at `y = 20 * scale` to `70 * scale`). Keep motion paths low (e.g., `trackY` at `0.44` to `0.52` of canvas height) to prevent overlapping.
- **Simulation Boundaries & Quality**: All canvas simulations must be uniquely crafted to accurately explain that specific concept. They must be highly interactive (e.g., support touching, hovering, tapping, clicking, and dragging to directly manipulate the physical systems within the canvas). Crucially, calculate dynamic scaling (e.g., `viewScale`) using `Math.min(this.canvas.width, this.canvas.height)` and apply proper centering offsets to ensure that the visualization is perfectly centered and never overflows or gets cropped outside the canvas window on any screen size.
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
2. **Add Visualization Class**: Implement a simplified mini-simulation class for the dashboard card by extending `BaseVisual`. **Important Note:** Unlike the `BaseVisual` class on individual concept pages, the index page's `BaseVisual` does **not** pre-calculate `this.cx` and `this.cy`. You must calculate the center manually in your `draw()` method using `this.width / 2` and `this.height / 2`.
3. **Link Class in switch-case**: Add the new case to the `renderGrid` method's switch statement to map `concept-type` to your new class.
4. **Register the Domain (if new)**:
   - Check the existing `<div class="filter-group">` filter chips. The current parent domains exposed as chips are: `Mechanics`, `Waves`, `Electromagnetism`, `Quantum`.
   - If the new concept belongs to a domain **not yet listed as a filter chip** (e.g., Thermodynamics, Relativity, Atomic/Nuclear, Condensed Matter, Astrophysics), add a new `<button class="filter-chip">` for it inside `#filterContainer`.
   - Also update the **Domains Overlay** (`#domainsOverlay`) — find the matching `<section class="domain-section">` for that domain and find the concept in the list. Change its `<li>` class from `concept-item--soon` to `concept-item--live`, wrap the concept name in an `<a>` tag pointing to its live page, and change the status span to `<span class="concept-status">Live</span>`. Change the section's badge from `domain-badge--new` to `domain-badge--active` if it doesn't already have one.

## Step 5: Verify & Run Accessibility Checks
1. Run a local development server if it isn't running: `python3 -m http.server 8000`.
2. Run the javascript syntax checker to ensure no syntax errors were introduced in the concept page:
   ```bash
   python3 scripts/check_concept_syntax.py Concepts/<concept-slug>.html
   ```
3. Run the static accessibility script:
   ```bash
   python3 scripts/check_static_accessibility.py
   ```
   Ensure there are no failures (e.g., target="_blank" links missing rel="noopener noreferrer", AI buttons missing labels, or remote Google font links).
4. Run browser accessibility checks:
   ```bash
   npm test
   ```
5. Verify keyboard accessibility and responsive scaling.
6. **Dark Mode Check**: Verify the page in both light mode and dark mode to ensure all text, canvas elements, and equations maintain high contrast and are clearly visible.

## Step 6: Mark Completed
Update [CONCEPTS_CHECKLIST.md](file:///Users/eswarprasaath/Documents/AI%20Playground/Physics-Notebook/CONCEPTS_CHECKLIST.md) to mark the concept as checked:
`- [x] Concept Name`
