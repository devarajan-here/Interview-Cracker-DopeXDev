
import { useState, useRef, useEffect } from 'react';
import { toast } from "sonner";
import { convertAudioToText } from '@/services/audioToTextService';

export const useAudioRecording = (selectedMicId: string, onAudioProcessed: (audioBlob: Blob) => void) => {
  const [isRecording, setIsRecording] = useState(false);
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
          onAudioProcessed(audioBlob);
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

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording
  };
};
