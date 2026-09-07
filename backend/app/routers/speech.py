from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from app.speech.tts import TextToSpeechService
from app.speech.stt import SpeechToTextService
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
import io
from app.speech.tts import generate_wav_bytes_for_audio_id
import wave

router = APIRouter(prefix="/api/speech", tags=["Voice & Speech"])

class SynthesizeRequest(BaseModel):
    text: str
    voice: str = "default"
    language: str = "en"

@router.post("/synthesize")
async def synthesize_speech(req: SynthesizeRequest):
    tts = TextToSpeechService()
    result = await tts.synthesize(text=req.text, voice=req.voice, language=req.language)
    return result

@router.post("/transcribe")
async def transcribe_speech(
    file: Optional[UploadFile] = File(None),
    language: Optional[str] = Form("en")
):
    stt = SpeechToTextService()
    audio_data = await file.read() if file else b""
    text = await stt.transcribe(audio_data=audio_data, language=language)
    return {"transcription": text}


@router.get("/audio/{audio_id}")
async def get_audio(audio_id: str):
    """Serve a generated WAV audio for the registered audio_id. Returns 404 when not found."""
    wav = generate_wav_bytes_for_audio_id(audio_id)
    if not wav:
        raise HTTPException(status_code=404, detail="Audio not found")

    return StreamingResponse(io.BytesIO(wav), media_type="audio/wav")
