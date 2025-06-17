
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JobSelectorProps {
  onJobChange: (jobType: string) => void;
  selectedJob: string;
}

const JobSelector = ({ onJobChange, selectedJob }: JobSelectorProps) => {
  const [customJobInput, setCustomJobInput] = useState("");
  const [internalSelection, setInternalSelection] = useState<string>("");

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

  useEffect(() => {
    // Ensure predefinedJobs is accessible here. If it's defined outside the component, pass it in or ensure scope.
    // Assuming predefinedJobs is defined within the component scope as shown in the initial file read.
    if (predefinedJobs.includes(selectedJob)) {
      setInternalSelection(selectedJob);
      setCustomJobInput(""); // Clear custom input if a predefined job is selected/active
    } else if (selectedJob) { // This means selectedJob is a truthy value and not in predefinedJobs, so it's a custom one
      setInternalSelection("Custom");
      setCustomJobInput(selectedJob);
    } else { // selectedJob is empty (e.g., "" or null or undefined)
      setInternalSelection(""); // This will make the Select show its placeholder
      setCustomJobInput("");
    }
  }, [selectedJob, predefinedJobs]); // Now predefinedJobs is correctly in scope

  const handleDropdownValueChange = (value: string) => {
    setInternalSelection(value); // Update what the dropdown shows
    if (value === "Custom") {
      onJobChange(""); // Inform parent: no specific job selected yet, entering custom mode
      setCustomJobInput(""); // Clear custom input field for new entry
    } else {
      // It's a predefined job from the dropdown
      onJobChange(value); // Inform parent of the specific job selected
    }
  };

  const handleCustomJobSet = () => {
    if (customJobInput.trim()) {
      onJobChange(customJobInput.trim());
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="space-y-2">
        <Label htmlFor="job-type">Interview Type</Label>
        <Select value={internalSelection} onValueChange={handleDropdownValueChange}>
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
      
      {internalSelection === "Custom" && (
        <div className="space-y-2">
          <Label htmlFor="custom-job">Custom Job Title</Label>
          <div className="flex gap-2">
            <Input
              id="custom-job"
              value={customJobInput}
              onChange={(e) => setCustomJobInput(e.target.value)}
              placeholder="Enter job title (e.g., SOC Analyst)"
            />
            <Button onClick={handleCustomJobSet} disabled={!customJobInput.trim()}>
              Set
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSelector;
