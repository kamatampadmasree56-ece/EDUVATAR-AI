from typing import Optional
from app.ai.factory import get_stt_provider

class SpeechToTextService:
    def __init__(self):
        self.provider = get_stt_provider()

    async def transcribe(self, audio_data: bytes, language: Optional[str] = None) -> str:
        return await self.provider.transcribe(audio_data=audio_data, language=language)
