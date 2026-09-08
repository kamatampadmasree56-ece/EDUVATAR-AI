from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.lesson import Lesson, LessonSection, Question
from app.routers.auth import ensure_demo_user
from app.schemas.lesson import LessonResponse

router = APIRouter(prefix="/api/demo", tags=["Hackathon Demo Mode"])

COURSES_CATALOG = [
    {
        "id": "pcb-design",
        "slug": "pcb-design",
        "title": "PCB Design & Hardware Engineering",
        "subject": "PCB Design",
        "level": "All Stages (Basic, Advance, High Level)",
        "duration": "25 Mins",
        "sections_count": 3,
        "description": "Master schematic capture, multi-layer stackups, trace impedance routing, DRC verification, and high-speed differential pairs.",
        "icon": "Layers",
        "color": "purple",
        "featured": True,
        "visual_type": "circuit",
        "stages": ["Basic", "Advance", "High Level"]
    },
    {
        "id": "matlab-simulink",
        "slug": "matlab-simulink",
        "title": "MATLAB & Simulink System Modeling",
        "subject": "MATLAB",
        "level": "All Stages (Basic, Advance, High Level)",
        "duration": "30 Mins",
        "sections_count": 3,
        "description": "Master matrix computation, signal processing FFTs, state-space control systems, PID tuning, and Simulink dynamic simulations.",
        "icon": "Cpu",
        "color": "indigo",
        "featured": True,
        "visual_type": "neural_net",
        "stages": ["Basic", "Advance", "High Level"]
    },
    {
        "id": "analog-digital-circuits",
        "slug": "analog-digital-circuits",
        "title": "Analog & Digital Circuits Engineering",
        "subject": "Analog and Digital Circuits",
        "level": "All Stages (Basic, Advance, High Level)",
        "duration": "25 Mins",
        "sections_count": 3,
        "description": "Explore Op-Amps, MOSFET small-signal amplifiers, active filters, logic gates, flip-flops, ADC/DAC, and noise margins.",
        "icon": "Zap",
        "color": "violet",
        "featured": True,
        "visual_type": "circuit",
        "stages": ["Basic", "Advance", "High Level"]
    },
    {
        "id": "dcd-systems",
        "slug": "dcd-systems",
        "title": "DCD — Digital Circuit Design & FPGA",
        "subject": "DCD",
        "level": "All Stages (Basic, Advance, High Level)",
        "duration": "28 Mins",
        "sections_count": 3,
        "description": "Master Boolean algebra, K-Maps, Mealy/Moore State Machines, Verilog/VHDL RTL, Static Timing Analysis (STA), and FPGA routing.",
        "icon": "Cpu",
        "color": "purple",
        "featured": True,
        "visual_type": "neural_net",
        "stages": ["Basic", "Advance", "High Level"]
    },
    {
        "id": "ohms-law",
        "slug": "ohms-law",
        "title": "Circuit Dynamics & Ohm's Law",
        "subject": "Analog and Digital Circuits",
        "level": "Basic",
        "duration": "15 Mins",
        "sections_count": 3,
        "description": "Master the fundamental triad: Voltage (V), Current (I), and Resistance (R) with interactive circuit diagrams and water pipe analogies.",
        "icon": "Zap",
        "color": "violet",
        "featured": False,
        "visual_type": "circuit",
        "stages": ["Basic"]
    }
]

