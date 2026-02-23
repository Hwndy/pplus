import React from 'react';
import LoginForm from '@/components/auth/LoginForm';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-background">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
        {/* Illustration - comes first on mobile, second on desktop */}
        <div className="order-1 md:order-2 flex flex-col items-center justify-center">
          <div className="w-full max-w-[380px] md:max-w-none">
            <img
              src="/uploads/loginpage.png"
              alt="Analytics illustration"
              className="w-full h-auto max-h-[320px] md:max-h-none object-contain"
            />
          </div>
          <div className="mt-5 md:mt-8 text-center max-w-md px-4 md:px-0">
            <h2 className="text-xl md:text-2xl font-medium mb-3 tracking-tight">
              Comprehensive Analytics Platform
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Track, analyze and visualize your media performance metrics with our intuitive dashboard solution.
            </p>
          </div>
        </div>

        {/* Login form - comes second on mobile, first on desktop */}
        <div className="order-2 md:order-1 w-full">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Index;