
import { useState, useRef } from 'react';
import { toast } from "sonner";
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
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProcessedTime = useRef<number>(0);

  const processAudioBlob = async (audioBlob: Blob) => {
    // Prevent processing too frequently (minimum 2 second gap)
    const now = Date.now();
    if (now - lastProcessedTime.current < 2000) {
      console.log('Skipping processing - too frequent');
      return;
    }
    lastProcessedTime.current = now;

    // Clear any existing timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    console.log('Starting audio processing...');
    setIsProcessing(true);
    setCurrentTranscript("🎤 Converting speech to text...");

    try {
      console.log('Processing audio blob:', {
        size: audioBlob.size,
        type: audioBlob.type,
        jobType: jobType
      });
      
      // Convert audio to text only - no AI response generation
      const transcribedText = await convertAudioToText(audioBlob);
      
      if (!transcribedText.trim()) {
        console.log('No transcription received');
        setCurrentTranscript("");
        return;
      }

      console.log('Transcription received:', transcribedText);
      setCurrentTranscript(transcribedText);
      
      // Only notify parent with transcribed text, no AI response
      onSpeechProcessed(transcribedText, "");
      
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to process speech - please try again');
      setCurrentTranscript("❌ Failed to process speech");
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
    
    if (!selectedMicId) {
      toast.error('Please select a microphone first');
      return;
    }
    
    // Clear previous responses when starting new recording
    setCurrentTranscript("");
    lastProcessedTime.current = 0;
    
    console.log('Starting recording with:', { jobType, selectedMicId });
    
    await startRecording();
    toast.success('🎤 Real-time recording started - speak naturally!');
  };

  const handleStopRecording = () => {
    console.log('Stopping recording');
    stopRecording();
    toast.info('Recording stopped');
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="space-y-4">
        <RecordingControls
          isRecording={isRecording}
          isProcessing={isProcessing}
          selectedMicId={selectedMicId}
          jobType={jobType}
          recordingTime={recordingTime}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
        />

        <RecordingStatus
          isRecording={isRecording}
          isProcessing={isProcessing}
          jobType={jobType}
          selectedMicId={selectedMicId}
        />

        <TranscriptDisplay currentTranscript={currentTranscript} />
      </div>
    </div>
  );
};

export default RealTimeSpeechProcessor;
