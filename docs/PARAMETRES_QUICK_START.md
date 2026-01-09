# Guide de Démarrage Rapide - Module Paramètres

## 🎯 Objectif

Ce guide vous permet de créer rapidement une nouvelle page de gestion pour un paramètre.

## 📋 Liste des paramètres à implémenter

- [x] **Page principale des paramètres** ✅
- [x] **Exemple : Départements** ✅ (voir `/parametres/departements`)
- [ ] **Postes**
- [ ] **Emplois**
- [ ] **Métiers**
- [ ] **Lieux de Travail**
- [ ] **Primes**
- [ ] **Indemnités**
- [ ] **Types d'Absences**
- [ ] **Politique de Congés**
- [ ] **Mutuelles et Assurances**
- [ ] **Managers**
- [ ] **Rubriques de Paie**
- [ ] **Conditions de Contrat**
- [ ] **Conditions de Période d'Essai**
- [ ] **Paramètres Maximaux Généraux**

## 🚀 Créer une nouvelle page de paramètre en 5 étapes

### Étape 1 : Créer le dossier de la page

```bash
# Exemple pour "Postes"
mkdir src/app/parametres/postes
```

### Étape 2 : Copier le fichier d'exemple

```bash
# Copier le fichier d'exemple départements
cp src/app/parametres/departements/page.tsx src/app/parametres/postes/page.tsx
```

### Étape 3 : Adapter le contenu

Modifiez le fichier copié en changeant :

1. **Le titre et la description**
2. **L'interface TypeScript** (selon les champs du paramètre)
3. **Les données d'exemple**
4. **Les colonnes du tableau**
5. **Les champs du formulaire**

### Étape 4 : Définir l'interface

Pour chaque paramètre, créez l'interface TypeScript correspondante :

#### Exemple pour POSTES

```typescript
interface Poste {
  id: string;
  code: string;
  libelle: string;
  departement: string;
}
```

#### Exemple pour PRIMES

```typescript
interface Prime {
  id: string;
  code: string;
  libelle: string;
  exonere: boolean;
  montant: number;
}
```

### Étape 5 : Tester la navigation

Accédez à `/parametres` et cliquez sur le paramètre créé.

## 📝 Template de base

Voici un template réutilisable pour créer une nouvelle page :

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

// 1. Définir l'interface
interface MonParametre {
  id: string;
  code: string;
  libelle: string;
  // Ajouter d'autres champs
}

export default function MonParametrePage() {
  const { toast } = useToast();
  
  // 2. État local
  const [items, setItems] = useState<MonParametre[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MonParametre | null>(null);
  const [formData, setFormData] = useState({ code: '', libelle: '' });

  // 3. Fonctions CRUD
  const handleSubmit = () => {
    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData }
          : item
      ));
      toast({ title: 'Modifié avec succès' });
    } else {
      setItems([...items, { id: Date.now().toString(), ...formData }]);
      toast({ title: 'Créé avec succès' });
    }
    resetForm();
  };

  const handleEdit = (item: MonParametre) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast({ title: 'Supprimé avec succès', variant: 'destructive' });
  };

  const resetForm = () => {
    setFormData({ code: '', libelle: '' });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  // 4. Rendu JSX
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/parametres">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Mon Paramètre</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau
            </Button>
          </DialogTrigger>
          {/* Formulaire */}
        </Dialog>
      </div>
      
      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Liste</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            {/* Contenu du tableau */}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 🎨 Personnalisation

### Changer l'icône

Dans `parametres-config.ts` :

```typescript
import { IconName } from 'lucide-react';

{
  icon: IconName, // Nouvelle icône
}
```

### Changer la couleur

```typescript
{
  couleur: '#FF5733', // Code hexadécimal
}
```

### Ajouter des champs au formulaire

```typescript
<div className="space-y-2">
  <Label htmlFor="nouveauChamp">Nouveau Champ</Label>
  <Input
    id="nouveauChamp"
    value={formData.nouveauChamp}
    onChange={(e) => setFormData({ ...formData, nouveauChamp: e.target.value })}
  />
</div>
```

## 🔗 Intégration avec l'API

Pour connecter avec l'API backend :

```typescript
// Créer un hook personnalisé
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function useMonParametre() {
  const queryClient = useQueryClient();
  
  const { data } = useQuery({
    queryKey: ['mon-parametre'],
    queryFn: async () => {
      const res = await fetch('/api/parametres/mon-parametre');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newItem) => {
      const res = await fetch('/api/parametres/mon-parametre', {
        method: 'POST',
        body: JSON.stringify(newItem),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mon-parametre'] });
    },
  });

  return { data, createMutation };
}
```

## ✅ Checklist avant de publier

- [ ] Interface TypeScript définie
- [ ] Données d'exemple ajoutées
- [ ] Formulaire complet (tous les champs)
- [ ] Validation des champs
- [ ] Messages toast configurés
- [ ] Navigation retour fonctionnelle
- [ ] Responsive design testé
- [ ] Actions CRUD testées
- [ ] Icône et couleur personnalisées
- [ ] Documentation mise à jour

## 🐛 Problèmes courants

### Erreur "Cannot find module"

Vérifiez les imports :
```typescript
import { Component } from '@/components/ui/component';
```

### Dialog ne s'ouvre pas

Vérifiez l'état `isDialogOpen` et la fonction `onOpenChange`.

### Données ne se mettent pas à jour

Assurez-vous d'appeler `resetForm()` après modification.

## 📚 Ressources

- [Documentation shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Hook Form](https://react-hook-form.com/) (pour validation avancée)
- [Zod](https://zod.dev/) (pour schémas de validation)

## 🎓 Prochaines étapes

1. Implémenter la connexion à l'API backend
2. Ajouter la pagination pour les grandes listes
3. Ajouter des filtres et recherche
4. Exporter en PDF/Excel
5. Ajouter l'historique des modifications
6. Implémenter les permissions utilisateur

