
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, CheckCircle, Info } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paymentVerified = searchParams.get('payment_verified') === 'true';
  const prefilledEmail = searchParams.get('email') || '';
  const isEmailConfirmed = searchParams.get('confirmed') === 'true';

  // Admin credentials
  const ADMIN_EMAIL = 'draxmoon01@gmail.com';

  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }

    // Check stored payment details
    const storedDetails = localStorage.getItem('payment_customer_details');
    if (storedDetails && !prefilledEmail) {
      const details = JSON.parse(storedDetails);
      if (details.payment_completed && details.payment_id) {
        setEmail(details.email);
      }
    }

    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is admin - bypass payment verification
        if (session.user.email === ADMIN_EMAIL) {
          console.log('Admin user detected, bypassing payment check');
          navigate('/live-interview');
          return;
        }

        // For regular users, check if they have access
        const { data: profile } = await supabase
          .from('profiles')
          .select('payment_verified, subscription_status')
          .eq('id', session.user.id)
          .single();

        if (profile && profile.payment_verified && profile.subscription_status === 'active') {
          navigate('/live-interview');
        }
      }
    };

    checkAuth();
  }, [navigate, prefilledEmail]);

  const validateForm = (isSignUp: boolean) => {
    if (!email || !password) {
      toast.error("Please fill all required fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    if (isSignUp && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm(true)) return;

    // Check for payment verification
    const storedDetails = localStorage.getItem('payment_customer_details');
    const isAdmin = email === ADMIN_EMAIL;
    
    if (!isAdmin && !paymentVerified && (!storedDetails || !JSON.parse(storedDetails).payment_completed || !JSON.parse(storedDetails).payment_id)) {
      toast.error("Please complete payment verification first");
      navigate('/payment');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Creating account with payment verification...');
      
      // Create account with email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?confirmed=true&email=${encodeURIComponent(email)}`,
          data: {
            email: email,
            payment_verified: true
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Update profile to mark payment as verified immediately
        console.log('Updating user profile with payment verification...');
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            payment_verified: true,
            subscription_status: 'active'
          })
          .eq('id', data.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
        }

        // Clear stored payment details after successful account creation
        localStorage.removeItem('payment_customer_details');

        if (data.user.email_confirmed_at) {
          // User email is already confirmed
          toast.success("Account created successfully! You now have access to the AI Interview Assistant.");
          navigate('/live-interview');
        } else {
          // Email confirmation required
          toast.success("Account created! Please check your email and click the confirmation link.");
          toast.info("After confirming your email, you'll be redirected back here to sign in.");
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      if (error.message?.includes('already registered')) {
        toast.info("Email already registered. Please sign in with your existing password.");
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!validateForm(false)) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user is admin - bypass payment verification
        if (data.user.email === ADMIN_EMAIL) {
          console.log('Admin login successful');
          toast.success("Welcome back, Admin!");
          navigate('/live-interview');
          return;
        }

        // For regular users, check payment status
        const { data: profile } = await supabase
          .from('profiles')
          .select('payment_verified, subscription_status')
          .eq('id', data.user.id)
          .single();

        // Check if user's email is confirmed and they have verified payment
        if (data.user.email_confirmed_at && profile && profile.payment_verified && profile.subscription_status === 'active') {
          toast.success("Welcome back! You now have access to the AI Interview Assistant.");
          navigate('/live-interview');
        } else if (!data.user.email_confirmed_at) {
          toast.error("Please confirm your email first. Check your inbox for the confirmation link.");
          await supabase.auth.signOut();
        } else {
          toast.error("Payment verification required. Please complete payment first.");
          await supabase.auth.signOut();
          navigate('/payment');
        }
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has payment details stored with payment ID
  const hasStoredPayment = localStorage.getItem('payment_customer_details');
  const hasCompletedPayment = hasStoredPayment && JSON.parse(hasStoredPayment).payment_completed && JSON.parse(hasStoredPayment).payment_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">AI Interview Assistant</CardTitle>
          <CardDescription>
            {paymentVerified || hasCompletedPayment ? 
              "Complete your account setup" : 
              isEmailConfirmed ?
              "Welcome back! Please sign in" :
              "Sign in to your account"
            }
          </CardDescription>
          {(paymentVerified || hasCompletedPayment) && (
            <div className="flex items-center justify-center mt-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              Payment verified successfully!
            </div>
          )}
          {isEmailConfirmed && (
            <div className="flex items-center justify-center mt-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              Email confirmed! Please sign in below.
            </div>
          )}
          {hasCompletedPayment && !paymentVerified && (
            <div className="flex items-center justify-center mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
              <Info className="h-4 w-4 mr-1" />
              Payment verified! Create your account below to access the service.
            </div>
          )}
        </CardHeader>

        <CardContent>
          <Tabs defaultValue={paymentVerified || hasCompletedPayment ? "signup" : (isEmailConfirmed ? "signin" : "signin")} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button onClick={handleSignIn} disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Sign In
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={paymentVerified || !!hasCompletedPayment}
                  />
                </div>

                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password (min 6 characters)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                  />
                </div>

                <Button onClick={handleSignUp} disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Account & Access Service
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {!paymentVerified && !hasCompletedPayment && !isEmailConfirmed && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have a subscription?{" "}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/payment')}>
                  Start with payment
                </Button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
