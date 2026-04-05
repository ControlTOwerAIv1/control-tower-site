# Control Tower — MVP Website Design Spec

**Date:** 2026-04-05
**Project:** Control Tower (business process automation startup)
**Type:** Showcase / portfolio website (MVP)

---

## 1. Overview

A Three.js 3D animated showcase website for Control Tower — an AI-powered business operations intelligence platform. Control Tower watches every operation happening across a business in real time, proactively suggests actions to improve efficiency, and can automate processes where appropriate. It is not just an automation tool — it is an always-on AI co-pilot for business operations.

The site serves two audiences equally: **potential clients** (businesses seeking better operational visibility and efficiency) and **investors** (evaluating the vision and team).

The central metaphor: *a lone operator at a massive screen, watching every process in your business — with the AI surfacing what needs attention and acting on it.* The site makes this metaphor literal through 3D animation.

---

## 2. Visual Identity

- **Style:** Dark & futuristic — deep navy/black backgrounds, cyan/electric blue (`#00c8ff`) as the primary accent, green (`#00ff88`) for positive states, amber (`#ffa000`) for warnings
- **Typography:** Monospace for labels/code elements; clean sans-serif for body copy and headings
- **3D aesthetic:** Low-poly geometric shapes, glowing particles, grid overlays, light-beam connections
- **Brand name:** Control Tower
- **Tagline:** *Your business, always in view. Always improving.*

---

## 3. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| 3D Engine | React Three Fiber + @react-three/drei |
| Scroll Animation | GSAP ScrollTrigger |
| UI Overlays | Tailwind CSS + Framer Motion |
| Language | TypeScript |
| Deployment | Vercel |

---

## 4. Site Structure

```
/           → Main scrolling experience (all 8 zones, single Three.js canvas)
/contact    → Contact form page (minimal 3D particle background)
```

An optional `/about` page can be added post-MVP.

---

## 5. Architecture — Single Canvas, Camera-Driven

The entire homepage is **one persistent Three.js canvas** that lives behind all content. Scrolling does not load new pages — it drives the camera through different **zones** of a single 3D world. HTML text and UI elements are positioned as absolute overlays on top of the canvas using Tailwind.

**Scroll driver:** GSAP ScrollTrigger maps `scrollY` position to a camera animation timeline. Each zone occupies a defined scroll range. The page height is set to `100vh * number_of_zones` to give enough scroll distance.

**Performance strategy:**
- Single `<Canvas>` instance — no multiple canvases
- Instanced meshes for repeated geometry (particles, grid tiles)
- `drei/Preload` to load assets before first render
- `drei/PerformanceMonitor` to auto-degrade quality on slow devices
- Geometry for off-screen zones is not rendered until camera approaches (frustum culling)

---

## 6. Homepage Zones

### Zone 1 — Hero (initial load)

**Camera position:** Close, slightly elevated, angled toward the operator and screen.

**3D scene:**
- A **massive curved screen** fills ~75% of the viewport. It displays a live operations dashboard with animated panels: process flow map, throughput bar chart, an active anomaly alert (amber) with an AI-generated suggestion ("Suggested fix: reroute Process B-7 → APPLY FIX"), automation progress bars, efficiency score. The screen communicates the three core behaviours: watching, suggesting, and automating.
- A **low-poly geometric boy** sits at a desk in the bottom-right — small relative to the screen, emphasising scale. One arm reaches toward the anomaly panel on the screen.
- Ambient particle system floats in the background.
- Subtle perspective grid on the floor.
- Camera slowly drifts/orbits on load (no scroll required).

**HTML overlay:**
- Top-right: "CONTROL TOWER" label (monospace, cyan, letter-spaced) + tagline "Your business, always in view." + 2-line subtitle + two CTAs: `GET STARTED →` (routes to `/contact`) and `LEARN MORE` (scrolls to Zone 2)
- Bottom-centre: "SCROLL ↓" hint

---

### Zone 2 — What We Do

**Camera movement:** Pulls back from Zone 1. The full "control tower" structure comes into view — a tall low-poly building with glowing windows, surrounded by orbiting data nodes.

**3D scene:** The control tower building sits in the centre of the world. Data node spheres orbit it slowly, connected by light-beam lines.

**HTML overlay:** 2–3 punchy sentences explaining what Control Tower does. e.g. *"Control Tower watches every operation in your business, 24/7. It surfaces what needs attention, suggests what to do, and automates what it can. Think of it as an AI co-pilot for your entire operation."*

