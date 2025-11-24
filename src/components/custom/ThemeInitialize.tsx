'use client';

import { useEffect } from 'react';

export function ThemeInitializer() {
  useEffect(() => {document.documentElement.classList.add('theme-sirh');
    localStorage.theme = 'sirh';
  }, []);

  return null;
}

export default ThemeInitializer;