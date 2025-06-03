
// Service for converting audio to text using Whisper API or similar
export interface AudioToTextResponse {
  text: string;
  confidence?: number;
}

export const convertAudioToText = async (audioBlob: Blob): Promise<string> => {
  try {
    console.log('Converting audio to text - blob size:', audioBlob.size, 'bytes');
    console.log('Audio type:', audioBlob.type);
    
    // For now, we'll simulate transcription but add better mock responses
    // In production, you would implement actual speech-to-text API here
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate more realistic mock transcriptions based on audio duration
    const durationEstimate = Math.max(1, Math.floor(audioBlob.size / 8000)); // Rough estimate
    
    const mockTranscriptions = [
      "Can you tell me about your experience with React?",
      "What are your strengths as a developer?", 
      "How do you handle challenging situations at work?",
      "Tell me about a project you're proud of.",
      "What motivates you in your career?",
      "How do you stay updated with new technologies?",
      "Describe your problem-solving approach.",
      "What are your career goals?",
      "How do you work in a team environment?",
      "What interests you about this position?"
    ];
    
    // Select a mock transcription based on timing
    const transcription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
    
    console.log('Mock transcription generated:', transcription);
    return transcription;
    
  } catch (error) {
    console.error('Error converting audio to text:', error);
    throw new Error('Failed to convert audio to text');
  }
};

// Helper function to convert blob to base64 (for future API implementations)
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Example OpenAI Whisper implementation (uncomment when you have API key)
/*
export const convertAudioToTextWithOpenAI = async (audioBlob: Blob): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const result = await response.json();
    return result.text || '';
  } catch (error) {
    console.error('Error with OpenAI Whisper:', error);
    throw error;
  }
};
*/