---

### Zone 3 — How It Works

**Camera movement:** Flies forward into a 3D node graph floating in space.

**3D scene:** 8 large glowing nodes connected by light-beam edges, lighting up sequentially as camera approaches, split into two layers:

*Service layer (how CT works with a client):*
1. **Identify** — map your existing processes
2. **Analyse** — find inefficiencies with AI
3. **Automate** — build and deploy automations
4. **Monitor** — track results in real time

*AI intelligence layer (ongoing, always-on):*
5. **Watch** — real-time visibility across every operation
6. **Detect** — AI spots anomalies and patterns
7. **Suggest** — system recommends actions for the user to take
8. **Act** — automate what can be automated; user controls the rest

For MVP, these can be displayed as two distinct rows of 4 nodes each, with a visual separator between the service workflow and the AI intelligence loop.

Each node pulses when active. Connecting beams travel between nodes.

**HTML overlay:** Step labels and 1-line descriptions appear beside each node as it activates.

---

### Zone 4 — Services

**Camera movement:** Pans sideways through space.

**3D scene:** 5 floating 3D cards drift slowly in space, each representing a service. Cards tilt slightly in 3D and rotate gently.

**Services:**
1. Real-Time Operations Monitoring
2. AI-Powered Anomaly Detection
3. Intelligent Suggestions & Alerts
4. Process Automation
5. Custom Operations Dashboards

**HTML overlay:** Each card has a geometric icon, service name, and 1-line description. Cards tilt on hover.

---

### Zone 5 — Why Us

**Camera movement:** Approaches a cluster of 3D stat geometry.

**3D scene:** Stats materialise as 3D objects — rising bar columns, a large glowing sphere, orbiting rings. Numbers count up as camera approaches.

**Placeholder stats (to be updated with real data):**
- 94% average efficiency improvement
- 3× faster process cycle times
- 12 industries served
- 48hr average time-to-automation

**HTML overlay:** Each stat has a number (counting animation) and a 1-line context label.

---

### Zone 6 — Case Studies

**Camera movement:** Zooms into 3 floating holographic panels.

**3D scene:** Three tilted panels hover in space, each representing a client story. Panels have a holographic edge glow.

**Placeholder content (3 cards):**
- Logistics company: reduced invoice processing time by 70%
- SaaS startup: automated lead routing, 3× faster response
- Retail chain: real-time inventory alerts, 0 stockouts in 6 months

**HTML overlay:** Industry icon + headline stat + 1-line outcome per panel. "View all →" link (routes to future case studies page).

---

### Zone 7 — Team

**Camera movement:** Moves into a loose orbital arrangement of glowing orbs.

**3D scene:** One low-poly geometric orb per team member, orbiting slowly in space. Clicking/hovering an orb expands a name card with name, role, and 1-line bio.

**Note:** Placeholder names for MVP. Abstract orb design avoids the need for headshots at this stage.

---

### Zone 8 — Contact CTA

**Camera movement:** Pulls all the way back — the entire world (operator, screen, building, nodes) is visible in miniature.

**3D scene:** The full scene is visible, giving a sense of the whole system being under control.

**HTML overlay:** Large centred CTA — *"Ready to take control?"* — with a glowing `LET'S TALK →` button that routes to `/contact`.

---

## 7. Contact Page (`/contact`)

- Minimal 3D background: slow-drifting particle field only (no heavy scene)
- Contact form: Name, Company, Email, Message, Submit
- On submit: simple success state (no backend required for MVP — use a service like Formspree or Resend)
- Nav back to homepage

---

## 8. Navigation

- Fixed top navbar on all pages: logo left, links right (`Home`, `Services`, `Team`, `Contact`)
- On homepage: clicking nav links scrolls to the relevant zone (scroll-to-section)
- Transparent background, becomes slightly frosted on scroll
- On mobile: hamburger menu

---

## 9. Responsive Behaviour

- Desktop (1280px+): full 3D experience as designed
- Tablet (768–1279px): 3D scenes scale down, overlays reflow
- Mobile (<768px): 3D scenes replaced with static rendered previews (canvas is disabled, replaced with pre-rendered images) to ensure performance. All content still visible.

---

## 10. Out of Scope for MVP

- Backend / database
- Authentication
- Blog
- Full case study pages (linked from Zone 6 but not built)
- Extended `/about` page
- Animations beyond scroll-driven camera movement
- Mobile 3D (replaced with static images)
