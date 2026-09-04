from typing import Tuple
from app.config import settings
from app.ai.base import LLMProvider, EmbeddingProvider, TTSProvider, STTProvider, AvatarProvider
from app.ai.demo_provider import DemoLLMProvider, DemoEmbeddingProvider, DemoTTSProvider, DemoSTTProvider, DemoAvatarProvider
from app.ai.openai_provider import OpenAIProvider
from app.ai.gemini_provider import GeminiProvider
from app.utils.logger import logger

def get_llm_provider() -> LLMProvider:
    provider = settings.LLM_PROVIDER.lower()
    if provider == "openai":
        return OpenAIProvider()
    elif provider == "gemini":
        return GeminiProvider()
    else:
        return DemoLLMProvider()

def get_embedding_provider() -> EmbeddingProvider:
    provider = settings.EMBEDDING_PROVIDER.lower()
    if provider == "openai":
        return OpenAIProvider()
    elif provider == "gemini":
        return GeminiProvider()
    else:
        return DemoEmbeddingProvider()

def get_tts_provider() -> TTSProvider:
    return DemoTTSProvider()

def get_stt_provider() -> STTProvider:
    return DemoSTTProvider()

def get_avatar_provider() -> AvatarProvider:
    return DemoAvatarProvider()