# -------------------------------------------------------------
# 1. PCB DESIGN SEEDER
# -------------------------------------------------------------
def seed_pcb_design(db: Session, user_id: Optional[int] = None, stage: str = "Basic") -> Lesson:
    if user_id is None:
        user_id = ensure_demo_user(db).id
    stage_title = stage.capitalize()

    existing = db.query(Lesson).filter(Lesson.user_id == user_id, Lesson.title.like(f"%PCB Design%{stage_title}%")).first()
    if existing:
        return existing

    lesson = Lesson(
        user_id=user_id,
        title=f"PCB Design: From Schematic to Manufacturing ({stage_title} Level)",
        subject="PCB Design",
        learning_objective="Master professional printed circuit board layout, trace routing, layer stackups, and manufacturing rules.",
        learning_mode="complete_learning",
        target_level=stage_title,
        duration_minutes=25,
        language="English",
        teaching_style="Friendly Mentor",
        total_sections=3,
        current_section_index=0,
        current_mastery=0.0,
        status="in_progress",
        curriculum_summary={
            "total_concepts": 3,
            "completed_concepts_count": 0,
            "estimated_total_minutes": 25,
            "prerequisites_tree": ["Schematic Netlist -> Layer Stackup -> Routing & DRC"],
            "continuation_plan": "Advance to high-speed impedance matching and Gerber exports."
        }
    )
    db.add(lesson)
    db.flush()

    sec1 = LessonSection(
        lesson_id=lesson.id,
        section_index=0,
        title="PCB Anatomy & Schematic Netlists",
        concept="Substrate, Copper Traces, and Netlist Connectivity",
        explanation_text="A Printed Circuit Board (PCB) consists of an FR4 fiberglass core, copper foil layers for electrical traces, solder mask for insulation, and silkscreen for component labels. Think of copper traces like paved highways for electrons and vias like multi-story elevators connecting different floors!",
        example_text="A 1oz copper layer has a thickness of 35 micrometers (1.4 mils). Trace width determines current carrying capacity without overheating.",
        narration_script="Welcome to PCB Design! Today we begin with the physical anatomy of circuit boards. Think of copper traces as highways for electricity and vias as elevators moving signals across layers.",
        visual_type="diagram",
        visual_data={
            "diagram": "graph TD\n  Schematic[Schematic Capture] --> Netlist[Generate Netlist]\n  Netlist --> Footprints[Assign Component Footprints]\n  Footprints --> BoardOutline[Define 4-Layer Board Outline]\n  BoardOutline --> Routing[Route Power & Signal Traces]\n  Routing --> DRC[Run Design Rule Check]\n  style Schematic fill:#ede9fe,stroke:#7c3aed,stroke-width:2px\n  style DRC fill:#ddd6fe,stroke:#6d28d9,stroke-width:2px"
        },
        visual_caption="Standard Professional PCB Design Workflow",
        key_points=[
            "FR-4 is the industry-standard woven fiberglass dielectric.",
            "1 oz copper = 35 μm thickness (carries ~1A per 10-20 mil width).",
            "Solder mask prevents accidental solder bridging during reflow.",
            "Silkscreen shows reference designators (R1, C1, U1)."
        ]
    )
    db.add(sec1)
    db.flush()

    q1 = Question(
        lesson_id=lesson.id,
        section_id=sec1.id,
        question_text="What physical feature acts like an 'elevator' allowing electrical traces to hop between different copper layers on a PCB?",
        question_type="short_answer",
        correct_answer="A Via (Through-hole via, blind via, or buried via).",
        explanation="Vias are copper-plated drill holes connecting multiple copper routing layers.",
        concept_tested="PCB Via Architecture"
    )
    db.add(q1)

    sec2 = LessonSection(
        lesson_id=lesson.id,
        section_index=1,
        title="4-Layer Stackup & Decoupling Capacitors",
        concept="Power Ground Planes and Return Current Loops",
        explanation_text="In a 4-layer PCB (Top Signal -> Ground Plane -> Power Plane -> Bottom Signal), solid reference ground planes minimize EMI and electromagnetic crosstalk. Always place 0.1uF ceramic decoupling capacitors as physically close as possible to the IC power pins to act as local energy reservoirs during rapid switching.",
        example_text="Placing a decoupling capacitor 2mm from the VDD pin reduces parasitic trace inductance significantly compared to placing it 20mm away.",
        narration_script="Now let's examine multi-layer board stackups. Having a continuous ground plane directly beneath your signals keeps electrical return loops tight, eliminating noise.",
        visual_type="concept_card",
        visual_data={
            "stackup": [
                {"layer": "Layer 1 (Top)", "type": "High-Speed Signals & Component Pads"},
                {"layer": "Layer 2 (Inner 1)", "type": "Solid GND Reference Plane"},
                {"layer": "Layer 3 (Inner 2)", "type": "Power Plane (3.3V / 5V / 1.8V)"},
                {"layer": "Layer 4 (Bottom)", "type": "Low-Speed Signals & Thermal Vias"}
            ]
        },
        visual_caption="Standard 4-Layer Low-Noise PCB Stackup",
        key_points=[
            "Layer 2 Ground Plane provides lowest impedance return path.",
            "Decoupling capacitors (0.1 μF ceramic) belong right next to IC power pins.",
            "Avoid routing high-speed traces across plane splits (prevents slot antennas).",
            "Keep loop area between signal and ground return as minimal as possible."
        ]
    )
    db.add(sec2)
    db.flush()

    q2 = Question(
        lesson_id=lesson.id,
        section_id=sec2.id,
        question_text="Where should decoupling capacitors be placed relative to an integrated circuit (IC) on a PCB layout?",
        question_type="short_answer",
        correct_answer="As close as possible to the IC power (VDD) and ground pins to minimize trace inductance.",
        explanation="Placing decoupling capacitors directly next to IC pins minimizes parasitic trace inductance.",
        concept_tested="Decoupling Capacitor Placement"
    )
    db.add(q2)

    sec3 = LessonSection(
        lesson_id=lesson.id,
        section_index=2,
        title="Differential Pairs, DRC & Gerber Generation",
        concept="Controlled Impedance & Manufacturing Verification",
        explanation_text="High-speed protocols like USB, HDMI, and Ethernet require differential pair routing with matched trace lengths and controlled characteristic impedance (e.g. 90Ω or 100Ω differential). Before fabrication, run Design Rule Checks (DRC) for clearance, drill sizes, and export standard RS-274X Gerber & Excellon drill files.",
        example_text="USB 2.0 requires 90Ω differential impedance (±10%) and length matching within 1.25 mm (50 mils) to prevent phase skew.",
        narration_script="In this final high-level section, we master differential pair routing and Gerber export. Running a strict DRC ensures your board manufactures with zero solder bridges.",
        visual_type="interactive_chart",
        visual_data={
            "rules": [
                {"check": "Trace-to-Trace Clearance", "min": "0.15 mm (6 mil)"},
                {"check": "Trace-to-Pad Clearance", "min": "0.2 mm (8 mil)"},
                {"check": "Minimum Via Drill Size", "min": "0.3 mm (12 mil)"},
                {"check": "Annular Ring Width", "min": "0.15 mm (6 mil)"}
            ]
        },
        visual_caption="Standard PCB Design Rule Constraints (DRC)",
        key_points=[
            "Differential pairs must maintain constant spacing and length matching.",
            "Avoid 90-degree trace bends; use 45-degree angles or smooth curves.",
            "DRC (Design Rule Check) verifies manufacturer clearances before ordering.",
            "Gerber files (RS-274X) define physical copper, masks, drills, and pastes."
        ]
    )
    db.add(sec3)
    db.flush()

    q3 = Question(
        lesson_id=lesson.id,
        section_id=sec3.id,
        question_text="What standard file format is exported from PCB CAD tools to send copper layers and silkscreen data to PCB fabricators?",
        question_type="short_answer",
        correct_answer="Gerber files (RS-274X / Gerber X2) and Excellon Drill files.",
        explanation="Gerber format is the universal standard for PCB manufacturing photoplotters.",
        concept_tested="PCB Manufacturing Export"
    )
    db.add(q3)

    db.commit()
    return lesson


