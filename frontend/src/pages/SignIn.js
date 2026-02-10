import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Car } from 'lucide-react';
import { toast } from 'sonner';

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Welcome back!');
      
      // Redirect based on role
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'DEALER':
          navigate('/dealer');
          break;
        case 'DRIVER':
          navigate('/driver');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6">
      <Card className="w-full max-w-md p-8 shadow-lg border-slate-100" data-testid="signin-card">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Car className="h-8 w-8 text-primary" />
          <span className="font-heading font-bold text-2xl text-[#0F172A]">UrbanCab</span>
        </div>
        
        <h1 className="font-heading font-bold text-3xl text-[#0F172A] text-center mb-2">Welcome Back</h1>
        <p className="text-slate-600 text-center mb-8">Sign in to your account to continue</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" data-testid="email-label">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-2"
              data-testid="email-input"
            />
          </div>
          
          <div>
            <Label htmlFor="password" data-testid="password-label">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-2"
              data-testid="password-input"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-primary text-white hover:bg-primary/90"
            disabled={loading}
            data-testid="signin-submit-btn"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <p className="text-center text-sm text-slate-600 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-medium" data-testid="signup-link">
            Sign up
          </Link>
        </p>
        
        {/* <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Demo accounts: customer@test.com / dealer@test.com / driver@test.com (password: password123)
          </p>
        </div> */}
      </Card>
    </div>
  );
};

export default SignIn;