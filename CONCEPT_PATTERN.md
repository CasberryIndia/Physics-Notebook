# Physics Notebook: Concept Page Pattern

This guide documents the standard pattern for creating new concept pages in the Physics Notebook project. Follow this template to ensure consistency in design, functionality, and code structure.

## 1. File Structure & Location
-   **New Concept File**: Create in `Concepts/<concept-name>.html`.
-   **Asset Linking**: Ensure CSS (`../css/`) and JS (`../js/`) paths are correct relative to the `Concepts/` directory.
-   **Analytics**: Do not manually add Google Analytics (gtag.js) script tags to new concept pages. Analytics tracking is initialized automatically when `../js/common.js` is imported.

## 2. HTML Template
Use the following structure for the HTML file.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Concept Title] • Physics Notebook</title>

    <!-- Standard Framework Styles -->
    <link rel="stylesheet" href="../css/common.css">
    <link rel="stylesheet" href="../css/article.css">
    
    <!-- Page Specific Styles -->
    <style>
        /* AI Links & Buttons styling */
        .ai-links {
            display: flex;
            gap: 0.8rem;
            margin-top: 1rem;
            align-items: center;
        }

        .ai-label {
            font-size: 0.8rem;
            opacity: 0.6;
            margin-right: 0.2rem;
            font-weight: 500;
        }

        .ai-btn {
            background: var(--bg-color);
            border: 1px solid var(--line-subtle);
            color: var(--text-muted);
            min-width: 36px;
            height: 36px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            padding: 0 8px;
        }

        .ai-btn svg {
            width: 20px;
            height: 20px;
            fill: currentColor;
        }

        /* Specific styles for interactive controls */
        .sim-controls {
            margin-top: 1.5rem;
            padding: 1.5rem;
            background: var(--card-bg);
            border: 1.5px solid var(--border-color);
            border-radius: 8px;
        }
    </style>

    <!-- MathJax (LaTeX) Support -->
    <script>
        window.MathJax = { tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] } };
    </script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

    <!-- Theme Initialization -->
    <script>
        const savedTheme = localStorage.getItem('physics-notebook-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    </script>

    <!-- Libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
    <!-- Navbar -->
    <nav class="sticky">
        <div class="nav-bg"></div>
        <a href="../index.html" class="logo"><i data-lucide="arrow-left" width="16"></i> Library</a>
        <button id="themeBtn"><i data-lucide="moon" width="16"></i> Theme</button>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
        <div class="text-reveal-wrapper">
            <h1 class="hero-title">[Concept Title]<br>[Second Line]</h1>
            <p style="margin-top: 2rem; font-size: 1.4rem; max-width: 40ch;">
                [One sentence description of the concept].
            </p>
        </div>
    </section>

    <!-- Standard Section Layout (Repeat for 3 Sections) -->
    <section>
        <div class="split-layout">
            <!-- Left: Content -->
            <div class="content-col">
                <h3 class="section-label" style="color: var(--accent);">01. [Section Label]</h3>
                <h2>[Section Title]</h2>
                <p>[Explanatory text...]</p>
                
                <!-- Math Block -->
                <div class="math-block">$$ [Equation] $$</div>
                
                <!-- Setup/Analogy Card -->
                <div class="etu-card">
                    <span class="etu-tag">Real World Analogy</span>
                    <h4 style="margin-bottom:0.5rem;">[Analogy Title]</h4>
                    <p style="font-size: 0.95rem; margin-bottom:0;">[Analogy Description]</p>
                </div>

                <!-- AI Links -->
                <div class="ai-links">
                    <span class="ai-label">Ask AI:</span>
                    <!-- Automatically populated with clean, standardized SVGs by AILinksManager inside common.js on load -->
                    <button onclick="openAI('topic', 'claude')" class="ai-btn" title="Ask Claude"></button>
                    <button onclick="openAI('topic', 'gemini')" class="ai-btn" title="Ask Gemini"></button>
                    <button onclick="openAI('topic', 'chatgpt')" class="ai-btn" title="Ask ChatGPT"></button>
                    <button onclick="openAI('topic', 'grok')" class="ai-btn" title="Ask Grok"></button>
                    <button onclick="openAI('topic', 'perplexity')" class="ai-btn" title="Ask Perplexity"></button>
                </div>
                
                <!-- Interactive Controls (Optional) -->
                <div class="sim-controls">
                    <div class="slider-group">
                        <label>[Variable Name] <span id="val-[id]">[Default]</span>[Unit]</label>
                        <input type="range" id="input-[id]" min="[min]" max="[max]" step="[step]" value="[default]">
                    </div>
                </div>
            </div>

            <!-- Right: Visualization -->
            <div class="visual-col">
                <canvas id="canvas-[id]"></canvas>
            </div>
        </div>
    </section>

    <div class="divider"></div>

    <!-- Additional sections follow same pattern... -->

    <!-- References -->
    <section class="references">
        <div style="max-width: 800px; margin: 0 auto;">
            <h3>Academic References</h3>
            <ul>
                <li><strong>[Author]</strong> ([Year]). <em>[Title]</em>, [Details].</li>
            </ul>
        </div>
    </section>

    <!-- Scripts -->
    <script src="../js/common.js"></script>
    <script>
        // ... Page Specific JS (See Section 3) ...
    </script>
</body>
</html>
```

## 3. JavaScript Architecture

The JavaScript structure handles the canvas animations, theme updates, and intersection observing (for performance).

### 3.1 Standard `openAI` Function
Use the shared `launchAIPrompt()` helper from `../js/common.js` instead of
duplicating direct provider and clipboard logic in each page.

```javascript
function openAI(topic, model) {
    let prompt = "";
    // Define prompts based on specific topics in the page
    switch (topic) {
        case 'topic1': prompt = "Query 1..."; break;
        // ...
    }
    launchAIPrompt(model, prompt);
}
```

### 3.2 The `APP` Object
Manages initialization and lifecycle.

```javascript
const APP = {
    visuals: [],
    observer: null,

    init() {
        this.setupObserver();
        this.initScrollAnimations(); // GSAP setup
        this.initVisuals(); // Instantiate visuals

        // Listen for theme changes to update canvas colors
        window.addEventListener('theme-changed', (e) => {
            this.visuals.forEach(v => v.updateColors());
        });
    },

    setupObserver() {
        // Only render canvases when visible
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const visual = this.visuals.find(v => v.canvas === entry.target);
                if (visual) visual.isVisible = entry.isIntersecting;
            });
        }, { threshold: 0.1 });
    },

    initVisuals() {
        this.addVisual(new VisualClass1('canvas-id-1'));
        this.addVisual(new VisualClass2('canvas-id-2'));
    },

    addVisual(visual) {
        this.visuals.push(visual);
        this.observer.observe(visual.canvas);
    }
};

