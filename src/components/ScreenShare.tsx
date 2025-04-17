
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startScreenShare = async () => {
    try {
      // Remove the invalid 'cursor' property from the constraints
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: false 
      });
      
      mediaStreamRef.current = stream;
      setIsSharing(true);
      toast.success("Screen sharing started");
      
      // Create a hidden video element to capture frames
      if (!videoRef.current) {
        const video = document.createElement('video');
        video.style.display = 'none';
        document.body.appendChild(video);
        videoRef.current = video;
      }

      // Create canvas for processing if it doesn't exist
      if (!canvasRef.current) {
        const canvas = document.createElement('canvas');
        canvas.style.display = 'none';
        document.body.appendChild(canvas);
        canvasRef.current = canvas;
      }
      
      // Set up video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Capture frame after a short delay to ensure video is playing
        setTimeout(captureFrame, 1000);
      }
      
      // Set up listener for when screen sharing ends
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.error("Error sharing screen:", err);
      toast.error("Failed to start screen sharing");
    }
  };

  const captureFrame = () => {
    if (!isSharing || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // In a real implementation, you would use OCR here
      // For now, we'll simulate OCR with a placeholder
      simulateOcr(canvas);
    }
  };
  
  const simulateOcr = (canvas: HTMLCanvasElement) => {
    // In a real implementation, this would call an OCR service
    // For now, we're simulating OCR results
    
    // Get timestamp to make each capture unique
    const timestamp = new Date().toLocaleTimeString();
    
    // Simulate captured text (in production, this would come from actual OCR)
    const capturedText = `What are the most important qualities for a software engineer? (Captured at ${timestamp})`;
    
    // Send the captured text to the parent component
    onScreenCapture(capturedText);
    
    // Log for debugging
    console.log("Screen captured and processed:", capturedText);
  };

  const stopScreenShare = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    // Clean up video and canvas elements
    if (videoRef.current) {
      videoRef.current.srcObject = null;
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
