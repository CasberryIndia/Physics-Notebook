
/**
 * Physics Notebook - Common Utilities
 * Handles Theme persistence and Initialization
 */

const ThemeManager = {
    init() {
        this.setupTheme();
        this.bindEvents();
    },

    setupTheme() {
        // Check localStorage first, fallback to 'light'
        const savedTheme = localStorage.getItem('physics-notebook-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.body.setAttribute('data-theme', savedTheme);
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', next);
        document.body.setAttribute('data-theme', next);
        localStorage.setItem('physics-notebook-theme', next);

        // Dispatch event for canvases to redraw colors
        window.dispatchEvent(new CustomEvent('theme-changed', { detail: next }));
    },

    bindEvents() {
        const btn = document.getElementById('themeBtn');
        if (btn) {
            btn.addEventListener('click', () => this.toggle());
        }

        // Also listen for logo click in top left if it sometimes acts as toggle? 
        // No, logo is navigation.
    }
};

const ExternalNavigation = {
    open(url) {
        const popup = window.open(url, '_blank', 'noopener,noreferrer');
        if (popup) {
            popup.opener = null;
        }
    },

    openBlank() {
        const popup = window.open('', '_blank', 'noopener,noreferrer');
        if (popup) {
            popup.opener = null;
        }
        return popup;
    },

    navigate(popup, url) {
        if (popup) {
            popup.location = url;
            return;
        }

        this.open(url);
    }
};

const AIProviderLauncher = {
    launch(model, prompt, options = {}) {
        const encodedPrompt = encodeURIComponent(prompt);

        if (model === 'gemini') {
            const geminiAppUrl = options.geminiAppUrl || 'https://gemini.google.com/app';
            const geminiQueryUrl = options.geminiQueryUrl || `https://gemini.google.com/?q=${encodedPrompt}`;
            const showClipboardAlert = options.showClipboardAlert !== false;

            if (window.isSecureContext && navigator.clipboard?.writeText) {
                const popup = ExternalNavigation.openBlank();

                navigator.clipboard.writeText(prompt).then(() => {
                    if (showClipboardAlert) {
                        alert("Gemini doesn't support auto-fill. The prompt has been copied to your clipboard.");
                    }

                    ExternalNavigation.navigate(popup, geminiAppUrl);
                }).catch(() => {
                    ExternalNavigation.navigate(popup, geminiQueryUrl);
                });
                return;
            }

            ExternalNavigation.open(geminiQueryUrl);
            return;
        }

        const providerUrls = {
            perplexity: `https://www.perplexity.ai/search?q=${encodedPrompt}`,
            chatgpt: `https://chatgpt.com/?q=${encodedPrompt}`,
            claude: `https://claude.ai/new?q=${encodedPrompt}`,
            grok: `https://grok.com/?q=${encodedPrompt}`
        };

        const url = providerUrls[model];
        if (url) {
            ExternalNavigation.open(url);
        }
    }
};

const AccessibilityManager = {
    init() {
        this.labelAIButtons();
        this.labelCanvases();
        this.enhanceSimulationControls();
    },

    labelAIButtons() {
        const providerLabels = {
            perplexity: 'Perplexity',
            gemini: 'Gemini',
            chatgpt: 'ChatGPT',
            claude: 'Claude',
            grok: 'Grok'
        };

        document.querySelectorAll('.ai-btn').forEach((button) => {
            button.setAttribute('type', 'button');

            if (!button.getAttribute('aria-label')) {
                const title = button.getAttribute('title')?.trim();
                const inferredLabel = title || this.inferAIButtonLabel(button, providerLabels);

                if (inferredLabel) {
                    button.setAttribute('aria-label', inferredLabel);
                }
            }

            button.querySelectorAll('svg').forEach((icon) => {
                icon.setAttribute('aria-hidden', 'true');
                icon.setAttribute('focusable', 'false');
            });
        });
    },

    inferAIButtonLabel(button, providerLabels) {
        const onclick = button.getAttribute('onclick') || '';
        const match = onclick.match(/,\s*'([^']+)'\s*\)/);
        if (!match) {
            return '';
        }

        const provider = providerLabels[match[1]] || match[1];
        return `Ask ${provider}`;
    },

    labelCanvases() {
        document.querySelectorAll('canvas').forEach((canvas) => {
            if (canvas.closest('.card-visual')) {
                canvas.setAttribute('role', 'presentation');
                canvas.setAttribute('aria-hidden', 'true');
                return;
            }

            const layout = canvas.closest('.split-layout');
            const heading = layout?.querySelector('.content-col h2')?.textContent?.trim();
            if (!heading) {
                return;
            }

            canvas.setAttribute('role', 'img');
            canvas.setAttribute('aria-label', `${heading} visualization`);
        });
    },

    enhanceSimulationControls() {
        document.querySelectorAll('.split-layout').forEach((layout, layoutIndex) => {
            const heading = layout.querySelector('.content-col h2')?.textContent?.trim();
            const canvas = layout.querySelector('.visual-col canvas');
            if (!heading || !canvas) {
                return;
            }

            const statusId = canvas.id ? `${canvas.id}-status` : `simulation-status-${layoutIndex}`;
            let status = document.getElementById(statusId);

            if (!status) {
                status = document.createElement('div');
                status.id = statusId;
                status.className = 'sr-only';
                status.setAttribute('aria-live', 'polite');
                status.setAttribute('aria-atomic', 'true');
                layout.querySelector('.content-col')?.appendChild(status);
            }

            const describeControls = () => {
                const controls = Array.from(layout.querySelectorAll('input[type="range"]')).map((input) => {
                    const label = this.getSliderLabel(input);
                    const value = this.getSliderValueText(input);
                    return label && value ? `${label}: ${value}` : '';
                }).filter(Boolean);

                return controls.length > 0
                    ? `${heading} simulation. ${controls.join('. ')}.`
                    : `${heading} simulation.`;
            };

            canvas.setAttribute('aria-describedby', status.id);

            layout.querySelectorAll('input[type="range"]').forEach((input, inputIndex) => {
                const label = this.getSliderLabel(input);
                const valueId = this.ensureSliderValueId(input, layoutIndex, inputIndex);
                const describedBy = [valueId, status.id].filter(Boolean).join(' ');

                if (label && !input.getAttribute('aria-label')) {
                    input.setAttribute('aria-label', label);
                }

                if (describedBy) {
                    input.setAttribute('aria-describedby', describedBy);
                }

                const updateInputAccessibility = () => {
                    const valueText = this.getSliderValueText(input);
                    input.setAttribute('aria-valuetext', valueText);
                    status.textContent = `${heading} simulation updated. ${label}: ${valueText}.`;
                };

                updateInputAccessibility();
                input.addEventListener('input', updateInputAccessibility);
                input.addEventListener('change', updateInputAccessibility);
            });

            layout.querySelectorAll('.sim-controls button, .controls button').forEach((button) => {
                if (!button.getAttribute('type')) {
                    button.setAttribute('type', 'button');
                }

                button.addEventListener('click', () => {
                    const label = button.textContent.replace(/\s+/g, ' ').trim();
                    if (label) {
                        status.textContent = `${heading} simulation control activated. ${label}.`;
                    }
                });
            });

            status.textContent = describeControls();
        });
    },

    getSliderLabel(input) {
        const group = input.closest('.slider-group, .control-group');
        if (!group) {
            return input.id || 'Simulation control';
        }

        const controlLabel = group.querySelector('.control-label span');
        if (controlLabel?.textContent?.trim()) {
            return controlLabel.textContent.trim();
        }

        const label = group.querySelector('label');
        if (!label) {
            return input.id || 'Simulation control';
        }

        const clone = label.cloneNode(true);
        clone.querySelectorAll('span').forEach((span) => span.remove());
        return clone.textContent.replace(/\s+/g, ' ').trim() || input.id || 'Simulation control';
    },

    getSliderValueText(input) {
        const group = input.closest('.slider-group, .control-group');
        if (!group) {
            return input.value;
        }

        const valueLabel = group.querySelector('.control-value, label span[id], .control-label span:last-child');
        return valueLabel?.textContent?.replace(/\s+/g, ' ').trim() || input.value;
    },

    ensureSliderValueId(input, layoutIndex, inputIndex) {
        const group = input.closest('.slider-group, .control-group');
        if (!group) {
            return '';
        }

        const valueLabel = group.querySelector('.control-value, label span[id], .control-label span:last-child');
        if (!valueLabel) {
            return '';
        }

        if (!valueLabel.id) {
            valueLabel.id = `${input.id || `slider-${layoutIndex}-${inputIndex}`}-value`;
        }

        return valueLabel.id;
    }
};

