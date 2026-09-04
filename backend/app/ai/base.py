from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class LLMProvider(ABC):
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        response_format: Optional[str] = None
    ) -> str:
        """Generates text from an LLM model."""
        pass

class EmbeddingProvider(ABC):
    @abstractmethod
    async def embed_text(self, text: str) -> List[float]:
        """Generates an embedding vector for a single string."""
        pass

    @abstractmethod
    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generates embedding vectors for a batch of strings."""
        pass

class TTSProvider(ABC):
    @abstractmethod
    async def synthesize(self, text: str, voice: str = "default", language: str = "en") -> Dict[str, Any]:
        """Synthesizes text to speech audio or returns client audio cues."""
        pass

class STTProvider(ABC):
    @abstractmethod
    async def transcribe(self, audio_data: bytes, language: Optional[str] = None) -> str:
        """Transcribes audio data to text."""
        pass

class AvatarProvider(ABC):
    @abstractmethod
    async def generate_avatar_cues(self, text: str, mood: str = "explaining") -> Dict[str, Any]:
        """Generates animation timeline, visemes, and expressions for the avatar."""
        pass
