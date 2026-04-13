**Prefered Browser: Chrome**<br>
**Please allow the animations to finish before clicking on any button**<br>
**Use scroll bar to navigate through the slides in the main app**<br>
**Click on a planet to explore , example-: click on URANUS to explore URANUS**<br>
**Future Plannings: The stories given under all the planets will be used to complete the missions, only then the XP will be increased**<br><br><br>
🚀 NEXUS — Mission Control Portfolio
An immersive, space-themed 3D developer portfolio built with React, Three.js, GSAP, and Vite. Navigate a living solar system where each planet represents a dev skill domain.

🌌 Project Overview
NEXUS reimagines the traditional portfolio as a fully interactive WebGL solar system.

The Solar System:

☿ Mercury: Performance & Speed

♀ Venus: UI/UX & Design Systems

🌍 Earth: Full-Stack Development

♂ Mars: Backend & System Design

♃ Jupiter: AI / ML Systems

♄ Saturn: DevOps & Cloud

⛢ Uranus: Web3 & Blockchain

♆ Neptune: The Frontier / Emerging Tech

Key Features: Cinematic Boot Loader & Big Bang Intro, Typewriter Story Overlay, Interactive 3D Solar System (orbit rings, planet glow, raycasting), Scrollable Skills Explorer, Detailed Planet Dossiers, Ambient Audio, Custom Cursor, and a hidden Konami Code easter egg.

🛠 Tech Stack
Core: React (^19.2.4), Vite (^8.0.4)

3D & Animation: Three.js (^0.183.2), @react-three/fiber, @react-three/drei, GSAP + ScrollTrigger, @react-spring/three

Utilities & Styling: Tailwind CSS, maath, simplex-noise, leva (debug)

📦 Getting Started
Prerequisites: Node.js (v18+) and npm (v8+).

Bash
# 1. Clone or extract the project
cd nexus_project

# 2. Install dependencies (use --legacy-peer-deps if React 19 warnings occur)
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build

# 5. Preview production build locally
npm run preview
📁 Project Structure (Abridged)
public/: Static assets (slide backgrounds, standalone supernova.html, logos, icons).

src/assets/: Bundled assets (ambient audio, textures, UI images).

src/components/: Core React components (Scene.jsx, Planet.jsx, DossierModal.jsx, BootLoader.jsx, etc.).

src/data/planets.js: Centralised data configuration for all planets and projects.

src/hooks/useCursor.js: Custom cursor logic.

src/index.css: Global styles and custom cursor/scanline CSS.

✨ Core Features & Components Reference
BootLoader & BigBangIntro: Terminal-style boot screen followed by a cinematic particle explosion simulating the solar system's birth.

Scene, Sun & Planet (3D): Renders the R3F scene. Planets use procedural noise shaders and feature hover/click raycasting. Orbits are drawn via OrbitRing.

StarField & ConstellationLines: Drifting background stars with parallax and connecting lines.

HUD & Tooltips: Fixed UI showing total XP and planets visited. Floating tooltips appear on planet hover.

DossierModal: Full-screen modal triggered by clicking a planet. Contains Overview, Projects, Data, and Links tabs.

SkillsSection & WarpTransition: Scrolling past the canvas triggers a warp-speed effect, revealing a slide-based explorer for deep-dives into each skill domain.

🪐 Data Configuration (src/data/planets.js)
All planet content is managed in a single array of objects. Modify this to update the portfolio:

JavaScript
{
  id: 'earth', name: 'Earth', subtitle: 'Full-Stack Development',
  color: '#3b82f6', emissive: '#1e3a8a', orbitRadius: 7.5, orbitSpeed: 0.22,
  size: 0.52, xp: 280, level: 'ARCHITECT', skills: [...],
  featureTitle: '...', featureDesc: '...', buildStory: '...',
  projects: [{ name: '...', desc: '...', tech: [...] }],
  mass: '...', distance: '...', dayLength: '...', temp: '...', moons: 1, rings: false,
  planetDesc: '...', didYouKnow: '...'
}
🎮 Special Systems
Konami Code Easter Egg: Press ↑ ↑ ↓ ↓ ← → ← → B A to activate "Classified Mode" (shifts nebula hue, triggers red alert banners, and plays procedural glitch audio).

Audio System: Silent_Orbits.mp3 auto-plays/loops after the boot sequence. Includes a mute toggle and a browser autoplay-fallback prompt.

Custom Cursor: Replaces native cursor with a dot, lagging ring, and click-ripple canvas. (Hidden during intros).

🚀 Deployment
Vercel / Netlify: Connect repo, set framework to Vite, build command to npm run build, and output directory to dist.

GitHub Pages: Install gh-pages, set base: '/repo-name/' in vite.config.js, and run gh-pages -d dist.

🛠 Troubleshooting
Blank Screen / No 3D: Verify WebGL2 support and hardware acceleration in your browser.

Audio Not Autoplaying: Expected browser behavior; click the "ENABLE AUDIO" fallback prompt.

Cursor Missing: It hides during the intro. Ensure index.css has cursor: none and refs are active.

Performance Issues: Reduce star count in StarField.jsx, lower dpr on the <Canvas>, or disable post-processing. For production, host large assets (audio/images) on a CDN.

Port 5173 In Use: Run npm run dev -- --port 3000.