// Immediate execution to prevent flash IF this script is loaded in head deferred
// But we actually want to run `setupTheme` ASAP.
// Optimally, a small inline script in head handles the initial set, but this works traversing the DOM once body exists


// Expose for usage
// GitHub Stats
const GitHubStats = {
    repo: 'CasberryIndia/Physics-Notebook',

    init() {
        this.fetchStars();
    },

    async fetchStars() {
        const starCountEl = document.getElementById('starCount');
        if (!starCountEl) return;

        // Visual loading state
        starCountEl.style.opacity = '0.5';

        try {
            // Check session storage first to avoid rate limits
            const cached = sessionStorage.getItem('physics-notebook-stars');
            if (cached) {
                starCountEl.textContent = cached;
                starCountEl.style.opacity = '1';
                return;
            }

            const response = await fetch(`https://api.github.com/repos/${this.repo}`);
            if (response.ok) {
                const data = await response.json();
                const stars = this.formatCount(data.stargazers_count);
                starCountEl.textContent = stars;
                sessionStorage.setItem('physics-notebook-stars', stars);
            } else {
                starCountEl.textContent = '--';
            }
        } catch (e) {
            console.warn('Failed to fetch stars:', e);
            starCountEl.textContent = '--';
        } finally {
            starCountEl.style.opacity = '1';
        }
    },

    formatCount(count) {
        if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'k';
        }
        return count;
    }
};

