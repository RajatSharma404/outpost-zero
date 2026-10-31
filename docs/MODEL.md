# Outpost Zero: Mathematical Model & Flow Specification
**Document ID:** `docs/MODEL.md`  
**Framework:** Coupled, Non-Linear Life Support & Logistics Engine  
**Governing Standards:** NASA-STD-3001 Vol 2 Rev D, NASA BVAD Rev 2 (NASA/TP-2015-218570), NASA DRA 5.0

---

## 1. Crew Metabolism & Stoichiometric Gas Coupling

The engine rejects static multipliers. Human metabolic expenditure and respiration are coupled to individual physiological metrics:

### 1.1 Estimated Energy Requirement (EER)
Calculated from age (years), body mass ($M$ in kg), height ($H$ in m), activity factor ($AF$), and EVA workload ($h_{\text{eva}}$):

$$\text{EER}_{\text{male}} = 662 - 9.53 \times \text{age} + AF \times (15.9 \times M + 539.6 \times H) + 200 \times h_{\text{eva}}$$
$$\text{EER}_{\text{female}} = 354 - 6.91 \times \text{age} + AF \times (9.36 \times M + 726.0 \times H) + 200 \times h_{\text{eva}}$$

- $AF = 1.11$ ("Low Active", ~30 min/day resistance exercise)
- $AF = 1.25$ ("Active", standard ISS-level daily exercise regimen)
- Metabolic energy in Megajoules: $E_{\text{metabolic}} = \text{EER} \times 0.004184\text{ MJ/kcal}$

### 1.2 Stoichiometric Respiration Coupling
Oxygen demand and carbon dioxide exhalation are stoichiometric functions of metabolic megajoules:
$$m_{O_2} = E_{\text{metabolic}} \times 0.0701\text{ kg } O_2/\text{MJ}$$
$$m_{CO_2} = E_{\text{metabolic}} \times 0.0850\text{ kg } CO_2/\text{MJ}$$

*(Verification: Reference astronaut consuming $12.027\text{ MJ/d}$ yields $0.843\text{ kg } O_2$ and $1.022\text{ kg } CO_2$; $12.778\text{ MJ/d}$ yields $0.896\text{ kg } O_2$ and $1.086\text{ kg } CO_2$, strictly matching BVAD observations across all crew percentiles).*

---

## 2. Water Mass Balance & Excretion Partitioning

Potable water intake satisfies the greater of body mass proportionality or gender-specific safety floors:
$$V_{\text{fluid}} = \max\Big(0.032 \times M,\; \text{if male then } 2.5\text{ else } 2.1\Big) + 0.24 \times h_{\text{eva}}\quad [\text{L/CM-d}]$$

Gross water throughput partitions across distinct physical streams:
1. **Inputs:** Drinking water + Food preparation water ($2.5\text{ kg/CM-d}$) + Hygiene ($0.4\text{ kg/CM-d}$) + Flush ($0.3\text{ kg/CM-d}$).
2. **Outputs (Excretions):**
   - Respiration & Perspiration Vapor: $2.27\text{–}2.52\text{ kg/CM-d}$ (collected by condensing heat exchangers).
   - Liquid Sweat Runoff: $0.22\text{–}0.43\text{ kg/CM-d}$ (hygiene wipes / towels).
   - Urine Output: $1.85\text{ kg/CM-d}$ (1.40–2.00 range, $95\%$ water, $5\%$ dissolved solids).
   - Feces: $0.09\text{ kg}$ water + $0.03\text{ kg}$ solids (vented or stowed).

---

## 3. Daily Conservation of Mass Audit

Every simulated sol, the engine conducts a closed mass-balance audit across every crew member:
$$\Delta M = \sum \text{Inputs } (m_{O_2} + m_{\text{food, consumed}} + m_{\text{water, ingested}}) - \sum \text{Outputs } (m_{CO_2} + m_{\text{urine}} + m_{\text{vapor}} + m_{\text{sweat}} + m_{\text{feces}} + m_{\text{solids}})$$

The physical conservation invariant requires $|\Delta M| \le 2.0\%$ of total throughput. Any deviation triggers an immediate diagnostic warning.

---

## 4. Closed-Loop ECLSS Stoichiometry & Chemistry

```
                     ┌──────────────────┐
                     │ Crew Respiration │
                     └─────────┬────────┘
                               │ CO2
                               ▼
┌─────────────┐  H2  ┌──────────────────┐  CH4 (Vented)
│ Electrolyzer├─────►│ Sabatier Reactor ├─────────────►
└──────▲──────┘      └─────────┬────────┘
       │ H2O                   │ H2O Product
       └───────────────────────┴──────────────► Recycled Water
```

