
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PracticeCard from "@/components/PracticeCard";
import { 
  Brain, 
  Mic, 
  Video, 
  Star, 
  ArrowRight, 
  CheckCircle, 
  Shield,
  Users,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Assistance",
      description: "Get real-time AI suggestions and answers during interviews"
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: "Voice Recognition",
      description: "Advanced speech-to-text for seamless conversation"
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Screen Capture",
      description: "Capture interview questions directly from your screen"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Your data is encrypted and never shared"
    }
  ];

  const pricing = [
    "Real-time AI interview assistance",
    "Voice and screen capture",
    "Multiple job type support",
    "Secure API key management",
    "24/7 availability"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">InterviewAI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/payment')}>
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge variant="secondary" className="mb-4">
          <Star className="h-4 w-4 mr-1" />
          AI-Powered Interview Assistant
        </Badge>
        
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Ace Your Interviews with
          <br />
          <span className="text-blue-600">AI Assistance</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Get real-time AI suggestions, practice with different job types, and boost your confidence with our intelligent interview assistant.
        </p>

        {/* Pricing Card */}
        <Card className="max-w-md mx-auto mb-8 border-2 border-blue-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="text-3xl font-bold text-blue-600">₹70</div>
            <div className="text-gray-600">per month</div>
            <CardTitle>Premium Access</CardTitle>
            <CardDescription>Everything you need to succeed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {pricing.map((feature, index) => (
              <div key={index} className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
            <Button 
              onClick={() => navigate('/payment')} 
              className="w-full mt-4"
              size="lg"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose InterviewAI?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our advanced AI technology helps you prepare and perform better in interviews
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-blue-600 mb-2 flex justify-center">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Practice Types */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Practice for Any Role</h2>
          <p className="text-gray-600">
            Specialized AI assistance for different job types and industries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PracticeCard 
            title="SOC Analyst"
            description="Cybersecurity, incident response, threat analysis"
          />
          <PracticeCard 
            title="Software Engineer"
            description="Coding, system design, technical problem solving"
          />
          <PracticeCard 
            title="Data Scientist"
            description="Analytics, machine learning, statistical modeling"
          />
          <PracticeCard 
            title="Product Manager"
            description="Strategy, roadmaps, stakeholder management"
          />
          <PracticeCard 
            title="DevOps Engineer"
            description="Infrastructure, CI/CD, cloud technologies"
          />
          <PracticeCard 
            title="And Many More"
            description="Custom job types and specialized roles"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Next Interview?</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of successful candidates who've improved their interview performance with our AI assistant
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/payment')} 
                size="lg" 
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Zap className="mr-2 h-5 w-5" />
                Start for ₹70/month
              </Button>
              <Button 
                onClick={() => navigate('/auth')} 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                <Users className="mr-2 h-5 w-5" />
                Already have an account?
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="text-center text-gray-600">
          <p>&copy; 2024 InterviewAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
