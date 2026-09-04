from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.progress import LearningPath
from app.schemas.analytics import LearningPathResponse, LearningPathNode
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/learning-path", tags=["Learning Path"])

SUBJECT_ROADMAPS: Dict[str, Dict[str, Any]] = {
    "Physics": {
        "title": "Mastery Tree: Electrical Physics & Circuits",
        "subject": "Physics",
        "overall_progress": 65.0,
        "current_node_id": "node-3",
        "nodes": [
            {
                "id": "node-1",
                "title": "Electric Charges & Electrostatics",
                "description": "Coulomb's law, electrostatic attraction, and electric fields",
                "status": "completed",
                "mastery": 95.0,
                "prerequisites": []
            },
            {
                "id": "node-2",
                "title": "Electric Potential & Voltage",
                "description": "Potential difference driving charges through conductors",
                "status": "completed",
                "mastery": 90.0,
                "prerequisites": ["node-1"]
            },
            {
                "id": "node-3",
                "title": "Ohm's Law & Circuit Dynamics",
                "description": "The fundamental triad: Voltage, Current, and Resistance (I = V / R)",
                "status": "active",
                "mastery": 75.0,
                "prerequisites": ["node-2"]
            },
            {
                "id": "node-4",
                "title": "Series & Parallel Resistors",
                "description": "Equivalent resistance and current/voltage division in branch networks",
                "status": "locked",
                "mastery": 0.0,
                "prerequisites": ["node-3"]
            },
            {
                "id": "node-5",
                "title": "Kirchhoff's Current & Voltage Laws",
                "description": "Conservation of charge and energy in complex multi-loop circuit topologies",
                "status": "locked",
                "mastery": 0.0,
                "prerequisites": ["node-4"]
            }
        ]
    },
    "Computer Science": {
        "title": "Mastery Tree: Deep Learning & Neural Networks",
        "subject": "Computer Science",
        "overall_progress": 50.0,
        "current_node_id": "node-3",
        "nodes": [
            {
                "id": "node-1",
                "title": "Linear Algebra & Vectors for AI",
                "description": "Matrices, dot products, and vector spaces for feature representation",
                "status": "completed",
                "mastery": 92.0,
                "prerequisites": []
            },
            {
                "id": "node-2",
                "title": "The Single Artificial Perceptron",
                "description": "Inputs, synaptic weights, bias summation, and linear classification",
                "status": "completed",
                "mastery": 88.0,
                "prerequisites": ["node-1"]
            },
            {
                "id": "node-3",
                "title": "Neural Networks & Backpropagation",
                "description": "Multi-layer perceptrons, ReLU activations, and gradient descent optimization",
                "status": "active",
                "mastery": 60.0,
                "prerequisites": ["node-2"]
            },
            {
                "id": "node-4",
                "title": "Convolutional Networks (CNNs)",
                "description": "Kernel filters, pooling layers, and spatial computer vision features",
                "status": "locked",
                "mastery": 0.0,
                "prerequisites": ["node-3"]
            },
            {
                "id": "node-5",
                "title": "Transformers & Attention Mechanism",
                "description": "Self-attention, query-key-value projections, and modern LLM architecture",
                "status": "locked",
                "mastery": 0.0,
                "prerequisites": ["node-4"]
            }
        ]
    },
    "Mathematics": {
        "title": "Mastery Tree: Differential Calculus & Optimization",
        "subject": "Mathematics",
        "overall_progress": 45.0,
        "current_node_id": "node-3",
        "nodes": [
            {
                "id": "node-1",
                "title": "Functions & Instantaneous Velocity",
                "description": "Rates of change, average speed vs instant velocity, and graph curves",
                "status": "completed",
                "mastery": 90.0,
                "prerequisites": []
            },
            {
                "id": "node-2",
                "title": "Limits & Continuity",
                "description": "Approaching points, epsilon-delta intuition, and resolving 0/0 paradoxes",
                "status": "completed",
                "mastery": 85.0,
                "prerequisites": ["node-1"]
            },
            {
                "id": "node-3",
                "title": "Derivatives & Tangent Slopes",
                "description": "Limit definition of the derivative and secant-to-tangent convergence",
                "status": "active",
                "mastery": 65.0,
                "prerequisites": ["node-2"]
            },
            {
                "id": "node-4",
                "title": "Product, Quotient & Chain Rules",
                "description": "Differentiation rules for composite functions and nested systems",
                "status": "locked",
                "mastery": 0.0,
                "prerequisites": ["node-3"]
            },
            {
                "id": "node-5",
                "title": "Optimization & Critical Points",
                "description": "Setting f'(x)=0 to find maximums, minimums, and inflection concavity",
                "status": "locked",
                "mastery": 0.0,
                "prerequisites": ["node-4"]
            }
        ]
    },
    "Chemistry": {
        "title": "Mastery Tree: Chemical Bonding & Reaction Kinetics",
        "subject": "Chemistry",
        "overall_progress": 40.0,
        "current_node_id": "node-2",
        "nodes": [
            {
                "id": "node-1",
                "title": "Valence Shells & The Octet Rule",
                "description": "Electron configurations, electronegativity, and noble gas stability",
                "status": "completed",
                "mastery": 88.0,
                "prerequisites": []
            },
            {
                "id": "node-2",
                "title": "Chemical Bonding: Ionic vs Covalent",
                "description": "Electron transfer vs shared electron pairs and molecular geometry",
                "status": "active",
                "mastery": 70.0,
                "prerequisites": ["node-1"]
            },
            {
                "id": "node-3",
                "title": "Collision Theory & Activation Energy",
                "description": "Energy thresholds (Ea), molecular collisions, and transition states",
                "status": "locked",
                "mastery": 0.0,
                "prerequisites": ["node-2"]
            },
            {
                "id": "node-4",
                "title": "Catalysis & Reaction Rates",
                "description": "Arrhenius equation, lowering activation barriers, and catalytic efficiency",
                "status": "locked",
                "mastery": 0.0,
                "prerequisites": ["node-3"]
            },
            {
                "id": "node-5",
                "title": "Dynamic Chemical Equilibrium",
                "description": "Le Chatelier's principle, equilibrium constants (Kc), and reversible flows",
                "status": "locked",
                "mastery": 0.0,
                "prerequisites": ["node-4"]
            }
        ]
    },
    "Biology": {
        "title": "Mastery Tree: Molecular Biology & Genetics",
        "subject": "Biology",
        "overall_progress": 35.0,
        "current_node_id": "node-2",
        "nodes": [
            {
                "id": "node-1",
                "title": "Nucleotides & Nucleic Acids",
                "description": "Phosphate groups, deoxyribose sugars, and purine/pyrimidine nitrogenous bases",
                "status": "completed",
                "mastery": 95.0,
                "prerequisites": []
            },
            {
                "id": "node-2",
                "title": "The DNA Double Helix & Base Pairing",
                "description": "Chargaff's rules (A=T, G=C), anti-parallel strands, and helical geometry",
                "status": "active",
                "mastery": 68.0,
                "prerequisites": ["node-1"]
            },
            {
                "id": "node-3",
                "title": "Semi-Conservative DNA Replication",
                "description": "Helicase unwinding, DNA Polymerase synthesis, and leading/lagging replication forks",
                "status": "locked",
                "mastery": 0.0,
                "prerequisites": ["node-2"]
            },
            {
                "id": "node-4",
                "title": "Transcription: DNA to Messenger RNA",
                "description": "RNA polymerase, promoter regions, introns/exons, and codon generation",
                "status": "locked",
                "mastery": 0.0,
                "prerequisites": ["node-3"]
            },
            {
                "id": "node-5",
                "title": "Translation: Ribosomes & Protein Synthesis",
                "description": "tRNA anti-codons, amino acid peptide chains, and ribosomal assembly",
                "status": "locked",
                "mastery": 0.0,
                "prerequisites": ["node-4"]
            }
        ]
    }
}