window.onload = () => APP.init();
```

### 3.3 Visual Classes
All visualizations should extend a `BaseVisual` class to handle common canvas logic (HiDPI scaling, colors, loop).

```javascript
class BaseVisual {
    constructor(id) {
        this.canvas = document.getElementById(id);
        this.ctx = this.canvas.getContext('2d');
        this.isVisible = false;
        this.updateColors();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.loop();
    }
    updateColors() {
        // Fetch CSS variables for theme consistency
        this.color = getComputedStyle(document.body).getPropertyValue('--text-main').trim();
        this.bg = getComputedStyle(document.body).getPropertyValue('--bg-color').trim();
        this.accent = getComputedStyle(document.body).getPropertyValue('--accent').trim();
        this.secondary = getComputedStyle(document.body).getPropertyValue('--accent-secondary').trim();
    }
    resize() {
        // Handle Retina/HighDPI displays
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width * 2;
        this.canvas.height = rect.height * 2;
        this.scale = 2;
        this.cx = this.canvas.width / 2;
        this.cy = this.canvas.height / 2;
    }
    loop() {
        if (this.isVisible) this.draw();
        requestAnimationFrame(() => this.loop());
    }
    draw() { /* Override this */ }
}

class MySpecificVisual extends BaseVisual {
    constructor(id) {
        super(id);
        
        // Initialize interactive parameters
        this.customParam = 0;
        
        // Hook up slider controls
        const input = document.getElementById('input-[id]');
        if (input) {
            input.addEventListener('input', (e) => {
                this.customParam = parseFloat(e.target.value);
                const valDisplay = document.getElementById('val-[id]');
                if (valDisplay) valDisplay.innerText = e.target.value;
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Custom drawing logic using this.ctx, this.cx, this.cy, this.scale
        // Use this.customParam in your visualizations
    }
}
```

## 4. Integration
1.  Add the new file to `Concepts/`.
2.  Serve the repo locally and open `http://localhost:8000/index.html`.
3.  Add a new entry to the `DATA` array:
    ```javascript
    {
        id: 'new-id',
        title: 'New Concept Title',
        domain: 'Domain Name',
        desc: 'Short description for the card.',
        type: 'new-type', // Used to map to your unique visual class
        href: 'Concepts/new-concept.html'
    }
    ```
4.  Create a unique visualization class for the index page card by extending `BaseVisual` inside `index.html`:
    ```javascript
    class NewConceptVisual extends BaseVisual {
        // Implement your own custom draw() loop for the card animation
        draw() {
            if (!this.isVisible) return;
            this.time += 0.05;
            this.clear();
            // custom animation code here
        }
    }
    ```
5.  Link the new visual class in the `renderGrid` function's switch statement inside `index.html`:
    ```javascript
    switch (item.type) {
        // ... existing cases ...
        case 'new-type': visual = new NewConceptVisual(canvas); break;
        default: visual = new BaseVisual(canvas);
    }
    ```

## 5. Design & Accessibility Standards
- **Shared Typography**: Standard site fonts are bundled locally and loaded through `../css/common.css`. Do not add page-level Google Fonts includes for `DM Serif Display`, `Inter`, or `JetBrains Mono`.
- **Shared Design Rules**: Read `STYLE_GUIDE.md` before changing shared typography, layout, color, or motion behavior.
- **Minimalist Academic Aesthetic vs. Cartoon Realism**:
  - All canvas simulations must represent physical systems using clean, abstract, minimalist vector graphics (such as simple circles, paths, and lines) rather than literal, cartoon-like, or game-like illustrations (e.g., detailed cars, cart wheels, asphalt texture fills, or road markings). Keep the visuals looking like an elegant, premium academic textbook.
  - Strictly bind all drawing colors to theme-derived variables fetched from the CSS custom properties (`this.accent` for primary, `this.accentSecondary` for secondary, and `this.color` for standard text/lines) instead of hardcoding arbitrary colors, ensuring native dark and light theme adaptability.
- **Non-Overlapping Compositions & Horizontal Dashboard Layouts**:
  - To prevent animated physics elements (like carts, blocks, pendulums, or vectors) from overlapping readouts, **never use bulky floating HUD boxes** in the active simulation area.
  - Standardize on a **sleek, horizontal status bar spanning the full width of the canvas top** (typically `y = 20 * scale` to `70 * scale`) to group and display live variables cleanly, similar to a professional instrument cluster.
  - Position tracks, roads, and active motion paths lower down vertically (e.g., `trackY` at `0.44` to `0.52` of canvas height) to maintain a massive visual safety margin (minimum `100px` scaled) between the top dashboard bar and the highest path of any animated object.
  - **Simulation Boundaries & Quality**: All canvas simulations of each concept should not overflow the canvas window and should be highly interactive (e.g., support touching, hovering, tapping, clicking, and dragging to directly manipulate the physical systems). All simulations must be uniquely crafted to accurately explain that specific concept. Crucially, calculate dynamic scaling (e.g., `viewScale`) using `Math.min(this.canvas.width, this.canvas.height)` and apply proper centering offsets to ensure that the visualization is perfectly centered and never overflows or gets cropped outside the canvas window on any screen size.
- **Fluid Sizing & Concise Scientific Notation**:
  - Always implement dynamic, responsive font scaling in the drawing loop to guarantee readouts fit side-by-side in columns on narrow mobile/tablet screen viewports:
    ```javascript
    let fontSize = 15 * this.scale;
    if (this.canvas.width < 750 * this.scale) fontSize = 13 * this.scale;
    if (this.canvas.width < 600 * this.scale) fontSize = 11 * this.scale;
    if (this.canvas.width < 450 * this.scale) fontSize = 9.5 * this.scale;
    this.ctx.font = `700 ${fontSize}px 'JetBrains Mono', monospace`;
    ```
  - Standardize on compact, internationally recognized physics variables and abbreviations (e.g., `W_applied`, `Heat (Q)`, `KE`, `Velocity (v)`, `d_stop`) instead of verbose text strings. This cuts label lengths by over **60%**, eliminating text collisions and maximizing screen utilization.
- **Readable and Responsive Simulation Text**: The text labels in the simulations must be clearly readable. Make sure they are responsive for all devices (e.g., using dynamic sizing with `this.scale` for high-DPI displays) and clearly legible across all simulations.
- **Interactive Controls Placement**: Interactive controls, such as sliders, toggle switches, or buttons, must always be positioned **above** the simulations on mobile and tablet responsive views. Furthermore, both the controls and the canvas simulation they affect should comfortably fit within the viewport of the device simultaneously to prevent the user from having to scroll up and down to observe the simulation changes.
- **Mobile & Tablet Responsiveness**:
  - The site and all concept pages must be fully responsive. Ensure all layout components wrap cleanly on screens down to 320px width.
  - **Avoid MathJax in Form Controls**: Do not use MathJax/LaTeX notation (like `$\tau$`, `$l_1$`) inside input sliders, buttons, or `<label>` tags. MathJax containers create layout shifts, vertical offsets, and wide spacing gaps on small viewports. Use clean, native Unicode characters (e.g., `τ`, `l₁`, `l₂`, `q₀`, `θ₀`) for standard mathematical symbols inside controls.
  - Ensure the navigation bar has a solid or highly opaque background to mask underlying content when scrolling, preventing text overlaps.
  - Verify that canvas sizes fit perfectly inside their parent column containers dynamically without horizontal clipping.
