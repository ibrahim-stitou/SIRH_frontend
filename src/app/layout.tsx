import { auth } from '@/lib/auth';
import Providers from '@/components/layout/providers';
import { LanguageProvider } from '@/context/LanguageContext';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata, Viewport } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import NextTopLoader from 'nextjs-toploader';
import { headers } from 'next/headers';
import { cn } from '@/lib/utils';
import ThemeInitializer from '@/components/custom/ThemeInitialize';
import { fontVariables } from '@/lib/font';
import './globals.css';
import './theme.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'Application de gestion de flotte',
  description:
    'Application de gestion de flotte de véhicules, carburant, chauffeurs, etc.'
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

const SUPPORTED_LANGS = ['en', 'fr', 'ar'] as const;
const DEFAULT_LANG = 'fr';

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const activeThemeValue = 'sirh';
  // Language detection
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  const browserLang = acceptLanguage?.split(',')[0]?.split('-')[0];
  const validatedLang = SUPPORTED_LANGS.includes(browserLang as any)
    ? browserLang
    : DEFAULT_LANG;

  return (
    <html
      lang={validatedLang}
      suppressHydrationWarning
      dir={validatedLang === 'ar' ? 'rtl' : 'ltr'}
    >
      <head>
        <title>
          {typeof metadata.title === 'string' ? metadata.title : ''}
        </title>
        <script
          dangerouslySetInnerHTML={{
            __html: (() => {
              return `try {\n  localStorage.theme = 'sirh';\n  document.documentElement.classList.add('theme-sirh');\n  if (localStorage.darkMode === 'true' || (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {\n    document.documentElement.classList.add('dark');\n    document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}');\n  }\n  if (!localStorage.lang || localStorage.lang !== '${validatedLang}') {\n    localStorage.setItem('lang', '${validatedLang}');\n  }\n} catch (e) {\n  console.error('Erreur init theme sirh:', e);\n}`;
            })()
          }}
        />
      </head>
      <body
        className={cn(
          'bg-background theme-sirh overflow-hidden overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <NextTopLoader showSpinner={true} />
        <NuqsAdapter>
          <LanguageProvider>
            <Providers session={session} activeThemeValue={activeThemeValue}>
              <ThemeInitializer />
              <Toaster />
              {children}
            </Providers>
          </LanguageProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
