import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/api/client';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        const data = await apiClient.postForm('/auth/token', formData);
        login(data.access_token);
        toast.success('Successfully logged in');
      } else {
        await apiClient.post('/auth/register', { email, password });
        toast.success('Registration successful. Please log in.');
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121319] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center mb-4">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">FinPredict Pro</h1>
          <p className="text-slate-400 mt-2">AI-Powered Market Intelligence</p>
        </div>

        <Card className="glass-card border-white/[0.05] bg-[#1a1c23]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white font-bold text-center">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              {isLogin ? 'Enter your credentials to access your dashboard' : 'Sign up to start analyzing the market'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-black/20 border-white/[0.05] text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-black/20 border-white/[0.05] text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors border-0"
                disabled={loading}
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-slate-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
            
            {isLogin && (
              <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                <p className="text-xs text-emerald-400 font-medium mb-1">Demo Credentials:</p>
                <p className="text-xs text-slate-300">test@predict.com / password123</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
