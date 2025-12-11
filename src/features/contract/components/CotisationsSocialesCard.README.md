# CotisationsSocialesCard Component

## Description
Composant React qui affiche et gère la configuration des cotisations sociales marocaines (CNSS, AMO, CMIR, RCAR).

## Statut
⚠️ **Ce composant n'est PAS utilisé dans le formulaire de création de contrat.**

Il a été extrait du composant `SalaryAndLegalTab` pour le rendre réutilisable dans d'autres contextes où la gestion des cotisations sociales est nécessaire.

## Utilisation

```tsx
import { CotisationsSocialesCard } from '@/features/contract/components/CotisationsSocialesCard';
// ou
import { CotisationsSocialesCard } from '@/features/contract/components';

function MyComponent() {
  const form = useForm<SimplifiedContractInput>({
    resolver: zodResolver(simplifiedContractSchema),
    defaultValues: simplifiedContractDefaultValues,
  });

  return (
    <form>
      {/* Autres champs... */}
      
      <CotisationsSocialesCard form={form} />
      
      {/* Autres champs... */}
    </form>
  );
}
```

## Props

| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| form | `UseFormReturn<SimplifiedContractInput>` | Oui | Instance du formulaire react-hook-form |

## Fonctionnalités

Le composant gère les cotisations suivantes :

### 1. CNSS (Caisse Nationale de Sécurité Sociale)
- Part employé : 4.48% (par défaut)
- Part employeur : 8.98% (par défaut)
- Obligatoire pour le secteur privé

### 2. AMO (Assurance Maladie Obligatoire)
- Part employé : 2.26% (par défaut)
- Part employeur : 2.26% (par défaut)
- Couverture santé obligatoire

### 3. CMIR (Caisse Marocaine des Retraites)
- Taux de cotisation : 6.00% (par défaut)
- Numéro d'affiliation
- Régime complémentaire privé

### 4. RCAR (Régime Collectif d'Allocation de Retraite)
- Taux de cotisation : 20.00% (par défaut)
- Numéro d'affiliation
- Pour le secteur public et semi-public

## Notes techniques

- Tous les taux sont modifiables par l'utilisateur
- Les sections de configuration sont affichées/masquées selon l'activation de chaque cotisation
- Les valeurs par défaut correspondent aux taux légaux marocains en vigueur
- Le composant utilise les composants UI de shadcn/ui (Card, Input, Checkbox, etc.)

## Contextes d'utilisation possibles

1. Module de gestion des employés
2. Module de paie
3. Configuration des paramètres de l'entreprise
4. Simulation de coûts salariaux
5. Rapports et analyses RH

## Voir aussi

- [SalaryAndLegalTab](./SalaryAndLegalTab.tsx) - Composant principal pour la création de contrat
- [SimplifiedContractInput](../../../validations/contract-simplified.schema.ts) - Schéma de validation

