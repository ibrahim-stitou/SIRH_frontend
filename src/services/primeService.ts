import { PrimeType } from '@/types/prime';

/**
 * Service pour gérer les types de primes
 * À terme, ces données viendront du backend via API
 */

// Données mockées pour le développement - seront remplacées par des appels API
const MOCK_PRIME_TYPES: PrimeType[] = [
  {
    id: 1,
    code: 'PRIME_TRANSPORT',
    label: 'Prime de Transport',
    description: 'Indemnité de transport quotidien',
    is_taxable: false, // Généralement exonérée jusqu\'à un certain montant
    is_subject_to_cnss: true,
    default_amount: 500,
    is_active: true,
    category: 'transport',
    order: 1,
  },
  {
    id: 2,
    code: 'PRIME_PANIER',
    label: 'Prime Panier',
    description: 'Indemnité de restauration',
    is_taxable: false, // Exonérée dans certaines limites
    is_subject_to_cnss: true,
    default_amount: 300,
    is_active: true,
    category: 'panier',
    order: 2,
  },
  {
    id: 3,
    code: 'PRIME_ANCIENNETE',
    label: 'Prime d\'Ancienneté',
    description: 'Prime basée sur l\'ancienneté',
    is_taxable: true,
    is_subject_to_cnss: true,
    default_amount: 0,
    is_active: true,
    category: 'anciennete',
    order: 3,
  },
  {
    id: 4,
    code: 'PRIME_RESPONSABILITE',
    label: 'Prime de Responsabilité',
    description: 'Prime liée aux responsabilités du poste',
    is_taxable: true,
    is_subject_to_cnss: true,
    default_amount: 0,
    is_active: true,
    category: 'responsabilite',
    order: 4,
  },
  {
    id: 5,
    code: 'PRIME_PERFORMANCE',
    label: 'Prime de Performance',
    description: 'Prime basée sur les résultats',
    is_taxable: true,
    is_subject_to_cnss: true,
    default_amount: 0,
    is_active: true,
    category: 'performance',
    order: 5,
  },
  {
    id: 6,
    code: 'PRIME_RISQUE',
    label: 'Prime de Risque',
    description: 'Prime pour travaux dangereux',
    is_taxable: true,
    is_subject_to_cnss: true,
    default_amount: 0,
    is_active: true,
    category: 'autre',
    order: 6,
  },
  {
    id: 7,
    code: 'PRIME_ASTREINTE',
    label: 'Prime d\'Astreinte',
    description: 'Prime pour disponibilité hors horaires',
    is_taxable: true,
    is_subject_to_cnss: true,
    default_amount: 0,
    is_active: true,
    category: 'autre',
    order: 7,
  },
  {
    id: 8,
    code: 'PRIME_TECHNICITE',
    label: 'Prime de Technicité',
    description: 'Prime pour compétences techniques spécifiques',
    is_taxable: true,
    is_subject_to_cnss: true,
    default_amount: 0,
    is_active: true,
    category: 'autre',
    order: 8,
  },
];

/**
 * Récupère tous les types de primes disponibles
 * TODO: Remplacer par un appel API réel
 */
export async function getPrimeTypes(): Promise<PrimeType[]> {
  // const response = await fetch('/api/prime-types');
  // return response.json();

  return Promise.resolve(MOCK_PRIME_TYPES.filter(p => p.is_active));
}

/**
 * Récupère un type de prime par son ID
 */
export async function getPrimeTypeById(id: string | number): Promise<PrimeType | undefined> {
  const primes = await getPrimeTypes();
  return primes.find(p => p.id === id);
}

/**
 * Récupère les types de primes par catégorie
 */
export async function getPrimeTypesByCategory(category: string): Promise<PrimeType[]> {
  const primes = await getPrimeTypes();
  return primes.filter(p => p.category === category);
}

/**
 * Hook pour utiliser les types de primes (version synchrone avec les données mockées)
 */
export function usePrimeTypes(): PrimeType[] {
  return MOCK_PRIME_TYPES.filter(p => p.is_active);
}

/**
 * Calcule le montant soumis à l'IR pour une prime
 */
export function calculateTaxableAmount(amount: number, isTaxable: boolean): number {
  return isTaxable ? amount : 0;
}

/**
 * Calcule le montant soumis aux cotisations CNSS pour une prime
 */
export function calculateCnssAmount(amount: number, isSubjectToCnss: boolean): number {
  return isSubjectToCnss ? amount : 0;
}

