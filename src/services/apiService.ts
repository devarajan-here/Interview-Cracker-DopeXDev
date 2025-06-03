
import { toast } from "sonner";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Initialize API key from localStorage if available
let apiKey = localStorage.getItem("openrouter_api_key") || ""; 

export const setApiKey = (key: string) => {
  apiKey = key;
  console.log('API key updated in apiService');
};

export const getApiKey = () => {
  return apiKey;
};

export const generateAnswer = async (question: string): Promise<string> => {
  console.log('Generating answer for question:', question.substring(0, 100) + '...');
  
  if (!apiKey) {
    console.error('No API key available');
    toast.error("OpenRouter API key is not set. Please add your API key in the settings.");
    return "Please set your API key first to use this feature.";
  }

  try {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: "You are an expert interview coach providing concise, helpful responses to interview questions. Keep responses under 150 words and focus on actionable advice. Format your answers clearly."
      },
      {
        role: "user",
        content: question
      }
    ];

    console.log('Making API request to OpenRouter...');

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.href,
        "X-Title": "AI Interview Assistant"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages,
        temperature: 0.7,
        max_tokens: 300
      })
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error:', errorData);
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content || "Sorry, I couldn't generate an answer.";
    
    console.log('AI response received successfully');
    return result;
  } catch (error) {
    console.error("Error generating answer:", error);
    toast.error(`Failed to get AI response: ${error instanceof Error ? error.message : "Unknown error"}`);
    return "Sorry, there was an error generating a response. Please check your API key and try again.";
  }
};
