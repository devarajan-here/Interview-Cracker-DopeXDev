
import { useState } from 'react';
import { toast } from "sonner";
import { processSpeechForInterview } from '@/services/speechToApiService';
import { convertAudioToText } from '@/services/audioToTextService';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import RecordingControls from './RecordingControls';
import RecordingStatus from './RecordingStatus';
import TranscriptDisplay from './TranscriptDisplay';

interface RealTimeSpeechProcessorProps {
  jobType: string;
  onSpeechProcessed: (originalText: string, aiResponse: string) => void;
  selectedMicId: string;
}

const RealTimeSpeechProcessor = ({ jobType, onSpeechProcessed, selectedMicId }: RealTimeSpeechProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");

  const processAudioBlob = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setCurrentTranscript("Converting audio to text...");

    try {
      console.log('Processing audio blob:', audioBlob.size, 'bytes');
      
      // Convert audio to text
      const transcribedText = await convertAudioToText(audioBlob);
      
      if (!transcribedText.trim()) {
        toast.warning('No speech detected in the recording');
        setCurrentTranscript("");
        return;
      }

      setCurrentTranscript(transcribedText);
      console.log(`Processing speech for ${jobType}:`, transcribedText);

      // Process with AI
      const aiResponse = await processSpeechForInterview(transcribedText, jobType);
      onSpeechProcessed(transcribedText, aiResponse);
      toast.success('Speech processed successfully');
      
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to process audio');
      setCurrentTranscript("");
    } finally {
      setIsProcessing(false);
    }
  };

  const { isRecording, recordingTime, startRecording, stopRecording } = useAudioRecording(
    selectedMicId,
    processAudioBlob
  );

  const handleStartRecording = async () => {
    if (!jobType) {
      toast.error('Please select a job type first');
      return;
    }
    await startRecording();
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <RecordingControls
        isRecording={isRecording}
        isProcessing={isProcessing}
        selectedMicId={selectedMicId}
        jobType={jobType}
        recordingTime={recordingTime}
        onStartRecording={handleStartRecording}
        onStopRecording={stopRecording}
      />

      <RecordingStatus
        isRecording={isRecording}
        isProcessing={isProcessing}
        jobType={jobType}
        selectedMicId={selectedMicId}
      />

      <TranscriptDisplay currentTranscript={currentTranscript} />
    </div>
  );
};

export default RealTimeSpeechProcessor;
