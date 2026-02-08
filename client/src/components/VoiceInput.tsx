import { Mic, MicOff } from 'lucide-react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';

interface VoiceInputProps {
  onTranscriptReady: (transcript: string) => void;
  isProcessing: boolean;
}

export function VoiceInput({ onTranscriptReady, isProcessing }: VoiceInputProps) {
  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecording();

  const handleToggleRecording = () => {
    if (isListening) {
      stopListening();
      if (transcript.trim()) {
        onTranscriptReady(transcript.trim());
        resetTranscript();
      }
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="voice-input-container">
        <div className="error-message">
          <p>Voice input is not supported in your browser.</p>
          <p>Please use Chrome, Edge, or Firefox for the best experience.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-input-container">
      <button
        className={`mic-button ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
        onClick={handleToggleRecording}
        disabled={isProcessing}
        aria-label={isListening ? 'Stop recording' : 'Start recording'}
      >
        {isListening ? (
          <MicOff size={48} />
        ) : (
          <Mic size={48} />
        )}
      </button>

      {isListening && (
        <div className="recording-indicator">
          <span className="pulse"></span>
          <span>Listening...</span>
        </div>
      )}

      {isProcessing && (
        <div className="processing-indicator">
          <span>Processing...</span>
        </div>
      )}

      {transcript && (
        <div className="transcript-preview">
          <p className="transcript-label">You said:</p>
          <p className="transcript-text">{transcript}</p>
        </div>
      )}
    </div>
  );
}
