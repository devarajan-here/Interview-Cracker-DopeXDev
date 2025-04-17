
/// <reference types="vite/client" />
/// <reference path="./types/speech-recognition.d.ts" />

// Ensure global Window interface includes SpeechRecognition
interface Window {
  SpeechRecognition: SpeechRecognitionStatic;
  webkitSpeechRecognition: SpeechRecognitionStatic;
}
