import { format } from 'date-fns';
import {fr, Locale } from 'date-fns/locale';

const locales: Record<string, Locale> = {
  fr: fr,
};

export function getDateLocale(language: string): Locale {
  return locales[language] || fr;
}


export function dFormat(date: Date | string, formatString: string, language: string): string {
  const locale = getDateLocale(language);
  return format(new Date(date), formatString, { locale });
}
