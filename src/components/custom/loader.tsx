import { useState, useEffect } from 'react';
import SmallLogo from '@/components/custom/small-logo';
export default function CreativeLoader() {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(0.7);

  useEffect(() => {
    // Animation de rotation
    const rotationInterval = setInterval(() => {
      setRotation((prev) => (prev + 5) % 360);
    }, 50);

    // Animation de pulsation
    const pulseInterval = setInterval(() => {
      setScale((prev) => (prev === 1 ? 1.2 : 1));
      setOpacity((prev) => (prev === 0.7 ? 1 : 0.7));
    }, 800);

    return () => {
      clearInterval(rotationInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  return (
    <div className='flex h-screen flex-col items-center justify-center bg-white'>
      <div
        className='relative'
        style={{
          transform: `rotate(${rotation}deg) scale(${scale})`,
          transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
          opacity: opacity
        }}
      >
        <div className='flex h-16 w-16 justify-center'>
          <SmallLogo />
        </div>

        {/* Cercles concentriques animés */}
        <div className='absolute inset-0 animate-ping rounded-full border-4 border-indigo-300 opacity-30'></div>
        <div className='absolute inset-0 animate-pulse rounded-full border-2 border-blue-400'></div>
      </div>
    </div>
  );
}
