
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
      
      // Convert audio to text
      const transcribedText = await convertAudioToText(audioBlob);
      
      if (!transcribedText.trim()) {
        console.log('No transcription received');
        setCurrentTranscript("");
        return;
      }

      console.log('Transcription received:', transcribedText);
      setCurrentTranscript(transcribedText);

      // Start streaming response
      setIsStreaming(true);
      setStreamingResponse("");
      
      console.log(`Processing speech for ${jobType} interview`);
      
      // Get AI response
      const aiResponse = await processSpeechForInterview(transcribedText, jobType);
      console.log('AI response received:', aiResponse);
      
      // Simulate streaming
      await simulateStreamingText(aiResponse);
      
      // Notify parent component
      onSpeechProcessed(transcribedText, aiResponse);
      
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to process speech - please try again');
      setCurrentTranscript("❌ Failed to process speech");
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
      await new Promise(resolve => setTimeout(resolve, 80)); // Slightly slower for better effect
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
    
    if (!selectedMicId) {
      toast.error('Please select a microphone first');
      return;
    }
    
    // Clear previous responses when starting new recording
    setStreamingResponse("");
    setCurrentTranscript("");
    setIsStreaming(false);
    lastProcessedTime.current = 0;
    
    console.log('Starting recording with:', { jobType, selectedMicId });
    
    await startRecording();
    toast.success('🎤 Real-time recording started - speak naturally!');
  };

  const handleStopRecording = () => {
    console.log('Stopping recording');
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