# -------------------------------------------------------------
# 2. MATLAB & SIMULINK SEEDER
# -------------------------------------------------------------
def seed_matlab_simulink(db: Session, user_id: Optional[int] = None, stage: str = "Basic") -> Lesson:
    if user_id is None:
        user_id = ensure_demo_user(db).id
    stage_title = stage.capitalize()

    existing = db.query(Lesson).filter(Lesson.user_id == user_id, Lesson.title.like(f"%MATLAB%{stage_title}%")).first()
    if existing:
        return existing

    lesson = Lesson(
        user_id=user_id,
        title=f"MATLAB & Simulink: Signal Processing & Control ({stage_title} Level)",
        subject="MATLAB",
        learning_objective="Master matrix vectorization, FFT spectral analysis, filter design, and Simulink dynamic system modeling.",
        learning_mode="complete_learning",
        target_level=stage_title,
        duration_minutes=30,
        language="English",
        teaching_style="Friendly Mentor",
        total_sections=3,
        current_section_index=0,
        current_mastery=0.0,
        status="in_progress",
        curriculum_summary={
            "total_concepts": 3,
            "completed_concepts_count": 0,
            "estimated_total_minutes": 30,
            "prerequisites_tree": ["Matrix Operations -> Signal FFT -> Simulink Control Loop"],
            "continuation_plan": "Explore state-space representation and PID autotuning."
        }
    )
    db.add(lesson)
    db.flush()

    sec1 = LessonSection(
        lesson_id=lesson.id,
        section_index=0,
        title="Matrix Computation & Vectorization in MATLAB",
        concept="Array Operations vs Element-wise (.*/.^) Operations",
        explanation_text="In MATLAB (Matrix Laboratory), everything is natively a matrix. Avoid slow for-loops by using vectorization! For example, `t = 0:0.001:1; y = sin(2*pi*50*t);` computes 1001 points simultaneously. Always remember: `*` is matrix multiplication, while `.*` performs element-by-element multiplication!",
        example_text="Element-wise squaring: `y = x .^ 2` squares each individual number, whereas `x ^ 2` performs algebraic matrix multiplication.",
        narration_script="Welcome to MATLAB! In MATLAB, vectorization is your superpower. Instead of writing slow loops, we compute entire arrays in a single vectorized command.",
        visual_type="formula_card",
        visual_data={
            "formula": "Y(f) = \\int_{-\\infty}^{\\infty} y(t) e^{-j 2\\pi f t} dt \\quad \\longrightarrow \\quad \\text{Y = fft(y, N)}",
            "variables": [
                {"symbol": "fft(y)", "name": "Fast Fourier Transform", "unit": "Frequency Domain"},
                {"symbol": ".* / .^", "name": "Element-wise Operators", "unit": "Dimension-preserving"}
            ]
        },
        visual_caption="MATLAB Vectorization and FFT Analysis",
        key_points=[
            "Vectors are indexed starting at 1 (not 0 like C/Python).",
            "Use `.*`, `./`, and `.^` for element-wise array math.",
            "Use colon operator `start:step:stop` to generate clean time vectors.",
            "`whos` displays size, memory, and datatype of all workspace variables."
        ]
    )
    db.add(sec1)
    db.flush()

    q1 = Question(
        lesson_id=lesson.id,
        section_id=sec1.id,
        question_text="Which operator is used in MATLAB to perform element-wise multiplication between two equal-sized vectors?",
        question_type="short_answer",
        correct_answer="The dot-star operator ( .* ).",
        explanation="The .* operator instructs MATLAB to multiply arrays element-by-element.",
        concept_tested="MATLAB Vectorization Operators"
    )
    db.add(q1)

    sec2 = LessonSection(
        lesson_id=lesson.id,
        section_index=1,
        title="Signal Processing & FFT Spectral Analysis",
        concept="Fast Fourier Transform and Butterworth Filtering",
        explanation_text="The Fast Fourier Transform (`fft`) converts time-domain signals into frequency spectra to discover dominant frequencies, noise, and harmonics. Using `[b, a] = butter(4, 0.2, 'low')` followed by `y_filtered = filter(b, a, y_noisy)`, we can cleanly strip high-frequency noise from our data!",
        example_text="Sampling a 50Hz power signal with 1kHz sampling rate (`Fs = 1000`), `f = (0:N-1)*(Fs/N)` produces the precise frequency spectrum.",
        narration_script="Next, let's explore digital signal processing. The Fast Fourier Transform lets us peer inside noisy audio or sensor streams and isolate the exact frequencies present.",
        visual_type="diagram",
        visual_data={
            "diagram": "graph LR\n  NoisySignal[Time-Domain Signal y(t)] --> FFT[fft(y)]\n  FFT --> Magnitude[Magnitude Spectrum |Y(f)|]\n  Magnitude --> FilterDesign[Design Butterworth Filter]\n  FilterDesign --> Filtered[Clean Output y_clean]\n  style FFT fill:#ede9fe,stroke:#7c3aed,stroke-width:2px\n  style Filtered fill:#ddd6fe,stroke:#6d28d9,stroke-width:2px"
        },
        visual_caption="Signal Processing and Digital Filter Flow",
        key_points=[
            "`Fs` is Sampling Frequency (must be > 2 * Fmax by Nyquist Theorem).",
            "`fftshift` centers zero-frequency component in the middle of spectrum.",
            "`butter(N, Wn)` designs digital Butterworth IIR filters.",
            "`spectrogram` reveals frequency changes over time for audio/vibrations."
        ]
    )
    db.add(sec2)
    db.flush()

    q2 = Question(
        lesson_id=lesson.id,
        section_id=sec2.id,
        question_text="According to the Nyquist-Shannon sampling theorem, what is the minimum sampling rate required to accurately capture a 100 Hz signal?",
        question_type="short_answer",
        correct_answer="At least 200 Hz (Sampling frequency Fs >= 2 * Fmax).",
        explanation="Nyquist criterion states sampling frequency must be at least twice the maximum signal frequency.",
        concept_tested="Nyquist Sampling Rate"
    )
    db.add(q2)

    sec3 = LessonSection(
        lesson_id=lesson.id,
        section_index=2,
        title="Simulink Dynamic Modeling & PID Control",
        concept="Block-Diagram Simulation and Feedback Loops",
        explanation_text="Simulink provides a visual block-diagram environment for modeling dynamic physical systems. In a classic closed-loop feedback system, a PID Controller block calculates an error value between a desired Setpoint and Process Variable, adjusting proportional, integral, and derivative gains for zero steady-state error!",
        example_text="Tuning gains: Proportional (Kp) accelerates response, Integral (Ki) removes steady-state offset, Derivative (Kd) dampens overshoot.",
        narration_script="In this final high-level section, we move into Simulink. We simulate physical dynamics and tune a PID feedback controller for precision motor control.",
        visual_type="concept_card",
        visual_data={
            "pid_blocks": [
                {"gain": "Kp (Proportional)", "role": "Reacts to current error for swift reaction."},
                {"gain": "Ki (Integral)", "role": "Accumulates past errors to eliminate steady-state error."},
                {"gain": "Kd (Derivative)", "role": "Predicts future trends to prevent oscillation & overshoot."}
            ]
        },
        visual_caption="Simulink Closed-Loop PID Architecture",
        key_points=[
            "Simulink integrates ODE solvers like `ode45` (Dormand-Prince) and `ode15s` (stiff).",
            "Scope blocks display real-time signal graphs during simulation.",
            "Transfer Function block `tf(num, den)` represents linear systems in s-domain.",
            "`pidTuner` automatically finds optimal Kp, Ki, Kd gains for stability."
        ]
    )
    db.add(sec3)
    db.flush()

    q3 = Question(
        lesson_id=lesson.id,
        section_id=sec3.id,
        question_text="Which PID controller term is specifically responsible for eliminating steady-state error over time?",
        question_type="short_answer",
        correct_answer="The Integral term (Ki / Integral gain).",
        explanation="The integral term integrates past cumulative error to bring steady-state error to zero.",
        concept_tested="PID Integral Control"
    )
    db.add(q3)

    db.commit()
    return lesson


