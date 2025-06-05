
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CreditCard, Shield, CheckCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !name || !phone) {
      toast.error("Please fill all required fields");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      console.log('Initiating payment process...');
      
      // Store customer details in localStorage for after payment verification
      localStorage.setItem('payment_customer_details', JSON.stringify({
        name,
        email,
        phone,
        payment_initiated: true,
        timestamp: Date.now()
      }));

      // Create the return URL for after payment
      const returnUrl = `${window.location.origin}/auth?payment_success=true&email=${encodeURIComponent(email)}`;
      
      // Add return URL as a parameter to the Razorpay payment link
      const paymentUrl = `https://pages.razorpay.com/pl_Qbn1Dc0OBKEhgl/view?redirect_url=${encodeURIComponent(returnUrl)}`;
      
      toast.success("Redirecting to payment gateway...");
      
      // Redirect to payment with return URL
      window.location.href = paymentUrl;
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Failed to initiate payment. Please try again.");
      setIsLoading(false);
    }
  };

  // Check if user is returning from payment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const paymentId = urlParams.get('payment_id');
    
    if (paymentSuccess === 'true' || paymentId) {
      console.log('Payment success detected, redirecting to auth...');
      const storedDetails = localStorage.getItem('payment_customer_details');
      
      if (storedDetails) {
        const details = JSON.parse(storedDetails);
        navigate(`/auth?payment_verified=true&email=${encodeURIComponent(details.email)}`);
      } else {
        navigate('/auth?payment_verified=true');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            AI Interview Assistant
          </CardTitle>
          <CardDescription>
            Secure your access with our monthly subscription
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Price Display */}
          <div className="text-center p-6 bg-blue-50 rounded-lg border">
            <div className="text-3xl font-bold text-blue-600">₹70</div>
            <div className="text-gray-600">per month</div>
            <div className="flex items-center justify-center mt-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              Real-time AI assistance
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit phone number"
                maxLength={10}
                required
              />
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Shield className="h-4 w-4 mr-2 text-green-600" />
            Secured by Razorpay
          </div>

          {/* Payment Button */}
          <Button 
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Redirecting...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Pay ₹70 & Continue
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By proceeding, you agree to our terms of service and privacy policy.
            After payment, you'll be redirected back to create your account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payment;
