
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();

  // Admin email with bypass access
  const ADMIN_EMAIL = 'draxmoon01@gmail.com';

  useEffect(() => {
    const verifyAccess = async () => {
      if (isLoading) return;

      if (!user) {
        navigate('/payment');
        return;
      }

      try {
        // Check if user is admin - bypass payment verification
        if (user.email === ADMIN_EMAIL) {
          console.log('Admin access granted for:', user.email);
          setHasAccess(true);
          setIsVerifying(false);
          return;
        }

        // Check if user has verified payment and active subscription
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('payment_verified, subscription_status')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Profile fetch error:', error);
          navigate('/payment');
          return;
        }

        if (!profile || !profile.payment_verified || profile.subscription_status !== 'active') {
          navigate('/payment');
          return;
        }

        setHasAccess(true);
      } catch (error) {
        console.error('Access verification error:', error);
        navigate('/payment');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAccess();
  }, [user, isLoading, navigate]);

  if (isLoading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
