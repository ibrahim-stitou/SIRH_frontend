/**
 * Types pour le module de paramètres
 */

import { LucideIcon } from 'lucide-react';

export interface ParametreItem {
  code: string;
  titre: string;
  description: string;
  icon: LucideIcon;
  path: string;
  categorie:
    | 'organisation'
    | 'rh'
    | 'financier'
    | 'absences'
    | 'paie'
    | 'contrats';
  couleur?: string;
  actif?: boolean;
}

export interface ParametreCategorie {
  id: string;
  nom: string;
  description: string;
  icon: LucideIcon;
  couleur: string;
}
