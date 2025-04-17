
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { PlusCircle, Code, UserRound, Clock, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import PracticeCard from "@/components/PracticeCard";

const Index = () => {
  const [recentPractices, setRecentPractices] = useState([
    {
      id: 1,
      title: "React Hooks Interview",
      type: "coding" as const,
      date: "2 days ago",
      questions: 5,
      completed: true
    },
    {
      id: 2,
      title: "Leadership Experience",
      type: "behavioral" as const,
      date: "1 week ago",
      questions: 8,
      completed: false
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Interview Buddy</h1>
          <Button variant="outline">Sign In</Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Master Your Interview Skills with AI</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Practice coding and behavioral questions with personalized feedback to boost your confidence.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              <Link to="/live-interview">
                <Mic className="mr-2" />
                Try Live Interview
              </Link>
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button size="lg" variant="secondary">
                  <PlusCircle className="mr-2" />
                  Start New Practice
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Choose Practice Type</SheetTitle>
                  <SheetDescription>
                    Select the type of interview practice you want to start.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                  <Button variant="outline" className="h-24 justify-start gap-4" asChild>
                    <Link to="/live-interview">
                      <Code size={24} />
                      <div className="text-left">
                        <h3 className="font-medium">Coding Interview</h3>
                        <p className="text-sm text-muted-foreground">Practice algorithms and technical questions</p>
                      </div>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-24 justify-start gap-4" asChild>
                    <Link to="/live-interview">
                      <UserRound size={24} />
                      <div className="text-left">
                        <h3 className="font-medium">Behavioral Interview</h3>
                        <p className="text-sm text-muted-foreground">Work on your soft skills and situational questions</p>
                      </div>
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </section>

      {/* Recent Practice Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-800">Recent Practice Sessions</h3>
          <Button variant="ghost" size="sm" className="text-indigo-600">
            <Clock className="mr-2 h-4 w-4" /> View All
          </Button>
        </div>

        {recentPractices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPractices.map((practice) => (
              <PracticeCard key={practice.id} practice={practice} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">You haven't started any practice sessions yet.</p>
            <p className="text-gray-500 text-sm mt-2">
              Click "Start New Practice" to begin your interview preparation.
            </p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-semibold text-gray-800 text-center mb-12">Why Practice With Us</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Code className="text-indigo-600 h-8 w-8" />
              </div>
              <h4 className="text-xl font-medium mb-3">Technical Interviews</h4>
              <p className="text-gray-600">
                Practice coding challenges with real-time feedback and hints to improve your solutions.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <UserRound className="text-purple-600 h-8 w-8" />
              </div>
              <h4 className="text-xl font-medium mb-3">Behavioral Questions</h4>
              <p className="text-gray-600">
                Refine your responses to common behavioral questions with AI-powered feedback.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="text-blue-600 h-8 w-8" />
              </div>
              <h4 className="text-xl font-medium mb-3">Track Progress</h4>
              <p className="text-gray-600">
                Monitor your improvement over time with detailed performance analytics.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 Interview Buddy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
