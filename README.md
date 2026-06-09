# Physics Notebook 🔬

> An interactive collection of physics concepts with beautiful visualizations and real-time simulations

<div align="center">

[![GitHub stars](https://img.shields.io/github/stars/CasberryIndia/Physics-Notebook?style=social)](https://github.com/CasberryIndia/Physics-Notebook/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/CasberryIndia/Physics-Notebook)

[Live Link](https://physics-notebook.casberry.in) • [Report Bug](https://github.com/CasberryIndia/Physics-Notebook/issues) • [Request Feature](https://github.com/CasberryIndia/Physics-Notebook/issues)

</div>

---

## 📖 About

Physics Notebook is an open-source interactive learning platform that brings physics concepts to life through beautiful visualizations and real-time simulations. Each concept features:

- 🎨 **Interactive Canvas Animations** - Real-time visualizations built with HTML5 Canvas
- 🧮 **Mathematical Equations** - Rendered beautifully using MathJax
- 🤖 **AI Integration** - Quick access to AI assistants (Perplexity, Gemini, ChatGPT, Claude, Grok)
- 🎛️ **Adjustable Parameters** - Sliders and controls to explore different scenarios
- 🌓 **Dark/Light Mode** - Seamless theme switching
- 📱 **Responsive Design** - Works beautifully on all devices

## ✨ Features

### Current Concepts

#### **Mechanics**
- 🌀 Harmonic Oscillation
- 🏹 Projectile Motion
- 🪐 Orbital Mechanics
- ⏱️ Simple Pendulum
- 🔄 Rotational Dynamics
- 🛠️ Lagrangian & Hamiltonian Mechanics

#### **Waves & Optics**
- 🌊 Wave Interference
- 🔍 Double Slit Experiment

#### **Electromagnetism**
- ⚡ Electric Fields

### Technical Highlights

- **Zero Dependencies** - Pure vanilla JavaScript (except MathJax)
- **Performance Optimized** - IntersectionObserver for canvas rendering
- **HiDPI/Retina Support** - Crystal clear on all displays
- **GSAP Animations** - Smooth scroll-triggered animations
- **Modular Architecture** - Easy to extend with new concepts

## 🚀 Getting Started

### Prerequisites

You only need a modern web browser! No build process or dependencies required.

### Installation

1. Clone the repository
```bash
git clone https://github.com/CasberryIndia/Physics-Notebook.git
cd Physics-Notebook
```

2. Start a local server from the repo root
```bash
# Using Python's built-in server
python -m http.server 8000

# Or using Node's http-server
npx http-server
```

3. Navigate to `http://localhost:8000`

Serving the site locally is the recommended workflow. Some browser APIs used by the AI-assist buttons are restricted on `file://` pages.

That's it! 🎉

## 📂 Project Structure

```
Physics-Notebook/
├── index.html              # Main library page
├── STYLE_GUIDE.md          # Shared layout and design rules
├── CONCEPT_PATTERN.md      # Guide for creating new concepts
├── assets/
│   └── fonts/              # Local webfont binaries and licenses
├── Concepts/               # Individual concept pages
│   ├── simple-pendulum.html
│   ├── double-slit-experiment.html
│   ├── orbital-mechanics.html
│   └── ...
├── css/
│   ├── common.css          # Shared styles
│   ├── home.css            # Library page styles
│   └── article.css         # Concept page styles
└── js/
    └── common.js           # Theme toggle & utilities
```

## 🤝 Contributing

We love contributions! Whether it's a new physics concept, bug fix, or improvement, your help is welcome.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-concept`)
3. **Make your changes**
4. **Test thoroughly** - Open your concept in a browser
5. **Commit your changes** (`git commit -m 'Add amazing new concept'`)
6. **Push to the branch** (`git push origin feature/amazing-concept`)
7. **Open a Pull Request**

### Creating a New Concept

Follow our comprehensive [CONCEPT_PATTERN.md](CONCEPT_PATTERN.md) guide. Here's the quick version:

#### 1. Create Your Concept File

Create a new HTML file in the `Concepts/` directory:

```bash
touch Concepts/your-concept-name.html
```

#### 2. Follow the Standard Structure

Every concept should have:

- **HTML Structure**
  - `<head>` with proper metadata, shared styles, MathJax, GSAP, Lucide icons
  - Navigation bar with back button and theme toggle
  - Hero section with concept title and description
  - 3 sections with split-layout (content + visualization)
  - References section

- **Section Components** (repeat for 3 sections)
  - Section label (01, 02, 03)
  - Content column with:
    - Title and description
    - Mathematical equations in `<div class="math-block">`
    - Concept cards (`<div class="etu-card">`)
    - AI assistance links (all 5 providers)
    - Interactive controls (`<div class="sim-controls">`)
  - Visualization column with `<canvas>` element

- **JavaScript Architecture**
  - `openAI()` function for AI integrations
  - `APP` object managing initialization
  - `BaseVisual` class for canvas rendering
  - Specific visual classes extending BaseVisual
  - IntersectionObserver for performance
  - GSAP scroll animations

#### 3. Example: Basic Visual Class

```javascript
class MyConceptVisual extends BaseVisual {
    constructor(id) {
        super(id);
        this.time = 0;
        this.setupControls();
    }

    setupControls() {
        const slider = document.getElementById('my-slider');
        slider.addEventListener('input', (e) => {
            this.parameter = parseFloat(e.target.value);
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.time += 0.03;
        
        // Your visualization logic here
        // Use this.color, this.accent, this.scale, etc.
        // from BaseVisual
    }
}
```

#### 4. Add to Main Index

Update `index.html` DATA array:

```javascript
{
    id: 'your-concept',
    title: 'Your Concept Title',
    domain: 'Mechanics', // or 'Waves', 'Electromagnetism', 'Quantum'
    desc: 'Brief description for the card.',
    type: 'your-type',
    href: 'Concepts/your-concept-name.html'
}
```

#### 5. Test Your Concept

- ✅ Works in both light and dark themes
- ✅ All sliders update visual in real-time
- ✅ All AI links open correctly
- ✅ Equations render properly (wait for MathJax)
- ✅ Responsive on mobile devices
- ✅ Canvas animations are smooth (60fps)

Refer to [STYLE_GUIDE.md](STYLE_GUIDE.md) when changing shared typography,
layout, motion, or page structure.

### 🤖 Automated Concept Generation

If you are using an AI agent (such as Antigravity, Claude, Copilot, etc.) to contribute, you can automate the process of selecting, researching, generating, and registering a new concept page using our automated workflow tools:

1. **AI Agent Runbook (`scripts/add_concept_workflow.md`)**: Point your AI assistant to this runbook file (e.g. *"Please read scripts/add_concept_workflow.md and add the next concept"*). The agent will autonomously read the checklist, search the web, generate the HTML page conforming to the style guidelines, update `index.html`, and run verification scripts.
2. **Workflow Automation Script (`scripts/add_concept.py`)**: Run this Python script directly from your terminal:
   ```bash
   python3 scripts/add_concept.py
   ```
   - **If `GEMINI_API_KEY` is set**: The script calls the Gemini API (with Google Search Grounding enabled) to autonomously research the next unchecked concept, generate all matching assets, write the files, update the main index layout, run accessibility checks, and check the concept off in the checklist.
   - **If `GEMINI_API_KEY` is not set**: The script identifies the next unchecked concept and prints a comprehensive, pre-formatted prompt that you can copy and paste to your AI assistant to execute the workflow.

### Contribution Guidelines

- **Code Style**: Follow existing patterns for consistency
- **Performance**: Use IntersectionObserver for canvas rendering
- **Accessibility**: Ensure proper semantic HTML
- **Physics Accuracy**: Double-check equations and concepts
- **Documentation**: Comment complex visualization logic
- **Testing**: Test on Chrome, Firefox, and Safari

## 📚 Resources

- [STYLE_GUIDE.md](STYLE_GUIDE.md) - Shared layout, typography, and interaction rules
- [CONCEPT_PATTERN.md](CONCEPT_PATTERN.md) - Detailed guide for creating concepts
- [MathJax Documentation](https://www.mathjax.org/)
- [GSAP Documentation](https://greensock.com/docs/)
- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

## 🎨 Design Philosophy

### Visual Excellence
We prioritize stunning visuals over minimal viable products. Every concept should:
- Use the shared typography and restrained accent palette consistently
- Include smooth, purposeful animations
- Provide immediate visual feedback
- Feel polished without decorative excess

### Educational Value
Each concept must:
- Start simple, build complexity
- Include real-world analogies
- Provide interactive exploration
- Link to academic references

### Performance First
- Lazy load canvas rendering (IntersectionObserver)
- HiDPI scaling for sharp visuals
- Smooth 60fps animations
- Minimal dependencies

## 📊 GitHub Star History

<a href="https://star-history.com/#CasberryIndia/Physics-Notebook&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=CasberryIndia/Physics-Notebook&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=CasberryIndia/Physics-Notebook&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=CasberryIndia/Physics-Notebook&type=Date" />
  </picture>
</a>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Physics concepts inspired by classic textbooks (Halliday, Resnick, Walker)
- Animations powered by [GSAP](https://greensock.com/)
- Icons by [Lucide](https://lucide.dev/)
- Mathematics rendered by [MathJax](https://www.mathjax.org/)

## 💬 Community

- **Questions?** Open a [Discussion](https://github.com/CasberryIndia/Physics-Notebook/discussions)
- **Found a bug?** Create an [Issue](https://github.com/CasberryIndia/Physics-Notebook/issues)
- **Have an idea?** We'd love to hear it in [Discussions](https://github.com/CasberryIndia/Physics-Notebook/discussions)

## 🚧 Roadmap

- [ ] More Mechanics concepts (Friction, Collisions)
- [ ] Thermodynamics section
- [ ] Special Relativity visualizations
- [ ] 3D visualizations using Three.js
- [ ] Mobile app (React Native)
- [ ] Offline PWA support
- [ ] Multi-language support

---

<div align="center">

**Made with ❤️ by the Physics Notebook Community**

[⬆ Back to Top](#physics-notebook-)

</div>
