
interface StreamingResponseProps {
  response: string;
  isStreaming: boolean;
  isRecording: boolean;
}

const StreamingResponse = ({ response, isStreaming, isRecording }: StreamingResponseProps) => {
  if (!response && !isStreaming) return null;

  return (
    <div className="p-4 bg-blue-50 rounded border-l-4 border-blue-500">
      <div className="flex items-center mb-2">
        <h4 className="text-sm font-semibold text-blue-800">AI Interview Assistant</h4>
        {isStreaming && (
          <div className="ml-2 flex items-center">
            <div className="animate-pulse rounded-full h-2 w-2 bg-blue-600 mr-1"></div>
            <span className="text-xs text-blue-600">Responding...</span>
          </div>
        )}
      </div>
      
      <div className="text-sm text-blue-900 leading-relaxed">
        {response.split('\n').map((line, index) => (
          <p key={index} className="mb-2">
            {line}
            {isStreaming && index === response.split('\n').length - 1 && (
              <span className="animate-pulse">|</span>
            )}
          </p>
        ))}
      </div>
      
      {isRecording && !isStreaming && response && (
        <div className="mt-3 text-xs text-blue-600 italic">
          Keep speaking for more assistance...
        </div>
      )}
    </div>
  );
};

export default StreamingResponse;
