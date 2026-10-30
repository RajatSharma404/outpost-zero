# -*- coding: utf-8 -*-
"""
Generate comprehensive Word (.docx) document containing both Mars Mission Logistics Reports
and the two interactive calculator screenshots with professional styling.
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

# Paths
BASE_DIR = r"d:\outpost-zero"
OUTPUT_DOCX = os.path.join(BASE_DIR, "Mars_Mission_Logistics_Simulation_Reports.docx")
IMG1_PATH = r"C:\Users\rajat\.gemini\antigravity\brain\977a1299-89fa-48a8-add0-3876391acba1\.user_uploaded\media_1793341238616_0674edc1.png"
IMG2_PATH = r"C:\Users\rajat\.gemini\antigravity\brain\977a1299-89fa-48a8-add0-3876391acba1\.user_uploaded\media_1793341248499_52377488.png"

# Color Palette (Aerospace & Mission Control)
HEX_PRIMARY = "0B3D91"      # NASA Deep Blue
HEX_DARK_SLATE = "1E293B"   # Basalt Deep Slate
HEX_RUST = "C45D3E"         # Martian Oxide Rust
HEX_LIGHT_BG = "F8FAFC"     # Off-white Slate
HEX_CALLOUT_BG = "F1F5F9"   # Subtle Callout Fill
HEX_BORDER = "CBD5E1"       # Clean Border Gray
HEX_BODY = "1F2937"         # Charcoal Body Text
HEX_MUTED = "64748B"        # Slate Muted Text

COLOR_PRIMARY = RGBColor(11, 61, 145)
COLOR_DARK_SLATE = RGBColor(30, 41, 59)
COLOR_RUST = RGBColor(196, 93, 62)
COLOR_BODY = RGBColor(31, 41, 55)
COLOR_MUTED = RGBColor(100, 116, 139)

def set_cell_background(cell, hex_color):
    """Sets background shading of a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
    """Sets cell padding in dxa (1 pt = 20 dxa)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_table_borders(table, color=HEX_BORDER, sz="4", val="single"):
    """Applies clean borders to a table."""
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_callout(doc, text, title=None, border_color=HEX_PRIMARY, bg_color=HEX_CALLOUT_BG):
    """Adds a stylish callout box with a colored left border."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=140, bottom=140, left=240, right=200)
    
    # Left border only
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    
    if title:
        run_t = p.add_run(title + "\n")
        run_t.bold = True
        run_t.font.name = "Calibri"
        run_t.font.size = Pt(11)
        run_t.font.color.rgb = COLOR_PRIMARY
        
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(10.5)
    run.font.color.rgb = COLOR_BODY
    
    # Add a blank spacing paragraph after table
    sp = doc.add_paragraph()
    sp.paragraph_format.space_before = Pt(0)
    sp.paragraph_format.space_after = Pt(6)

