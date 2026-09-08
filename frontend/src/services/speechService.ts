// Browser Web Speech API & Natural Human Voice Synthesis Service

export type VoiceGender = 'natural-female' | 'natural-male' | 'natural-expressive';

export type SpeechOptions = {
  rate?: number;
  pitch?: number;
  gender?: VoiceGender;
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
  private availableVoices: SpeechSynthesisVoice[] = [];
  public selectedGender: VoiceGender = 'natural-female';
  public isSpeechSupported: boolean = false;
  public isRecognitionSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSpeechSupported = true;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
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

  private loadVoices() {
    if (this.synth) {
      this.availableVoices = this.synth.getVoices();
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.availableVoices.length === 0 && this.synth) {
      this.availableVoices = this.synth.getVoices();
    }
    return this.availableVoices;
  }

  /**
   * Find the highest quality Natural Human Voice available on the user's OS
   */
  public getBestNaturalVoice(gender: VoiceGender = this.selectedGender): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices || voices.length === 0) return null;

    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    const pool = enVoices.length > 0 ? enVoices : voices;

    if (gender === 'natural-female') {
      // Prioritize natural female voices
      const femaleKeywords = ['natural', 'aria', 'jenny', 'samantha', 'victoria', 'karen', 'zira', 'female', 'google us english', 'zoe'];
      for (const kw of femaleKeywords) {
        const match = pool.find(v => v.name.toLowerCase().includes(kw));
        if (match) return match;
      }
    } else if (gender === 'natural-male') {
      // Prioritize natural male voices
      const maleKeywords = ['natural', 'guy', 'david', 'george', 'daniel', 'male', 'mark', 'james', 'alex'];
      for (const kw of maleKeywords) {
        const match = pool.find(v => v.name.toLowerCase().includes(kw));
        if (match) return match;
      }
    }

    // Default fallback to any Natural or Google voice
    const naturalVoice = pool.find(v => v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google'));
    return naturalVoice || pool[0] || null;
  }

  /**
   * Speak text with natural cadence, pitch modulation, and synchronized visemes
   */
  async speak(text: string, options?: SpeechOptions) {
    this.stop();
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
      }, 180);

      setTimeout(() => {
        clearInterval(interval);
        options?.onViseme?.('sil');
        options?.onEnd?.();
      }, Math.max(1200, text.length * 55));
      return;
    }

    // Clean text: strip markdown symbols for clear pronunciation
    const cleanText = text
      .replace(/[*_~`#]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\\Omega/g, 'Ohms')
      .replace(/\\mu/g, 'micro')
      .replace(/\\pi/g, 'pi')
      .trim();

    if (!cleanText) {
      options?.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const gender = options?.gender || this.selectedGender;
    const voice = this.getBestNaturalVoice(gender);
    if (voice) {
      utterance.voice = voice;
    }

    // Natural human conversational pacing:
    // 0.96x rate creates warm, articulate, highly intelligible cadence
    utterance.rate = options?.rate ?? 0.96;
    utterance.pitch = options?.pitch ?? (gender === 'natural-female' ? 1.05 : 0.95);
    utterance.lang = 'en-US';

    // Viseme simulation cycle during active speech
    let visemeInterval: any = null;
    let step = 0;
    const mouthShapes: ('aa' | 'ee' | 'oo' | 'mm')[] = ['aa', 'ee', 'oo', 'mm', 'aa', 'ee'];

    utterance.onstart = () => {
      options?.onStart?.();
      visemeInterval = setInterval(() => {
        options?.onViseme?.(mouthShapes[step % mouthShapes.length]);
        step++;
      }, 160);
    };

    utterance.onboundary = (event) => {
      // Alternate mouth shapes dynamically on word boundaries for realism
      if (event.name === 'word') {
        const char = cleanText.charAt(event.charIndex).toLowerCase();
        if (['a', 'e', 'i'].includes(char)) {
          options?.onViseme?.('aa');
        } else if (['o', 'u', 'w'].includes(char)) {
          options?.onViseme?.('oo');
        } else if (['m', 'p', 'b'].includes(char)) {
          options?.onViseme?.('mm');
        } else {
          options?.onViseme?.('ee');
        }
      }
    };

    utterance.onend = () => {
      if (visemeInterval) clearInterval(visemeInterval);
      options?.onViseme?.('sil');
      this.currentUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      if (visemeInterval) clearInterval(visemeInterval);
      options?.onViseme?.('sil');
      this.currentUtterance = null;
      options?.onError?.();
    };

    this.currentUtterance = utterance;
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
    this.currentUtterance = null;
  }

  pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  /**
   * Listen to user speech input (Speech-to-Text)
   */
  startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError?: (err: any) => void
  ) {
    if (!this.recognition || !this.isRecognitionSupported) {
      onError?.(new Error('Speech recognition is not supported in this browser.'));
      return;
    }

    try {
      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          onResult(finalTranscript, true);
        } else if (interimTranscript) {
          onResult(interimTranscript, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        onError?.(event.error);
      };

      this.recognition.start();
    } catch (e) {
      onError?.(e);
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore if already stopped
      }
    }
  }
}

export const speechService = new SpeechService();
