
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const EmailVerified = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 5 seconds if user is authenticated
    if (user) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-lingo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Email Verified!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-lg text-slate-600">
            Your email has been successfully verified. You can now access all features of LingoConnect.
          </p>
          
          {user && (
            <p className="text-sm text-slate-500">
              You will be automatically redirected to the home page in a few seconds...
            </p>
          )}
          
          <div className="space-y-3">
            <Link to="/">
              <Button className="w-full bg-gradient-to-r from-lingo-500 to-lingo-600 hover:from-lingo-600 hover:to-lingo-700">
                Go to Home
              </Button>
            </Link>
            
            <Link to="/rooms">
              <Button variant="outline" className="w-full">
                Browse Rooms
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerified;
