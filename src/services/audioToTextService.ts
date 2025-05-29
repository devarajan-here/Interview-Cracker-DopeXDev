
// Service for converting audio to text using Whisper API or similar
export interface AudioToTextResponse {
  text: string;
  confidence?: number;
}

export const convertAudioToText = async (audioBlob: Blob): Promise<string> => {
  try {
    // Convert blob to base64 for API transmission
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    // For now, using a mock response - you can replace this with actual API calls
    // Example implementations for different APIs:
    
    // Option 1: OpenAI Whisper API (requires API key)
    // return await callOpenAIWhisper(base64Audio);
    
    // Option 2: Free Whisper API service
    // return await callFreeWhisperAPI(audioBlob);
    
    // Mock response for testing
    console.log('Audio blob size:', audioBlob.size, 'bytes');
    console.log('Audio type:', audioBlob.type);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return "This is a mock transcription. Please implement your preferred speech-to-text API.";
    
  } catch (error) {
    console.error('Error converting audio to text:', error);
    throw new Error('Failed to convert audio to text');
  }
};

// Example OpenAI Whisper implementation (uncomment and use with API key)
/*
const callOpenAIWhisper = async (base64Audio: string): Promise<string> => {
  const formData = new FormData();
  const audioBlob = base64ToBlob(base64Audio, 'audio/webm');
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
};
*/

// Example free API implementation (replace with actual free service)
/*
const callFreeWhisperAPI = async (audioBlob: Blob): Promise<string> => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  const response = await fetch('https://whisperapi.com/api/transcribe', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Free Whisper API request failed');
  }

  const result = await response.json();
  return result.transcription || result.text || '';
};
*/

const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};
