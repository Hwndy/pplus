import React from 'react';
import LoginForm from '@/components/auth/LoginForm';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left side - Login form */}
        <div className="order-2 md:order-1">
          <LoginForm />
        </div>

        {/* Right side - Illustration */}
        <div className="order-1 md:order-2 flex flex-col items-center justify-center">
          <img 
            src="/uploads/loginpage.png" 
            alt="Analytics illustration" 
            className="max-w-full h-auto"
          />
          <div className="mt-6 text-center max-w-md">
            <h2 className="text-xl md:text-2xl font-medium mb-3">Comprehensive Analytics Platform</h2>
            <p className="text-muted-foreground">
              Track, analyze and visualize your media performance metrics with our intuitive dashboard solution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
