import React from 'react';

const SmallLogo = () => {
  return (
    <svg
      width='80'
      height='80'
      viewBox='0 0 80 80'
      xmlns='http://www.w3.org/2000/svg'
    >
      <defs>
        <linearGradient id='mainGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' style={{ stopColor: '#0D9488', stopOpacity: 1 }} />
          <stop
            offset='100%'
            style={{ stopColor: '#06B6D4', stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>

      <rect
        x='0'
        y='0'
        width='80'
        height='80'
        rx='18'
        fill='url(#mainGradient)'
      />
      <g transform='translate(40, 35)'>
        <circle cx='-8' cy='-15' r='7' fill='white' />
        <path
          d='M 15,-20 Q 8,-20 0,-15 Q -8,-10 -8,-2 Q -8,6 0,11 Q 8,16 15,16'
          fill='none'
          stroke='white'
          stroke-width='5'
          stroke-linecap='round'
        />

        <circle cx='8' cy='18' r='7' fill='white' />
        <circle cx='-18' cy='5' r='3' fill='white' opacity='0.7' />
        <circle cx='18' cy='-8' r='3' fill='white' opacity='0.7' />
      </g>
    </svg>
  );
};

export default SmallLogo;
