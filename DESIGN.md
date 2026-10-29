# Outpost Zero — Design System Specification

## 1. Design Philosophy: Warm Basalt Mission-Control
**Outpost Zero** is a deterministic, high-fidelity Mars surface systems engineering simulator designed for the NASA Space Apps Challenge. 

The aesthetic identity is strictly **warm basalt mission-control**:
- **Palette**: Deep volcanic basalt (`#15110F`, `#1D1815`), atmospheric dusts (`#7A4A32`), oxidized iron (`#D9622B`), solar ember (`#F0A24B`), and life-support sage (`#8FB38A`).
- **Geometry**: Sharp 0–2px radii (`--r-0: 0px`, `--r-1: 2px`). Strictly no pill buttons, no floating 16px border-radii, and no generic SaaS cards.
- **Surface**: High data density, crisp 1px rule dividers (`--rule`), structured telemetry readouts, zero decorative drop-shadows, zero glassmorphism/backdrop-blur, and zero gratuitous gradients.
- **Assets**: Zero external image or audio files. All graphics are native SVG engineering cutaways; all auditory feedback is generated in real-time via the Web Audio API.

---

## 2. Token Registry (`styles/tokens.css`)

### 2.1 Surfaces & Geometry
| Token | Value | Semantic Usage |
| :--- | :--- | :--- |
| `--basalt` | `#15110F` | Primary application canvas, deepest volcanic substrate |
| `--basalt-2` | `#1D1815` | Elevated surface (panels, cards, dialogs, drawers) |
| `--basalt-overlay` | `rgba(21, 17, 15, 0.82)` | Full-screen modal / dialog backdrop tint |
| `--rule` | `#756155` | 1px border dividers & structural grids (3.2:1 contrast against basalt) |
| `--r-0` | `0px` | Crisp angular elements, technical charts, progress gauges |
| `--r-1` | `2px` | Subtle corner grounding for panels, item cards, and buttons |

### 2.2 Functional & Status Palette (WCAG 2.2 Compliant)
| Token | Value | Contrast on `--basalt` | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| `--ink` | `#EDE3D6` | 14.80:1 (AAA) | Primary readable text, headings, tabular readouts |
| `--ink-dim` | `#A89B8C` | 6.91:1 (AAA) | Secondary labels, units, metadata, inactive indicators |
| `--ember` | `#F0A24B` | 8.91:1 (AAA) | Power systems, focus rings (`:focus-visible`), active highlights |
| `--sage` | `#8FB38A` | 8.03:1 (AAA) | Life support nominal status, closed-loop sustainability, water/O2 positive |
| `--caution` | `#E9C46A` | 11.23:1 (AAA) | Advisory warnings, calorie rationing, 20% resource threshold ticks |
| `--alarm` | `#E0533D` | 4.89:1 (AA Body) | Mission-critical failure, brownout shedding, 10% critical threshold ticks |
| `--oxide` | `#D9622B` | 5.12:1 (AA Body) | Regolith shielding, radiation exposure tracking, dust storms |
| `--water` | `#5B8CA8` | 5.15:1 (AA Body) | Hydroponics, drinking stores, radiation storm-shelter jacket |
| `--water-dark` | `#1B2833` | Surface tint | Background fill for storm shelter bay |
| `--water-border` | `#4E8098` | 4.35:1 (AA Large) | Outline for water-jacket radiation barriers |
| `--water-text` | `#90C2DE` | 9.79:1 (AAA) | High-contrast label for water subsystem metrics |
| `--sky-clear` | `#C98B63` | 6.57:1 (AAA) | Clear Martian sky ambient ($ \tau \approx 0.3 $) |
| `--sky-dust` | `#7A4A32` | 2.55:1 (Env fill) | High dust optical depth Martian sky ($ \tau \ge 2.5 $) |
| `--greenhouse-bg` | `#1C2920` | Surface fill | Hydroponic bay substrate fill |
| `--greenhouse-lit` | `#2D4A34` | Surface fill | Fully powered crop growth cycle active |
| `--greenhouse-dim` | `#26201B` | Surface fill | Browned-out / unpowered greenhouse bay |

---

## 3. Typography Scale & Hierarchy

Every font family is loaded locally and optimized via Next.js Font Subsets (`Barlow Condensed`, `IBM Plex Mono`, `Source Serif 4`):

```
Display:   --fs-display (clamp(40px, 8vw, 112px)) — Barlow Condensed 700 / Landing headline
Giant:     --fs-giant (56px)                      — Barlow Condensed 700 / Final mission grade
Numeral:   --fs-numeral (48px)                    — IBM Plex Mono / Sol counter, tonnage display
Gauge:     --fs-gauge (36px)                      — IBM Plex Mono / Primary telemetry metrics
Lead:      --fs-lead (20px)                       — Barlow Condensed 600 / Subtitles, panel headers
Body:      --fs-body (16px)                       — IBM Plex Mono / General body copy
Label:     --fs-label (12px)                      — IBM Plex Mono / Section tags, badge labels
Detail:    --fs-detail (11px)                     — IBM Plex Mono / Min. readable content threshold
Caption:   --fs-caption (10px)                    — Non-essential SVG tick marks only
Micro:     --fs-micro (9px)                       — Non-essential SVG coordinate axes only
```

### Monospaced Numbers
All numerical telemetry readouts across the app enforce `font-variant-numeric: tabular-nums` to eliminate layout jiggle during high-speed simulation ticks (1x, 4x, 16x).

---

## 4. Spatial Grid & Spacing System

All padding, margins, gaps, and structural offsets derive exclusively from tokenized spatial increments:

| Token | Pixels | Application |
| :--- | :--- | :--- |
| `--space-1` | `4px` | Fine badge insets, hairline icon offsets |
| `--space-2` | `8px` | Segment gaps, chip margins, tight list spacing |
| `--space-3` | `12px` | Card internal padding, button horizontal spacing |
| `--space-4` | `16px` | Standard panel padding, grid column gaps |
| `--space-5` | `20px` | Dialog card padding, telemetry ribbon gap |
| `--space-6` | `24px` | Section margins, header baseline separation |
| `--space-8` | `32px` | Major page component spacing |
| `--space-10` | `40px` | Page section margins |
| `--space-12` | `48px` | Landing section separation |
| `--touch-min` | `44px` | Minimum touch target bounding box on coarse pointers |

---

## 5. Accessibility & Motion Rules (Hard Constraints H5, H6)

1. **Non-Color Semantics (H6)**:
   - Status indicators pair color with text tokens (`NOMINAL`, `CAUTION`, `CRITICAL`) and shapes/glyphs (`▲`, `▼`, `■`, `●`).
   - Cargo mass segments utilize distinct SVG pattern fills (diagonal crosshatch, vertical stripes, stipple dots) in addition to category hues.
2. **Focus Visibility**:
   - High-visibility focus indicators: `outline: 2px solid var(--ember); outline-offset: 2px;`.
   - Modals enforce trapped focus cycles and return focus to triggering nodes upon closure.
3. **Hardware-Accelerated Compositor Motion (H5)**:
   - Animations restrict properties strictly to `transform` and `opacity`. Zero layout thrashing (`width`, `height`, `margin` transitions forbidden).
   - Under `@media (prefers-reduced-motion: reduce)`, all transitions clamp to `0.01ms` and animations freeze immediately.