# -------------------------------------------------------------
# 3. ANALOG & DIGITAL CIRCUITS SEEDER
# -------------------------------------------------------------
def seed_analog_digital_circuits(db: Session, user_id: Optional[int] = None, stage: str = "Basic") -> Lesson:
    if user_id is None:
        user_id = ensure_demo_user(db).id
    stage_title = stage.capitalize()

    existing = db.query(Lesson).filter(Lesson.user_id == user_id, Lesson.title.like(f"%Analog & Digital Circuits%{stage_title}%")).first()
    if existing:
        return existing

    lesson = Lesson(
        user_id=user_id,
        title=f"Analog & Digital Circuits: Op-Amps, Transistors & Logic ({stage_title} Level)",
        subject="Analog and Digital Circuits",
        learning_objective="Understand semiconductor biasing, Operational Amplifiers (Op-Amps), active filters, and digital sequential logic.",
        learning_mode="complete_learning",
        target_level=stage_title,
        duration_minutes=25,
        language="English",
        teaching_style="Friendly Mentor",
        total_sections=3,
        current_section_index=0,
        current_mastery=0.0,
        status="in_progress",
        curriculum_summary={
            "total_concepts": 3,
            "completed_concepts_count": 0,
            "estimated_total_minutes": 25,
            "prerequisites_tree": ["Semiconductor Diodes -> Op-Amp Amplification -> Sequential Logic & ADC/DAC"],
            "continuation_plan": "Master mixed-signal circuit design and feedback stability."
        }
    )
    db.add(lesson)
    db.flush()

    sec1 = LessonSection(
        lesson_id=lesson.id,
        section_index=0,
        title="Operational Amplifiers & Golden Rules",
        concept="Negative Feedback, Virtual Ground & Gain Equations",
        explanation_text="An ideal Operational Amplifier (Op-Amp) has infinite input impedance, zero output impedance, and infinite open-loop gain. Under negative feedback, two Golden Rules apply: (1) No current flows into the input terminals (I+ = I- = 0), and (2) The op-amp forces the inverting input voltage to equal the non-inverting input (V+ = V- = Virtual Short)!",
        example_text="Inverting Amplifier: Vout = -(Rf / Rin) * Vin. If Rf = 100kΩ and Rin = 10kΩ, the voltage gain Av = -10.",
        narration_script="Welcome to Analog and Digital Circuits! We start with the crown jewel of analog design: the Op-Amp. With negative feedback, it enforces virtual short conditions across its inputs.",
        visual_type="formula_card",
        visual_data={
            "formula": "V_{out} = -\\left(\\frac{R_f}{R_{in}}\\right) V_{in} \\quad \\text{(Inverting)} \\qquad V_{out} = \\left(1 + \\frac{R_f}{R_1}\\right) V_{in} \\quad \\text{(Non-Inverting)}",
            "variables": [
                {"symbol": "R_f", "name": "Feedback Resistor", "unit": "Ohms (Ω)"},
                {"symbol": "R_in", "name": "Input Resistor", "unit": "Ohms (Ω)"}
            ]
        },
        visual_caption="Op-Amp Inverting and Non-Inverting Voltage Gain",
        key_points=[
            "Rule 1: Input currents are zero: I+ = I- = 0 (infinite input impedance).",
            "Rule 2: Under negative feedback, V+ = V- (virtual ground/short).",
            "Inverting Gain: Av = -Rf / Rin.",
            "Non-Inverting Gain: Av = 1 + (Rf / R1) (always >= 1)."
        ]
    )
    db.add(sec1)
    db.flush()

    q1 = Question(
        lesson_id=lesson.id,
        section_id=sec1.id,
        question_text="In an inverting op-amp amplifier with Rf = 50 kΩ and Rin = 10 kΩ, what is the voltage gain (Av)?",
        question_type="short_answer",
        correct_answer="-5 (or gain magnitude of 5 with inverted phase).",
        explanation="Inverting amplifier voltage gain Av = -(Rf / Rin) = -(50/10) = -5.",
        concept_tested="Inverting Op-Amp Gain Calculation"
    )
    db.add(q1)

    sec2 = LessonSection(
        lesson_id=lesson.id,
        section_index=1,
        title="MOSFET & BJT Small-Signal Amplification",
        concept="Transconductance (gm) and Active Biasing",
        explanation_text="Field Effect Transistors (MOSFETs) are voltage-controlled devices where gate voltage (Vgs) modulates the drain-to-source current (Ids). When biased in the Saturation region (Vds >= Vgs - Vth), the MOSFET operates as a linear transconductance amplifier with small-signal gain Av ≈ -gm * (Rd || ro).",
        example_text="Common-Source Amplifier: A 10mV AC input signal at the gate generates a 200mV inverted AC output signal at the drain.",
        narration_script="Now let's look at semiconductor switching and amplification. MOSFETs allow tiny gate voltages to control large load currents with high efficiency.",
        visual_type="diagram",
        visual_data={
            "diagram": "graph TD\n  Gate[Gate Input Vin] --> Channel[Inversion Channel]\n  Channel --> DrainCurrent[Drain Current Ids = 1/2 mu Cox W/L (Vgs-Vth)^2]\n  DrainCurrent --> Output[Output Vout = VDD - Ids*Rd]\n  style Channel fill:#ede9fe,stroke:#7c3aed,stroke-width:2px\n  style Output fill:#ddd6fe,stroke:#6d28d9,stroke-width:2px"
        },
        visual_caption="N-Channel MOSFET Small-Signal Amplification Model",
        key_points=[
            "MOSFETs draw virtually zero DC gate current (insulated SiO2 gate).",
            "Saturation condition: Vds >= Vgs - Vth and Vgs > Vth.",
            "Transconductance gm = dIds / dVgs measures voltage-to-current sensitivity.",
            "Pull-up resistors convert drain current variations into voltage swings."
        ]
    )
    db.add(sec2)
    db.flush()

    q2 = Question(
        lesson_id=lesson.id,
        section_id=sec2.id,
        question_text="Which transistor terminal controls the current flowing between Drain and Source in an enhancement-mode MOSFET?",
        question_type="short_answer",
        correct_answer="The Gate terminal (Vgs voltage).",
        explanation="The insulated Gate terminal applies an electrostatic field that forms the conducting channel.",
        concept_tested="MOSFET Gate Control"
    )
    db.add(q2)

    sec3 = LessonSection(
        lesson_id=lesson.id,
        section_index=2,
        title="Sequential Logic: Flip-Flops, Counters & ADC/DAC",
        concept="Clocked Memory Elements and Mixed-Signal Conversion",
        explanation_text="While combinational logic depends only on current inputs, sequential logic utilizes memory. D Flip-Flops capture data on clock edges (posedge clk). Cascading D Flip-Flops creates synchronous binary counters and shift registers. Analog-to-Digital Converters (ADCs) sample continuous voltages and quantize them into discrete binary words.",
        example_text="An 8-bit ADC with 3.3V reference voltage has a resolution of 3.3V / 256 = 12.89 mV per LSB.",
        narration_script="In this final section, we bridge analog and digital domains. D Flip-Flops store digital state on clock transitions, while ADCs convert real-world voltages into binary data.",
        visual_type="concept_card",
        visual_data={
            "converters": [
                {"name": "D Flip-Flop", "role": "Latches input D on rising edge of clock: Q(t+1) = D."},
                {"name": "SAR ADC", "role": "Successive Approximation Register for high-speed precision."},
                {"name": "R-2R Ladder DAC", "role": "Converts binary code into proportional analog voltage using only two resistor values."}
            ]
        },
        visual_caption="Sequential Logic and Data Conversion Triad",
        key_points=[
            "D Flip-Flop: Q = D on rising clock edge; ignores D between clock edges.",
            "Setup Time (Tsu): Minimum time data must be stable BEFORE clock edge.",
            "Hold Time (Th): Minimum time data must remain stable AFTER clock edge.",
            "ADC Quantization error is limited to ± 0.5 LSB."
        ]
    )
    db.add(sec3)
    db.flush()

    q3 = Question(
        lesson_id=lesson.id,
        section_id=sec3.id,
        question_text="What is the minimum time a data signal must remain stable before the clock edge arrives at a flip-flop?",
        question_type="short_answer",
        correct_answer="Setup Time (Tsu / Tsetup).",
        explanation="Setup time is the mandatory time window before the active clock edge during which data must not change.",
        concept_tested="Digital Timing Constraints (Setup Time)"
    )
    db.add(q3)

    db.commit()
    return lesson


