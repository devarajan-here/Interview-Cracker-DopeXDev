
import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { processSpeechForInterview } from '@/services/speechToApiService';

interface RealTimeSpeechProcessorProps {
  jobType: string;
  onSpeechProcessed: (originalText: string, aiResponse: string) => void;
}

const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;

const RealTimeSpeechProcessor = ({ jobType, onSpeechProcessed }: RealTimeSpeechProcessorProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const recognitionRef = useRef<InstanceType<typeof SpeechRecognitionConstructor> | null>(null);
  const processingTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        window.clearTimeout(processingTimeoutRef.current);
      }
      stopListening();
    };
  }, []);

  const startListening = () => {
    if (!SpeechRecognitionConstructor) {
      toast.error('Speech Recognition not supported in this browser');
      return;
    }

    if (!jobType) {
      toast.error('Please select a job type first');
      return;
    }

    try {
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setCurrentTranscript(fullTranscript);

        // Process speech after 2 seconds of final result
        if (finalTranscript.trim()) {
          if (processingTimeoutRef.current) {
            window.clearTimeout(processingTimeoutRef.current);
          }
          
          processingTimeoutRef.current = window.setTimeout(() => {
            processSpokenText(finalTranscript.trim());
          }, 2000);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast.error(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart if it was supposed to be listening
          setTimeout(() => {
            if (isListening && recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 1000);
        }
      };

      recognitionRef.current.start();
      setIsListening(true);
      toast.success('Speech recognition started');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error('Failed to start speech recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setCurrentTranscript("");
    if (processingTimeoutRef.current) {
      window.clearTimeout(processingTimeoutRef.current);
    }
    toast.info('Speech recognition stopped');
  };

  const processSpokenText = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    console.log(`Processing speech for ${jobType}:`, text);

    try {
      const aiResponse = await processSpeechForInterview(text, jobType);
      onSpeechProcessed(text, aiResponse);
      toast.success('Speech processed successfully');
    } catch (error) {
      console.error('Error processing speech:', error);
      toast.error('Failed to process speech');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Real-Time Speech Processor</h3>
        <Button
          variant={isListening ? "destructive" : "default"}
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
        >
          {isListening ? (
            <>
              <MicOff className="mr-2 h-4 w-4" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="mr-2 h-4 w-4" />
              Start Listening
            </>
          )}
        </Button>
      </div>

      {currentTranscript && (
        <div className="p-3 bg-white rounded border">
          <p className="text-sm text-gray-600 mb-1">Current Speech:</p>
          <p className="text-sm">{currentTranscript}</p>
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          Processing speech for {jobType} interview...
        </div>
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
