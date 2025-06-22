import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (!formData.agreeToTerms) {
      return;
    }

    setIsLoading(true);
    
    const { error } = await signUp(formData.email, formData.password, formData.name);
    
    setIsLoading(false);
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-lingo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-lingo-200/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl -z-10"></div>
      
      {/* Back button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center space-x-2 text-slate-600 hover:text-lingo-600 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back home</span>
      </Link>

      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-lingo-500 to-lingo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white font-bold text-xl">LC</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Join LingoConnect
          </CardTitle>
          <CardDescription className="text-lg text-slate-600">
            Create your account and start practicing languages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            variant="outline" 
            className="w-full py-6 text-base border-2 hover:border-lingo-300 hover:bg-lingo-50 transition-all duration-300 rounded-xl"
            onClick={handleGoogleSignup}
            disabled={isLoading}
          >
            <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
          
          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white px-4 text-sm text-slate-500">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="h-12 text-base rounded-xl border-2 focus:border-lingo-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="h-12 text-base rounded-xl border-2 focus:border-lingo-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-medium">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="h-12 text-base rounded-xl border-2 focus:border-lingo-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                className="h-12 text-base rounded-xl border-2 focus:border-lingo-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                className="h-12 text-base rounded-xl border-2 focus:border-lingo-400"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed">
                I agree to the{' '}
                <Link to="/terms" className="text-lingo-600 hover:text-lingo-700 hover:underline font-semibold">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-lingo-600 hover:text-lingo-700 hover:underline font-semibold">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-lingo-500 to-lingo-600 hover:from-lingo-600 hover:to-lingo-700 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-slate-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-lingo-600 hover:text-lingo-700 hover:underline font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
