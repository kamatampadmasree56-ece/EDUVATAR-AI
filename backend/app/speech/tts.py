from typing import Dict, Any
from app.ai.factory import get_tts_provider

class TextToSpeechService:
    def __init__(self):
        self.provider = get_tts_provider()

    async def synthesize(self, text: str, voice: str = "default", language: str = "en") -> Dict[str, Any]:
        return await self.provider.synthesize(text=text, voice=voice, language=language)
