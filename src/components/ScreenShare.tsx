
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Monitor, MonitorOff } from "lucide-react";
import { toast } from "sonner";

interface ScreenShareProps {
  onScreenCapture: (text: string) => void;
}

const ScreenShare = ({ onScreenCapture }: ScreenShareProps) => {
  const [isSharing, setIsSharing] = useState(false);
  let mediaStream: MediaStream | null = null;

  const startScreenShare = async () => {
    try {
      mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setIsSharing(true);
      toast.success("Screen sharing started");
      // Here you would implement OCR or other screen analysis
      // For now, we'll simulate capturing text from screen
      onScreenCapture("Sample text captured from screen");
    } catch (err) {
      console.error("Error sharing screen:", err);
      toast.error("Failed to start screen sharing");
    }
  };

  const stopScreenShare = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      mediaStream = null;
    }
    setIsSharing(false);
    toast.info("Screen sharing stopped");
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
          Share Screen
        </>
      )}
    </Button>
  );
};

export default ScreenShare;