/**
 * Standardized AI Brand SVGs Registry
 */
const AI_ICONS = {
    claude: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="hsl(14.8, 63.1%, 59.6%)"><path d="m19.6 66.5 19.7-11 .3-1-.3-.5h-1l-3.3-.2-11.2-.3L14 53l-9.5-.5-2.4-.5L0 49l.2-1.5 2-1.3 2.9.2 6.3.5 9.5.6 6.9.4L38 49.1h1.6l.2-.7-.5-.4-.4-.4L29 41l-10.6-7-5.6-4.1-3-2-1.5-2-.6-4.2 2.7-3 3.7.3.9.2 3.7 2.9 8 6.1L37 36l1.5 1.2.6-.4.1-.3-.7-1.1L33 25l-6-10.4-2.7-4.3-.7-2.6c-.3-1-.4-2-.4-3l3-4.2L28 0l4.2.6L33.8 2l2.6 6 4.1 9.3L47 29.9l2 3.8 1 3.4.3 1h.7v-.5l.5-7.2 1-8.7 1-11.2.3-3.2 1.6-3.8 3-2L61 2.6l2 2.9-.3 1.8-1.1 7.7L59 27.1l-1.5 8.2h.9l1-1.1 4.1-5.4 6.9-8.6 3-3.5L77 13l2.3-1.8h4.3l3.1 4.7-1.4 4.9-4.4 5.6-3.7 4.7-5.3 7.1-3.2 5.7.3.4h.7l12-2.6 6.4-1.1 7.6-1.3 3.5 1.6.4 1.6-1.4 3.4-8.2 2-9.6 2-14.3 3.3-.2.1.2.3 6.4.6 2.8.2h6.8l12.6 1 3.3 2 1.9 2.7-.3 2-5.1 2.6-6.8-1.6-16-3.8-5.4-1.3h-.8v.4l4.6 4.5 8.3 7.5L89 80.1l.5 2.4-1.3 2-1.4-.2-9.2-7-3.6-3-8-6.8h-.5v.7l1.8 2.7 9.8 14.7.5 4.5-.7 1.4-2.6 1-2.7-.6-5.8-8-6-9-4.7-8.2-.5.4-2.9 30.2-1.3 1.5-3 1.2-2.5-2-1.4-3 1.4-6.2 1.6-8 1.3-6.4 1.2-7.9.7-2.6v-.2H49L43 72l-9 12.3-7.2 7.6-1.7.7-3-1.5.3-2.8L24 86l10-12.8 6-7.9 4-4.6-.1-.5h-.3L17.2 77.4l-4.7.6-2-2 .2-3 1-1 8-5.5Z"></path></svg>`,
    gemini: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 65"><mask id="maskme" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="65" height="65"><path d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z" fill="#000"/><path d="M32.447 0c.68 0 1.273.465 1.439 1.125a38.904 38.904 0 001.999 5.905c2.152 5 5.105 9.376 8.854 13.125 3.751 3.75 8.126 6.703 13.125 8.855a38.98 38.98 0 005.906 1.999c.66.166 1.124.758 1.124 1.438 0 .68-.464 1.273-1.125 1.439a38.902 38.902 0 00-5.905 1.999c-5 2.152-9.375 5.105-13.125 8.854-3.749 3.751-6.702 8.126-8.854 13.125a38.973 38.973 0 00-2 5.906 1.485 1.485 0 01-1.438 1.124c-.68 0-1.272-.464-1.438-1.125a38.913 38.913 0 00-2-5.905c-2.151-5-5.103-9.375-8.854-13.125-3.75-3.749-8.125-6.702-13.125-8.854a38.973 38.973 0 00-5.905-2A1.485 1.485 0 010 32.448c0-.68.465-1.272 1.125-1.438a38.903 38.903 0 005.905-2c5-2.151 9.376-5.104 13.125-8.854 3.75-3.749 6.703-8.125 8.855-13.125a38.972 38.972 0 001.999-5.905A1.485 1.485 0 0132.447 0z" fill="url(#prefix__paint0_linear_2001_67)"/></mask><g mask="url(#maskme)"><g filter="url(#prefix__filter0_f_2001_67)"><path d="M-5.859 50.734c7.498 2.663 16.116-2.33 19.249-11.152 3.133-8.821-.406-18.131-7.904-20.794-7.498-2.663-16.116 2.33-19.25 11.151-3.132 8.822.407 18.132 7.905 20.795z" fill="#FFE432"/></g><g filter="url(#prefix__filter1_f_2001_67)"><path d="M27.433 21.649c10.3 0 18.651-8.535 18.651-19.062 0-10.528-8.35-19.062-18.651-19.062S8.78-7.94 8.78 2.587c0 10.527 8.35 19.062 18.652 19.062z" fill="#FC413D"/></g><g filter="url(#prefix__filter2_f_2001_67)"><path d="M20.184 82.608c10.753-.525 18.918-12.244 18.237-26.174-.68-13.93-9.95-24.797-20.703-24.271C6.965 32.689-1.2 44.407-.519 58.337c.681 13.93 9.95 24.797 20.703 24.271z" fill="#00B95C"/></g><g filter="url(#prefix__filter3_f_2001_67)"><path d="M20.184 82.608c10.753-.525 18.918-12.244 18.237-26.174-.68-13.93-9.95-24.797-20.703-24.271C6.965 32.689-1.2 44.407-.519 58.337c.681 13.93 9.95 24.797 20.703 24.271z" fill="#00B95C"/></g><g filter="url(#prefix__filter4_f_2001_67)"><path d="M30.954 74.181c9.014-5.485 11.427-17.976 5.389-27.9-6.038-9.925-18.241-13.524-27.256-8.04-9.015 5.486-11.428 17.977-5.39 27.902 6.04 9.924 18.242 13.523 27.257 8.038z" fill="#00B95C"/></g><g filter="url(#prefix__filter5_f_2001_67)"><path d="M67.391 42.993c10.132 0 18.346-7.91 18.346-17.666 0-9.757-8.214-17.667-18.346-17.667s-18.346 7.91-18.346 17.667c0 9.757 8.214 17.666 18.346 17.666z" fill="#3186FF"/></g><g filter="url(#prefix__filter6_f_2001_67)"><path d="M-13.065 40.944c9.33 7.094 22.959 4.869 30.442-4.972 7.483-9.84 5.987-23.569-3.343-30.663C4.704-1.786-8.924.439-16.408 10.28c-7.483 9.84-5.986 23.57 3.343 30.664z" fill="#FBBC04"/></g><g filter="url(#prefix__filter7_f_2001_67)"><path d="M34.74 51.43c11.135 7.656 25.896 5.524 32.968-4.764 7.073-10.287 3.779-24.832-7.357-32.488C49.215 6.52 34.455 8.654 27.382 18.94c-7.072 10.288-3.779 24.833 7.357 32.49z" fill="#3186FF"/></g><g filter="url(#prefix__filter8_f_2001_67)"><path d="M54.984-2.336c2.833 3.852-.808 11.34-8.131 16.727-7.324 5.387-15.557 6.631-18.39 2.78-2.833-3.853.807-11.342 8.13-16.728 7.324-5.387 15.558-6.631 18.39-2.78z" fill="#749BFF"/></g><g filter="url(#prefix__filter9_f_2001_67)"><path d="M31.727 16.104C43.053 5.598 46.94-8.626 40.41-15.666c-6.53-7.04-21.006-4.232-32.332 6.274s-15.214 24.73-8.683 31.77c6.53 7.04 21.006 4.232 32.332-6.274z" fill="#FC413D"/></g><g filter="url(#prefix__filter10_f_2001_67)"><path d="M8.51 53.838c6.732 4.818 14.46 5.55 17.262 1.636 2.802-3.915-.384-10.994-7.116-15.812-6.731-4.818-14.46-5.55-17.261-1.636-2.802 3.915.383 10.994 7.115 15.812z" fill="#FFEE48"/></g></g><defs><filter id="prefix__filter0_f_2001_67" x="-19.824" y="13.152" width="39.274" height="43.217" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="2.46" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter1_f_2001_67" x="-15.001" y="-40.257" width="84.868" height="85.688" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="11.891" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter2_f_2001_67" x="-20.776" y="11.927" width="79.454" height="90.916" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter3_f_2001_67" x="-20.776" y="11.927" width="79.454" height="90.916" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter4_f_2001_67" x="-19.845" y="15.459" width="79.731" height="81.505" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="10.109" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter5_f_2001_67" x="29.832" y="-11.552" width="75.117" height="73.758" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="9.606" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter6_f_2001_67" x="-38.583" y="-16.253" width="78.135" height="78.758" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="8.706" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter7_f_2001_67" x="8.107" y="-5.966" width="78.877" height="77.539" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="7.775" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter8_f_2001_67" x="13.587" y="-18.488" width="56.272" height="51.81" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="6.957" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter9_f_2001_67" x="-15.526" y="-31.297" width="70.856" height="69.306" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="5.876" result="effect1_foregroundBlur_2001_67"/></filter><filter id="prefix__filter10_f_2001_67" x="-14.168" y="20.964" width="55.501" height="51.571" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="7.273" result="effect1_foregroundBlur_2001_67"/></filter><linearGradient id="prefix__paint0_linear_2001_67" x1="18.447" y1="43.42" x2="52.153" y2="15.004" gradientUnits="userSpaceOnUse"><stop stop-color="#4893FC"/><stop offset=".27" stop-color="#4893FC"/><stop offset=".777" stop-color="#969DFF"/><stop offset="1" stop-color="#BD99FE"/></linearGradient></defs></svg>`,
    chatgpt: `<svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg"><path d='m297.06 130.97c7.26-21.79 4.76-45.66-6.85-65.48-17.46-30.4-52.56-46.04-86.84-38.68-15.25-17.18-37.16-26.95-60.13-26.81-35.04-.08-66.13 22.48-76.91 55.82-22.51 4.61-41.94 18.7-53.31 38.67-17.59 30.32-13.58 68.54 9.92 94.54-7.26 21.79-4.76 45.66 6.85 65.48 17.46 30.4 52.56 46.04 86.84 38.68 15.24 17.18 37.16 26.95 60.13 26.8 35.06.09 66.16-22.49 76.94-55.86 22.51-4.61 41.94-18.7 53.31-38.67 17.57-30.32 13.55-68.51-9.94-94.51zm-120.28 168.11c-14.03.02-27.62-4.89-38.39-13.88.49-.26 1.34-.73 1.89-1.07l63.72-36.8c3.26-1.85 5.26-5.32 5.24-9.07v-89.83l26.93 15.55c.29.14.48.42.52.74v74.39c-.04 33.08-26.83 59.9-59.91 59.97zm-128.84-55.03c-7.03-12.14-9.56-26.37-7.15-40.18.47.28 1.3.79 1.89 1.13l63.72 36.8c3.23 1.89 7.23 1.89 10.47 0l77.79-44.92v31.1c.02.32-.13.63-.38.83l-64.41 37.19c-28.69 16.52-65.33 6.7-81.92-21.95zm-16.77-139.09c7-12.16 18.05-21.46 31.21-26.29 0 .55-.03 1.52-.03 2.2v73.61c-.02 3.74 1.98 7.21 5.23 9.06l77.79 44.91-26.93 15.55c-.27.18-.61.21-.91.08l-64.42-37.22c-28.63-16.58-38.45-53.21-21.95-81.89zm221.26 51.49-77.79-44.92 26.93-15.54c.27-.18.61-.21.91-.08l64.42 37.19c28.68 16.57 38.51 53.26 21.94 81.94-7.01 12.14-18.05 21.44-31.2 26.28v-75.81c.03-3.74-1.96-7.2-5.2-9.06zm26.8-40.34c-.47-.29-1.3-.79-1.89-1.13l-63.72-36.8c-3.23-1.89-7.23-1.89-10.47 0l-77.79 44.92v-31.1c-.02-.32.13-.63.38-.83l64.41-37.16c28.69-16.55 65.37-6.7 81.91 22 6.99 12.12 9.52 26.31 7.15 40.1zm-168.51 55.43-26.94-15.55c-.29-.14-.48-.42-.52-.74v-74.39c.02-33.12 26.89-59.96 60.01-59.94 14.01 0 27.57 4.92 38.34 13.88-.49.26-1.33.73-1.89 1.07l-63.72 36.8c-3.26 1.85-5.26 5.31-5.24 9.06l-.04 89.79zm14.63-31.54 34.65-20.01 34.65 20v40.01l-34.65 20-34.65-20z'/></svg>`,
    grok: `<svg fill="currentColor" fill-rule="evenodd" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Grok</title><path d="M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815"/></svg>`,
    perplexity: `<svg fill="currentColor" fill-rule="evenodd" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Perplexity</title><path d="M19.785 0v7.272H22.5V17.62h-2.935V24l-7.037-6.194v6.145h-1.091v-6.152L4.392 24v-6.465H1.5V7.188h2.884V0l7.053 6.494V.19h1.09v6.49L19.786 0zm-7.257 9.044v7.319l5.946 5.234V14.44l-5.946-5.397zm-1.099-.08l-5.946 5.398v7.235l5.946-5.234V8.965zm8.136 7.58h1.844V8.349H13.46l6.105 5.54v2.655zm-8.982-8.28H2.59v8.195h1.8v-2.576l6.192-5.62zM5.475 2.476v4.71h5.115l-5.115-4.71zm13.219 0l-5.115 4.71h5.115v-4.71z"/></svg>`
};