# -------------------------------------------------------------
# 4. DCD (DIGITAL CIRCUIT DESIGN) SEEDER
# -------------------------------------------------------------
def seed_dcd_systems(db: Session, user_id: Optional[int] = None, stage: str = "Basic") -> Lesson:
    if user_id is None:
        user_id = ensure_demo_user(db).id
    stage_title = stage.capitalize()

    existing = db.query(Lesson).filter(Lesson.user_id == user_id, Lesson.title.like(f"%DCD%{stage_title}%")).first()
    if existing:
        return existing

    lesson = Lesson(
        user_id=user_id,
        title=f"DCD: Digital Circuit Design & FPGA Architecture ({stage_title} Level)",
        subject="DCD",
        learning_objective="Master Boolean algebra simplification, Karnaugh Maps, Finite State Machines (FSMs), Verilog/VHDL RTL, and FPGA design.",
        learning_mode="complete_learning",
        target_level=stage_title,
        duration_minutes=28,
        language="English",
        teaching_style="Friendly Mentor",
        total_sections=3,
        current_section_index=0,
        current_mastery=0.0,
        status="in_progress",
        curriculum_summary={
            "total_concepts": 3,
            "completed_concepts_count": 0,
            "estimated_total_minutes": 28,
            "prerequisites_tree": ["K-Maps & Logic Minimization -> Finite State Machines (FSM) -> Verilog/VHDL on FPGA"],
            "continuation_plan": "Master Static Timing Analysis (STA) and Clock Domain Crossing (CDC)."
        }
    )
    db.add(lesson)
    db.flush()

    sec1 = LessonSection(
        lesson_id=lesson.id,
        section_index=0,
        title="Boolean Algebra & Karnaugh Map (K-Map) Optimization",
        concept="Sum-of-Products (SOP) Minimization & Don't Cares",
        explanation_text="Karnaugh Maps (K-Maps) provide a visual method to simplify Boolean algebra expressions without tedious algebraic manipulation. Grouping adjacent 1s in powers of 2 (1, 2, 4, 8, 16) in Gray code format eliminates redundant variables, directly minimizing logic gate count, propagation delay, and silicon area!",
        example_text="For f(A,B,C) = Σm(0, 2, 4, 6), grouping the four corners reduces the entire logic circuit to simply: f = C'.",
        narration_script="Welcome to Digital Circuit Design! We start with K-Maps. By grouping adjacent 1s in powers of two, we eliminate redundant logic gates and optimize silicon performance.",
        visual_type="diagram",
        visual_data={
            "diagram": "graph TD\n  TruthTable[Truth Table 2^N States] --> KMap[Populate K-Map Grid in Gray Code]\n  KMap --> Grouping[Circle Largest Groups of 1s in 2^k Sizes]\n  Grouping --> MinimalSOP[Extract Minimal Sum-of-Products]\n  MinimalSOP --> Gates[Synthesize NAND-NAND Logic]\n  style KMap fill:#ede9fe,stroke:#7c3aed,stroke-width:2px\n  style MinimalSOP fill:#ddd6fe,stroke:#6d28d9,stroke-width:2px"
        },
        visual_caption="Karnaugh Map Boolean Logic Simplification Flow",
        key_points=[
            "K-Map cells use Gray Code (00, 01, 11, 10) so only 1 bit changes between adjacent cells.",
            "Always circle the largest possible power-of-2 groups (16 > 8 > 4 > 2 > 1).",
            "K-Maps wrap around edges (torus geometry: top connects to bottom, left to right).",
            "Don't Care conditions ('X') can be treated as 1 or 0 to enlarge group sizes."
        ]
    )
    db.add(sec1)
    db.flush()

    q1 = Question(
        lesson_id=lesson.id,
        section_id=sec1.id,
        question_text="Why do Karnaugh Map axes follow Gray code ordering (00, 01, 11, 10) instead of standard binary sequence?",
        question_type="short_answer",
        correct_answer="To ensure only a single bit changes between adjacent cells, enabling visual variable elimination.",
        explanation="Gray code guarantees a Hamming distance of 1 between adjacent cells.",
        concept_tested="Gray Code in K-Maps"
    )
    db.add(q1)

    sec2 = LessonSection(
        lesson_id=lesson.id,
        section_index=1,
        title="Finite State Machines (FSM): Mealy vs. Moore",
        concept="State Transitions, Next-State Logic & Output Encoding",
        explanation_text="Finite State Machines (FSMs) are the brain of digital controllers. In a **Moore Machine**, outputs depend ONLY on the current state. In a **Mealy Machine**, outputs depend on BOTH the current state and current inputs. Mealy machines often require fewer states, while Moore machines provide glitch-free outputs aligned with clock boundaries.",
        example_text="Traffic Light Controller: Green (10s) -> Yellow (3s) -> Red (15s) is a classic Moore FSM where outputs (lamps) depend purely on the active state.",
        narration_script="Now let's build digital brains: Finite State Machines. We contrast Moore machines, where outputs depend only on the state, with Mealy machines, which react immediately to input changes.",
        visual_type="concept_card",
        visual_data={
            "fsm_types": [
                {"type": "Moore Machine", "output": "Output = f(Current State)", "benefit": "Glitch-free, synchronous output."},
                {"type": "Mealy Machine", "output": "Output = f(Current State, Inputs)", "benefit": "Faster response, fewer required states."},
                {"type": "State Encoding", "output": "Binary, Gray, or One-Hot Encoding", "benefit": "One-Hot is ideal for high-speed FPGA routing."}
            ]
        },
        visual_caption="Mealy vs. Moore Finite State Machine Architectures",
        key_points=[
            "Moore: Output depends only on Present State: Y = f(S).",
            "Mealy: Output depends on Present State AND Inputs: Y = f(S, X).",
            "One-Hot encoding uses 1 flip-flop per state (fastest decoding on FPGAs).",
            "Always include an asynchronous Reset state to recover from invalid states."
        ]
    )
    db.add(sec2)
    db.flush()

    q2 = Question(
        lesson_id=lesson.id,
        section_id=sec2.id,
        question_text="In which type of Finite State Machine (Mealy or Moore) does the output depend strictly on the current state alone?",
        question_type="short_answer",
        correct_answer="Moore Machine (Moore FSM).",
        explanation="In a Moore machine, output decoding is solely a function of the active state flip-flops.",
        concept_tested="Moore vs. Mealy FSM Classification"
    )
    db.add(q2)

    sec3 = LessonSection(
        lesson_id=lesson.id,
        section_index=2,
        title="Verilog RTL Synthesis & FPGA Architecture",
        concept="Look-Up Tables (LUTs), Static Timing Analysis & Metastability",
        explanation_text="Modern digital circuits are described using Hardware Description Languages (HDL) like Verilog or VHDL. In an FPGA, combinational logic synthesizes into configurable Look-Up Tables (LUTs), Block RAM (BRAM), and DSP blocks. Static Timing Analysis (STA) verifies that propagation delay (Tclk >= Tcq + Tcomb + Tsu) prevents setup timing violations!",
        example_text="Verilog non-blocking assignment (`q <= d;`) inside `always @(posedge clk)` synthesizes into clocked D Flip-Flops.",
        narration_script="In this final high-level section, we synthesize Verilog RTL onto FPGAs. We inspect Look-Up Tables and verify Static Timing Constraints for rock-solid timing closure.",
        visual_type="interactive_chart",
        visual_data={
            "fpga_elements": [
                {"element": "LUT (Look-Up Table)", "desc": "Implements any arbitrary N-input boolean function via SRAM truth tables."},
                {"element": "CLB / Slice", "desc": "Contains LUTs, multiplexers, and D-type flip-flops."},
                {"element": "STA Timing Constraint", "desc": "Clock period T >= T_clk_to_q + T_logic_comb + T_setup."}
            ]
        },
        visual_caption="FPGA Configurable Logic Block (CLB) Architecture",
        key_points=[
            "Use non-blocking `<= ` for sequential logic inside `posedge clk` blocks.",
            "Use blocking `=` for pure combinational `always @(*)` blocks.",
            "LUT6 can implement any arbitrary 6-input boolean function in 1 SRAM read.",
            "Static Timing Analysis (STA) calculates Slack: Slack = Required Time - Arrival Time (must be >= 0)."
        ]
    )
    db.add(sec3)
    db.flush()

    q3 = Question(
        lesson_id=lesson.id,
        section_id=sec3.id,
        question_text="What hardware structure inside an FPGA is used to implement arbitrary combinational logic functions via truth tables?",
        question_type="short_answer",
        correct_answer="Look-Up Table (LUT / LUT4 / LUT6).",
        explanation="LUTs store truth table outputs in SRAM cells addressed by input logic lines.",
        concept_tested="FPGA Look-Up Table (LUT)"
    )
    db.add(q3)

    db.commit()
    return lesson


