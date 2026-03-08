<a id="top"></a>
# 🎨 Theme Genie

A modern, accessible color palette generator for designers and developers. Create, preview, and export CSS color variables with real-time accessibility checks and responsive previews.


## ✨ Features

### 🎯 Core Features
- **Dual Theme Support** - Design both light and dark themes simultaneously
- **Real-time Preview** - See your palette in action with a realistic UI mockup
- **Side-by-side Comparison** - Compare light and dark themes together
- **One-click Export** - Copy production-ready CSS variables instantly

### 🎨 Color Management
- **14 Semantic Color Variables** - Brand, surfaces, text, and status colors
- **Visual Color Picker** - Intuitive color selection with hex input
- **Tabbed Editing** - Organized color groups for focused editing
- **Quick Swatches** - Overview of all colors at a glance

### ♿ Accessibility
- **WCAG Contrast Checking** - Real-time contrast ratio calculations
- **Health Score** - Overall accessibility rating (Excellent/Strong/Fair/Needs Work)
- **Detailed Diagnostics** - Individual contrast checks with labels
- **Skip Links** - Keyboard navigation support

### 🚀 Productivity
- **4 Curated Presets** - Professional starting points for any project
- **Random Generation** - AI-free algorithmic palette generation
- **Local Storage** - Save your work automatically
- **Floating Copy Button** - Quick access to export from anywhere

### 📱 Responsive Design
- **Mobile-first** - Works beautifully on all screen sizes
- **Touch-friendly** - Optimized for touch interactions
- **Adaptive Layout** - Sidebar becomes stacked on smaller screens

## 🖥️ Demo

[Live Demo](https://your-demo-url.com) · [Video Walkthrough](https://your-video-url.com)

## 🛠️ Tech Stack

- **Framework:** React 18+ with TypeScript
- **Styling:** Tailwind CSS with CSS Variables
- **Build Tool:** Vite
- **State Management:** React useState/useMemo hooks
- **Storage:** Browser LocalStorage API

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Quick Start

```bash
# Clone the repository
git clone https://github.com/devlopers-labs/themegenie.git

# Navigate to project directory
cd themegenie

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
themegenie/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles & CSS variables
├── public/
│   └── favicon.svg      # App favicon
├── index.html           # HTML template
├── package.json         # Dependencies & scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── README.md            # This file
```

## 🎯 Usage Guide

### Creating a Palette

1. **Choose a Preset** - Start with one of 4 curated presets or the default
2. **Select Theme Mode** - Toggle between Light and Dark editing modes
3. **Edit Colors** - Use tabbed sections (Brand, Surfaces, Text, Status)
4. **Check Accessibility** - Monitor contrast scores in real-time
5. **Preview** - See changes reflected in the live preview
6. **Export** - Copy CSS variables to your clipboard

### Color Sections

| Section | Colors | Purpose |
|---------|--------|---------|
| **Brand** | Primary, Secondary, Accent | Main brand identity colors |
| **Surfaces** | Background, Surface, Elevated | UI layer backgrounds |
| **Text** | Primary, Secondary, Muted | Typography hierarchy |
| **Status** | Border, Border Strong, Success, Warning, Danger | UI feedback & structure |

### Using Exported CSS

```css
/* Paste the exported CSS into your stylesheet */
:root, [data-theme="light"] {
  color-scheme: light;
  --color-primary: 99 102 241;
  --color-background: 255 255 255;
  /* ... more variables */
}

[data-theme="dark"] {
  color-scheme: dark;
  --color-primary: 129 140 248;
  --color-background: 2 6 23;
  /* ... more variables */
}

/* Use in your components */
.button {
  background-color: rgb(var(--color-primary));
  color: white;
}

.card {
  background-color: rgb(var(--color-surface));
  border: 1px solid rgb(var(--color-border));
}

/* With opacity */
.overlay {
  background-color: rgb(var(--color-primary) / 0.5);
}
```

### Theme Switching

```javascript
// Toggle theme in your application
function toggleTheme() {
  const current = document.documentElement.dataset.theme;
  document.documentElement.dataset.theme = current === 'dark' ? 'light' : 'dark';
}
```

## 🎨 Preset Themes

| Preset | Description | Best For |
|--------|-------------|----------|
| **Professional Indigo** | Balanced and portfolio-friendly | Corporate, SaaS, Professional sites |
| **Ocean Signal** | Cool, technical, and polished | Tech products, Developer tools |
| **Warm Premium** | Soft luxury with warmth | E-commerce, Lifestyle brands |
| **Minimal Mono** | Editorial and understated | Portfolios, Blogs, Magazines |

## ♿ Accessibility Features

### Contrast Ratios
- **7:1+** → Excellent (AAA)
- **4.5:1+** → AA Ready (Standard text)
- **3:1+** → Large text only (18pt+ or 14pt bold)
- **Below 3:1** → Low contrast (Needs improvement)

### Keyboard Navigation
- `Tab` - Navigate between controls
- `Enter` - Activate buttons, submit hex values
- `Skip Link` - Jump directly to export section

## 🔧 Configuration

### Tailwind CSS Setup

```javascript
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Use CSS variables for dynamic theming
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        // ... add more as needed
      },
    },
  },
};
```

### CSS Variables Reference

```css
/* All available CSS variables */
--color-primary
--color-secondary
--color-accent
--color-background
--color-surface
--color-surface-elevated
--color-text-primary
--color-text-secondary
--color-text-muted
--color-border
--color-border-strong
--color-success
--color-warning
--color-danger
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain accessibility standards (WCAG 2.1 AA)
- Test on multiple screen sizes
- Keep components focused and reusable
- Add meaningful comments for complex logic

## 🐛 Known Issues

- Color picker appearance varies across browsers
- LocalStorage may be disabled in private browsing
- Some system fonts may not render identically across OS

## 📋 Roadmap

- [ ] Export to Figma/Sketch format
- [ ] Import from existing CSS
- [ ] Color blindness simulation
- [ ] Gradient generator
- [ ] Typography scale generator
- [ ] Shareable palette URLs
- [ ] More preset themes
- [ ] Plugin system for frameworks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Theme Genie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [React](https://react.dev) - UI library
- [Vite](https://vitejs.dev) - Build tool
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards

## 📬 Contact

- **Author:** Your Name
- **Email:** your.email@example.com
- **Twitter:** [@yourhandle](https://twitter.com/yourhandle)
- **Website:** [yourwebsite.com](https://yourwebsite.com)

---

<p align="center">
  Made with ❤️ for designers and developers
</p>

<p align="center">
  <a href="#top">Back to top ↑</a>
</p>
