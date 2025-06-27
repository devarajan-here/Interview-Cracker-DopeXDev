
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Settings, LogOut } from "lucide-react";
import { toast } from "sonner";
import { generateAnswer, getApiKey } from "@/services/apiService";
import ScreenShare from "@/components/ScreenShare";
import JobSelector from "@/components/JobSelector";
import MicrophoneSelector from "@/components/MicrophoneSelector";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import ApiKeyForm from "@/components/ApiKeyForm";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const LiveInterview = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedMicId, setSelectedMicId] = useState("");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleScreenCapture = (capturedText: string) => {
    setQuestion(prev => {
      const updatedText = prev ? `${prev}\n${capturedText}` : capturedText;
      return updatedText;
    });
  };

  const handleClearCapturedText = () => {
    setQuestion("");
    // Optionally, add a toast notification if desired, e.g.:
    // toast.info("Captured text cleared");
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast.error("Please enter a question first.");
      return;
    }

    if (!getApiKey()) {
      toast.error("API key is not configured. Please contact administrator.");
      return;
    }

    setIsLoading(true);
    setAnswer("");
    
    try {
      const response = await generateAnswer(question, selectedJob);
      setAnswer(response);
    } catch (error) {
      console.error("Error generating answer:", error);
    } finally {
      setIsLoading(false);
      setQuestion("");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">AI Interview Assistant</h1>
            {user && (
              <span className="ml-4 text-sm text-gray-600">
                Welcome, {user.email}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Sheet open={showSettings} onOpenChange={setShowSettings}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col h-full"> {/* New wrapper */}
                  <SheetHeader>
                    <SheetTitle>Account Settings</SheetTitle>
                    <SheetDescription>
                      Manage your account settings and security.
                    </SheetDescription>
                  </SheetHeader>

                  <ScrollArea className="flex-1">
                    <div className="p-4"> {/* This div holds the actual form content */}
                      <div>
                        <h4 className="text-md font-semibold mb-3 text-gray-800">Change Password</h4>
                        <ChangePasswordForm onSave={() => setShowSettings(false)} />
                      </div>
                      <hr className="my-6 border-gray-200" />
                      <div>
                        <h4 className="text-md font-semibold mb-3 text-gray-800">OpenRouter API Key</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Manage your OpenRouter API key to enable AI-powered features.
                        </p>
                        <ApiKeyForm onSave={() => setShowSettings(false)} />
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>
            
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Controls and Input */}
          <div className="space-y-6">
            <JobSelector 
              selectedJob={selectedJob} 
              onJobChange={setSelectedJob} 
            />
            
            <MicrophoneSelector 
              selectedMicId={selectedMicId}
              onMicrophoneSelect={setSelectedMicId}
            />
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Screen & Audio Capture</h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <ScreenShare 
                    onScreenCapture={handleScreenCapture} 
                  />
                  
                  <Textarea 
                    value={question} 
                    onChange={(e) => setQuestion(e.target.value)} 
                    placeholder="Your response will appear here as you type..."
                    className="min-h-[100px]"
                  />
                  <Button
                    variant="outline"
                    onClick={handleClearCapturedText}
                    className="self-start"
                  >
                    Clear Captured Text
                  </Button>
                </div>
                
                <div className="flex gap-4">
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type your response to the interviewer here..."
                    className="flex-grow"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                  <Button onClick={handleSubmit} disabled={isLoading || !question}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Responses */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">AI Response</h3>
              <div className="border rounded-lg p-4 min-h-[200px] bg-gray-50">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <span className="ml-2 text-gray-500">Generating response...</span>
                  </div>
                ) : answer ? (
                  <div className="prose max-w-none">
                    {answer.split('\n').map((line, index) => (
                      <p key={index} className="mb-2">{line}</p>
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
