import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../utils/auth';
import { Dumbbell, ArrowLeft } from 'lucide-react';

export function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        await resetPassword(email);
        setSuccess('Password reset link sent! Check your email.');
      } else if (isSignUp) {
        if (!name) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        if (!username) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        if (!/^[a-z0-9]+$/.test(username)) {
          setError('Username can only contain lowercase letters and numbers');
          setLoading(false);
          return;
        }
        await signUp(email, password, name, username);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    setIsForgotPassword(false);
    setIsSignUp(false);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setName('');
    setUsername('');
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4 relative">
      {/* Forgot Password Link - Bottom Left - Always Visible */}
      {!isForgotPassword && (
        <button
          onClick={() => {
            setIsForgotPassword(true);
            setError('');
            setSuccess('');
          }}
          className="fixed bottom-8 left-8 text-slate-400 hover:text-emerald-400 text-sm transition-colors z-50"
        >
          Forgot password?
        </button>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 mb-4">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl text-white mb-2">SPREDfit</h1>
          <p className="text-slate-400">
            {isForgotPassword ? 'Reset your password' : 'Ready to crush it?'}
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-8 backdrop-blur-sm border border-slate-700">
          {isForgotPassword && (
            <button
              onClick={handleBackToSignIn}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-300 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </button>
          )}

          <h2 className="text-2xl text-white mb-6 text-center">
            {isForgotPassword 
              ? 'Forgot Password' 
              : isSignUp 
              ? 'Create Account' 
              : 'Welcome Back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isForgotPassword && isSignUp && (
              <>
                <div>
                  <Label htmlFor="name" className="text-slate-300">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="John Smith"
                    required={isSignUp}
                  />
                </div>
                
                <div>
                  <Label htmlFor="username" className="text-slate-300">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="johnsmith"
                    required={isSignUp}
                  />
                  <p className="text-slate-500 text-xs mt-1">Lowercase letters and numbers only</p>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white"
                placeholder="you@example.com"
                required
              />
            </div>

            {!isForgotPassword && (
              <div>
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}

            {success && (
              <div className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                {success}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
              disabled={loading}
            >
              {loading 
                ? 'Loading...' 
                : isForgotPassword 
                ? 'Send Reset Link' 
                : isSignUp 
                ? 'Sign Up' 
                : 'Sign In'}
            </Button>
          </form>

          {!isForgotPassword && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                  setName('');
                  setUsername('');
                }}
                className="text-emerald-400 hover:text-emerald-300 text-sm"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}