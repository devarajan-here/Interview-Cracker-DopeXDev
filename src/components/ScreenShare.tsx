
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Monitor, MonitorOff } from "lucide-react";
import { toast } from "sonner";

interface ScreenShareProps {
  onScreenCapture: (text: string) => void;
}

// Add this line to ensure TypeScript recognizes the SpeechRecognition type
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

const ScreenShare = ({ onScreenCapture }: ScreenShareProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  // Use the correct type reference
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: true 
      });
      
      mediaStreamRef.current = stream;
      setIsSharing(true);
      toast.success("Screen sharing and audio capture started");
      
      // Initialize speech recognition
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognitionConstructor();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join(' ');
            
          if (transcript.trim()) {
            onScreenCapture(transcript);
          }
        };
        
        recognitionRef.current.start();
      }
      
      // Initialize audio context for level detection
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(1024, 1, 1);
      
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      
      // Process audio data for level detection
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const average = inputData.reduce((sum, value) => sum + Math.abs(value), 0) / inputData.length;
        
        if (average > 0.01) {
          console.log('Audio detected at level:', average.toFixed(3));
        }
      };
      
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

  const stopScreenShare = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsSharing(false);
    toast.info("Screen sharing and audio capture stopped");
  };

  return (
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
  );
};

export default ScreenShare;
