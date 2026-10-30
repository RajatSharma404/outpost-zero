# Outpost Zero: Coupled Life-Support & Logistics Engine Architecture Plan
**NASA Space Apps Challenge — Mars Surface Systems & Logistics Engineering Simulation**
**Document ID:** `docs/PLAN.md`  
**Status:** Phase 0 Audit & Engineering Plan Complete  
**Date:** October 2026

---

## 1. Executive Summary & Problem Statement

A domain expert review of the deployed Outpost Zero simulator identified a foundational pedagogical limitation:
> *"The current simulator is too simple … human life support in space is not a simple linear equation."*

### Current Linear Approach vs. Physical Reality
1. **Current Linear Math (As Inferred & Verified):**
   - **Crew Demand:** Computed via static multipliers:
     $$\text{Daily Demand} = \text{Crew Count} \times \text{Constant Rate}$$
     Where:
     - Water: $2.5\text{ kg/CM-d}$ (drinking/food) or $3.5\text{ kg/CM-d}$ (gross).
     - Oxygen: $0.84\text{ kg/CM-d}$.
     - Food: $1.83\text{ kg/CM-d}$ (packaged) or $0.62\text{ kg/CM-d}$ (dry).
   - **Open-Loop Mass (e.g. 6 crew, 210 days = 1,260 person-days):**
     $$\text{Water} = 1,260 \times 2.5\text{ kg} = 3,150\text{ kg } (3.15\text{ t})$$
     $$\text{Oxygen} = 1,260 \times 0.84\text{ kg} = 1,058.4\text{ kg } (\sim 1.06\text{ t})$$
     $$\text{Food} = 1,260 \times 1.83\text{ kg} = 2,305.8\text{ kg } (\sim 2.31\text{ t})$$
     $$\text{Total Open Loop} = 3.15\text{ t} + 1.06\text{ t} + 2.31\text{ t} = 6.514\text{ t } (\approx 6.5\text{ t})$$
   - **Closed-Loop Shortcut Formula:**
     $$\text{Closed Loop Mass} = \text{Water} \times (1 - \text{Recycle \%}) + O_2 \times (1 - \text{Recovery \%}) + \text{Food}$$
     At $98\%$ water recovery and $\sim 47\text{–}50\%$ $O_2$ recovery:
     $$\text{Water} = 3,150 \times 0.02 = 63\text{ kg } (0.063\text{ t})$$
     $$\text{Oxygen} \approx 1,058.4 \times (1 - 0.47) \approx 561\text{ kg } (\sim 0.56\text{ t})$$
     $$\text{Food} = 2,305.8\text{ kg } (2.31\text{ t})$$
     $$\text{Total Closed Loop} = 0.063\text{ t} + 0.56\text{ t} + 2.31\text{ t} = 2.933\text{ t } (\approx 2.9\text{ t}, -56\%)$$
2. **Deficiencies of the Linear Model:**
   - **Neglects Human Physiological Individuality:** Assumes every astronaut consumes the exact same mass regardless of sex, age, lean body mass, height, activity factor, and EVA exercise increments.
   - **Decoupled From Stoichiometric Energy Balance:** Respiration rates ($O_2$ consumed, $CO_2$ exhaled, vapor produced) are biological byproducts of metabolic energy expenditure ($\text{MJ/sol}$), not independent constants.
   - **Hardcoded Oxygen Recovery:** In reality, the Sabatier reaction ($CO_2 + 4H_2 \rightarrow CH_4 + 2H_2O$) has a stoichiometric recovery limit of $\sim 50\%$ because half of the available hydrogen is lost as vented methane ($CH_4$).
   - **Ignored Volumetric & Stowage Constraints:** Spacecraft payload limits are constrained by both mass ($\text{kg}$) and pressurized volume ($m^3$). Neglecting stowage cubes and Net Habitable Volume (NHV) thresholds ($11.3\text{ / }20\text{ / }25\text{ m}^3\text{/person}$) obscures the volumetric trade-off of carrying food vs. equipment.
   - **Zero Accounting for Mechanical Sparing & Maintenance:** High recycling percentages require complex distillation assemblies and pumps that break down. Over a 3-year mission, replacement spare parts mass often equals or exceeds the mass of water saved!
   - **Deterministic Illusion:** In actual spaceflight, hardware failures are stochastic, requiring probabilistic Monte Carlo modeling and critical open-loop backup reserves (30-day NASA AES standard).

---

## 2. Target Architecture Overview

