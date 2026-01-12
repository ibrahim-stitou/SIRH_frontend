/**
 * Composant section de catégorie de paramètres
 * Affiche un groupe de paramètres regroupés par catégorie
 */

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ParametreCategorie, ParametreItem } from './types';
import { ParameterCard } from './parameter-card';

interface ParametreCategorieCardProps {
  categorie: ParametreCategorie;
  parametres: ParametreItem[];
}

export const ParametreCategorieCard = ({
  categorie,
  parametres
}: ParametreCategorieCardProps) => {
  const Icon = categorie.icon;

  if (parametres.length === 0) {
    return null;
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-3'>
        <div
          className='rounded-lg p-2.5'
          style={{
            backgroundColor: `${categorie.couleur}15`
          }}
        >
          <Icon className='h-6 w-6' style={{ color: categorie.couleur }} />
        </div>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>{categorie.nom}</h2>
          <p className='text-muted-foreground text-sm'>
            {categorie.description}
          </p>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {parametres.map((parametre) => (
          <ParameterCard key={parametre.code} parametre={parametre} />
        ))}
      </div>
    </div>
  );
};
