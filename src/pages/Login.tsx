import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth as firebaseAuth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await signUp(email, password, name);
        toast({
          title: 'Account created successfully!',
          description: 'Please check your email to verify your account.',
        });
        navigate('/onboarding');
      } else {
        console.log('[Login] Starting sign in...');
        const user = await signIn(email, password);
        console.log('[Login] Sign in successful, user:', user?.uid);

        if (!user) {
          throw new Error('Sign in failed - no user returned');
        }

        toast({ title: 'Welcome back!' });

        console.log('[Login] Fetching user document...');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        console.log('[Login] User document exists:', userDoc.exists());

        const userData = userDoc.data();
        console.log('[Login] User data:', userData);

        if (!userDoc.exists() || !userData?.onboardingCompleted) {
          console.log('[Login] Redirecting to onboarding');
          navigate('/onboarding');
        } else {
          console.log('[Login] Redirecting to home');
          navigate('/');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(firebaseAuth, resetEmail);
      toast({
        title: 'Password reset email sent!',
        description: 'Check your inbox for instructions to reset your password.',
      });
      setResetDialogOpen(false);
      setResetEmail('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-md md:max-w-lg lg:max-w-xl p-6 md:p-10 lg:p-12 space-y-6 md:space-y-8">
        <div className="text-center space-y-2 md:space-y-3">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">
            <span className="text-foreground">BOX</span>
            <span className="text-racing-red">BOXD</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {isSignUp && (
            <div className="space-y-2 md:space-y-3">
              <label className="text-sm md:text-base font-medium">Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="md:h-12 md:text-base"
              />
            </div>
          )}

          <div className="space-y-2 md:space-y-3">
            <label className="text-sm md:text-base font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="md:h-12 md:text-base"
            />
          </div>

          <div className="space-y-2 md:space-y-3">
            <label className="text-sm md:text-base font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="md:h-12 md:text-base"
            />
          </div>

          <Button type="submit" className="w-full md:h-12 md:text-base md:mt-4" disabled={loading}>
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center space-y-3 md:space-y-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm md:text-base text-muted-foreground hover:text-foreground block w-full py-2"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>

          {!isSignUp && (
            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <DialogTrigger asChild>
                <button className="text-sm md:text-base text-racing-red hover:underline py-2">
                  Forgot password?
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePasswordReset} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setResetDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={resetLoading}>
                      {resetLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-3">
          <div className="flex flex-wrap justify-center gap-3 text-xs sm:text-sm">
            <a href="/support" className="text-muted-foreground hover:text-racing-red transition-colors">
              Support
            </a>
            <span className="text-muted-foreground">•</span>
            <a href="/privacy-policy" className="text-muted-foreground hover:text-racing-red transition-colors">
              Privacy Policy
            </a>
            <span className="text-muted-foreground">•</span>
            <a href="/terms-of-service" className="text-muted-foreground hover:text-racing-red transition-colors">
              Terms of Service
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2025 BoxBoxd. All rights reserved.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
