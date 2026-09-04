from typing import Dict, Any

class VisualPlanner:
    """
    Determines domain-specific visual structures (KaTeX formulas, Mermaid charts,
    SVG simulations, code sandboxes, or timelines) based on subject and concept.
    """

    @staticmethod
    def plan_visual(subject: str, concept: str) -> Dict[str, Any]:
        sub = (subject or "").lower()
        con = (concept or "").lower()

        if "math" in sub or "calculus" in sub or "algebra" in sub:
            return {
                "visual_type": "katex",
                "visual_data": {
                    "formula": "\\int_a^b f(x)dx = F(b) - F(a)",
                    "steps": [
                        "Identify the integrand function f(x)",
                        "Compute the antiderivative F(x)",
                        "Evaluate the definite integral limits [a, b]"
                    ]
                },
                "visual_caption": "Fundamental Theorem of Calculus Formulation"
            }

        elif "physics" in sub or "ohm" in con or "circuit" in con or "electric" in con:
            return {
                "visual_type": "katex",
                "visual_data": {
                    "formula": "V = I \\times R \\iff I = \\frac{V}{R}",
                    "variables": [
                        {"symbol": "V", "name": "Voltage", "unit": "Volts (V)"},
                        {"symbol": "I", "name": "Current", "unit": "Amperes (A)"},
                        {"symbol": "R", "name": "Resistance", "unit": "Ohms (Ω)"}
                    ]
                },
                "visual_caption": "Ohm's Law: Inverse Relationship Between Resistance and Current"
            }

        elif "code" in sub or "programming" in sub or "computer" in sub or "python" in con:
            return {
                "visual_type": "code",
                "visual_data": {
                    "language": "python",
                    "code": "# Python demonstration of Ohm's Law\ndef calculate_current(voltage: float, resistance: float) -> float:\n    if resistance <= 0:\n        raise ValueError('Resistance must be positive')\n    return voltage / resistance\n\n# As resistance increases, current drops\nv = 12.0\nfor r in [2.0, 4.0, 6.0, 12.0]:\n    print(f'R={r:4.1f} Ohms -> Current={calculate_current(v, r):4.2f} Amperes')",
                    "output": "R= 2.0 Ohms -> Current=6.00 Amperes\nR= 4.0 Ohms -> Current=3.00 Amperes\nR= 6.0 Ohms -> Current=2.00 Amperes\nR=12.0 Ohms -> Current=1.00 Amperes"
                },
                "visual_caption": "Interactive Code Execution Flow"
            }

        elif "bio" in sub or "cell" in con or "plant" in con:
            return {
                "visual_type": "mermaid",
                "visual_data": {
                    "diagram": "graph TD\n  Light[Sunlight Energy] --> Chloroplast[Chloroplast / Chlorophyll]\n  H2O[Water H2O] --> Chloroplast\n  CO2[Carbon Dioxide CO2] --> CalvinCycle[Calvin Cycle]\n  Chloroplast --> ATP[ATP & NADPH]\n  ATP --> CalvinCycle\n  CalvinCycle --> Glucose[Glucose C6H12O6]\n  Chloroplast --> Oxygen[Oxygen Byproduct O2]"
                },
                "visual_caption": "Photosynthesis Biochemical Energy Flow"
            }

        elif "history" in sub or "timeline" in con:
            return {
                "visual_type": "timeline",
                "visual_data": {
                    "events": [
                        {"year": "1800", "title": "Voltaic Pile", "description": "Alessandro Volta invents the first chemical battery."},
                        {"year": "1827", "title": "Ohm's Law Published", "description": "Georg Simon Ohm mathematically defines V = IR."},
                        {"year": "1879", "title": "Incandescent Lamp", "description": "Edison refines high-resistance carbon filament."}
                    ]
                },
                "visual_caption": "Historical Milestones in Electrical Physics"
            }

        # Default fallback: structured Mermaid flowchart
        return {
            "visual_type": "mermaid",
            "visual_data": {
                "diagram": f"graph LR\n  A[Core Concept: {concept}] --> B[Observable Mechanism]\n  B --> C[Concrete Real-World Application]\n  C --> D[Adaptive Validation]"
            },
            "visual_caption": f"Conceptual Architecture for {concept}"
        }
