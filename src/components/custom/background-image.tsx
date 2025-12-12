// src/components/background-image.tsx
'use client';

import Image, { ImageProps } from 'next/image';
import { FC } from 'react';

interface BackgroundImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  imagePath: string;
  altText?: string;
  overlayClassName?: string;
}

const BackgroundImage: FC<BackgroundImageProps> = ({
  imagePath = '/images/testimonial-bg.jpg',
  altText = 'Background Image',
  overlayClassName = 'opacity-75 mix-blend-overlay object-cover',
  ...props
}) => {
  return (
    <div className='relative h-full w-full'>
      <Image
        src={imagePath}
        alt={altText}
        fill
        priority
        className={overlayClassName}
        sizes='(max-width: 768px) 100vw, 50vw'
        {...props}
      />
    </div>
  );
};

export default BackgroundImage;
