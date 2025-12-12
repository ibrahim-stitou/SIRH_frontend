// app/unauthorized/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function UnauthorizedPage() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-4'>
      {/* Animated background elements */}
      <div className='absolute top-0 left-0 h-full w-full overflow-hidden opacity-20'>
        <div className='absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-400 mix-blend-screen blur-3xl filter'></div>
        <div className='absolute top-3/4 left-2/3 h-80 w-80 animate-pulse rounded-full bg-blue-400 mix-blend-screen blur-3xl filter'></div>
        <div className='absolute top-1/2 left-1/6 h-72 w-72 animate-pulse rounded-full bg-pink-400 mix-blend-screen blur-3xl filter'></div>
        <div className='absolute top-1/3 right-1/4 h-64 w-64 animate-pulse rounded-full bg-indigo-400 mix-blend-screen blur-3xl filter'></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6IiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIuMDUiLz48cGF0aCBkPSJNMCAwaDMwdjMwSDB6IiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIuMDUiLz48cGF0aCBkPSJNMzAgMGgzMHYzMEgzMHoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjxwYXRoIGQ9Ik0wIDMwaDMwdjMwSDB6IiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')]"></div>
      </div>

      <div className='relative z-10 mx-auto w-full max-w-2xl'>
        {/* Main content container */}
        <div className='overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl'>
          {/* Header section with "403" */}
          <div className='relative flex h-32 items-center justify-center overflow-hidden bg-gradient-to-r from-red-500 via-purple-500 to-blue-500'>
            <div className='absolute inset-0 bg-black/10'></div>
            <div className='relative z-10 flex items-center'>
              <span className='text-8xl font-black tracking-tighter text-white'>
                4
              </span>
              <div className='relative mx-2'>
                <div className='flex h-16 w-16 animate-spin items-center justify-center rounded-full bg-white'>
                  <div className='flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-red-500 via-purple-500 to-blue-500'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-8 w-8 text-white'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V9m0 0V7m0 2h2m-2 0H9'
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <span className='text-8xl font-black tracking-tighter text-white'>
                3
              </span>
            </div>

            {/* Decorative elements */}
            <div className='absolute -bottom-6 -left-6 h-12 w-12 animate-pulse rounded-full bg-purple-500'></div>
            <div className='absolute top-6 right-12 h-8 w-8 animate-pulse rounded-full bg-blue-500'></div>
            <div className='absolute right-20 bottom-8 h-4 w-4 animate-pulse rounded-full bg-red-500'></div>
          </div>

          {/* Content section */}
          <div className='p-8 md:p-12'>
            <h1 className='mb-4 text-center text-4xl font-extrabold text-white'>
              Access Denied
            </h1>

            <div className='mb-8 space-y-6'>
              <p className={'text-center text-xl text-white/90'}>
                Looks like you&apos;ve tried to enter a restricted area of SIRH.
              </p>

              <div className='relative'>
                <div className='absolute -inset-1 rounded-lg bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 opacity-25 blur'></div>
                <div className='relative rounded-lg border border-white/10 bg-black/30 p-6 backdrop-blur-sm'>
                  <div className='mb-4 flex items-center'>
                    <div className='mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-6 w-6 text-amber-500'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </div>
                    <h2 className='text-xl font-bold text-white'>
                      Why am I seeing this?
                    </h2>
                  </div>
                  <p className={'text-white/80'}>
                    You do not have the necessary permissions to access this
                    resource. If you believe this is an error, please contact
                    your administrator or our support team.
                  </p>
                </div>
              </div>

              {/* Progress bar with keyframe animation */}
              <div className='relative h-1.5 w-full overflow-hidden rounded-full bg-white/10'>
                <div className='absolute inset-0 animate-[shimmer_2s_ease-in-out_infinite] bg-gradient-to-r from-red-500 via-purple-500 to-blue-500'></div>
              </div>
            </div>

            {/* Action buttons */}
            <div className='flex flex-col justify-center gap-4 sm:flex-row'>
              <Link
                href='/'
                className='group flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 px-8 py-4 font-medium text-white shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:shadow-indigo-500/50'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 19l-7-7m0 0l7-7m-7 7h18'
                  />
                </svg>
                Return to Homepage
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className='border-t border-white/10 bg-black/30 p-4 backdrop-blur-sm'>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-white/60'>
                © {year} SIRH. All rights reserved.
              </p>
              <div className='flex space-x-2'>
                <span className='h-2 w-2 rounded-full bg-red-500'></span>
                <span className='h-2 w-2 rounded-full bg-amber-500'></span>
                <span className='h-2 w-2 rounded-full bg-green-500'></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
