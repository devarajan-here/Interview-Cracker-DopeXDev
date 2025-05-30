
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, UserRound, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface PracticeCardProps {
  title: string;
  description: string;
}

const PracticeCard: React.FC<PracticeCardProps> = ({ title, description }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-0">
        <div className="px-6 py-4 bg-indigo-50">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <Code className="text-indigo-600 mr-2" size={18} />
              <span className="text-sm font-medium">Practice</span>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-4 border-t border-gray-100">
        <Button variant="default" className="w-full" asChild>
          <Link to="/payment">
            Get Started
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PracticeCard;
