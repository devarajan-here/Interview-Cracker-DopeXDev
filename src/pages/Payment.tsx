
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CreditCard, Shield, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Payment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  // Using live Razorpay credentials
  const RAZORPAY_KEY_ID = 'rzp_live_zwZIrpd1jClmwz';

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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
      // Create order via Supabase Edge Function
      const orderResponse = await fetch(`https://xemlhjvuqxxyswyzyozy.supabase.co/functions/v1/create-payment-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbWxoanZ1cXh4eXN3eXp5b3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjA2MDMsImV4cCI6MjA2NDA5NjYwM30.URA-BboCjVoSjRctpakFJ7CH1A_WwTF_Br7rRKUyKIs`
        },
        body: JSON.stringify({
          amount: 7000, // ₹70 in paise
          currency: 'INR',
          customer_details: {
            name,
            email,
            contact: phone
          }
        }),
      });

      const orderData = await orderResponse.json();
      console.log('Order response:', orderData);

      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Configure Razorpay options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'AI Interview Assistant',
        description: 'Monthly Subscription - ₹70',
        order_id: orderData.order.id,
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: {
          color: '#3B82F6',
        },
        handler: async (response: any) => {
          // Verify payment via Supabase Edge Function
          try {
            console.log('Payment successful, verifying...', response);
            
            const verifyResponse = await fetch(`https://xemlhjvuqxxyswyzyozy.supabase.co/functions/v1/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbWxoanZ1cXh4eXN3eXp5b3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjA2MDMsImV4cCI6MjA2NDA5NjYwM30.URA-BboCjVoSjRctpakFJ7CH1A_WwTF_Br7rRKUyKIs`
              },
              body: JSON.stringify({
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature,
                customer_details: { name, email, phone }
              }),
            });

            const verifyData = await verifyResponse.json();
            console.log('Verification response:', verifyData);
            
            if (verifyData.success) {
              toast.success("Payment successful! Redirecting to sign in...");
              // Clear form and redirect to auth page
              setEmail("");
              setName("");
              setPhone("");
              setTimeout(() => {
                navigate('/auth?payment_verified=true&email=' + encodeURIComponent(email));
              }, 2000);
            } else {
              toast.error("Payment verification failed. Please contact support.");
              console.error('Verification failed:', verifyData);
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            setIsLoading(false);
          },
          escape: false,
          confirm_close: true
        }
      };

      console.log('Opening Razorpay with options:', options);
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setIsLoading(false);
      });

      rzp.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Failed to initiate payment. Please try again.");
      setIsLoading(false);
    }
  };

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
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Pay ₹70 & Continue
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By proceeding, you agree to our terms of service and privacy policy.
            You'll be redirected to create your account after successful payment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payment;
