
// Service for converting audio to text using Whisper API or similar
export interface AudioToTextResponse {
  text: string;
  confidence?: number;
}

export const convertAudioToText = async (audioBlob: Blob): Promise<string> => {
  try {
    console.log('Converting audio to text - blob size:', audioBlob.size, 'bytes');
    console.log('Audio type:', audioBlob.type);
    
    // For now, we'll simulate transcription with empty response to stop auto-generation
    // In production, you would implement actual speech-to-text API here
    
    // Check if audio blob is too small (likely silence)
    if (audioBlob.size < 1000) {
      console.log('Audio blob too small, likely silence');
      return "";
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return empty string to stop auto-generating mock transcriptions
    // This will be replaced with actual speech-to-text service later
    console.log('Simulated transcription - returning empty to stop auto-generation');
    return "";
    
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
