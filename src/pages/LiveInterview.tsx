import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";
import { generateAnswer, getApiKey, setApiKey } from "@/services/apiService";
import ApiKeyForm from "@/components/ApiKeyForm";
import ScreenShare from "@/components/ScreenShare";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const LiveInterview = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [aiAssistance, setAIAssistance] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(!getApiKey());

  const handleScreenCapture = (capturedText: string) => {
    setQuestion(prev => {
      const updatedText = prev ? `${prev}\n${capturedText}` : capturedText;
      return updatedText;
    });
  };

  const handleAIAssistance = (suggestion: string) => {
    setAIAssistance(suggestion);
    toast.info("AI Assistance", {
      description: suggestion,
      duration: 5000,
    });
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question first.");
      return;
    }

    if (!getApiKey()) {
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    setAnswer("");
    
    try {
      const response = await generateAnswer(question);
      setAnswer(response);
    } catch (error) {
      console.error("Error generating answer:", error);
    } finally {
      setIsLoading(false);
      setQuestion("");
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
            <h1 className="text-2xl font-bold text-gray-900">Screen Interview Assistant</h1>
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
          <h2 className="text-xl font-semibold mb-4">LockedIn AI Interview Assistant</h2>
          
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <ScreenShare 
                onScreenCapture={handleScreenCapture} 
                onAIAssist={handleAIAssistance}
              />
              
              <div className="relative flex-grow">
                <Textarea 
                  value={question} 
                  onChange={(e) => setQuestion(e.target.value)} 
                  placeholder="Captured text will appear here..." 
                  className="min-h-[100px] w-full"
                />
              </div>
            </div>
            
            {aiAssistance && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">AI Assistance</h3>
                <p className="text-blue-800">{aiAssistance}</p>
              </div>
            )}
            
            <div className="flex gap-4">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Or type your question here..."
                className="flex-grow"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <Button onClick={handleSubmit} disabled={isLoading || !question}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send
              </Button>
            </div>
            
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
