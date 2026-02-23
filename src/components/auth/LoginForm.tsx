import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface LoginFormProps {
  className?: string;
}

const LoginForm = ({ className }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/forgot-password');
  };

  return (
    <Card
      className={cn(
        'w-full max-w-md mx-auto border-0 shadow-none bg-transparent md:bg-card md:shadow-sm md:border md:rounded-xl md:p-6 lg:p-8',
        className
      )}
    >
      <div className="flex justify-center md:justify-start mb-6 md:mb-8">
        <img
          src="/uploads/logo.png"
          alt="Logo"
          className="w-36 h-12 md:w-40 md:h-14 object-contain"
        />
      </div>

      <CardHeader className="space-y-1 p-0 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-center md:text-left">
          Welcome Back
        </h1>
        <p className="text-sm md:text-base text-muted-foreground text-center md:text-left">
          Welcome back! Please enter your details.
        </p>
      </CardHeader>

      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm md:text-base">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 md:h-12 bg-muted border-muted text-base placeholder:text-sm md:placeholder:text-base"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm md:text-base">
                Password
              </Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 md:h-12 bg-muted border-muted pr-10 text-base"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none p-1"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="cursor-pointer font-normal">
                Remember me
              </Label>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-primary hover:underline focus:outline-none font-medium"
            >
              Forgot Password
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-11 md:h-12 text-base md:text-lg font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>

          {/* Uncomment if you want to re-enable Google sign-in later */}
          {/* <Button
            type="button"
            variant="outline"
            className="w-full h-11 md:h-12 border border-input text-sm md:text-base"
            onClick={() => {}}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              ... (Google SVG paths remain unchanged)
            </svg>
            Sign in with Google
          </Button> */}
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;