/**
 * AI Links Manager - Dynamically standardizes and populates Ask AI sections on concept pages
 */
const AILinksManager = {
    init() {
        const containers = document.querySelectorAll('.ai-links');
        containers.forEach((container) => {
            // Find a button with openAI onclick handler to extract topic
            const existingBtn = container.querySelector('button[onclick*="openAI"]');
            if (!existingBtn) return;

            const onclick = existingBtn.getAttribute('onclick') || '';
            const match = onclick.match(/openAI\(['"]([^'"]+)['"]/);
            if (!match) return;

            const topic = match[1];

            // Replace container innerHTML with fully standardized 5-button setup
            container.innerHTML = `
                <span class="ai-label">Ask AI:</span>
                <button type="button" onclick="openAI('${topic}', 'claude')" class="ai-btn ai-claude" title="Ask Claude" aria-label="Ask Claude">${AI_ICONS.claude}</button>
                <button type="button" onclick="openAI('${topic}', 'gemini')" class="ai-btn ai-gemini" title="Ask Gemini" aria-label="Ask Gemini">${AI_ICONS.gemini}</button>
                <button type="button" onclick="openAI('${topic}', 'chatgpt')" class="ai-btn ai-chatgpt" title="Ask ChatGPT" aria-label="Ask ChatGPT">${AI_ICONS.chatgpt}</button>
                <button type="button" onclick="openAI('${topic}', 'grok')" class="ai-btn ai-grok" title="Ask Grok" aria-label="Ask Grok">${AI_ICONS.grok}</button>
                <button type="button" onclick="openAI('${topic}', 'perplexity')" class="ai-btn ai-perplexity" title="Ask Perplexity" aria-label="Ask Perplexity">${AI_ICONS.perplexity}</button>
            `;
        });
    }
};

// Google Analytics
const GoogleAnalytics = {
    init() {
        const id = 'G-REQTSJ0Q84';
        
        // Inject script tag
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
        document.head.appendChild(script);

        // Setup window.dataLayer and gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function() {
            window.dataLayer.push(arguments);
        };
        
        window.gtag('js', new Date());
        window.gtag('config', id);
    }
};

window.ThemeManager = ThemeManager;
window.openExternalLink = (url) => ExternalNavigation.open(url);
window.launchAIPrompt = (model, prompt, options) => AIProviderLauncher.launch(model, prompt, options);

document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    GitHubStats.init();
    AILinksManager.init();
    AccessibilityManager.init();
    GoogleAnalytics.init();
    // Initialize Lucide icons if library is present
    if (window.lucide) {
        window.lucide.createIcons();
    }
});

