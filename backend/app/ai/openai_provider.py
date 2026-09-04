import json
from typing import List, Dict, Any, Optional
import httpx
from app.ai.base import LLMProvider, EmbeddingProvider
from app.ai.demo_provider import DemoLLMProvider, DemoEmbeddingProvider
from app.config import settings
from app.utils.logger import logger

class OpenAIProvider(LLMProvider, EmbeddingProvider):
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.LLM_API_KEY
        self.model = model or settings.LLM_MODEL or "gpt-4o-mini"
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
            logger.info("OpenAI API key not set. Using DemoLLMProvider fallback.")
            return await self.demo_llm.generate(prompt, system_prompt, temperature, response_format)

        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
        }
        if response_format == "json":
            payload["response_format"] = {"type": "json_object"}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    logger.warning(f"OpenAI API returned status {response.status_code}: {response.text}. Using fallback.")
                    return await self.demo_llm.generate(prompt, system_prompt, temperature, response_format)
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}. Falling back to DemoLLMProvider.")
            return await self.demo_llm.generate(prompt, system_prompt, temperature, response_format)

    async def embed_text(self, text: str) -> List[float]:
        if not self.api_key:
            return await self.demo_embed.embed_text(text)

        url = "https://api.openai.com/v1/embeddings"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "input": text,
            "model": "text-embedding-3-small"
        }
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(url, json=payload, headers=headers)
                if resp.status_code == 200:
                    return resp.json()["data"][0]["embedding"]
                return await self.demo_embed.embed_text(text)
        except Exception as e:
            logger.error(f"OpenAI embedding error: {e}. Using fallback.")
            return await self.demo_embed.embed_text(text)

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        results = []
        for text in texts:
            results.append(await self.embed_text(text))
        return results
