
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, UserRound, CheckCircle, Clock } from "lucide-react";

interface Practice {
  id: number;
  title: string;
  type: "coding" | "behavioral";
  date: string;
  questions: number;
  completed: boolean;
}

interface PracticeCardProps {
  practice: Practice;
}

const PracticeCard: React.FC<PracticeCardProps> = ({ practice }) => {
  const { title, type, date, questions, completed } = practice;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-0">
        <div className={`px-6 py-4 ${type === "coding" ? "bg-indigo-50" : "bg-purple-50"}`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              {type === "coding" ? (
                <Code className="text-indigo-600 mr-2" size={18} />
              ) : (
                <UserRound className="text-purple-600 mr-2" size={18} />
              )}
              <span className="text-sm font-medium">
                {type === "coding" ? "Coding" : "Behavioral"}
              </span>
            </div>
            <div className="flex items-center text-gray-500 text-xs">
              <Clock size={14} className="mr-1" />
              {date}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{questions} questions</span>
            {completed && (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle size={14} className="mr-1" />
                Completed
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-4 border-t border-gray-100">
        <Button variant="default" className="w-full">
          {completed ? "Review Session" : "Continue Practice"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PracticeCard;