The new system replaces linear formulas with a **coupled, seeded, unit-tested, and deterministic life-support and logistics engine** (`src/engine/`), wrapped in an **ISA-101 high-performance human-machine interface (HMI)**.

### Architectural Invariants & Rules
1. **Single Source of Truth (`src/engine/constants.ts`):** Every constant lives in one typed registry containing: `value`, `unit`, `tier`, `source`, `confidence`, and `definition note`. Tiers:
   - `REQ`: NASA technical standard / official requirement (e.g., NASA-STD-3001).
   - `OBS`: Empirical historical observation or flight measurement (e.g., ISS WRS, MSL RAD).
   - `STUDY`: Published aerospace study assumption (e.g., NASA DRA 5.0, DLR Starship analysis).
   - `STUDENT`: Educational modeling concept or unverified assumption (documented in `docs/OPEN_QUESTIONS.md`).
2. **Pure TypeScript Engine:** Located in `src/engine/`, completely decoupled from React, DOM, or Next.js APIs. 100% deterministic given a PRNG seed.
3. **Coupled Flows & Mass-Balance Audit:**
   - EER calculation from body stats $\rightarrow$ Metabolic MJ $\rightarrow$ Stoichiometric $O_2$ and $CO_2$ rates.
   - Real Sabatier stoichiometry with hydrogen tracking and methane venting.
   - Daily mass-balance audit verifying:
     $$\sum \text{Inputs } (O_2 + \text{Food} + \text{Water}) = \sum \text{Outputs } (CO_2 + \text{Urine} + \text{Vapor} + \text{Sweat} + \text{Feces} + \text{Solids}) \pm 2\%$$
   - Carbon ledger tracking elemental carbon flow from food input to $CO_2$, $CH_4$, trash, and biomass output.
4. **Volume & Feasibility Constraints:**
   - Tracking mass ($\text{kg}$) AND stowage volume ($m^3$).
   - Evaluating vehicle pressurized volume against:
     $$\text{Pressurized Volume} = \text{Net Habitable Volume (NHV)} + \text{Stowage Volume} + \text{Systems Machinery}$$
   - Enforcing habitability thresholds: $11.3\text{ m}^3$ (survival minimum), $20.0\text{ m}^3$ (optimal 6-month limit), $25.0\text{ m}^3$ (NASA SME multi-year consensus).
5. **Reliability, Sparing & Monte Carlo:**
   - Daily failure hazard: $\lambda = \frac{\text{realityFactor}}{\text{MTBF}}$, with $\text{realityFactor} = 2.0$ based on ISS flight data.
   - Web Worker Monte Carlo simulation ($N=1,000$ runs) providing probabilistic distribution of reserve days, spare parts consumed, and probability of crew loss.
6. **Break-Even Module:** Non-linear parametric curve comparing:
   - (a) All-stored expendables.
   - (b) Recycling only (including machine dry mass + required spares).
   - (c) Mixed architecture (recycling + 30-day survival reserve).

---

## 3. Detailed Phase Breakdown

### Phase 1: Constants Registry & Model Specification
- **1.1 Single Constants Registry (`src/engine/constants.ts`):**
  - Implement full type-safe registry supporting `REQ`, `OBS`, `STUDY`, `STUDENT`.
  - Encode all parameters from NASA-STD-3001, NASA BVAD Rev 2, JSC-67378, DRA 5.0, and DLR studies.
  - Expose query functions: `getConstant(id)`, `getConstantsByTier()`, and full metadata inspectability.
- **1.2 Mathematical Model Specification (`docs/MODEL.md`):**
  - Document all mathematical equations: EER calculation, stoichiometric conversions, Sabatier reaction mechanics, ideal-gas cabin atmosphere $ppCO_2$, mass-balance equations, and failure hazard formulas.
- **1.3 Open Questions & Student Assumptions Register (`docs/OPEN_QUESTIONS.md`):**
  - Formally track every parameter falling under `STUDENT` tier or `LOW` confidence, ensuring zero unverified numbers are presented as official NASA standards.

### Phase 2: Pure TypeScript Engine (`src/engine/`)
- **2.1 Crew & Metabolic Sizing (`src/engine/crew.ts`):**
  - Individual crew roster tracking: sex, age, mass, height, activity factor (1.11 vs 1.25), and weekly EVA hours.
  - Derived EER using NASA erratum formula ($662$ constant for men, $354$ for women).
  - Energy conversion: $\text{Metabolic MJ} = \text{kcal} \times 0.004184$.
  - Stoichiometric gas rates: $O_2 = 0.0701\text{ kg/MJ}$, $CO_2 = 0.0850\text{ kg/MJ}$.
  - Fluid intake targets: $\max(32\text{ mL/kg}, 2.5\text{ L men} / 2.1\text{ L women})$.
