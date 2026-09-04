import json
from typing import List, Dict, Any, Optional
import httpx
from app.ai.base import LLMProvider, EmbeddingProvider
from app.ai.demo_provider import DemoLLMProvider, DemoEmbeddingProvider
from app.config import settings
from app.utils.logger import logger

class GeminiProvider(LLMProvider, EmbeddingProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.LLM_API_KEY
        self.model = "gemini-1.5-flash"
        self.demo_llm = DemoLLMProvider()
        self.demo_embed = DemoEmbeddingProvider()

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        response_format: Optional[str] = None
    ) -> str:
        if not self.api_key:
            logger.info("Gemini API key not set. Using DemoLLMProvider fallback.")
            return await self.demo_llm.generate(prompt, system_prompt, temperature, response_format)

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        
        contents = []
        if system_prompt:
            contents.append({"role": "user", "parts": [{"text": f"System Context: {system_prompt}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. I will act as the adaptive AI educator following these instructions."}]})
        
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload: Dict[str, Any] = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
            }
        }
        if response_format == "json":
            payload["generationConfig"]["responseMimeType"] = "application/json"

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
                    return await self.demo_llm.generate(prompt, system_prompt, temperature, response_format)
                else:
                    logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text}")
                    return await self.demo_llm.generate(prompt, system_prompt, temperature, response_format)
        except Exception as e:
            logger.error(f"Gemini API error: {e}. Falling back to DemoLLMProvider.")
            return await self.demo_llm.generate(prompt, system_prompt, temperature, response_format)

    async def embed_text(self, text: str) -> List[float]:
        return await self.demo_embed.embed_text(text)

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return await self.demo_embed.embed_batch(texts)
