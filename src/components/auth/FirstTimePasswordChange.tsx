import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Shield } from 'lucide-react';

const FirstTimePasswordChange = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem('temp_email') || '');
  const [currentPassword, setCurrentPassword] = useState(localStorage.getItem('temp_password') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const validatePassword = () => {
    if (newPassword.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters long.');
      return false;
    }

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return false;
    }

    if (newPassword === currentPassword) {
      setStatus('error');
      setMessage('New password must be different from your current password.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    setIsSubmitting(true);
    setStatus('idle');

    const API_BASE_URL = 'https://pplus-7q0p.onrender.com/api/v1';

    try {
      const response = await fetch(`${API_BASE_URL}/auth/first-time-password-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Password changed successfully! Redirecting to login...');
        
        // Clear temporary storage
        localStorage.removeItem('temp_email');
        localStorage.removeItem('temp_password');
        
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to change password. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Unable to change password. Please try again later.');
      console.error('First-time password change error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 8) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (password.length < 12) return { strength: 2, label: 'Fair', color: 'bg-orange-500' };
    if (password.length < 16) return { strength: 3, label: 'Good', color: 'bg-yellow-500' };
    return { strength: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
        <CardHeader className="space-y-1 p-0 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-semibold text-primary">P+</span>
              <span className="text-lg font-medium">Analytics</span>
            </div>
          </div>

          <h1 className="text-2xl font-semibold">Change Your Password</h1>
          <p className="text-sm text-muted-foreground">
            For security, please change your temporary password.
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {status === 'success' ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {message}
                </AlertDescription>
              </Alert>

              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground">
                  You can now log in with your new password.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Security Notice */}
              <Alert className="bg-blue-50 border-blue-200">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  Your account was created by an administrator. You must change your password before proceeding.
                </AlertDescription>
              </Alert>

              {status === 'error' && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted border-muted"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Your temporary password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="bg-muted border-muted pr-10"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="bg-muted border-muted pr-10"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                
                {newPassword && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= passwordStrength.strength
                              ? passwordStrength.color
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength.label && (
                      <p className="text-xs text-muted-foreground">
                        Password strength: {passwordStrength.label}
                      </p>
                    )}
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters long and different from your current password
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-muted border-muted pr-10"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-white hover:bg-primary/90"
                disabled={isSubmitting || !email || !currentPassword || !newPassword || !confirmPassword}
              >
                {isSubmitting ? 'Changing password...' : 'Change password'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Need help? Contact your administrator
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FirstTimePasswordChange;
