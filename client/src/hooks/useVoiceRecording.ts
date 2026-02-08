import { useState, useEffect, useRef } from 'react';

// Extend Window interface to include webkit prefix
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function useVoiceRecording() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  // Check support on mount - don't use setState in effect
  const [isSupported] = useState(() => {
    return !!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));
  });
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Skip initialization if not supported
    if (!isSupported) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // Initialize Speech Recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Voice recognition started');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // Build transcript from ALL results (not just new ones)
      for (let i = 0; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + ' ';
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      // Set the complete transcript (don't append to previous state)
      const fullTranscript = finalTranscript.trim();
      setTranscript(interimTranscript ? fullTranscript + ' ' + interimTranscript : fullTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current || !isSupported) {
      return;
    }

    try {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting voice recognition:', error);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) {
      return;
    }

    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  const resetTranscript = () => {
    setTranscript('');
  };

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
