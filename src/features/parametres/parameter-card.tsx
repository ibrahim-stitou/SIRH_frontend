/**
 * Composant carte de paramètre
 * Affiche un paramètre avec son titre, description, icône et lien
 */

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ParametreItem } from './types';
import { cn } from '@/lib/utils';

interface ParameterCardProps {
  parametre: ParametreItem;
  className?: string;
}

export const ParameterCard = ({ parametre, className }: ParameterCardProps) => {
  const Icon = parametre.icon;

  return (
    <Card
      className={cn(
        'group h-full border-l-4 transition-all duration-200 hover:shadow-lg',
        className
      )}
      style={{ borderLeftColor: parametre.couleur || '#3B82F6' }}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex flex-1 items-start gap-3'>
            <div
              className='shrink-0 rounded-lg p-2 transition-transform group-hover:scale-110'
              style={{
                backgroundColor: `${parametre.couleur || '#3B82F6'}15`
              }}
            >
              <Icon
                className='h-6 w-6'
                style={{ color: parametre.couleur || '#3B82F6' }}
              />
            </div>
            <div className='min-w-0 flex-1'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                {parametre.titre}
                <Badge variant='outline' className='text-xs font-normal'>
                  {parametre.code}
                </Badge>
              </CardTitle>
              <CardDescription className='mt-2 text-sm leading-relaxed'>
                {parametre.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className='pt-0'>
        <Link href={parametre.path}>
          <Button
            variant='ghost'
            className='group-hover:bg-accent w-full justify-between'
          >
            <span>Gérer</span>
            <ChevronRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
