import type { ReactNode } from 'react';

/** Split-screen layout shared by sign-in and password recovery screens. */
export function AuthLayout({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <img src="/uploads/logo.png" alt="P+ Media Analytics" className="mb-10 h-12 w-auto" />
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <div className="hidden flex-col items-center justify-center bg-muted/40 px-12 lg:flex">
        <img src="/uploads/loginpage.png" alt="" className="max-h-[420px] w-auto object-contain" />
        <h2 className="mt-8 text-xl font-medium tracking-tight">Media intelligence, measured</h2>
        <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
          Track, analyse and report your brand&apos;s media performance against competitors in one place.
        </p>
      </div>
    </div>
  );
}
