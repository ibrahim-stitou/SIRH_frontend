/**
 * Composant carte de paramètre
 * Affiche un paramètre avec son titre, description, icône et lien
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        'group hover:shadow-lg transition-all duration-200 border-l-4 h-full',
        className
      )}
      style={{ borderLeftColor: parametre.couleur || '#3B82F6' }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div
              className="p-2 rounded-lg shrink-0 group-hover:scale-110 transition-transform"
              style={{
                backgroundColor: `${parametre.couleur || '#3B82F6'}15`,
              }}
            >
              <Icon
                className="h-6 w-6"
                style={{ color: parametre.couleur || '#3B82F6' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg flex items-center gap-2">
                {parametre.titre}
                <Badge variant="outline" className="text-xs font-normal">
                  {parametre.code}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-2 text-sm leading-relaxed">
                {parametre.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Link href={parametre.path}>
          <Button
            variant="ghost"
            className="w-full justify-between group-hover:bg-accent"
          >
            <span>Gérer</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