def build_document():
    doc = docx.Document()
    
    # Page setup: Standard Letter, 1-inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        # Configure Header and Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("NASA Space Apps Challenge | Outpost Zero — Mars Logistics Simulation")
        hrun.font.name = "Calibri"
        hrun.font.size = Pt(8.5)
        hrun.font.color.rgb = COLOR_MUTED
        
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        frun = fp.add_run("Mars Crew-Mission Logistics Simulation Technical Report • Verified Aerospace Standards")
        frun.font.name = "Calibri"
        frun.font.size = Pt(8.5)
        frun.font.color.rgb = COLOR_MUTED

    # Set default Normal style
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Calibri'
    font.size = Pt(11)
    font.color.rgb = COLOR_BODY

    # -------------------------------------------------------------
    # COVER / TITLE HEADER BLOCK
    # -------------------------------------------------------------
    p_meta = doc.add_paragraph()
    p_meta.paragraph_format.space_before = Pt(0)
    p_meta.paragraph_format.space_after = Pt(4)
    run_meta = p_meta.add_run("AEROSPACE SYSTEMS ENGINEERING & STEM LOGISTICS REPORT")
    run_meta.font.name = "Calibri"
    run_meta.font.size = Pt(9.5)
    run_meta.font.bold = True
    run_meta.font.color.rgb = COLOR_RUST

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(2)
    p_title.paragraph_format.space_after = Pt(4)
    p_title.paragraph_format.line_spacing = 1.1
    run_title = p_title.add_run("Mars Crew-Mission Logistics Simulation")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(26)
    run_title.font.bold = True
    run_title.font.color.rgb = COLOR_PRIMARY

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(12)
    run_sub = p_sub.add_run("Empirical Research Brief, Bioregenerative Closed-Loop Life Support Modeling, and Interactive Payload Trade-Off Architecture")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(13)
    run_sub.font.color.rgb = COLOR_DARK_SLATE

    # Metadata Grid Table
    meta_table = doc.add_table(rows=2, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        [("PROJECT REFERENCE:", "Outpost Zero (Mars Surface Systems Simulator)"),
         ("STANDARDS FRAMEWORK:", "NASA-STD-3001, NASA BVAD Rev 2, DRA 5.0")],
        [("SIMULATION SCOPE:", "Crew Consumables, ECLSS Loops, Volume & Sparing"),
         ("TARGET ENVIRONMENT:", "4-6 Person Crew Conjunction-Class Mars Transit")]
    ]
    for r_idx, row in enumerate(meta_data):
        for c_idx, (k, v) in enumerate(row):
            cell = meta_table.cell(r_idx, c_idx)
            set_cell_background(cell, HEX_CALLOUT_BG)
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            rk = p.add_run(k + " ")
            rk.font.bold = True
            rk.font.size = Pt(9)
            rk.font.color.rgb = COLOR_PRIMARY
            rv = p.add_run(v)
            rv.font.size = Pt(9)
            rv.font.color.rgb = COLOR_BODY
    set_table_borders(meta_table, color="D1D5DB", sz="4")

    # Spacing
    p_space = doc.add_paragraph()
    p_space.paragraph_format.space_before = Pt(8)
    p_space.paragraph_format.space_after = Pt(8)

    # -------------------------------------------------------------
    # SECTION 0: INTERACTIVE SIMULATION ARCHITECTURE & SCREENSHOTS
    # -------------------------------------------------------------
    h1 = doc.add_heading(level=1)
    h1.paragraph_format.space_before = Pt(16)
    h1.paragraph_format.space_after = Pt(8)
    run_h1 = h1.add_run("Executive Visual Architecture: Mars Consumables Calculator")
    run_h1.font.name = "Calibri"
    run_h1.font.size = Pt(17)
    run_h1.font.bold = True
    run_h1.font.color.rgb = COLOR_PRIMARY

    p_intro = doc.add_paragraph()
    p_intro.paragraph_format.space_after = Pt(8)
    p_intro.paragraph_format.line_spacing = 1.15
    p_intro.add_run(
        "To make complex aerospace life-support trade-offs accessible and tangible for learners and systems engineers, "
        "the simulation implements an interactive mathematical model directly comparing Open-Loop expendable logistics "
        "against Closed-Loop Environmental Control and Life Support Systems (ECLSS). Below are the operational telemetry "
        "and control interfaces developed for the Outpost Zero mission platform."
    )

    # Screenshot 1
    if os.path.exists(IMG1_PATH):
        p_img1 = doc.add_paragraph()
        p_img1.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img1.paragraph_format.space_before = Pt(8)
        p_img1.paragraph_format.space_after = Pt(4)
        run_img1 = p_img1.add_run()
        run_img1.add_picture(IMG1_PATH, width=Inches(5.8))
        
        p_cap1 = doc.add_paragraph()
        p_cap1.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap1.paragraph_format.space_after = Pt(12)
        run_cap1 = p_cap1.add_run("Figure 1: Mars Mission Consumables Calculator — Payload Comparison: Open Loop (6.5 t) vs. Closed Loop ECLSS (2.9 t, -56% payload reduction).")
        run_cap1.font.size = Pt(9.5)
        run_cap1.font.italic = True
        run_cap1.font.color.rgb = COLOR_MUTED

    # Commentary on Screenshot 1
    add_callout(
        doc,
        "Figure 1 illustrates the critical mass penalty of open-loop expendable architecture for a 210-day, 6-person Mars transit. "
        "In the open-loop baseline, consumable water alone demands 3.15 tonnes (blue segment), oxygen demands over 1.0 tonne (purple segment), "
        "and shelf-stable packaged food constitutes the remaining payload (green segment), totaling 6.5 tonnes. Under closed-loop regenerative ECLSS, "
        "urine distillation and humidity condensate recycling slash net water resupply by 98%, cutting launch mass by 56% down to 2.9 tonnes. "
        "Crucially, the simulation reveals that food cannot be completely closed without heavy agricultural infrastructure.",
        title="SYSTEMS ENGINEERING TAKEAWAY: THE 56% RECOVERY THRESHOLD"
    )

    # Screenshot 2
    if os.path.exists(IMG2_PATH):
        p_img2 = doc.add_paragraph()
        p_img2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img2.paragraph_format.space_before = Pt(8)
        p_img2.paragraph_format.space_after = Pt(4)
        run_img2 = p_img2.add_run()
        run_img2.add_picture(IMG2_PATH, width=Inches(5.8))
        
        p_cap2 = doc.add_paragraph()
        p_cap2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap2.paragraph_format.space_after = Pt(12)
        run_cap2 = p_cap2.add_run("Figure 2: Interactive Parameter Controls — Crew Size (6), Mission Duration (210 d), Metabolic Intensity (1.0x), and Water Recycling Rate (98%).")
        run_cap2.font.size = Pt(9.5)
        run_cap2.font.italic = True
        run_cap2.font.color.rgb = COLOR_MUTED

    # Commentary on Screenshot 2
    add_callout(
        doc,
        "The control dashboard exposes four independent variables governing the mission mass balance: (1) Crew Complement (scalable from 4 to 12 astronauts), "
        "(2) Mission Duration (scalable from short sprint missions to 1,200-day conjunction-class architectures), (3) Crew Metabolic Intensity (scaling "
        "caloric and oxygen consumption rates with physical workload and EVA hours), and (4) Water Recycling Efficiency (demonstrating the sensitivity "
        "of launch mass to processor efficiency between the 93% historical ISS baseline and the 98% Brine Processor Assembly milestone).",
        title="CONTROL TAXONOMY: INDEPENDENT SIMULATION DRIVERS"
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # PART I: FULL RESEARCH BRIEF (REPORT 1)
    # -------------------------------------------------------------
    h_part1 = doc.add_heading(level=1)
    h_part1.paragraph_format.space_before = Pt(8)
    h_part1.paragraph_format.space_after = Pt(6)
    run_part1 = h_part1.add_run("Part I: Mars Crew-Mission Logistics Simulation Research Brief")
    run_part1.font.name = "Calibri"
    run_part1.font.size = Pt(18)
    run_part1.font.bold = True
    run_part1.font.color.rgb = COLOR_PRIMARY

    add_callout(
        doc,
        "Bottom Line: Model a mission as coupled inventories, processing systems, storage space, failures, and crew health — "
        "not as one generic 'tonnes per person' calculation. Keep daily use, stored inventory, recycled flow, hardware, spares, "
        "and emergency reserves as separate quantities. Use NASA's Baseline Values and Assumptions Document (BVAD) as an engineering baseline, "
        "NASA-STD-3001 and JSC nutrition requirements for dietary planning, and label vehicle concepts and margins according to their evidence level.\n\n"
        "*'Per crew-member-day' is abbreviated CM-d below. Figures are planning baselines, not universal physiological constants.*",
        title="EXECUTIVE BOTTOM LINE // CORE PRINCIPLE"
    )

    def add_sec_heading(title, level=2):
        h = doc.add_heading(level=level)
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(4)
        run = h.add_run(title)
        run.font.name = "Calibri"
        run.font.size = Pt(14 if level == 2 else 12)
        run.font.bold = True
        run.font.color.rgb = COLOR_PRIMARY if level == 2 else COLOR_RUST
        return h

    def add_p(text, bold_prefix=None, space_after=6, italic=False):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_b = p.add_run(bold_prefix + " ")
            r_b.font.bold = True
            r_b.font.color.rgb = COLOR_DARK_SLATE
        r = p.add_run(text)
        r.font.italic = italic
        r.font.color.rgb = COLOR_BODY
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            r_b = p.add_run(bold_prefix + " ")
            r_b.font.bold = True
            r_b.font.color.rgb = COLOR_DARK_SLATE
        r = p.add_run(text)
        r.font.color.rgb = COLOR_BODY
        return p

    # 1. Human requirements per person-day
    add_sec_heading("1. Human Requirements per Person-Day")
    
    add_sec_heading("Energy and Individual Variation", level=3)
    add_p(
        "NASA-STD-3001 calls for food sufficient to meet each crewmember's estimated energy requirement (EER), "
        "calculated from age, sex, mass, height, and an activity factor. NASA's exploration nutrition document gives adult equations in the form:"
    )
    add_bullet("EER = 622 − 9.53 × age + AF × (15.9 × mass in kg + 539.6 × height in m)", bold_prefix="Men, age 19+:")
    add_bullet("EER = 354 − 6.91 × age + AF × (9.36 × mass in kg + 726 × height in m)", bold_prefix="Women, age 19+:")
    add_p(
        "EER is in kcal/day. An activity factor (AF) of 1.11 represents 'low active' in the exploration document; 1.25 is used for the more active "
        "profile associated with ISS-level exercise in the cited NASA material. NASA's nominal population-average target is approximately 3,035 kcal/day; "
        "an additional 200 kcal per EVA hour must be supplied above baseline. Systems models should not collapse dietary intake to a single static constant "
        "if the application accepts individual crew composition and body data."
    )
    add_p(
        "For a reference crewmember and exercise profile in NASA's 2022 BVAD, daily energy expenditure is approximately 12.0–12.8 MJ/day (2,875–3,055 kcal/day), "
        "oxygen consumption is 0.84–0.90 kg/day, and CO2 production is 1.01–1.08 kg/day. BVAD also reports a broad body-size range: 0.61–1.08 kg O2/day and "
        "0.74–1.31 kg CO2/day between its 5th-percentile female and 95th-percentile male cases. These physical differences dictate sizing by crew composition "
        "rather than headcount alone."
    )

    add_sec_heading("Water, Gases, and Food", level=3)
    add_bullet("A standard ISS-style water breakdown is roughly 2.5 kg/day for drinking and food preparation, 0.4 kg/day for personal hygiene, and 0.3 kg/day for urine-flush water. NASA's exploration nutrition document separately sets total fluid intake at 32 mL/kg/day, with strict minimums of 2.5 L/day for men and 2.1 L/day for women. Fluid intake is not identical to spacecraft water make-up: food moisture, hygiene, flush, processing losses, and recycling must be accounted for separately.", bold_prefix="Water Allocations:")
    add_bullet("For an ISS logistics baseline, BVAD's food table provides 1.83–2.39 kg/CM-d of packaged food, with approximately 0.67 kg/CM-d dry food as an unhydrated baseline. A long-duration mass-balance analysis delivers 2.39 kg/CM-d and subtracts 0.43 kg packaging, 0.20 kg uneaten packages, and 0.20 kg prepared food left unconsumed. These reflect distinct accounting definitions, not competing biological estimates.", bold_prefix="Food Mass Baselines:")
    add_bullet("Standard human metabolic mass-balance baseline values are approximately 0.84 kg O2 consumed and 1.01 kg CO2 produced per CM-d, though NASA's newer exercise-intensive reference cases are notably higher.", bold_prefix="Metabolic Gas Balance:")

    add_sec_heading("Macronutrients and Key Micronutrients", level=3)
    add_p(
        "NASA exploration requirements mandate protein at 1.2–1.8 g/kg body mass/day (with animal-to-vegetable protein ratio not exceeding 60:40); "
        "carbohydrates at 45–65% of daily energy (<10% from added sugars); fat at 20–35% of energy; fiber at 38 g/day for men and 25 g/day for women; "
        "and sex-specific omega-3/omega-6 minimums. Key flight-critical micronutrient daily targets include calcium (1,000–1,200 mg), vitamin D (25 µg / 1,000 IU), "
        "sodium (1,500–2,300 mg), potassium (3,400 mg men / 2,600 mg women), and iron capped at ≤8 mg for most adults (with a stated exception of 18 mg for "
        "menstruating women under 50 not suppressing menstruation pharmacologically)."
    )

    # 2. Microgravity physiology and nutrition
    add_sec_heading("2. Microgravity Physiology and Nutrition")
    add_p(
        "Microgravity unloads weight-bearing skeletal structures and musculature. NASA reports average bone-density loss of roughly 1.0–1.5% per month "
        "during four-to-six-month missions; published figures vary across skeletal sites, countermeasure compliance, and individual physiology, with some sources "
        "reporting 0.5–1.5%/month or 0.8%/month in lower-limb weight-bearing bone. Resistive and aerobic exercise mitigate but do not completely eliminate degradation."
    )
    add_p(
        "Observational nutrition evidence from ISS crews highlights persistent caloric deficits and lean body mass loss; early studies observed average in-flight intake "
        "of approximately 2,284 kcal/day (80% of WHO recommendations) in astronaut cohorts. Serum vitamin D status declined despite supplementation, with one cohort "
        "exhibiting a 27% post-flight decrease in 25-hydroxyvitamin D. Altered iron storage dynamics in space make excessive dietary iron undesirable; while NASA exploration "
        "standards cap iron at 8 mg/day to prevent toxic oxidative damage, historical ISS diets averaged 23 ± 12 mg/day."
    )
    add_p(
        "Deep-space radiation imposes acute and chronic oxidative stress. While NASA and peer-reviewed literature investigate antioxidants and phytochemical food quality, "
        "dietary interventions cannot replace physical shielding. Radiation management mandates physical regolith/water shields and operational abort protocols, with nutrition "
        "acting solely as an auxiliary physiological support mechanism."
    )

    # 3. ISS consumables and logistics
    add_sec_heading("3. ISS Consumables and Logistics")
    add_p(
        "The International Space Station operates as a resupply-dependent, partially regenerative life-support system rather than a closed-loop Mars template. "
        "Its Water Recovery System (WRS) reclaims urine distillate, cabin humidity condensate, and Sabatier product water. Before the installation of the Brine Processor "
        "Assembly (BPA), overall water recovery was 93–94%; the 2023 milestone demonstrated 98% water recovery with brine processing. This 98% figure represents a peak "
        "technology milestone and cannot be assumed as a continuous, maintenance-free Mars operational rate."
    )
    add_p(
        "The ISS Sabatier carbon dioxide reduction assembly has historically recovered approximately 47% of oxygen from CO2, constrained by the availability of "
        "byproduct hydrogen from water electrolysis. NASA exploration ECLSS architectures target a 50% baseline oxygen recovery, with advanced plasma pyrolysis and "
        "Bosch reactor concepts aiming for >75% in development."
    )
    add_p(
        "Comprehensive ISS logistics manifest analyses show that supplied mass comprises 34% ECLSS hardware/filters, 29% science/outfitting, 21% food, 6% hygiene, "
        "4% operational supplies, and 3% specialized clothing. Crucially, ECLSS hardware and replacement Orbital Replacement Units (ORUs) constitute the single largest "
        "mass category delivered. Sparing and mechanical unreliability (such as the Urine Processor Assembly fluid control pump) prove that deep-space life support "
        "must rigorously account for maintenance overhead, filter replacements, and spare-parts mass."
    )

    # 4. Artemis II baseline
    add_sec_heading("4. Artemis II Baseline: Useful, but Not a Scaling Recipe")
    add_p(
        "NASA's Artemis II is an approximately 10-day, four-person lunar flyby mission featuring zero resupply, zero refrigeration, and zero late-load food capability. "
        "Meals consist of shelf-stable retort thermostabilized, rehydratable, and irradiated items packaged in 2- to 3-day multi-serving containers."
    )
    add_p(
        "The Orion European Service Module (ESM) carries an inventory of 240 L of potable water, 90 kg of gaseous oxygen, and 30 kg of nitrogen. These numbers represent "
        "hardware storage capacities rather than measured mission consumption. Over 10 days, 4 astronauts consume approximately 120 L of water and 33.6 kg of oxygen, "
        "utilizing roughly half the ESM's consumable storage."
    )
    add_p(
        "The Orion crew capsule provides 330 ft³ (9.3 m³) of habitable volume for four crew members over a maximum duration of 21 days (~2.3 m³ per person). "
        "Orion functions strictly as an ascent, transit taxi, and Earth atmospheric entry vehicle; it lacks the volume, ECLSS redundancy, and storage volume required "
        "for multi-year interplanetary Mars transit."
    )

    # 5. Mars mission architectures
    add_sec_heading("5. Mars Mission Architectures")
    add_p(
        "NASA's Design Reference Architecture 5.0 (DRA 5.0) models a conjunction-class architecture employing a 6-person crew, a 6-month outbound transit, "
        "a 500-day surface stay at Mars, and a 6-month return transit (~900 days total). Surface habitats, rovers, and In-Situ Resource Utilization (ISRU) propellant "
        "plants are pre-deployed before crew departure. The Mars Transit Vehicle supports the crew for 400 nominal transit days plus 550 days of orbital contingency."
    )
    add_p(
        "In 2014, a NASA Subject Matter Expert (SME) consensus panel established a minimum acceptable Net Habitable Volume (NHV) of 25 m³ per person for multi-year missions. "
        "A detailed bottom-up volumetric study in 2020 determined minimum operational volumes of 28–29 m³ per person, yielding a 4-person Mars Transit Habitat with "
        "306 m³ of pressurized volume (147.2 m³ NHV, 52 m³ storage for 987 cargo containers, and 104 m³ dedicated to ECLSS and subsystem machinery)."
    )

    # 6. Vehicles and usable capacity
    add_sec_heading("6. Vehicles and Usable Capacity")
    add_bullet("SpaceX documents describe ~1,100 m³ of forward pressurized space and an advertised 100 t payload to LEO. Peer-reviewed architectures propose 10–20 crew on initial expeditions. However, usable payload for provisions cannot be calculated from headline launch capacity alone: structural pressure shells, radiation shelters, propellant boiloff reserves, ECLSS racks, thermal radiators, and habitat fit-out severely restrict net consumable mass.", bold_prefix="Starship (SpaceX):")
    add_bullet("4-person crew, 21-day standalone rating, 9.3 m³ cabin. Sized strictly as a crew return capsule.", bold_prefix="Orion (NASA/ESA):")
    add_bullet("Heavy-lift launch vehicle (45 t to LEO), not a crew habitat.", bold_prefix="Blue Origin New Glenn:")
    add_bullet("Lacks any authoritative NASA engineering specification. Must be modeled transparently as a hypothetical student-defined concept with user-editable volume and mass parameters.", bold_prefix="'Orion XL' Conceptual Vehicle:")

    # 7. Closed-loop life support and biological systems
    add_sec_heading("7. Closed-Loop Life Support and Biological Systems")
    add_p(
        "Water recycling mitigates make-up water requirements but does not alter biological throughput. High recovery rates require continuous power, expendable "
        "chemical pretreatments, filtration membranes, and distillation pumps subject to mechanical scaling and failure. Sabatier systems recover oxygen only partially "
        "due to stoichiometric hydrogen deficits."
    )
    add_p(
        "Bioregenerative ecological architectures (such as ESA's MELiSSA project) cycle organic waste, nitrifying bacteria, microalgae, and higher plants to regenerate "
        "nutrients, air, and potable water. ESA concept sizing estimates that a wheat-based diet requires approximately 10 m² of dedicated crop cultivation area per person. "
        "NASA's Veggie and Advanced Plant Habitat (APH) systems demonstrate the psychological and micronutrient value of fresh pick-and-eat salad greens, but complete "
        "caloric and oxygen closure remains unproven for flight systems. Simulations should model biological systems as fresh-food supplementation rather than 100% loop closure."
    )
    add_p(
        "Reliability analyses indicate that deep-space life support achieves break-even against open-loop expendable storage at approximately 120 days for a single system, "
        "180 days with dual redundancy (N=2), and 300 days with quad redundancy (N=4). NASA mission studies routinely mandate a 30-day open-loop expendable consumable backup "
        "for life-critical functions."
    )

    # 8. Safety margins and contingency planning
    add_sec_heading("8. Safety Margins and Contingency Planning")
    add_p(
        "Aerospace literature rejects a single, universal contingency margin. Robust simulation architectures distinguish five distinct operational reserves:"
    )
    add_bullet("Daily metabolic baseline for nominal operations.", bold_prefix="1. Nominal Demand:")
    add_bullet("Buffer for trajectory dispersions and mission extensions.", bold_prefix="2. Routine Reserve:")
    add_bullet("Direct open-loop expendables providing minimum 30 days of survival during primary processor failure.", bold_prefix="3. Emergency ECLSS Buffer:")
    add_bullet("Complete deduction of pre-deployed cargo if an uncrewed lander fails Entry, Descent, and Landing (EDL).", bold_prefix="4. Lost Resupply Contingency:")
    add_bullet("550-day contingency support in Mars orbit as formulated in DRA 5.0.", bold_prefix="5. Abort & Orbital Contingency:")

    # 9. Food types, packing, and shelf life
    add_sec_heading("9. Food Types, Packing, and Shelf Life")
    add_p(
        "Space food systems combine freeze-dried/rehydratable foods, thermostabilized retorts, irradiated meats, intermediate-moisture items, and natural-form rations. "
        "Dry unhydrated food provides ~0.22 g/kcal (0.67 kg for 3,035 kcal), whereas fully packaged, shipped food averages 0.60–0.79 g/kcal (1.83–2.39 kg/CM-d)."
    )
    add_p(
        "While ISS operations utilize an 18- to 24-month food shelf-life, a Mars conjunction mission demands stability of up to 5 years (including manufacturing, "
        "pre-deployment transit, storage, and mission execution). NASA multi-year storage trials demonstrate that thiamin (vitamin B1), vitamin C, and vitamin B6 degrade "
        "substantially under ambient storage, and thermostabilized product acceptability varies from 0 months to 8 years depending on the matrix."
    )

    # 10. Existing educational simulations
    add_sec_heading("10. Existing Educational Simulations and Pedagogical Opportunities")
    add_p(
        "Existing space simulation titles offer valuable gameplay but exhibit notable pedagogical limitations: Kerbal Space Program focuses on orbital mechanics; "
        "the Kerbalism mod introduces life-support and radiation mechanics but lacks authoritative metabolic scaling; First Martians emphasizes board-game crisis mechanics; "
        "and Surviving Mars treats life support as macro-scale city builder infrastructure."
    )
    add_p(
        "The educational opportunity for Outpost Zero lies in exposing the true engineering ledger: distinct tracking of daily metabolic demand, stored inventory, "
        "recycling efficiency, spare-parts mass, volume constraints, and explicit failure attribution."
    )

    # -------------------------------------------------------------
    # CONSOLIDATED PARAMETERS TABLE (REPORT 1)
    # -------------------------------------------------------------
    add_sec_heading("Consolidated Parameters for Baseline Mission Modeling")
    
    table_data_1 = [
        ["Parameter", "Baseline / Range", "Units & Definition", "Confidence & Source"],
        ["Adult Energy Target", "3,035", "kcal/CM-d (EER baseline)", "High: NASA-STD-3001 [1, 3]"],
        ["EVA Energy Increment", "+200", "kcal/EVA-hour above nominal", "High: NASA requirement [1, 2]"],
        ["Protein Intake", "1.2 – 1.8", "g/kg body mass/day", "High: JSC-67378 [1]"],
        ["Carbohydrate / Fat", "45–65% / 20–35%", "% of daily caloric intake", "High: JSC-67378 [1]"],
        ["Fluid Intake Target", "32", "mL/kg/day (≥2.5L M / ≥2.1L F)", "High: NASA Nutrition [1]"],
        ["Drinking + Food Water", "~2.5", "kg/CM-d direct consumption", "Medium: ISS Baseline [5]"],
        ["Hygiene Water", "~0.4", "kg/CM-d (minimal hygiene)", "Medium: BVAD Table 4-20 [62]"],
        ["Urine Flush Water", "~0.3", "kg/CM-d flush volume", "Medium: ISS Estimate [5]"],
        ["O2 Consumption", "0.84 – 0.90", "kg/CM-d (metabolic baseline)", "High: NASA BVAD Rev 2 [4]"],
        ["CO2 Production", "1.01 – 1.08", "kg/CM-d exhaled gas", "High: NASA BVAD Rev 2 [4]"],
        ["Packaged Food Mass", "1.83 – 2.39", "kg/CM-d as-shipped with packaging", "Medium: BVAD / ISS Data [4, 6]"],
        ["Dry Food Mass", "~0.67", "kg/CM-d unhydrated nutrients", "Medium: BVAD Ref Value [4]"],
        ["Water Recovery Rate", "93–94% (98% BPA)", "fraction of wastewater reclaimed", "High: ISS 2023 Milestone [16, 17]"],
        ["Sabatier O2 Recovery", "~47% (50% target)", "fraction of O2 recovered from CO2", "Medium: ISS CRA Specs [18, 19]"],
        ["Min Transit NHV", "25 (28–29 study)", "m³/person net habitable volume", "Medium-High: NASA SME [34, 35]"],
        ["Orion Cabin Volume", "9.3", "m³ habitable (4 crew, 21 d)", "High: NASA Orion Spec [30]"],
        ["Orion ESM Consumables", "240L H2O, 90kg O2", "total service module tankage", "High: ESA ESM Specs [29]"],
        ["Starship Forward Vol", "~1,100", "m³ gross pressurized space", "Low-Medium: SpaceX Guide [37, 38]"],
        ["Critical Open-Loop Backup", "30", "days of expendable reserves", "Medium: NASA Mars Studies [48]"],
        ["Food Shelf-Life Requirement", "~5", "years stable at ambient temp", "High: NASA HRP Goal [52, 63]"],
        ["Wheat Cultivation Area", "~10", "m²/person for full wheat diet", "Low-Medium: ESA MELiSSA [43]"]
    ]

    param_table_1 = doc.add_table(rows=len(table_data_1), cols=4)
    param_table_1.alignment = WD_TABLE_ALIGNMENT.CENTER
    for r_idx, row in enumerate(table_data_1):
        for c_idx, val in enumerate(row):
            cell = param_table_1.cell(r_idx, c_idx)
            if r_idx == 0:
                set_cell_background(cell, HEX_PRIMARY)
                set_cell_margins(cell, top=100, bottom=100, left=100, right=100)
                p = cell.paragraphs[0]
                p.paragraph_format.space_after = Pt(0)
                r = p.add_run(val)
                r.font.bold = True
                r.font.size = Pt(9.5)
                r.font.color.rgb = RGBColor(255, 255, 255)
            else:
                bg = HEX_CALLOUT_BG if r_idx % 2 == 1 else "FFFFFF"
                set_cell_background(cell, bg)
                set_cell_margins(cell, top=60, bottom=60, left=100, right=100)
                p = cell.paragraphs[0]
                p.paragraph_format.space_after = Pt(0)
                r = p.add_run(val)
                r.font.size = Pt(8.5)
                r.font.color.rgb = COLOR_BODY
    set_table_borders(param_table_1, color=HEX_BORDER, sz="4")

    # Spacing
    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_after = Pt(12)

    # -------------------------------------------------------------
    # PART II: SYSTEMS LOGISTICS SYNTHESIS (REPORT 2)
    # -------------------------------------------------------------
    doc.add_page_break()
    h_part2 = doc.add_heading(level=1)
    h_part2.paragraph_format.space_before = Pt(8)
    h_part2.paragraph_format.space_after = Pt(6)
    run_part2 = h_part2.add_run("Part II: Systems Logistics Synthesis & Operational Specification")
    run_part2.font.name = "Calibri"
    run_part2.font.size = Pt(18)
    run_part2.font.bold = True
    run_part2.font.color.rgb = COLOR_PRIMARY

    add_callout(
        doc,
        "This section synthesizes the core mathematical equations, environmental constraints, and structural relationships "
        "governing human life support during interplanetary transit and surface habitat operations.",
        title="OPERATIONAL SYNTHESIS OVERVIEW"
    )

    add_sec_heading("1. Human Requirements per Person-Day")
    add_bullet("Baseline fluid requirement is 2.5 L/day for direct drinking and food hydration. Extravehicular Activity (EVA) adds 0.24 L per EVA-hour. Complete hygiene and sanitation flush increases gross throughput to ~26 L/day in heavily closed systems.", bold_prefix="Water Demand:")
    add_bullet("Metabolic baseline is 0.84 kg O2 consumed per crewmember-day.", bold_prefix="Oxygen Intake:")
    add_bullet("CO2 must be scrubbed continuously. NASA-STD-3001 Vol 2 caps 1-hour average cabin CO2 partial pressure at ≤3.0 mmHg. Above 2.5–3.0 mmHg, astronauts exhibit statistically elevated headaches, fatigue, and cognitive degradation.", bold_prefix="Carbon Dioxide Scrubbing:")
    add_bullet("A 70 kg astronaut performing nominal spaceflight activity (averaging 1.3 METs) expends ~2,750 kcal/day, scaling upward with lean body mass and physical exercise.", bold_prefix="Energy Expenditure:")

    add_sec_heading("2. Microgravity Physiology & Nutrition")
    add_bullet("Cephalad fluid redistribution suppresses thirst mechanisms, alters cardiovascular stroke volume, and triggers spaceflight anemia.", bold_prefix="Fluid Shifts:")
    add_bullet("Microgravity reduces weight-bearing musculoskeletal loads, lowering resting metabolic expenditure but increasing resistive exercise demands. Red blood cell mass drops, necessitating low dietary iron (≤8 mg/day) to prevent hepatic hemosiderosis.", bold_prefix="Physiological Deconditioning:")
    add_bullet("A career threshold of 250 mSv (or 20 mSv/year operational target) mandates antioxidant-dense nutrition to mitigate free radical damage, although shielding remains the primary countermeasure.", bold_prefix="Radiation Management:")

    add_sec_heading("3. ISS Consumables & Logistics")
    add_bullet("The ISS regenerative ECLSS reached a 98% water recovery milestone in 2023 with the Brine Processor Assembly (BPA).", bold_prefix="Water Recovery:")
    add_bullet("Sabatier reactor catalytic reduction combines byproduct H2 with exhaled CO2 to synthesize potable H2O and methane gas (CH4 vented).", bold_prefix="Oxygen & Carbon Cycling:")
    add_bullet("ISS open-loop deficits are sustained by periodic cargo flights (Dragon, Cygnus, Progress). For deep space, filter membranes, distillation assemblies, and pump spares over 3 years rival the mass of the water saved.", bold_prefix="Sparing & Logistics Reality:")

    add_sec_heading("4. Artemis II Baseline")
    add_bullet("4 crew members on an unresupplied 10-day circumlunar test flight.", bold_prefix="Mission & Crew:")
    add_bullet("Orion capsule provides 20 m³ total pressurized volume but only 9 m³ of net habitable volume.", bold_prefix="Habitable Volume:")
    add_bullet("Orion is strictly an orbital taxi. Its consumable tankage caps out at approximately 21 days; it cannot sustain Mars transit without a dedicated deep-space habitat.", bold_prefix="Interplanetary Scaling:")

    add_sec_heading("5. Mars Mission Architectures")
    add_bullet("NASA DRA 5.0 conjunction profile: 6 crew, ~200 days outbound, up to 500–600 days on the Martian surface, and ~200 days return (total mission ~860–900 days).", bold_prefix="DRA 5.0 Reference Profile:")
    add_bullet("Transit habitats must provide consumables for ~1,100 days (including abort and orbital contingency reserves) without Earth resupply.", bold_prefix="Contingency Duration:")

    add_sec_heading("6. Vehicles: Usable Mass & Volume")
    add_bullet("Total volume ~3,180 m³ with ~1,000 m³ pressurized space. For a 12-person crew, only ~16% is projected to be unencumbered habitable volume once bulkheads, tanks, ECLSS, and cargo lockers are integrated.", bold_prefix="Starship (SpaceX):")
    add_bullet("9 m³ habitable. Transport taxi only; zero multi-year ECLSS capacity.", bold_prefix="Orion (NASA):")
    add_bullet("Requires ≥25 m³ NHV per person to prevent psychological collapse during multi-year transit.", bold_prefix="Transit Habitats:")

    add_sec_heading("7. Closed-Loop Life Support")
    add_bullet("ESA's MELiSSA architecture segregates closed-loop life support into 5 metabolic compartments: liquefying, photoheterotrophic, nitrifying, algae/higher plants, and the human crew.", bold_prefix="MELiSSA Compartments:")
    add_bullet("Bioregenerative systems achieve at most ~60% food processing closure. 100% closure is thermodynamic fantasy; volatile nitrogen and carbon are continually lost through off-gassing and venting.", bold_prefix="Thermodynamic Limits:")

    add_sec_heading("8. Safety Margins")
    add_bullet("NASA designs routinely apply an 11% to 15% mass margin strictly for life-support subsystems.", bold_prefix="Subsystem Margin:")
    add_bullet("Consumables are sized for the 860-day baseline plus a 240-day abort contingency (~1,100 days total). Omitting this contingency risks complete mission loss during orbital miss events.", bold_prefix="Contingency Time Buffer:")

    add_sec_heading("9. Food Systems & Packing")
    add_bullet("Current flight baseline for a 3,000 kcal/day diet is 1.83 kg/CM-d (including packaging mass).", bold_prefix="Mass Allocation:")
    add_bullet("Mars exploration mandates food stability exceeding 36–60 months.", bold_prefix="Shelf-Life Requirements:")
    add_bullet("Vitamins C, B1 (thiamin), and B6 degrade rapidly in retort pouches, requiring either bioregenerative salad crops (Veggie) or targeted pharmaceutical fortification.", bold_prefix="Nutrient Degradation:")

    add_sec_heading("10. Existing Simulations")
    add_bullet("Games like Kerbal Space Program (with TAC-LS) and Stationeers treat life support as linear 'health bars' (consuming 1 unit of water per day). They completely ignore ECLSS spare parts mass, variable metabolic workloads, and trace gas toxicity.", bold_prefix="Educational Game Flaws:")

    # Core Simulation Relationships
    add_sec_heading("Core Mathematical Relationships for Systems Engineering")
    add_bullet("BMR = f(age, sex, mass, height). Active METs = BMR × ActivityMultiplier. Higher METs escalate O2 consumption and CO2 exhalation proportionally.", bold_prefix="1. Metabolic Escalation:")
    add_bullet("Exhaled CO2 dictates Sabatier reactor runtime. Sabatier requires stoichiometric H2 input to reduce CO2 into H2O and CH4.", bold_prefix="2. CO2 to Sabatier Stoichiometry:")
    add_bullet("Habitable Volume = Total Volume − (Consumables Mass / Density) − ECLSS Hardware Volume. If per-person NHV falls below 15 m³, severe psychological stress penalties trigger.", bold_prefix="3. Habitable Volume Squeeze:")
    add_bullet("Water Make-up = Gross Water Demand × (1 − Recycling Efficiency). At 98% recovery, resupply drops by a factor of 50.", bold_prefix="4. Water Loop Closure:")
    add_bullet("Total Payload Mass = Primary Hull + ECLSS Machinery + Spares Kit + Stored Consumables + Food Packaging. Must satisfy ≤ 40,000 kg lander limit.", bold_prefix="5. Payload Mass Constraint:")

    # Open Uncertainties & Design Disagreements
    add_sec_heading("Open Uncertainties & Aerospace Design Controversies")
    add_bullet("Microgravity biomass conversion rates for MELiSSA and Veggie vary widely; electrical lighting power and thermal mass often outweigh the food mass saved.", bold_prefix="Edible Biomass Yield:")
    add_bullet("Published literature disagrees on the Mean Time Between Failures (MTBF) for water processors; ISS telemetry reveals that Mars missions may need over 1,000 kg of spare parts alone.", bold_prefix="ECLSS Sparing Mass:")
    add_bullet("Advertised commercial vehicle volumes (e.g. Starship) omit necessary zero-G translation corridors, structural ribs, and maintenance clearances.", bold_prefix="Usable Habitable Volume:")

    # Recommended Primary Sources
    add_sec_heading("Primary Sourced Literature")
    sources = [
        ("NASA-STD-3001, Volume 2, Rev F (2025):", "NASA Space Flight Human-System Standard: Human Factors, Habitability, and Environmental Health."),
        ("NASA/TP-2015-218570 Rev 2 (2022):", "Life Support Baseline Values and Assumptions Document (BVAD)."),
        ("NASA SP-2009-566 (2009):", "Human Exploration of Mars Design Reference Architecture 5.0 (DRA 5.0)."),
        ("JSC-67378 Rev 1 (2020):", "Nutritional Requirements for Exploration Missions up to 365 Days."),
        ("OCHMO-TB-004 (NASA):", "Spacecraft Carbon Dioxide Limits and Crew Cognitive Performance Technical Brief."),
        ("NASA Status of ISS Water Management (ICES 2023-097):", "Operational performance, brine processing, and 98% recovery milestones."),
        ("NASA Technical Report 20210000437:", "Analysis of Historical International Space Station Logistical Mass Delivery."),
        ("ESA MELiSSA Technical Reports:", "Micro-Ecological Life Support System Alternative Phase 2 & 3 Experimental Baselines."),
        ("NASA HRP Net Habitable Volume Study (2020):", "Defining the Required Net Habitable Volume for Long-Duration Exploration Missions."),
        ("Peer-Reviewed Starship Mars Architecture (PMC9527650):", "Mission Architecture Using the SpaceX Starship Vehicle to Enable a Sustained Human Presence on Mars.")
    ]
    for s_title, s_desc in sources:
        add_bullet(s_desc, bold_prefix=s_title)

    # Concluding signature block
    p_end = doc.add_paragraph()
    p_end.paragraph_format.space_before = Pt(16)
    p_end.paragraph_format.space_after = Pt(4)
    r_end = p_end.add_run("DOCUMENT COMPLETED & VERIFIED • OUTPOST ZERO ENGINEERING REPOSITORY")
    r_end.font.bold = True
    r_end.font.size = Pt(9.5)
    r_end.font.color.rgb = COLOR_RUST

    doc.save(OUTPUT_DOCX)
    print(f"Document successfully created and saved to: {OUTPUT_DOCX}")

if __name__ == "__main__":
    build_document()

