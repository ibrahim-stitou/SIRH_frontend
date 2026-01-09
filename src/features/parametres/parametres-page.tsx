/**
 * Composant principal de la page des paramètres
 * Affiche tous les paramètres regroupés par catégorie
 */

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PARAMETRES_CATEGORIES,
  PARAMETRES_LIST,
  getParametresByCategorie,
} from './parametres-config';
import { ParametreCategorieCard } from './parametre-categorie-card';
import PageContainer from '@/components/layout/page-container';

export const ParametresPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les paramètres en fonction de la recherche
  const filteredParametres = PARAMETRES_LIST.filter((param) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      param.titre.toLowerCase().includes(query) ||
      param.description.toLowerCase().includes(query) ||
      param.code.toLowerCase().includes(query)
    );
  });

  return (
    <PageContainer>
    <div className="space-y-6 w-full">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Settings className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
            <p className="text-muted-foreground">
              Configuration et gestion des paramètres de l&apos;application
            </p>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un paramètre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs par catégorie */}
      <Tabs defaultValue="all" className="space-y-6 w-full">
        <TabsList className="flex-wrap h-auto w-full">
          <TabsTrigger value="all">Tous</TabsTrigger>
          {PARAMETRES_CATEGORIES.map((categorie) => {
            const Icon = categorie.icon;
            const count = getParametresByCategorie(categorie.id).filter((p) =>
              filteredParametres.some((fp) => fp.code === p.code)
            ).length;

            return (
              <TabsTrigger
                key={categorie.id}
                value={categorie.id}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {categorie.nom}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({count})
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tous les paramètres */}
        <TabsContent value="all" className="space-y-8">
          {PARAMETRES_CATEGORIES.map((categorie) => {
            const parametresCategorie = getParametresByCategorie(
              categorie.id
            ).filter((p) => filteredParametres.some((fp) => fp.code === p.code));

            return (
              <ParametreCategorieCard
                key={categorie.id}
                categorie={categorie}
                parametres={parametresCategorie}
              />
            );
          })}

          {filteredParametres.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Aucun paramètre trouvé pour &quot;{searchQuery}&quot;
              </p>
            </div>
          )}
        </TabsContent>

        {/* Onglets par catégorie */}
        {PARAMETRES_CATEGORIES.map((categorie) => {
          const parametresCategorie = getParametresByCategorie(
            categorie.id
          ).filter((p) => filteredParametres.some((fp) => fp.code === p.code));

          return (
            <TabsContent
              key={categorie.id}
              value={categorie.id}
              className="space-y-6"
            >
              <ParametreCategorieCard
                categorie={categorie}
                parametres={parametresCategorie}
              />

              {parametresCategorie.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Aucun paramètre trouvé dans cette catégorie
                  </p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
    </PageContainer>
  );
};

