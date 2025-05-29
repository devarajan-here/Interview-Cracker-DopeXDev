
interface TranscriptDisplayProps {
  currentTranscript: string;
}

const TranscriptDisplay = ({ currentTranscript }: TranscriptDisplayProps) => {
  if (!currentTranscript) return null;

  return (
    <div className="p-3 bg-white rounded border">
      <p className="text-sm text-gray-600 mb-1">Transcribed Speech:</p>
      <p className="text-sm">{currentTranscript}</p>
    </div>
  );
};

export default TranscriptDisplay;
