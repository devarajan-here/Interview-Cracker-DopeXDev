
import { generateAnswer } from './apiService';

export const createJobSpecificPrompt = (jobType: string, spokenText: string): string => {
  const basePrompt = `I need an assistant for a ${jobType} job interview. 
  
Context: This is a real-time interview assistance system. The user is in an interview for a ${jobType} position.

Spoken text from interview: "${spokenText}"

Please provide:
1. A concise, professional response suggestion for the candidate
2. Key points they should mention for this ${jobType} role
3. Any technical terms or concepts relevant to ${jobType} they might want to include

Keep the response brief, actionable, and specifically tailored for a ${jobType} interview. Focus on helping the candidate give a strong, relevant answer.`;

  return basePrompt;
};

export const processSpeechForInterview = async (
  spokenText: string, 
  jobType: string
): Promise<string> => {
  if (!spokenText.trim() || !jobType.trim()) {
    return "Please select a job type and speak clearly.";
  }

  try {
    const jobSpecificPrompt = createJobSpecificPrompt(jobType, spokenText);
    const response = await generateAnswer(jobSpecificPrompt);
    return response;
  } catch (error) {
    console.error("Error processing speech for interview:", error);
    return "Error processing your request. Please try again.";
  }
};
