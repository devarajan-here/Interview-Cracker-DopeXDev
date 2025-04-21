
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Monitor, MonitorOff, Mic, MicOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { generateAnswer } from '@/services/apiService';

interface ScreenShareProps {
  onScreenCapture: (text: string) => void;
  onAIAssist?: (suggestion: string) => void;
}

// We create a local variable to access the SpeechRecognition constructor safely
const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;

const ScreenShare = ({ onScreenCapture, onAIAssist }: ScreenShareProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [microphoneState, setMicrophoneState] = useState<'ready' | 'denied' | 'unavailable' | 'inactive'>('inactive');
  const mediaStreamRef = useRef<MediaStream | null>(null);
  // Fix the typing here by using NonNullable<> to avoid TS2552 error
  const recognitionRef = useRef<InstanceType<NonNullable<typeof SpeechRecognitionConstructor>> | null>(null);
  const transcriptBufferRef = useRef<string[]>([]);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const restartTimeoutRef = useRef<number | null>(null);

  // Check microphone permission on component mount
  useEffect(() => {
    checkMicrophonePermission();
    return () => {
      // Clean up on unmount
      if (restartTimeoutRef.current) {
        window.clearTimeout(restartTimeoutRef.current);
      }
      stopScreenShare();
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      // Just request access to check permission status
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop tracks right away
      setMicrophoneState('ready');
      setPermissionDenied(false);
    } catch (err) {
      console.error("Microphone permission check failed:", err);
      setMicrophoneState('denied');
      setPermissionDenied(true);
    }
  };

  const startScreenShare = async () => {
    try {
      // Reset permission denied state on new attempt
      setPermissionDenied(false);
      
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: true 
      });
      
      mediaStreamRef.current = stream;
      setIsSharing(true);
      
      // Check microphone access separately to ensure it's available
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStream.getTracks().forEach(track => track.stop()); // Stop immediately after checking
        setMicrophoneState('ready');
        startSpeechRecognition(); // Only start if microphone is available
      } catch (err) {
        console.error("Microphone access error:", err);
        setMicrophoneState('denied');
        toast.error("Microphone access is required for transcription. Please allow microphone access.");
      }
      
      toast.success("Screen sharing started");
      
      stream.getTracks().forEach(track => {
        track.onended = () => {
          stopScreenShare();
        };
      });
    } catch (err) {
      console.error("Error sharing screen:", err);
      toast.error("Failed to start screen sharing");
    }
  };

  const startSpeechRecognition = () => {
    if (!SpeechRecognitionConstructor) {
      toast.error('Speech Recognition API not supported in this browser.');
      return;
    }
    
    try {
      // Create new instance and clean up any previous one
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = async (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        
        if (transcript.trim()) {
          console.log("Captured speech:", transcript);
          onScreenCapture(transcript);
          transcriptBufferRef.current.push(transcript);
          
          // AI assistance after a certain buffer size or timeout
          if (transcriptBufferRef.current.length >= 3) {
            await provideAIAssistance();
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech Recognition error:', event.error, event.message);
        
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setPermissionDenied(true);
          setMicrophoneState('denied');
          toast.error('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'audio-capture') {
          setMicrophoneState('unavailable');
          toast.error('No microphone detected or microphone is busy.');
        } else if (event.error === 'network') {
          toast.error('Network error occurred with speech recognition.');
        } else if (event.error === 'no-speech') {
          // This is a common error, we'll just show a gentler notification
          toast.info('No speech detected. Please speak louder or check your microphone.');
          
          // Auto-restart on no-speech without alarming the user
          if (isListening) {
            restartSpeechRecognition();
          }
        } else {
          toast.error(`Speech recognition error: ${event.error || 'Unknown error'}`);
        }
        
        // Auto-restart on non-permission errors
        if (event.error !== 'not-allowed' && event.error !== 'permission-denied' && isListening) {
          restartSpeechRecognition();
        } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setIsListening(false);
        }
      };

      recognitionRef.current.onend = () => {
        // Only restart if it's supposed to be listening and wasn't stopped due to permission issues
        if (isListening && !permissionDenied) {
          restartSpeechRecognition();
        } else {
          setIsListening(false);
        }
      };
      
      recognitionRef.current.start();
      setIsListening(true);
      toast.success("Speech recognition started");
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast.error("Failed to start speech recognition. Please try again.");
      setIsListening(false);
    }
  };

  // Helper to restart speech recognition with a small delay to avoid rapid restart loops
  const restartSpeechRecognition = () => {
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
    }
    
    restartTimeoutRef.current = window.setTimeout(() => {
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          console.log("Speech recognition restarted");
        } catch (e) {
          console.error('Failed to restart speech recognition:', e);
          setIsListening(false);
        }
      }
    }, 1000);
  };

  const provideAIAssistance = async () => {
    try {
      const conversationContext = transcriptBufferRef.current.slice(-3).join(' ');
      const aiResponse = await generateAnswer(`Provide a professional suggestion or follow-up based on this conversation context: ${conversationContext}`);
      
      if (onAIAssist) {
        onAIAssist(aiResponse);
      }
      
      // Clear buffer after generating assistance
      transcriptBufferRef.current = [];
    } catch (error) {
      console.error('AI Assistance Error:', error);
    }
  };

  const stopScreenShare = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    setIsSharing(false);
    setIsListening(false);
    setMicrophoneState('inactive');
    setPermissionDenied(false);
    transcriptBufferRef.current = [];
    toast.info("Screen sharing and AI assistant stopped");
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      toast.info("Speech recognition paused");
    } else {
      // Check microphone permission before restarting
      checkMicrophonePermission().then(() => {
        if (!permissionDenied) {
          startSpeechRecognition();
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button 
          variant={isSharing ? "destructive" : "default"}
          onClick={isSharing ? stopScreenShare : startScreenShare}
        >
          {isSharing ? (
            <>
              <MonitorOff className="mr-2" />
              Stop Sharing
            </>
          ) : (
            <>
              <Monitor className="mr-2" />
              Share Screen & Audio
            </>
          )}
        </Button>
        {isSharing && (
          <Button 
            variant={isListening ? "default" : "outline"}
            onClick={toggleSpeechRecognition}
          >
            {isListening ? (
              <>
                <MicOff className="mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="mr-2" />
                Start Listening
              </>
            )}
          </Button>
        )}
      </div>
      
      {permissionDenied && (
        <div className="mt-2 text-red-500 text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          Microphone access denied. Please check your browser settings and refresh the page.
        </div>
      )}
      
      {microphoneState === 'ready' && isListening && (
        <div className="mt-2 text-green-500 text-sm">
          Microphone active - speak clearly for best results.
        </div>
      )}
    </div>
  );
};

export default ScreenShare;
