from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter(prefix="/api/video", tags=["Video Generation"])

class VideoGenerateRequest(BaseModel):
    lesson_id: int
    section_index: Optional[int] = 0
    avatar_style: Optional[str] = "modern_teacher"

@router.post("/generate")
def generate_video_scene(req: VideoGenerateRequest):
    return {
        "video_id": f"scene_{req.lesson_id}_{req.section_index}",
        "status": "ready",
        "video_url": None,  # Signals client to use the high-fidelity interactive Canvas/SVG video stage
        "mode": "interactive_avatar",
        "message": "Interactive high-fidelity avatar classroom active."
    }

@router.get("/{video_id}")
def get_video_status(video_id: str):
    return {
        "video_id": video_id,
        "status": "ready",
        "mode": "interactive_avatar"
    }
