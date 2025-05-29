
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";

interface RecordingControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  selectedMicId: string;
  jobType: string;
  recordingTime: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const RecordingControls = ({
  isRecording,
  isProcessing,
  selectedMicId,
  jobType,
  recordingTime,
  onStartRecording,
  onStopRecording
}: RecordingControlsProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold">Real-Time Interview Assistant</h3>
        {isRecording && (
          <p className="text-sm text-green-600 mt-1">
            🎤 Listening continuously - speak naturally!
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isRecording && (
          <div className="flex items-center gap-2">
            <span className="text-red-600 text-sm font-mono">
              {formatTime(recordingTime)}
            </span>
            <div className="flex items-center text-green-600">
              <div className="animate-pulse rounded-full h-2 w-2 bg-green-600 mr-2"></div>
              <span className="text-xs">LIVE</span>
            </div>
          </div>
        )}
        <Button
          variant={isRecording ? "destructive" : "default"}
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={isProcessing || !selectedMicId || !jobType}
          size="sm"
        >
          {isRecording ? (
            <>
              <Square className="mr-2 h-4 w-4" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Start Live Recording
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RecordingControls;
