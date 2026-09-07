// Browser Web Speech API service for TTS and STT

type SpeechOptions = {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onViseme?: (viseme: 'aa' | 'ee' | 'oo' | 'mm' | 'sil') => void;
  onEnd?: () => void;
  onError?: () => void;
};

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private serverVisemeTimers: number[] = [];
  private recognition: any = null;
  public isSpeechSupported: boolean = false;
  public isRecognitionSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSpeechSupported = true;
    }

    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.isRecognitionSupported = true;
      }
    }
  }

  /**
   * Speak text with viseme simulation and callbacks
   */
  async speak(
    text: string,
    options?: SpeechOptions
  ) {
    // Prefer server-side TTS when available: ask the backend to synthesize first.
    try {
      const resp = await fetch('/api/speech/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'default', language: 'en' }),
      });

      if (resp.ok) {
        const payload = await resp.json();
        if (payload.mode === 'server_audio' && payload.audio_url) {
          this.stop();
          const audio = new Audio(payload.audio_url);
          this.currentAudio = audio;
          let fallbackStarted = false;
          const fallbackToBrowser = () => {
            if (fallbackStarted) return;
            fallbackStarted = true;
            this.speakWithBrowser(text, options);
          };
          if (payload.visemes && Array.isArray(payload.visemes)) {
            payload.visemes.forEach((v: any) => {
              this.serverVisemeTimers.push(window.setTimeout(() => options?.onViseme?.(v.value || 'sil'), Math.max(0, Math.floor((v.time || 0) * 1000))));
            });
          }
          audio.onplay = () => options?.onStart?.();
          audio.onended = () => {
            options?.onViseme?.('sil');
            options?.onEnd?.();
          };
          audio.onerror = fallbackToBrowser;
          audio.play().catch(fallbackToBrowser);
          return;
        }
      }
    } catch (e) {
      // ignore and fall back to browser speech
    }

    this.speakWithBrowser(text, options);
  }

  private speakWithBrowser(text: string, options?: SpeechOptions) {
    if (!this.synth || !this.isSpeechSupported) {
      // Fallback: simulate timer callbacks so avatar doesn't get stuck
      options?.onStart?.();
      let step = 0;
      const interval = setInterval(() => {
        const visemes: ('aa' | 'ee' | 'oo' | 'mm')[] = ['aa', 'ee', 'oo', 'mm'];
        options?.onViseme?.(visemes[step % visemes.length]);
        step++;
      }, 200);

      setTimeout(() => {
        clearInterval(interval);
        options?.onViseme?.('sil');
        options?.onEnd?.();
      }, Math.min(6000, Math.max(2000, text.length * 60)));
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const cleanText = text
      .replace(/[*_#`]/g, '')
      .replace(/\\frac\{.*?\}\{.*?\}/g, 'formula')
      .replace(/\\[a-zA-Z]+/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    utterance.rate = options?.rate || 1.0;
    utterance.pitch = options?.pitch || 1.0;

    // Pick best available natural voice
    const voices = this.synth.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Guy'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    let visemeInterval: any = null;

    utterance.onstart = () => {
      options?.onStart?.();
      const visemeCycle: ('aa' | 'ee' | 'oo' | 'mm')[] = ['aa', 'ee', 'oo', 'mm', 'ee', 'aa'];
      let idx = 0;
      visemeInterval = setInterval(() => {
        options?.onViseme?.(visemeCycle[idx % visemeCycle.length]);
        idx++;
      }, 160);
    };

    utterance.onend = () => {
      if (visemeInterval) clearInterval(visemeInterval);
      options?.onViseme?.('sil');
      options?.onEnd?.();
    };

    utterance.onerror = () => {
      if (visemeInterval) clearInterval(visemeInterval);
      options?.onViseme?.('sil');
      options?.onError?.();
    };

    this.synth.speak(utterance);
  }

  stop() {
    this.serverVisemeTimers.forEach((timer) => window.clearTimeout(timer));
    this.serverVisemeTimers = [];
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Listen to microphone input
   */
  startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (err: any) => void
  ) {
    if (!this.recognition) {
      console.warn('Speech Recognition not supported in this browser.');
      onError?.(new Error('Speech recognition not supported'));
      return;
    }

    try {
      this.recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }
        onResult(transcript, isFinal);
      };

      this.recognition.onerror = (event: any) => {
        onError?.(event.error);
      };

      this.recognition.start();
    } catch (err) {
      onError?.(err);
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (err) {
        // ignore
      }
    }
  }
}

export const speechService = new SpeechService();
