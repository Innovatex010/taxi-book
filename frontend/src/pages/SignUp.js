import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car } from 'lucide-react';
import { toast } from 'sonner';

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.phone
      );
      toast.success('Account created successfully!');
      
      // Redirect based on role
      switch (user.role) {
        case 'DEALER':
          navigate('/dealer');
          break;
        case 'DRIVER':
          navigate('/driver/setup');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md p-8 shadow-lg border-slate-100" data-testid="signup-card">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Car className="h-8 w-8 text-primary" />
          <span className="font-heading font-bold text-2xl text-[#0F172A]">UrbanCab</span>
        </div>
        
        <h1 className="font-heading font-bold text-3xl text-[#0F172A] text-center mb-2">Create Account</h1>
        <p className="text-slate-600 text-center mb-8">Join UrbanCab and start your journey</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
              className="mt-2"
              data-testid="name-input"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              required
              className="mt-2"
              data-testid="email-input"
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 234 567 8900"
              className="mt-2"
              data-testid="phone-input"
            />
          </div>
          
          <div>
            <Label htmlFor="role">I am a</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger className="mt-2" data-testid="role-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="DRIVER">Driver</SelectItem>
                <SelectItem value="DEALER">Fleet Owner (Dealer)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
              minLength={6}
              className="mt-2"
              data-testid="password-input"
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-primary text-white hover:bg-primary/90"
            disabled={loading}
            data-testid="signup-submit-btn"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>
        
        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{' '}
          <Link to="/signin" className="text-primary hover:underline font-medium" data-testid="signin-link">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default SignUp;