# -------------------------------------------------------------
# 5. OHM'S LAW SEEDER (Backward Compatibility for Existing Tests)
# -------------------------------------------------------------
def seed_ohms_law(db: Session, user_id: Optional[int] = None) -> Lesson:
    if user_id is None:
        user_id = ensure_demo_user(db).id
    existing = db.query(Lesson).filter(Lesson.user_id == user_id, Lesson.title.like("%Ohm%")).first()
    if existing:
        db.delete(existing)
        db.commit()

    lesson = Lesson(
        user_id=user_id,
        title="Class 10 Physics: Ohm's Law & Circuit Fundamentals",
        subject="Physics",
        learning_objective="Understand the mathematical and physical relationship between Voltage, Current, and Resistance (V = IR).",
        learning_mode="complete_learning",
        target_level="Beginner",
        duration_minutes=15,
        language="English",
        teaching_style="Friendly Mentor",
        total_sections=3,
        current_section_index=0,
        current_mastery=50.0,
        status="in_progress",
        curriculum_summary={
            "total_concepts": 3,
            "completed_concepts_count": 0,
            "estimated_total_minutes": 15,
            "prerequisites_tree": ["Voltage -> Ohm's Law", "Ohm's Law -> Circuit Lab"],
            "continuation_plan": "Systematic mastery of circuit dynamics."
        }
    )
    db.add(lesson)
    db.flush()

    sec1 = LessonSection(
        lesson_id=lesson.id,
        section_index=0,
        title="Understanding Electric Potential (Voltage)",
        concept="Voltage as Electrical Pressure",
        explanation_text="Electric Potential Difference (Voltage, V) is the push that drives electrons through a conductor. Think of a water pump in a closed pipe system: higher pressure forces more water through the pipe!",
        example_text="A standard AA battery provides 1.5 Volts of electrical push, while a wall outlet provides 120V to 230V.",
        narration_script="Welcome! Today we are exploring the foundational rule of electricity: Ohm's Law. Let's first picture Voltage as electrical pressure.",
        visual_type="concept_card",
        visual_data={"analogy": "Water pump pushing fluid through a constricted hose."},
        visual_caption="Water Pipe Analogy for Voltage and Flow",
        key_points=[
            "Voltage is measured in Volts (V).",
            "Current is the rate of flow of electrons, measured in Amperes (A).",
            "Resistance opposes current flow, measured in Ohms (Ω)."
        ]
    )
    db.add(sec1)
    db.flush()

    q1 = Question(
        lesson_id=lesson.id,
        section_id=sec1.id,
        question_text="What physical quantity acts as the electrical 'pressure' that pushes charges through a circuit?",
        question_type="short_answer",
        correct_answer="Voltage (Electric Potential Difference).",
        explanation="Voltage is the electrical potential difference that drives electric charges through conductors.",
        concept_tested="Voltage Definition"
    )
    db.add(q1)

    sec2 = LessonSection(
        lesson_id=lesson.id,
        section_index=1,
        title="Ohm's Law: The Interplay of V, I, and R",
        concept="Ohm's Law Mathematical Formula: V = I * R",
        explanation_text="Georg Ohm discovered that electric Current (I) is directly proportional to Voltage (V) and inversely proportional to Resistance (R). When resistance increases at constant voltage, current must decrease!",
        example_text="If V = 12V and R = 4 Ohms, I = 12 / 4 = 3 Amperes.",
        narration_script="Now for the signature relationship: Ohm's Law. Current equals Voltage divided by Resistance. When resistance increases, current decreases.",
        visual_type="formula_card",
        visual_data={
            "formula": "V = I \\times R \\implies I = \\frac{V}{R} \\implies R = \\frac{V}{I}",
            "variables": [
                {"symbol": "V", "name": "Voltage", "unit": "Volts (V)"},
                {"symbol": "I", "name": "Current", "unit": "Amperes (A)"},
                {"symbol": "R", "name": "Resistance", "unit": "Ohms (\\Omega)"}
            ]
        },
        visual_caption="Ohm's Law Formula & Variable Units",
        key_points=[
            "V = I × R",
            "Current is inversely proportional to Resistance",
            "Resistance is measured in Ohms (Ω)"
        ]
    )
    db.add(sec2)
    db.flush()

    q2 = Question(
        lesson_id=lesson.id,
        section_id=sec2.id,
        question_text="If you double the resistance in a circuit while keeping the voltage constant, what happens to the electric current?",
        question_type="short_answer",
        correct_answer="The current is halved (decreases by half).",
        explanation="Because I = V / R, doubling R halves I.",
        concept_tested="Ohm's Law Inverse Relationship"
    )
    db.add(q2)

    sec3 = LessonSection(
        lesson_id=lesson.id,
        section_index=2,
        title="Practical Circuit Calculations & Diagnostics",
        concept="Applying V = IR to Real Circuits",
        explanation_text="Let's apply Ohm's Law to calculate current in an actual appliance circuit.",
        example_text="A 120V circuit powering a 30 Ohm toaster draws I = 120 / 30 = 4 Amperes.",
        narration_script="Now let's apply our knowledge to calculate current in a real load resistor.",
        visual_type="circuit",
        visual_data={
            "diagram": "graph LR\n  Battery[12V Source] --> Switch[Closed Switch]\n  Switch --> Resistor[Load R = 3 Ohms]\n  Resistor --> Battery\n  style Resistor fill:#ede9fe,stroke:#7c3aed,stroke-width:2px"
        },
        visual_caption="Simple DC Circuit with 3 Ohm Load",
        key_points=[
            "Always align units: Volts, Amperes, Ohms",
            "Power dissipated P = V × I = I²R"
        ]
    )
    db.add(sec3)
    db.flush()

    q3 = Question(
        lesson_id=lesson.id,
        section_id=sec3.id,
        question_text="A circuit has a 24V supply and a 6 Ohm resistor. Calculate the current in Amperes.",
        question_type="short_answer",
        correct_answer="4 Amperes (I = 24 / 6 = 4A).",
        explanation="Using Ohm's Law: I = V / R = 24V / 6Ω = 4A.",
        concept_tested="Ohm's Law Calculation"
    )
    db.add(q3)

    db.commit()
    return lesson


