
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Monitor, MonitorOff } from "lucide-react";
import { toast } from "sonner";

interface ScreenShareProps {
  onScreenCapture: (text: string) => void;
}

const ScreenShare = ({ onScreenCapture }: ScreenShareProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: true 
      });
      
      mediaStreamRef.current = stream;
      setIsSharing(true);
      toast.success("Screen sharing and audio capture started");
      
      // Initialize audio context
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(1024, 1, 1);
      
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      
      // Process audio data
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Here you can process the audio data
        // For now, we'll just log the average volume
        const average = inputData.reduce((sum, value) => sum + Math.abs(value), 0) / inputData.length;
        console.log('Audio level:', average);
        
        if (average > 0.01) { // Threshold for detecting sound
          onScreenCapture(`Audio detected at level: ${average.toFixed(3)}`);
        }
      };
      
      // Set up listener for when screen sharing ends
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

