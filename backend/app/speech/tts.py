from typing import Dict, Any
from app.ai.factory import get_tts_provider
import io
import wave
import struct
import math
from typing import Optional

# Simple in-memory registry mapping audio_id -> (text, voice, language)
_AUDIO_REGISTRY: Dict[str, Dict[str, str]] = {}

class TextToSpeechService:
    def __init__(self):
        self.provider = get_tts_provider()

    async def synthesize(self, text: str, voice: str = "default", language: str = "en") -> Dict[str, Any]:
        return await self.provider.synthesize(text=text, voice=voice, language=language)


def register_text_for_audio(audio_id: str, text: str, voice: str = "default", language: str = "en"):
    """Register text for on-demand WAV generation via `/api/speech/audio/{audio_id}`."""
    _AUDIO_REGISTRY[audio_id] = {"text": text, "voice": voice, "language": language}


def generate_wav_bytes_for_audio_id(audio_id: str) -> Optional[bytes]:
    """Generate a tiny placeholder WAV audio for the registered text.

    This produces a short sine-wave tone whose duration scales with the word count.
    It is a deterministic and dependency-free server-side TTS fallback for demos.
    """
    info = _AUDIO_REGISTRY.get(audio_id)
    if not info:
        return None

    text = info.get("text", "")
    words = max(1, len(text.split()))
    duration_seconds = min(20.0, max(1.0, words * 0.35))

    # WAV params
    sample_rate = 22050
    amplitude = 16000
    freq = 440.0  # A4 tone

    num_samples = int(sample_rate * duration_seconds)
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit
        wf.setframerate(sample_rate)

        for i in range(num_samples):
            t = i / sample_rate
            # Simple envelope to avoid clicks
            envelope = 0.5 * (1 - math.cos(2 * math.pi * min(1.0, t / 0.02))) if t < 0.02 else 1.0
            sample = int(amplitude * envelope * math.sin(2 * math.pi * freq * t))
            wf.writeframes(struct.pack('<h', sample))

    return buf.getvalue()
