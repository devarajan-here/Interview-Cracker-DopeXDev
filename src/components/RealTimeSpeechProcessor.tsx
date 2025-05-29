
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square } from "lucide-react";
import { toast } from "sonner";
import { processSpeechForInterview } from '@/services/speechToApiService';
import { convertAudioToText } from '@/services/audioToTextService';

interface RealTimeSpeechProcessorProps {
  jobType: string;
  onSpeechProcessed: (originalText: string, aiResponse: string) => void;
  selectedMicId: string;
}

const RealTimeSpeechProcessor = ({ jobType, onSpeechProcessed, selectedMicId }: RealTimeSpeechProcessorProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopRecording();
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Stop recording when microphone changes
  useEffect(() => {
    if (isRecording) {
      stopRecording();
    }
  }, [selectedMicId]);

  const startRecording = async () => {
    if (!jobType) {
      toast.error('Please select a job type first');
      return;
    }

    if (!selectedMicId) {
      toast.error('Please select a microphone first');
      return;
    }

    try {
      // Request access to the selected microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { 
          deviceId: { exact: selectedMicId },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await processAudioBlob(audioBlob);
        }
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started with selected microphone');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to access selected microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    setIsRecording(false);
    setRecordingTime(0);
    toast.info('Recording stopped, processing audio...');
  };

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
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
            onClick={isRecording ? stopRecording : startRecording}
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

      {isRecording && (
        <div className="flex items-center text-red-600">
          <div className="animate-pulse rounded-full h-3 w-3 bg-red-600 mr-2"></div>
          Recording audio from selected microphone...
        </div>
      )}

      {currentTranscript && (
        <div className="p-3 bg-white rounded border">
          <p className="text-sm text-gray-600 mb-1">Transcribed Speech:</p>
          <p className="text-sm">{currentTranscript}</p>
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
    </div>
  );
};

export default RealTimeSpeechProcessor;
