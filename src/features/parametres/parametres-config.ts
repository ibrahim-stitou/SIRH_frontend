/**
 * Configuration des paramètres de l'application
 * Ce fichier contient la liste de tous les paramètres disponibles
 */

import {
  Building2,
  Briefcase,
  Users,
  Target,
  MapPin,
  Coins,
  Gift,
  CalendarOff,
  CalendarCheck,
  Shield,
  UserCog,
  Calculator,
  FileText,
  ClipboardList,
  Settings,
  DollarSign
} from 'lucide-react';
import { ParametreItem, ParametreCategorie } from './types';

/**
 * Catégories de paramètres
 */
export const PARAMETRES_CATEGORIES: ParametreCategorie[] = [
  {
    id: 'organisation',
    nom: 'Organisation',
    description: "Structure organisationnelle de l'entreprise",
    icon: Building2,
    couleur: '#3B82F6' // blue
  },
  {
    id: 'rh',
    nom: 'Ressources Humaines',
    description: 'Gestion des postes, emplois et métiers',
    icon: Users,
    couleur: '#8B5CF6' // violet
  },
  {
    id: 'financier',
    nom: 'Financier',
    description: 'Primes, indemnités et avances',
    icon: DollarSign,
    couleur: '#10B981' // green
  },
  {
    id: 'absences',
    nom: 'Absences & Congés',
    description: 'Gestion des absences et politiques de congés',
    icon: CalendarOff,
    couleur: '#F59E0B' // amber
  },
  {
    id: 'paie',
    nom: 'Paie',
    description: 'Rubriques et calculs de paie',
    icon: Calculator,
    couleur: '#EF4444' // red
  },
  {
    id: 'contrats',
    nom: 'Contrats',
    description: 'Conditions et paramètres contractuels',
    icon: FileText,
    couleur: '#06B6D4' // cyan
  }
];

/**
 * Liste complète des paramètres
 */
export const PARAMETRES_LIST: ParametreItem[] = [
  // ========== ORGANISATION ==========
  {
    code: 'DEPT',
    titre: 'Départements',
    description:
      "Structure organisationnelle de l'entreprise. Gérez les départements et services.",
    icon: Building2,
    path: '/admin/parametres/departements',
    categorie: 'organisation',
    couleur: '#3B82F6',
    actif: true
  },
  {
    code: 'LIEU',
    titre: 'Lieux de Travail',
    description:
      "Sites et établissements de l'entreprise. Gérez les adresses et localisations.",
    icon: MapPin,
    path: '/admin/parametres/lieux-travail',
    categorie: 'organisation',
    couleur: '#3B82F6',
    actif: true
  },

  // ========== RESSOURCES HUMAINES ==========
  {
    code: 'POST',
    titre: 'Postes',
    description:
      "Postes de travail disponibles dans l'organisation. Définissez les intitulés de postes.",
    icon: Briefcase,
    path: '/admin/parametres/postes',
    categorie: 'rh',
    couleur: '#8B5CF6',
    actif: true
  },
  {
    code: 'EMPL',
    titre: 'Emplois',
    description:
      "Types d'emplois et contrats proposés. Gérez les différentes natures de contrats.",
    icon: Users,
    path: '/admin/parametres/emplois',
    categorie: 'rh',
    couleur: '#8B5CF6',
    actif: true
  },
  {
    code: 'METR',
    titre: 'Métiers',
    description:
      "Référentiel des métiers de l'entreprise. Définissez les domaines d'activité.",
    icon: Target,
    path: '/admin/parametres/metiers',
    categorie: 'rh',
    couleur: '#8B5CF6',
    actif: true
  },
  {
    code: 'MNGR',
    titre: 'Managers',
    description:
      'Hiérarchie et relations managériales. Gérez la structure de reporting.',
    icon: UserCog,
    path: '/parametres/managers',
    categorie: 'rh',
    couleur: '#8B5CF6',
    actif: true
  },

  // ========== FINANCIER ==========
  {
    code: 'PRIM',
    titre: 'Primes',
    description:
      'Primes accordées aux employés. Configurez les montants et exonérations fiscales.',
    icon: Coins,
    path: '/parametres/primes',
    categorie: 'financier',
    couleur: '#10B981',
    actif: true
  },
  {
    code: 'INDEM',
    titre: 'Indemnités',
    description:
      "Indemnités et avantages en nature. Gérez les différents types d'avantages.",
    icon: Gift,
    path: '/parametres/indemnites',
    categorie: 'financier',
    couleur: '#10B981',
    actif: true
  },

  // ========== ABSENCES & CONGÉS ==========
  {
    code: 'TABS',
    titre: "Types d'Absences",
    description:
      "Catégories d'absences avec leurs règles de gestion. Configurez les validations et impacts.",
    icon: CalendarOff,
    path: '/admin/parametres/types-absences',
    categorie: 'absences',
    couleur: '#F59E0B',
    actif: true
  },
  {
    code: 'POLC',
    titre: 'Politique de Congés',
    description:
      "Règles d'acquisition et de gestion des congés. Définissez les modes d'acquisition.",
    icon: CalendarCheck,
    path: '/parametres/politique-conges',
    categorie: 'absences',
    couleur: '#F59E0B',
    actif: true
  },

  // ========== PAIE ==========
  {
    code: 'RUBRP',
    titre: 'Rubriques de Paie',
    description:
      'Éléments de calcul de la paie. Configurez les gains, retenues et formules de calcul.',
    icon: Calculator,
    path: '/parametres/rubriques-paie',
    categorie: 'paie',
    couleur: '#EF4444',
    actif: true
  },
  {
    code: 'MUTL',
    titre: 'Mutuelles et Assurances',
    description:
      'Organismes de protection sociale. Gérez les cotisations employeur et employé.',
    icon: Shield,
    path: '/parametres/mutuelles',
    categorie: 'paie',
    couleur: '#EF4444',
    actif: true
  },

  // ========== CONTRATS ==========
  {
    code: 'CONDC',
    titre: 'Conditions de Contrat',
    description:
      'Paramètres prédéfinis pour les contrats. Configurez les clauses standard.',
    icon: FileText,
    path: '/parametres/conditions-contrat',
    categorie: 'contrats',
    couleur: '#06B6D4',
    actif: true
  },
  {
    code: 'CONDE',
    titre: "Conditions de Période d'Essai",
    description:
      "Paramètres de gestion de la période d'essai. Définissez les critères de validation.",
    icon: ClipboardList,
    path: '/parametres/conditions-essai',
    categorie: 'contrats',
    couleur: '#06B6D4',
    actif: true
  },
  {
    code: 'PARMX',
    titre: 'Paramètres Maximaux Généraux',
    description:
      'Configuration centralisée des valeurs maximales. Définissez les limites globales.',
    icon: Settings,
    path: '/parametres/max-generaux',
    categorie: 'contrats',
    couleur: '#06B6D4',
    actif: true
  }
];

/**
 * Obtenir les paramètres par catégorie
 */
export const getParametresByCategorie = (
  categorieId: string
): ParametreItem[] => {
  return PARAMETRES_LIST.filter(
    (param) => param.categorie === categorieId && param.actif
  );
};

/**
 * Obtenir un paramètre par son code
 */
export const getParametreByCode = (code: string): ParametreItem | undefined => {
  return PARAMETRES_LIST.find((param) => param.code === code);
};
