
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Monitor, MonitorOff, Mic, MicOff } from "lucide-react";
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
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<InstanceType<typeof SpeechRecognition> | null>(null);
  const transcriptBufferRef = useRef<string[]>([]);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: true 
      });
      
      mediaStreamRef.current = stream;
      setIsSharing(true);
      startSpeechRecognition();
      toast.success("Screen sharing and AI assistant started");
      
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
    if (SpeechRecognitionConstructor) {
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = async (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        
        if (transcript.trim()) {
          onScreenCapture(transcript);
          transcriptBufferRef.current.push(transcript);
          
          // AI assistance after a certain buffer size or timeout
          if (transcriptBufferRef.current.length >= 3) {
            await provideAIAssistance();
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech Recognition error:', event);
        toast.error('Speech recognition error occurred.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      toast.error('Speech Recognition API not supported in this browser.');
    }
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
    transcriptBufferRef.current = [];
    toast.info("Screen sharing and AI assistant stopped");
  };

  return (
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
          onClick={() => {
            if (isListening) {
              recognitionRef.current?.stop();
              setIsListening(false);
            } else {
              startSpeechRecognition();
            }
          }}
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
  );
};

export default ScreenShare;