# Compatibility alias for test suites
seed_ohms_law_demo = seed_ohms_law


# -------------------------------------------------------------
# API ROUTER ENDPOINTS
# -------------------------------------------------------------
@router.get("/courses")
def get_demo_courses():
    return COURSES_CATALOG


@router.post("/reset-ohms-law", response_model=LessonResponse)
def reset_ohms_law_demo(db: Session = Depends(get_db)):
    demo_user = ensure_demo_user(db)
    lesson = seed_ohms_law(db, demo_user.id)
    return LessonResponse.model_validate(lesson)


@router.post("/select-course/{slug}", response_model=LessonResponse)
def select_course(slug: str, db: Session = Depends(get_db)):
    demo_user = ensure_demo_user(db)
    if "pcb" in slug.lower():
        lesson = seed_pcb_design(db, demo_user.id, "Basic")
    elif "matlab" in slug.lower():
        lesson = seed_matlab_simulink(db, demo_user.id, "Basic")
    elif "analog" in slug.lower() or "circuit" in slug.lower():
        lesson = seed_analog_digital_circuits(db, demo_user.id, "Basic")
    elif "dcd" in slug.lower():
        lesson = seed_dcd_systems(db, demo_user.id, "Basic")
    else:
        lesson = seed_ohms_law(db, demo_user.id)
    return LessonResponse.model_validate(lesson)


