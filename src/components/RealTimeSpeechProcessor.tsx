
import { useState, useRef } from 'react';
import { toast } from "sonner";
import { processSpeechForInterview } from '@/services/speechToApiService';
import { convertAudioToText } from '@/services/audioToTextService';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import RecordingControls from './RecordingControls';
import RecordingStatus from './RecordingStatus';
import TranscriptDisplay from './TranscriptDisplay';
import StreamingResponse from './StreamingResponse';

interface RealTimeSpeechProcessorProps {
  jobType: string;
  onSpeechProcessed: (originalText: string, aiResponse: string) => void;
  selectedMicId: string;
}

const RealTimeSpeechProcessor = ({ jobType, onSpeechProcessed, selectedMicId }: RealTimeSpeechProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [streamingResponse, setStreamingResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const processAudioBlob = async (audioBlob: Blob) => {
    // Clear any existing timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }

    setIsProcessing(true);
    setCurrentTranscript("Converting audio to text...");

    try {
      console.log('Processing audio blob:', audioBlob.size, 'bytes');
      
      // Convert audio to text
      const transcribedText = await convertAudioToText(audioBlob);
      
      if (!transcribedText.trim()) {
        setCurrentTranscript("");
        return;
      }

      setCurrentTranscript(transcribedText);
      console.log(`Processing speech for ${jobType}:`, transcribedText);

      // Start streaming response
      setIsStreaming(true);
      setStreamingResponse("");
      
      // Simulate streaming response (replace with actual streaming API call)
      const aiResponse = await processSpeechForInterview(transcribedText, jobType);
      await simulateStreamingText(aiResponse);
      
      onSpeechProcessed(transcribedText, aiResponse);
      
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to process audio');
      setCurrentTranscript("");
      setStreamingResponse("");
      setIsStreaming(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateStreamingText = async (text: string) => {
    setStreamingResponse("");
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50)); // Adjust speed as needed
      setStreamingResponse(prev => prev + (i === 0 ? words[i] : ' ' + words[i]));
    }
    setIsStreaming(false);
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
    
    // Clear previous responses when starting new recording
    setStreamingResponse("");
    setCurrentTranscript("");
    setIsStreaming(false);
    
    await startRecording();
    toast.success('Continuous recording started - speak naturally!');
  };

  const handleStopRecording = () => {
    stopRecording();
    setIsStreaming(false);
    toast.info('Recording stopped');
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
        onStopRecording={handleStopRecording}
      />

      <RecordingStatus
        isRecording={isRecording}
        isProcessing={isProcessing}
        jobType={jobType}
        selectedMicId={selectedMicId}
      />

      <TranscriptDisplay currentTranscript={currentTranscript} />
      
      <StreamingResponse 
        response={streamingResponse} 
        isStreaming={isStreaming}
        isRecording={isRecording}
      />
    </div>
  );
};

export default RealTimeSpeechProcessor;
