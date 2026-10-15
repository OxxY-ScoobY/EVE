import { audioVisualizer } from './audioVisualizer';

export interface VoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
}

export class SpeechService {
  private recognition: any = null;
  private isListeningActive: boolean = false;
  private isSpeakingActive: boolean = false;
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.initVoices();
  }

  public initVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve([]);
        return;
      }

      const load = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          this.availableVoices = voices;
          resolve(voices);
        }
      };

      load();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = load;
      }
    });
  }

  public getAvailableVoices(): VoiceOption[] {
    return this.availableVoices.map((v) => ({
      name: v.name,
      lang: v.lang,
      voiceURI: v.voiceURI,
    }));
  }

  // --- Speech to Text (STT) ---
  public isSpeechRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  public startListening(callbacks: {
    onStart: () => void;
    onResult: (transcript: string, isFinal: boolean) => void;
    onError: (error: string) => void;
    onEnd: () => void;
  }): boolean {
    if (!this.isSpeechRecognitionSupported()) {
      callbacks.onError('Speech recognition is not supported in this browser. Please use text input.');
      return false;
    }

    try {
      this.stopSpeaking(); // Interrupt speech when user talks
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListeningActive = true;
        audioVisualizer.playChime('listen');
        callbacks.onStart();
      };

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }
        callbacks.onResult(transcript, isFinal);
      };

      this.recognition.onerror = (event: any) => {
        this.isListeningActive = false;
        console.warn('Speech recognition event:', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          callbacks.onError(`Audio input: ${event.error}`);
        }
        callbacks.onEnd();
      };

      this.recognition.onend = () => {
        this.isListeningActive = false;
        callbacks.onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err: any) {
      this.isListeningActive = false;
      callbacks.onError(err.message || 'Microphone activation failed');
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListeningActive) {
      try {
        this.recognition.stop();
      } catch {
        // Safe ignore
      }
    }
    this.isListeningActive = false;
  }

  // --- Text to Speech (TTS) ---
  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public speak(
    text: string,
    options: {
      speed?: number;
      pitch?: number;
      volume?: number;
      voiceName?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    } = {}
  ): void {
    if (!this.isSpeechSynthesisSupported()) {
      options.onEnd?.();
      return;
    }

    this.stopSpeaking();

    // Strip markdown formatting for cleaner speech
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/```[\s\S]*?```/g, 'Code block omitted for speech.')
      .trim();

    if (!cleanText) {
      options.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options.speed || 1.05;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume !== undefined ? options.volume : 1.0;

    // Pick best natural voice
    if (this.availableVoices.length === 0) {
      this.availableVoices = window.speechSynthesis.getVoices();
    }

    let selectedVoice: SpeechSynthesisVoice | undefined;
    if (options.voiceName) {
      selectedVoice = this.availableVoices.find((v) => v.name === options.voiceName);
    }

    if (!selectedVoice) {
      // Prioritize pleasant English voices (Google, Samantha, Karen, Siri, etc.)
      selectedVoice = this.availableVoices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Karen') ||
            v.name.includes('Victoria') ||
            v.name.includes('Natural') ||
            v.name.includes('Female'))
      );
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      this.isSpeakingActive = true;
      audioVisualizer.playChime('speak');
      options.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeakingActive = false;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeakingActive = false;
      options.onError?.(e);
      options.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeakingActive = false;
  }

  public get isSpeaking(): boolean {
    return this.isSpeakingActive;
  }

  public get isListening(): boolean {
    return this.isListeningActive;
  }
}

export const speechService = new SpeechService();
