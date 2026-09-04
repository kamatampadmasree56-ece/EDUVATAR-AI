from typing import Dict, Any
from app.ai.factory import get_avatar_provider

class AvatarService:
    def __init__(self):
        self.provider = get_avatar_provider()

    async def get_scene_avatar_cues(self, text: str, mood: str = "explaining") -> Dict[str, Any]:
        """
        Generates animation markers for the avatar:
        - facial expression (neutral, smiling, thinking, encouraging, adjusting)
        - speech duration
        - viseme modulation sequence
        - arm/hand gesture (pointing_to_visual, open_palms, nod)
        """
        return await self.provider.generate_avatar_cues(text=text, mood=mood)
