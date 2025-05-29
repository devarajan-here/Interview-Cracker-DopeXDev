
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
      <h3 className="font-semibold">Real-Time Speech Processor</h3>
      <div className="flex items-center gap-2">
        {isRecording && (
          <span className="text-red-600 text-sm font-mono">
            {formatTime(recordingTime)}
          </span>
        )}
        <Button
          variant={isRecording ? "destructive" : "default"}
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={isProcessing || !selectedMicId || !jobType}
        >
          {isRecording ? (
            <>
              <Square className="mr-2 h-4 w-4" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Start Recording
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default RecordingControls;
