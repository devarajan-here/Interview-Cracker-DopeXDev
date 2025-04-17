
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setApiKey, getApiKey } from "@/services/apiService";
import { toast } from "sonner";

interface ApiKeyFormProps {
  onSave?: () => void;
}

const ApiKeyForm = ({ onSave }: ApiKeyFormProps) => {
  const [apiKey, setApiKeyState] = useState(getApiKey());
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }
    
    setApiKey(apiKey);
    localStorage.setItem("openrouter_api_key", apiKey);
    toast.success("API key saved successfully");
    
    if (onSave) {
      onSave();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="api-key">OpenRouter API Key</Label>
        <div className="flex gap-2">
          <Input
            id="api-key"
            type={showKey ? "text" : "password"}
            placeholder="Enter your OpenRouter API key"
            value={apiKey}
            onChange={(e) => setApiKeyState(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? "Hide" : "Show"}
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Get your free API key from{" "}
          <a
            href="https://openrouter.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            openrouter.ai
          </a>
        </p>
      </div>
      <Button type="submit">Save API Key</Button>
    </form>
  );
};

export default ApiKeyForm;
