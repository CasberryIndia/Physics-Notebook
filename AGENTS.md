# Physics Notebook Agent Guide

This repository is a static site. There is no build step or package manifest.
Primary entry points are `index.html`, `contribute.html`, `Concepts/*.html`,
`js/common.js`, and the shared styles under `css/`.

Use PowerShell on Windows by default on this machine. `git`, `gh`, `python`,
`node`, and `rg` are available. For machine-wide or cross-project workflow
questions, consult `C:\Users\tillh\AGENTS.md` and the Agent Bureau via the
`$bureau-context` skill.

Preferred local workflow

- Serve the repo locally from the root with `python -m http.server 8000`.
- Validate in the browser via `http://localhost:8000`; do not rely on
  `file://` for feature checks because clipboard and related browser APIs may be
  unavailable there.
- Deployment is defined in `.github/workflows/deploy.yml` and only triggers on
  pushes to `main`.

Editing rules

- Keep the site dependency-light and browser-native. Reuse `js/common.js` for
  shared behavior instead of duplicating helpers across concept pages.
- When opening external links in a new tab, use `rel="noopener noreferrer"` on
  anchors or the shared JS helper in `js/common.js`.
- Concept pages should keep the existing relative path convention from
  `Concepts/` to `../css/` and `../js/`.
- Shared typography is vendored under `assets/fonts/` and loaded from
  `css/common.css`; do not reintroduce Google Fonts tags for those families.
- Consult `STYLE_GUIDE.md` before making cross-page layout, typography, color,
  or motion changes.
- If you add a new concept page, update the `DATA` array in `index.html` and
  follow `CONCEPT_PATTERN.md`. For automated concept generation, use
  `CREATE_CONCEPT.md` as the primary runbook.

Verification

- Smoke test `index.html` and each edited concept page through the local server.
- Run `python scripts/check_static_accessibility.py` when touching cards, AI
  buttons, or `_blank` links.
- Run `npm run check:browser-a11y` or `npm test` when changing keyboard
  navigation, accessible names, core text contrast, or canvas semantics.
- When changing sliders or simulation controls, verify `aria-valuetext` and
  the live simulation status exposed by `js/common.js`.
- Re-run targeted searches for duplicated `window.open(` patterns, unsafe
  `target="_blank"` usage, and broken element ids when touching shared page
  structure.
