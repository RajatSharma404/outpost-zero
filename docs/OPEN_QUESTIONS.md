# Open Questions & Student Modeling Assumptions Register
**Project:** Outpost Zero — Mars Logistics & Life Support Simulator  
**Document ID:** `docs/OPEN_QUESTIONS.md`  
**Rule Compliance:** In accordance with Rule 1, any parameter or formula not directly sourced from NASA requirements (REQ), historical flight observations (OBS), or published peer-reviewed studies (STUDY) is classified as tier `STUDENT` with confidence `LOW`. These assumptions are tracked here transparently and never presented as official standards.

---

## 1. Active Student-Tier Modeling Assumptions

| Parameter / Model Area | Current Working Value | Tier | Confidence | Description & Rationale |
|:---|:---:|:---:|:---:|:---|
| **`orion_xl_pressurized_volume_m3`** | `60.0 m³` | STUDENT | LOW | Hypothetical scaled Orion transit concept ("Orion XL"). Has no official NASA specification; provided as a user-tunable what-if sandbox. |
| **`orion_xl_max_crew`** | `6 crew` | STUDENT | LOW | Hypothetical crew capacity for the student-defined Orion XL concept. |
| **`orion_xl_mass_capacity_kg`** | `15,000 kg` | STUDENT | LOW | Assumed payload mass capacity for the Orion XL concept. |
| **`bosch_co2_reduction_recovery_pct`** | `75.0%` | STUDENT | LOW | High-temperature catalytic Bosch reduction target. Advanced laboratory concept with carbon solid deposition; flagged as low TRL and higher failure rate. |
| **`bosch_hardware_mass_kg`** | `850 kg` | STUDENT | LOW | Estimated equipment mass for an exploration-scale Bosch reactor. |
| **`bosch_failure_mtbf_hours`** | `3,000 hrs` | STUDENT | LOW | High failure rate assumption reflecting catalyst poisoning and carbon soot fouling. |
| **`food_storage_degradation_rate_per_year`** | `5.0%` | STUDENT | LOW | Annual nutrient loss factor for ambient food storage, specifically modeling accelerated loss of thiamin (vitamin B1) and ascorbic acid (vitamin C). |
| **`predeployed_food_lead_time_months`** | `26.0 months` | STUDENT | LOW | Assumed pre-deployment cargo storage elapsed time before crew arrival at Mars. |
| **`cargo_lander_success_probability`** | `0.90 (90%)` | STUDENT | LOW | Probability of successful uncrewed cargo Entry, Descent, and Landing (EDL) for pre-deployed logistics. |
| **`surface_radiation_dose_msv_per_sol`** | `0.67 mSv/sol` | STUDENT | LOW | Surface cosmic ray dose rate under unshielded atmospheric conditions (to be further sourced from surface lander studies). |
| **`radiation_shielding_diminishing_exponent`** | `0.65` | STUDENT | LOW | Power-law diminishing returns exponent for passive regolith/polyethylene mass attenuation. |
| **`ppco2_cognitive_impairment_slope`** | `0.08 / mmHg` | STUDENT | LOW | Empirical curve modeling cognitive friction and task completion slowdown above the 3.0 mmHg 1-hour average limit. |
| **`eclss_unlisted_mtbf_default_hours`** | `5,000 hrs` | STUDENT | LOW | Default MTBF applied to auxiliary pumps, valves, and sensors lacking explicit historical flight failure data. |

---

## 2. Source Disagreement Reconciliation

Where authoritative sources disagree on planning values, the simulator preserves both as distinct, user-selectable parameters rather than silently averaging:

1. **Packaged Food Mass Rate:**
   - **`food_packaged_bvad_low_kg_cm_d`** (`1.83 kg/CM-d`): NASA BVAD lower baseline for packaged provisions (OBS / Medium).
   - **`food_packaged_bvad_high_kg_cm_d`** (`2.39 kg/CM-d`): NASA BVAD upper baseline for delivered food mass (OBS / Medium).
   - **`food_packaged_iss_leach_kg_cm_d`** (`2.77 kg/CM-d`): Historical ISS 2017–2020 measured delivery rate by Leach & Ewert (OBS / High).
2. **Water Recycling Efficiency:**
   - **`water_recovery_historical_iss`** (`0.935` / 93.5%): Historical ISS recovery rate prior to the Brine Processor Assembly (OBS / High).
   - **`water_recovery_bpa_milestone`** (`0.980` / 98.0%): Demonstrated peak recovery milestone with brine processing (OBS / High).
3. **Adult Estimated Energy Requirement (EER) Baseline Constant:**
   - **`eer_male_baseline_jsc_printed`** (`622 kcal`): Printed constant in JSC-67378 Rev 1 (STUDY / Medium).
   - **`eer_male_baseline_erratum`** (`662 kcal`): Official NASA erratum / standard dietary reference intake equation (REQ / High).
4. **Transit Net Habitable Volume (NHV):**
   - **`nhv_minimum_sme_consensus_m3`** (`25.0 m³/person`): 2014 NASA Subject Matter Expert consensus for multi-year missions (STUDY / High).
   - **`nhv_bottom_up_study_m3`** (`28.96 m³/person`): 2020 NASA bottom-up functional space study (STUDY / Medium).
   - **`nhv_woolford_bond_emergency_m3`** (`11.3 m³/person`): Historical 6-month performance degradation threshold (STUDY / Medium).
   - **`nhv_woolford_bond_optimal_m3`** (`20.0 m³/person`): Optimal 6-month habitability limit (STUDY / Medium).