- **2.2 Cabin Atmosphere & $ppCO_2$ (`src/engine/atmosphere.ts`):**
  - Ideal-gas partial pressure: $ppCO_2 = \frac{n_{CO_2} R T}{V_{pressurized}}$ in mmHg.
  - Threshold alerts: $\le 3.0\text{ mmHg}$ 1-hour average (REQ); hours-to-limit countdown if scrubbing is offline.
  - Cognitive and physical performance degradation curves.
- **2.3 ECLSS & Bioregenerative Subsystems (`src/engine/eclss.ts`):**
  - Water Recovery System (WRS): $93.5\%$ baseline; $98.0\%$ with Brine Processor Assembly.
  - $O_2$ Electrolysis ($2H_2O \rightarrow 2H_2 + O_2$).
  - Stoichiometric Sabatier reactor ($CO_2 + 4H_2 \rightarrow CH_4 + 2H_2O$), tracking $H_2$ availability and venting $CH_4$.
  - Optional Bosch reactor ($CO_2 + 2H_2 \rightarrow C_{(s)} + 2H_2O$) for $>75\%$ recovery (STUDENT).
  - Crop & plant growth modules: area in $m^2$, tunable yield, water/air regeneration offsets.
  - 30-day open-loop backup stores.
- **2.4 Vehicle Presets, Stowage & Feasibility (`src/engine/vehicles.ts`):**
  - Pre-configured aerospace vehicles: Orion Capsule (21 d max), NASA Mars Transit Habitat (306 m³ / 147 m³ NHV), NASA 500-Day Habitat (193 m³), Starship DLR Conservative (200 m³ / 12 crew), Starship SpaceX Concept (1,100 m³), and Custom/Orion XL.
  - Constraint evaluation: mass capacity, volume balance, and NHV per person.
- **2.5 Mass-Balance Audit & Carbon Ledger (`src/engine/mass-balance.ts`):**
  - Real-time audit verifying inputs vs. outputs within $\pm 2\%$.
  - Carbon ledger computing percentage of exhaled carbon recovered into food.
- **2.6 Sparing, Mechanical Failures & Monte Carlo (`src/engine/reliability.ts` & `src/engine/monte-carlo.ts`):**
  - MTBF tracking, realityFactor ($2.0\times$), repair crew-hours, and spare parts inventory.
  - Monte Carlo runner (N=1,000 seeded iterations) generating failure distributions and probability of crew loss.
- **2.7 Break-Even Analysis Module (`src/engine/breakeven.ts`):**
  - Parametric evaluation of stored vs. recycling vs. mixed architectures.
- **2.8 Comprehensive Vitest Test Suite (`tests/engine-coupled.test.ts`):**
  - Reference astronaut EER verification ($\approx 3,075\text{ kcal}$).
  - Stoichiometric $O_2/CO_2$ verification across 5th/ref/95th percentiles.
  - Sabatier $O_2$ recovery natural ceiling ($\le 50\%$).
  - Mass-balance closure verification ($\le 2\%$).
  - Monotonicity checks (increasing days/crew never decreases required mass).
  - Determinism verification across identical seeds.
  - Orion 21-day hard constraint enforcement.
  - Cabin $ppCO_2$ hours-to-limit validation.

### Phase 3: ISA-101 High-Performance HMI Visual Design
- **High-Performance HMI Guidelines:**
  - Light-gray baseline canvas (`#D0D0D0` to `#F0F0F0`; dedicated night mode with dark basalt `#141211`).
  - Flat 2D interface without decorative gradients, blurs, or glow effects.
  - Monospace tabular numerals for all telemetry readouts (`font-variant-numeric: tabular-nums`).
  - Color reserved strictly for abnormal states (Yellow = Caution, Orange = Warning, Red = Alarm).
  - Analog bar indicators with clearly delineated operational bands.
  - 4-level progressive disclosure drill-down:
    - **Level 1 (Overview):** Phase timeline, mission reserve gauges (days of water, $O_2$, food, $ppCO_2$, NHV/person, mass and volume margins, radiation indices, active alarm banner).
    - **Level 2 (Subsystems):** Dedicated views for Water Loop, Air Loop & Carbon Ledger, Nutrition & Food Shelf-Life, Vehicle Stowage Cube, and Reliability & Spares.
    - **Level 3 (Diagnostics):** Real-time mass-balance audit ledger, elemental flows, and failure hazard rates.
    - **Level 4 (Registry Browser):** Sourced parameters inspector displaying tier badges (`REQ`, `OBS`, `STUDY`, `STUDENT`), DOI links, and confidence ratings.
  - **Quick Start Mode:** Backward-compatible preset enabling players to run the classic 30-sol Martian outpost scenario on the new coupled engine.

