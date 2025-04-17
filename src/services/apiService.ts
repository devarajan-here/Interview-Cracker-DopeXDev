
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
};

export const getApiKey = () => {
  return apiKey;
};

export const generateAnswer = async (question: string): Promise<string> => {
  if (!apiKey) {
    toast.error("OpenRouter API key is not set. Please add your API key in the settings.");
    return "Please set your API key first to use this feature.";
  }

  try {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: "You are an expert interviewer providing concise, helpful responses to interview questions. Format your answers with markdown for clarity when appropriate."
      },
      {
        role: "user",
        content: question
      }
    ];

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.href,
        "X-Title": "Interview Buddy"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Sorry, I couldn't generate an answer.";
  } catch (error) {
    console.error("Error generating answer:", error);
    toast.error(`Failed to get response: ${error instanceof Error ? error.message : "Unknown error"}`);
    return "Sorry, there was an error generating a response. Please try again.";
  }
};
