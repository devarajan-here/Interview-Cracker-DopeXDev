
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Key, Eye, EyeOff } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SecureApiKeyFormProps {
  onSave: () => void;
}

const SecureApiKeyForm = ({ onSave }: SecureApiKeyFormProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const { user } = useAuth();

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setIsLoading(true);

    try {
      // Save API key securely via edge function
      const { data, error } = await supabase.functions.invoke('save-api-key', {
        body: {
          service_name: 'openrouter',
          api_key: apiKey
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success("API key saved securely!");
        setApiKey("");
        onSave();
      } else {
        throw new Error(data.error || 'Failed to save API key');
      }
    } catch (error: any) {
      console.error('API key save error:', error);
      toast.error(error.message || "Failed to save API key");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="h-5 w-5 mr-2" />
          API Key Configuration
        </CardTitle>
        <CardDescription>
          Your API key is encrypted and stored securely. It's never exposed to the frontend.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="apikey">OpenRouter API Key</Label>
          <div className="relative">
            <Input
              id="apikey"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenRouter API key"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save API Key Securely
        </Button>

        <p className="text-xs text-gray-500">
          Your API key is encrypted using AES-256 encryption and stored securely in our database.
          It's only accessible by you and used server-side for API calls.
        </p>
      </CardContent>
    </Card>
  );
};

export default SecureApiKeyForm;