@router.get("", response_model=LearningPathResponse)
def get_learning_path(
    subject: Optional[str] = Query(None, description="Subject domain: Physics, Computer Science, Mathematics, Chemistry, Biology"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_subject = "Physics"
    if subject:
        sub_lower = subject.lower()
        if "comp" in sub_lower or "ai" in sub_lower or "neural" in sub_lower:
            target_subject = "Computer Science"
        elif "math" in sub_lower or "calc" in sub_lower:
            target_subject = "Mathematics"
        elif "chem" in sub_lower:
            target_subject = "Chemistry"
        elif "bio" in sub_lower:
            target_subject = "Biology"
        else:
            target_subject = "Physics"

    # Query or initialize LearningPath for the requested subject
    path = db.query(LearningPath).filter(
        LearningPath.user_id == current_user.id,
        LearningPath.subject == target_subject
    ).first()

    if not path:
        roadmap_data = SUBJECT_ROADMAPS.get(target_subject, SUBJECT_ROADMAPS["Physics"])
        path = LearningPath(
            user_id=current_user.id,
            title=roadmap_data["title"],
            subject=roadmap_data["subject"],
            nodes=roadmap_data["nodes"],
            current_node_id=roadmap_data["current_node_id"],
            overall_progress=roadmap_data["overall_progress"]
        )
        db.add(path)
        db.commit()
        db.refresh(path)

    return LearningPathResponse(
        id=path.id,
        title=path.title,
        subject=path.subject,
        overall_progress=path.overall_progress,
        current_node_id=path.current_node_id,
        nodes=[LearningPathNode(**n) for n in path.nodes]
    )
