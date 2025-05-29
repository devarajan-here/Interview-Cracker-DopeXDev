
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface MicrophoneSelectorProps {
  onMicrophoneSelect: (deviceId: string) => void;
  selectedMicId: string;
}

const MicrophoneSelector = ({ onMicrophoneSelect, selectedMicId }: MicrophoneSelectorProps) => {
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getMicrophones = async () => {
    setIsLoading(true);
    try {
      // Request permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Get all audio input devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      
      setMicrophones(audioInputs);
      
      // If no microphone is selected and we have microphones, select the first one
      if (!selectedMicId && audioInputs.length > 0) {
        onMicrophoneSelect(audioInputs[0].deviceId);
      }
      
      toast.success(`Found ${audioInputs.length} microphone(s)`);
    } catch (error) {
      console.error('Error getting microphones:', error);
      toast.error('Failed to access microphones. Please allow microphone permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getMicrophones();
  }, []);

  const handleMicrophoneChange = (deviceId: string) => {
    onMicrophoneSelect(deviceId);
    const selectedMic = microphones.find(mic => mic.deviceId === deviceId);
    toast.success(`Selected: ${selectedMic?.label || 'Unknown Microphone'}`);
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4" />
          <h3 className="font-semibold">Microphone Selection</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={getMicrophones}
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Select Microphone:</label>
        <Select value={selectedMicId} onValueChange={handleMicrophoneChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a microphone" />
          </SelectTrigger>
          <SelectContent>
            {microphones.map((mic) => (
              <SelectItem key={mic.deviceId} value={mic.deviceId}>
                {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}...`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {microphones.length === 0 && !isLoading && (
          <p className="text-sm text-red-600">
            No microphones found. Please connect a microphone and refresh.
          </p>
        )}
      </div>
    </div>
  );
};

export default MicrophoneSelector;