### 4.1 Water Recovery System (WRS)
$$m_{\text{potable, recovered}} = (m_{\text{urine}} + m_{\text{condensate}} + m_{\text{hygiene}}) \times \eta_{\text{WRS}}$$
- Historical Baseline (without Brine Processor): $\eta_{\text{WRS}} = 0.935$ ($93.5\%$)
- Milestone Baseline (with Brine Processor Assembly): $\eta_{\text{WRS}} = 0.980$ ($98.0\%$)

### 4.2 Water Electrolysis & Sabatier Reaction
- **Electrolysis:** $2H_2O \rightarrow 2H_2 + O_2$ (Mass ratio: $1.0\text{ kg } O_2$ requires $1.125\text{ kg } H_2O$ and generates $0.125\text{ kg } H_2$).
- **Sabatier Reduction:** $CO_2 + 4H_2 \rightarrow CH_4 \uparrow + 2H_2O$
  - Reaction stoichiometry requires $4\text{ moles } H_2$ ($8\text{ g}$) per $1\text{ mole } CO_2$ ($44\text{ g}$).
  - Limiting Reagent: Because crew oxygen demand generates only $0.125\text{ kg } H_2 / \text{kg } O_2$, byproduct hydrogen is insufficient to reduce all exhaled $CO_2$.
  - Methane Venting Loss: Because $CH_4$ is vented, half the hydrogen is permanently lost.
  - **Emergent Result:** Oxygen loop recovery naturally caps at **$\approx 45\text{–}50\%$**, emerging directly from chemistry without hardcoded percentages.

### 4.3 Carbon Ledger
Tracks carbon atom conservation:
$$C_{\text{input}} (\text{food}) = C_{\text{exhaled}} (CO_2) + C_{\text{vented}} (CH_4) + C_{\text{trash}} + C_{\text{biomass}}$$
The ledger reports the exact percentage of metabolic carbon reclaimed into edible biomass:
$$\text{Carbon Closure \%} = \frac{C_{\text{recycled to food}}}{C_{\text{exhaled in } CO_2}} \times 100$$

---

## 5. Cabin Atmosphere & $ppCO_2$ Dynamics

Cabin carbon dioxide partial pressure is modeled via the Ideal Gas Law:
$$ppCO_2 = \frac{n_{CO_2} \cdot R \cdot T}{V_{\text{pressurized}}} \times 7.50062\quad [\text{mmHg}]$$

- **Limit (REQ):** $ppCO_2 \le 3.0\text{ mmHg}$ (1-hour average).
- **Time to Limit (Scrubber Offline):**
  $$t_{\text{limit}} = \frac{(3.0 - ppCO_{2,\text{current}}) \cdot V_{\text{pressurized}} \cdot M_{CO_2}}{7.50062 \cdot R \cdot T \cdot \sum \dot{m}_{CO_2}}\quad [\text{hours}]$$
  *(Hand check: 6 crew exhaling $0.26\text{ kg/h } CO_2$ in $300\text{ m}^3$ at $1.0\text{ mmHg}$ reaches $3.0\text{ mmHg}$ in $\approx 5.3\text{ hours}$).*

---

## 6. Sparing, Mechanical Reliability & Monte Carlo

- **Daily Failure Hazard:** $\lambda = \frac{\text{realityFactor}}{\text{MTBF}_{\text{hours}} / 24}$, with $\text{realityFactor} = 2.0$ (ISS flight data).
- **Repair Dynamics:** A failed processor stays offline until repaired ($t_{\text{repair}}$ crew-hours) and consumes 1 replacement spare ORU.
- **Exhaustion State:** If spares are depleted, the processor fails permanently, forcing immediate drawdown of the 30-day open-loop backup stores.
- **Monte Carlo Engine ($N=1,000$ runs):** Evaluates stochastic component lifetimes across seeds to generate true probability distributions of mission success, spares consumed, and loss-of-crew risks.

---

## 7. Vehicle Packing & Net Habitable Volume (NHV)

A mission architecture is valid if and only if all three physical constraints are satisfied:
1. **Mass Constraint:** $M_{\text{vehicle}} + M_{\text{ECLSS}} + M_{\text{spares}} + M_{\text{consumables}} \le M_{\text{capacity}}$
2. **Pressurized Volume Balance:** $\text{NHV} + V_{\text{stowage}} + V_{\text{machinery}} = V_{\text{pressurized}}$
3. **Habitability Standards:**
   - $\text{NHV} / \text{Crew} \ge 11.3\text{ m}^3$ (Woolford & Bond Emergency Minimum)
   - $\text{NHV} / \text{Crew} \ge 20.0\text{ m}^3$ (Optimal 6-month Performance)
   - $\text{NHV} / \text{Crew} \ge 25.0\text{ m}^3$ (NASA SME Multi-Year Mission Standard)
