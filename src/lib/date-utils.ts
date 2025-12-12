import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Vérifie si une valeur est une date valide
 */
export const isValidDate = (dateValue: any): boolean => {
  if (!dateValue) return false;
  try {
    const date = new Date(dateValue);
    return date instanceof Date && !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * Formate une date de manière sécurisée
 * @param dateValue - La valeur de date à formater (string, Date, ou null/undefined)
 * @param formatString - Le format de date (par défaut 'PPP' pour format long)
 * @param fallback - La valeur de retour si la date est invalide (par défaut 'N/A')
 * @returns La date formatée ou la valeur de fallback
 */
export const formatDateSafe = (
  dateValue: any,
  formatString: string = 'PPP',
  fallback: string = 'N/A'
): string => {
  if (!isValidDate(dateValue)) return fallback;

  try {
    const date = new Date(dateValue);
    return format(date, formatString, { locale: fr });
  } catch {
    return fallback;
  }
};

/**
 * Formate une date courte (ex: 05/12/2024)
 */
export const formatDateShort = (
  dateValue: any,
  fallback: string = 'N/A'
): string => {
  return formatDateSafe(dateValue, 'dd/MM/yyyy', fallback);
};

/**
 * Formate une date longue (ex: 5 décembre 2024)
 */
export const formatDateLong = (
  dateValue: any,
  fallback: string = 'N/A'
): string => {
  return formatDateSafe(dateValue, 'PPP', fallback);
};

/**
 * Formate une date avec l'heure (ex: 5 décembre 2024 à 14:30)
 */
export const formatDateTime = (
  dateValue: any,
  fallback: string = 'N/A'
): string => {
  return formatDateSafe(dateValue, 'PPP à HH:mm', fallback);
};

/**
 * Formate une date relative (ex: il y a 2 jours)
 */
export const formatDateRelative = (
  dateValue: any,
  fallback: string = 'N/A'
): string => {
  if (!isValidDate(dateValue)) return fallback;

  try {
    const date = new Date(dateValue);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Aujourd'hui";
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30)
      return `Il y a ${Math.floor(diffInDays / 7)} semaine${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
    if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`;
    return `Il y a ${Math.floor(diffInDays / 365)} an${Math.floor(diffInDays / 365) > 1 ? 's' : ''}`;
  } catch {
    return fallback;
  }
};
