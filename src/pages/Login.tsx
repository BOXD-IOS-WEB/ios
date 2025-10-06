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
import { checkUsernameAvailable } from '@/services/auth';
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
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUsernameChange = async (value: string) => {
    setUsername(value);
    setUsernameError('');

    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError('Username can only contain letters, numbers, and underscores');
      return;
    }

    setCheckingUsername(true);
    try {
      const available = await checkUsernameAvailable(value);
      if (!available) {
        setUsernameError('Username is already taken');
      }
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp && usernameError) {
      toast({
        title: 'Error',
        description: usernameError,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await signUp(email, password, name, username);
        toast({
          title: 'Account created successfully!',
          description: 'Please check your email to verify your account.',
        });
        navigate('/onboarding');
      } else {
        const user = await signIn(email, password);
        toast({ title: 'Welcome back!' });

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        if (!userDoc.exists() || !userData?.onboardingCompleted) {
          navigate('/onboarding');
        } else {
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-foreground">BOX</span>
            <span className="text-racing-red">BOXD</span>
          </h1>
          <p className="text-muted-foreground">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  required
                  placeholder="username"
                  className={usernameError ? 'border-red-500' : ''}
                />
                {checkingUsername && (
                  <p className="text-xs text-muted-foreground">Checking availability...</p>
                )}
                {usernameError && (
                  <p className="text-xs text-red-500">{usernameError}</p>
                )}
                {username && !usernameError && !checkingUsername && username.length >= 3 && (
                  <p className="text-xs text-green-500">Username is available!</p>
                )}
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-muted-foreground hover:text-foreground block w-full"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>

          {!isSignUp && (
            <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
              <DialogTrigger asChild>
                <button className="text-sm text-racing-red hover:underline">
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
      </Card>
    </div>
  );
};

export default Login;
