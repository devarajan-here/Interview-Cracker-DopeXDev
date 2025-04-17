
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Send, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";
import { generateAnswer, getApiKey, setApiKey } from "@/services/apiService";
import ApiKeyForm from "@/components/ApiKeyForm";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Declare missing types for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const LiveInterview = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(!getApiKey());
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Load saved API key from localStorage
    const savedApiKey = localStorage.getItem("openrouter_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    
    // Check if browser supports Web Speech API
    const SpeechRecognition: SpeechRecognitionStatic = 
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Voice recognition is not supported in your browser.");
      return;
    }
    
    // Initialize speech recognition
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    
    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      setTranscript((prev) => finalTranscript || interimTranscript);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      toast.error("There was an error with the speech recognition.");
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async () => {
    const input = transcript || question;
    if (!input.trim()) {
      toast.error("Please enter or speak a question first.");
      return;
    }

    if (!getApiKey()) {
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    setAnswer("");
    
    try {
      const response = await generateAnswer(input);
      setAnswer(response);
    } catch (error) {
      console.error("Error generating answer:", error);
    } finally {
      setIsLoading(false);
      setQuestion("");
      setTranscript("");
      if (isListening) {
        toggleListening();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" className="mr-2" asChild>
              <a href="/">← Back</a>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Live Interview Assistant</h1>
          </div>
          
          <Sheet open={showSettings} onOpenChange={setShowSettings}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>API Settings</SheetTitle>
                <SheetDescription>
                  Configure your OpenRouter API key to use the interview assistant.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <ApiKeyForm onSave={() => setShowSettings(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Ask or speak your interview question</h2>
          
          <div className="space-y-6">
            {/* Voice Input Section */}
            <div className="flex flex-col md:flex-row gap-4">
              <Button 
                variant={isListening ? "destructive" : "default"}
                className="flex-shrink-0"
                onClick={toggleListening}
              >
                {isListening ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
                {isListening ? "Stop Listening" : "Start Listening"}
              </Button>
              
              <div className="relative flex-grow">
                <Textarea 
                  value={transcript} 
                  onChange={(e) => setTranscript(e.target.value)} 
                  placeholder="Spoken text will appear here..." 
                  className={`min-h-[100px] w-full ${isListening ? 'border-purple-400' : ''}`}
                />
                {isListening && (
                  <span className="absolute bottom-2 right-2 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                  </span>
                )}
              </div>
            </div>
            
            {/* Text Input Section */}
            <div className="flex gap-4">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Or type your question here..."
                className="flex-grow"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <Button onClick={handleSubmit} disabled={isLoading || (!question && !transcript)}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send
              </Button>
            </div>
            
            {/* Answer Section */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-2">AI Response:</h3>
              <div className="border rounded-lg p-4 min-h-[200px] bg-gray-50">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <span className="ml-2 text-gray-500">Generating response...</span>
                  </div>
                ) : answer ? (
                  <div className="prose max-w-none">
                    {answer.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center mt-10">
                    Your AI-generated response will appear here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveInterview;
