
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JobSelectorProps {
  onJobChange: (jobType: string) => void;
  selectedJob: string;
}

const JobSelector = ({ onJobChange, selectedJob }: JobSelectorProps) => {
  const [customJob, setCustomJob] = useState("");

  const predefinedJobs = [
    "SOC Analyst",
    "Software Engineer", 
    "Data Scientist",
    "Product Manager",
    "DevOps Engineer",
    "Cybersecurity Specialist",
    "Full Stack Developer",
    "Custom"
  ];

  const handleJobSelect = (value: string) => {
    if (value === "Custom") {
      // Don't set the job yet, wait for user to enter custom title
      onJobChange("");
    } else {
      onJobChange(value);
    }
  };

  const handleCustomJobSet = () => {
    if (customJob.trim()) {
      onJobChange(customJob.trim());
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="space-y-2">
        <Label htmlFor="job-type">Interview Type</Label>
        <Select value={selectedJob === customJob ? "Custom" : selectedJob} onValueChange={handleJobSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select interview type" />
          </SelectTrigger>
          <SelectContent>
            {predefinedJobs.map((job) => (
              <SelectItem key={job} value={job}>
                {job}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {(selectedJob === "Custom" || selectedJob === customJob) && (
        <div className="space-y-2">
          <Label htmlFor="custom-job">Custom Job Title</Label>
          <div className="flex gap-2">
            <Input
              id="custom-job"
              value={customJob}
              onChange={(e) => setCustomJob(e.target.value)}
              placeholder="Enter job title (e.g., SOC Analyst)"
            />
            <Button onClick={handleCustomJobSet} disabled={!customJob.trim()}>
              Set
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSelector;
