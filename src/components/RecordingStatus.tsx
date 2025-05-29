
interface RecordingStatusProps {
  isRecording: boolean;
  isProcessing: boolean;
  jobType: string;
  selectedMicId: string;
}

const RecordingStatus = ({ isRecording, isProcessing, jobType, selectedMicId }: RecordingStatusProps) => {
  return (
    <>
      {isRecording && (
        <div className="flex items-center text-red-600">
          <div className="animate-pulse rounded-full h-3 w-3 bg-red-600 mr-2"></div>
          Recording audio from selected microphone...
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Processing speech for {jobType} interview...
        </div>
      )}

      {!selectedMicId && (
        <p className="text-sm text-amber-600">
          Please select a microphone above to enable speech processing.
        </p>
      )}

      {!jobType && (
        <p className="text-sm text-amber-600">
          Please select a job type above to enable speech processing.
        </p>
      )}
    </>
  );
};

export default RecordingStatus;
