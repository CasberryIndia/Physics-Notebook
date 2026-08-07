# Physics Notebook Style Guide

This document defines the shared visual rules for Physics Notebook. It is the
baseline contributors should preserve when adding or changing pages.

## Design intent

- Keep the site academic, calm, and direct.
- Pair editorial typography with practical UI controls.
- Let layout and spacing carry hierarchy instead of decorative chrome.
- Favor readable content and legible simulations over visual effects.

## Typography

- Headings use `DM Serif Display`.
- Body and interface text use `Inter`.
- Technical labels, values, and code-adjacent UI use `JetBrains Mono`.
- Fonts are bundled locally under `assets/fonts/` and loaded from
  `css/common.css`.
- Prefer the shared CSS variables instead of hardcoding font families:
  `var(--font-serif)`, `var(--font-sans)`, and `var(--font-mono)`.

### Type roles

- `h1` and major section headings should feel editorial, not dense.
- Body copy should stay near the current `1rem` to `1.05rem` scale with relaxed
  line height.
- Monospace should be reserved for equations, numeric readouts, and small UI
  labels, not long paragraphs.

## Color system

Core tokens live in `css/common.css`.

- Light theme background: warm off-white, not pure white.
- Dark theme background: near-black neutral, not blue-black.
- Primary accent: blue.
- Secondary accent: red.
- Borders and cards stay subtle.

### Rules

- Reuse the existing CSS custom properties instead of inventing page-local
  colors when shared tokens are sufficient.
- Keep decorative color use restrained; color should communicate emphasis,
  interaction, or state.
- Ensure text and control contrast stays at least at the current accessible
  baseline.

## Layout

### Global structure

- Shared layout primitives live in `css/common.css`.
- The library page uses `css/home.css`.
- Concept pages use `css/article.css` plus small page-local additions only when
  needed.

### Home page

- Navigation is compact and utility-focused.
- The search and filter area should stay functional, not promotional.
- Concept cards should read like browseable entries, not dashboard widgets.

### Concept pages

- Use a hero section followed by stacked teaching sections.
- Each teaching section should use the existing `split-layout` pattern:
  content on one side, visualization on the other.
- The visualization column should remain secondary to the explanation in the
  information hierarchy, even when it is visually prominent.
- Keep references as a distinct closing section.

## Surfaces and spacing

- Cards and panels use restrained radii and light borders.
- Spacing should follow the existing 8/12/16/24/32 rhythm already present in
  the CSS.
- Avoid adding new panel types when a shared card or section container already
  exists.

## Motion

- Motion should support reading and orientation, not spectacle.
- Existing GSAP entrance animations are acceptable because they are simple and
  short.
- Avoid large transforms, floaty hover motion, glow effects, and decorative
  looping animation.
- Simulation motion should explain the physics, not just animate for ambience.

## Interaction rules

- Shared browser behavior belongs in `js/common.js`.
- Homepage cards must remain real links.
- Icon-only buttons must expose accessible names.
- New tabs must use safe external navigation patterns.
- Simulation controls should expose accessible names and state.

## Canvas and simulation guidance

- Canvas visuals should be readable within a few seconds without requiring the
  user to infer hidden state.
- Show clear apparatus geometry when it matters to the explanation.
- If a simulation accumulates state over time, ensure the accumulation is
  visible and not dependent on tiny, low-contrast marks.
- Prefer simple detector guides, histograms, labels, or status text over
  purely decorative effects.
- **Simulation Boundaries**: All canvas simulations must be completely contained within the canvas window without overflowing or getting cropped. Calculate scaling dynamically based on the canvas dimensions (e.g., using `Math.min(width, height)`) and perfectly center the visualization.

## Accessibility baseline

- Keyboard access is required for primary navigation and interactive controls.
- Focus states must remain visible.
- Contrast should stay compatible with the existing CLI/browser checks.
- Canvas content should expose accessible names or descriptions through the
  shared accessibility helpers.
- When adding sliders or buttons for simulations, verify status and value text
  are surfaced to assistive tech.

## Contributor rules

- Do not reintroduce remote font loading for the shared site fonts.
- Reuse `css/common.css`, `css/home.css`, and `css/article.css` before adding
  page-local CSS.
- Extend existing patterns before creating new ones.
- Update this guide when the project makes a real cross-site design decision,
  not for one-off experiments.