### Phase 4: Verification & Quality Gate
- Full Vitest test execution (all unit and integration tests passing).
- Zero TypeScript (`npx tsc --noEmit`) and linting errors.
- Full Next.js production build (`npm run build`).
- Documentation verification and reporting.

---

## 4. Complete File Modification & Creation Manifest

| File Path | Action | Purpose |
|:---|:---:|:---|
| `docs/PLAN.md` | **Create** | Detailed Phase 0 audit and implementation plan (this document). |
| `docs/OPEN_QUESTIONS.md` | **Create** | Registry of all `STUDENT` tier and low-confidence modeling assumptions. |
| `docs/MODEL.md` | **Create** | Comprehensive mathematical formulation and systems flow documentation. |
| `src/engine/constants.ts` | **Create** | Single typed constants registry with tier, unit, source, and confidence. |
| `src/engine/types.ts` | **Create** | Core TypeScript interfaces (CrewMember, Inventory, ECLSSUnit, Vehicle, etc.). |
| `src/engine/crew.ts` | **Create** | Human metabolic modeling, EER calculations, and gas stoichiometry. |
| `src/engine/atmosphere.ts` | **Create** | Cabin gas volume, ideal-gas $ppCO_2$, and time-to-limit estimators. |
| `src/engine/eclss.ts` | **Create** | Water recovery, electrolysis, Sabatier stoichiometry, and plant growth. |
| `src/engine/vehicles.ts` | **Create** | Vehicle presets, stowage volume, and Net Habitable Volume constraints. |
| `src/engine/nutrition.ts` | **Create** | BVAD menus, micronutrient coverage, and shelf-life degradation modeling. |
| `src/engine/mass-balance.ts` | **Create** | Daily conservation of mass audit and closed-loop carbon ledger. |
| `src/engine/reliability.ts` | **Create** | MTBF failure hazard, reality factor, repair hours, and spares allocation. |
| `src/engine/breakeven.ts` | **Create** | Stored vs. recycling vs. mixed trade-off curve generator. |
| `src/engine/monte-carlo.ts` | **Create** | Probabilistic reserve and mission loss distribution runner. |
| `src/engine/sim.ts` | **Create** | Pure simulation step coordinator across outbound, surface, and return. |
| `src/engine/index.ts` | **Create** | Unified engine export entry point. |
| `tests/engine-coupled.test.ts` | **Create** | Vitest test suite validating all physiological, stoichiometric, and physical rules. |
| `app/pack/page.tsx` & components | **Update** | Rebuild manifest planner wizard around coupled mass and volume constraints. |
| `components/pack/MassBar.tsx` | **Update** | Dual-axis mass ($\text{kg}$) and volume ($m^3$) display with pattern textures. |
| `components/pack/LoadoutSummary.tsx`| **Update** | Multi-tier advisories, binding constraint detection, and max crew/days readouts. |
| `app/mission/page.tsx` & components | **Update** | ISA-101 high-performance HMI dashboard with 4-level progressive drill-down. |
| `components/mission/MeterGauge.tsx` | **Update** | Analog bar indicators with operational bands and threshold crossing alerts. |
| `app/report/page.tsx` & components | **Update** | Monte Carlo probability histograms, break-even charts, and causal attribution. |
| `app/how-it-works/page.tsx` | **Update** | Interactive textbook updated with coupled formulas from `MODEL.md`. |
| `app/sources/page.tsx` | **Update** | Live constants registry browser displaying tiers, confidence, and DOI links. |

---

## 5. Verification Gate & Phase Milestones

1. **Phase 0 Milestone (Current):** Audit complete. Linear math verified. Plan committed to `docs/PLAN.md`. Stop and report.
2. **Phase 1 Milestone:** `src/engine/constants.ts`, `docs/MODEL.md`, and `docs/OPEN_QUESTIONS.md` written and committed.
3. **Phase 2 Milestone:** Complete pure TypeScript engine implemented in `src/engine/`. All Vitest tests in `tests/engine-coupled.test.ts` passing. Commit. Stop and report.
4. **Phase 3 Milestone:** UI reconstructed under ISA-101 high-performance HMI principles. Replaced all linear UI components.
5. **Phase 4 Milestone:** Full production build passes (`npm run build`, `npm test`). Quality report delivered.
