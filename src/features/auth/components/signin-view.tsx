'use client';
import { Metadata } from 'next';
import UserAuthForm from './user-auth-form';
import Logo from '@/components/logo';

export const metadata: Metadata = {
  title: 'Authentication - SIRH',
  description: 'Secure login to your SIRH account'
};

export default function SignInViewPage() {
  return (
    <div className='from-primary/10 to-primary/10 relative flex h-screen items-center justify-center overflow-hidden bg-gradient-to-br via-white'>
      {/* Floating Blobs */}
      <div className='absolute inset-0 -z-10'>
        <div className='bg-primary/20 animate-float absolute top-0 left-0 h-64 w-64 rounded-full opacity-60 blur-3xl' />
        <div className='bg-primary/20 animate-float-delay absolute right-0 bottom-0 h-96 w-96 rounded-full opacity-60 blur-3xl' />
        <div className="pointer-events-none absolute inset-0 hidden bg-[url('/assets/grid-pattern.svg')] bg-center bg-repeat opacity-5 lg:block" />
      </div>

      {/* Main Card */}
      <div className='relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white/90 px-8 py-10 shadow-2xl backdrop-blur-md'>
        {/* Logo */}
        <div className='mb-12 flex justify-center'>
          <Logo />
        </div>

        {/* Welcome Text */}
        <div className='mb-6 text-center'>
          <h1 className='text-2xl font-bold text-gray-800'>Welcome Back</h1>
          <p className='mt-1 text-sm text-gray-500'>
            Sign in to your account to continue
          </p>
        </div>
        {/* Auth Form */}
        <UserAuthForm />
      </div>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        @keyframes float-delay {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(20px) rotate(-5deg);
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float-delay 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