@router.post("/seed-ece-curriculum")
def seed_all_ece_curriculum(db: Session = Depends(get_db)):
    demo_user = ensure_demo_user(db)
    
    created_lessons = [
        seed_pcb_design(db, demo_user.id, "Basic"),
        seed_pcb_design(db, demo_user.id, "Advance"),
        seed_pcb_design(db, demo_user.id, "High Level"),
        seed_matlab_simulink(db, demo_user.id, "Basic"),
        seed_matlab_simulink(db, demo_user.id, "Advance"),
        seed_matlab_simulink(db, demo_user.id, "High Level"),
        seed_analog_digital_circuits(db, demo_user.id, "Basic"),
        seed_analog_digital_circuits(db, demo_user.id, "Advance"),
        seed_analog_digital_circuits(db, demo_user.id, "High Level"),
        seed_dcd_systems(db, demo_user.id, "Basic"),
        seed_dcd_systems(db, demo_user.id, "Advance"),
        seed_dcd_systems(db, demo_user.id, "High Level"),
        seed_ohms_law(db, demo_user.id),
    ]

    return {
        "status": "success",
        "message": f"Successfully seeded {len(created_lessons)} ECE lessons across Basic, Advance, and High Level stages!",
        "subjects": ["PCB Design", "MATLAB", "Analog and Digital Circuits", "DCD"]
    }
