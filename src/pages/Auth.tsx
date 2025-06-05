
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
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
      setEmail(details.email);
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

        // Check if user has verified payment
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

    // Check for payment verification or admin status
    const storedDetails = localStorage.getItem('payment_customer_details');
    const isAdmin = email === ADMIN_EMAIL;
    
    if (!isAdmin && !paymentVerified && !storedDetails) {
      toast.error("Please complete payment first");
      navigate('/payment');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email: email,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Update profile to mark payment as verified
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

        toast.success(isAdmin ? "Admin account created successfully!" : "Account created successfully! Welcome!");
        navigate('/live-interview');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // If user already exists, try to sign them in
      if (error.message?.includes('already registered')) {
        toast.info("Email already registered. Trying to sign you in...");
        
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) throw signInError;

          if (signInData.user) {
            // Update profile to mark payment as verified for existing users
            const { error: profileError } = await supabase
              .from('profiles')
              .update({
                payment_verified: true,
                subscription_status: 'active'
              })
              .eq('id', signInData.user.id);

            if (profileError) {
              console.error('Profile update error:', profileError);
            }

            // Clear stored payment details
            localStorage.removeItem('payment_customer_details');

            toast.success("Welcome back! Payment verified successfully.");
            navigate('/live-interview');
          }
        } catch (signInError: any) {
          toast.error("Please try signing in with your existing password");
        }
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

        // Check payment status for regular users
        const { data: profile } = await supabase
          .from('profiles')
          .select('payment_verified, subscription_status')
          .eq('id', data.user.id)
          .single();

        if (!profile || !profile.payment_verified || profile.subscription_status !== 'active') {
          toast.error("Payment verification required. Please complete payment.");
          await supabase.auth.signOut();
          navigate('/payment');
          return;
        }

        toast.success("Welcome back!");
        navigate('/live-interview');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">AI Interview Assistant</CardTitle>
          <CardDescription>
            {paymentVerified || localStorage.getItem('payment_customer_details') ? 
              "Complete your account setup" : 
              "Sign in to your account"
            }
          </CardDescription>
          {(paymentVerified || localStorage.getItem('payment_customer_details')) && (
            <div className="flex items-center justify-center mt-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              Payment verified successfully!
            </div>
          )}
        </CardHeader>

        <CardContent>
          <Tabs defaultValue={paymentVerified || localStorage.getItem('payment_customer_details') ? "signup" : "signin"} className="space-y-4">
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
                    disabled={paymentVerified || !!localStorage.getItem('payment_customer_details')}
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
                  Create Account
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {!paymentVerified && !localStorage.getItem('payment_customer_details') && (
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
