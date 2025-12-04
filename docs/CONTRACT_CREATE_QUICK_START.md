# Guide de Démarrage Rapide - Nouveau Formulaire de Contrat

## 🚀 Démarrage

### Accès au formulaire
```
Navigation : Admin → Contrats et Mouvements → Contrats → Nouveau Contrat
URL : /admin/contrats-mouvements/contrats/create
```

## 📋 Créer un contrat en 3 étapes

### Étape 1 : Informations Générales

#### 1.1 Informations du Contrat
| Champ | Requis | Description |
|-------|--------|-------------|
| **Référence** | Non | Ex: CTR-2024-001 (auto si vide) |
| **Type de Contrat** | ✅ Oui | CDI, CDD, ANAPEC, etc. |
| **Titre** | Non | Ex: Contrat CDI - Développeur |
| **Date de Début** | ✅ Oui | Date d'effet du contrat |
| **Date de Fin** | Non* | *Obligatoire pour CDD |
| **Date de Signature** | ✅ Oui | Date de signature |
| **Description** | Non | Description libre |

#### 1.2 Informations Employé
| Champ | Requis | Description |
|-------|--------|-------------|
| **Employé** | ✅ Oui | Sélectionner dans la liste |
| **Département** | Non | Département de rattachement |
| **CIN** | Non | Numéro carte d'identité |
| **Numéro CNSS** | Non | Numéro d'affiliation |
| **Lieu de Naissance** | Non | Ville de naissance |
| **Nationalité** | Non | Défaut: Marocaine |

#### 1.3 Informations du Poste
| Champ | Requis | Description |
|-------|--------|-------------|
| **Fonction** | Non | Ex: Développeur Full Stack |
| **Catégorie Professionnelle** | ✅ Oui | Cadre, Employé, Ouvrier... |
| **Mode de Travail** | Non | Présentiel, Hybride, Télétravail |
| **Classification** | Non | Ex: Niveau 5 - Échelon 2 |
| **Lieu de Travail** | Non | Ex: Casablanca, Maroc |
| **Niveau** | Non | Ex: Senior |
| **Responsabilités** | Non | Description des responsabilités |

### Étape 2 : Horaires & Congés

#### 2.1 Horaires de Travail
| Champ | Requis | Valeur par défaut |
|-------|--------|-------------------|
| **Heures par Jour** | Non | 8 |
| **Jours par Semaine** | Non | 5 |
| **Heures par Semaine** | Non | 40 |
| **Heure de Début** | Non | 09:00 |
| **Heure de Fin** | Non | 18:00 |
| **Durée Pause (min)** | Non | 60 |
| **Jours de Travail** | Non | Lundi au Vendredi |

#### 2.2 Travail en Shifts ⭐ NOUVEAU

**Activation** : Cocher "Activer le travail en shifts"

| Champ | Description | Valeurs possibles |
|-------|-------------|-------------------|
| **Type de Shift** | Type de poste | Matin, Après-midi, Nuit, Rotation, Continu |
| **Rotation (jours)** | Fréquence de rotation | 1-30 jours |
| **Prime Nuit (MAD)** | Prime pour shift de nuit | Montant en MAD |
| **Description** | Détails du planning | Texte libre |

**Exemple : Shift en rotation**
```
Type: Rotation
Rotation: 7 jours
Prime Nuit: 500 MAD
Description: Rotation hebdomadaire matin/après-midi/nuit
```

#### 2.3 Période d'Essai

**Activation** : Cocher "Activer la période d'essai"

| Champ | Description | Auto-calculé |
|-------|-------------|--------------|
| **Durée (mois)** | Durée en mois | ✅ Selon catégorie* |
| **Durée (jours)** | Durée en jours | ✅ Selon catégorie* |
| **Date de Fin** | Date de fin d'essai | Non |
| **Renouvelable** | Peut être renouvelée | Non |
| **Nb Max Renouvellements** | Nombre de renouvellements | 1 |
| **Conditions** | Conditions particulières | Non |

*Auto-calculé selon catégorie :
- **Cadres** : 3 mois (90 jours)
- **Employés/Techniciens** : 1.5 mois (45 jours)
- **Ouvriers** : 0.5 mois (15 jours)

#### 2.4 Congés
| Champ | Requis | Valeur par défaut | Minimum légal |
|-------|--------|-------------------|---------------|
| **Congés Annuels (jours)** | Non | 22 | 18 jours |
| **Congés Maladie (jours)** | Non | 10 | - |
| **Autres Congés** | Non | - | - |

### Étape 3 : Salaire & Légal

#### 3.1 Salaire de Base
| Champ | Requis | Auto-calculé | Description |
|-------|--------|--------------|-------------|
| **Salaire de Base (MAD)** | ✅ Oui | Non | Salaire mensuel de base |
| **Salaire Brut (MAD)** | Non | ✅ Oui | Base + Primes |
| **Salaire Net (MAD)** | Non | ✅ Oui | Brut - CNSS (4.48%) |
| **Devise** | Non | MAD | Devise du salaire |
| **Méthode de Paiement** | Non | Virement | Virement, Chèque, Espèces |
| **Périodicité** | Non | Mensuel | Fréquence de paiement |

**Calcul automatique** :
```
Salaire Brut = Salaire de Base + Somme des Primes
Salaire Net = Salaire Brut - (Salaire Brut × 4.48%)
```

#### 3.2 Primes et Indemnités
Toutes les primes sont optionnelles (en MAD) :

| Prime | Description |
|-------|-------------|
| **Prime d'Ancienneté** | Selon ancienneté |
| **Prime de Transport** | Frais de transport |
| **Prime de Responsabilité** | Responsabilités spécifiques |
| **Prime de Performance** | Basée sur performance |
| **Prime Panier** | Frais de restauration |
| **Autres Primes** | Autres primes diverses |
| **Indemnités Diverses** | Description des indemnités |

#### 3.3 Avantages en Nature
Cocher les avantages fournis :

- ☑ **Voiture de Fonction**
- ☑ **Logement de Fonction**
- ☑ **Téléphone Professionnel**
- ☑ **Assurance Santé**
- ☑ **Tickets Restaurant**
- **Autres Avantages** (texte libre)

#### 3.4 Informations Légales

**Affiliations** :
- ☑ **Affiliation CNSS** (Cotisation 4.48%)
- ☑ **Affiliation AMO** (Assurance Maladie)
- ☑ **IR Applicable** (Impôt sur le revenu)

**Réglementation** :
| Champ | Description |
|-------|-------------|
| **Convention Collective** | Ex: Code du Travail |
| ☑ **Clause de Confidentialité** | Protection des informations |
| ☑ **Clause de Non-Concurrence** | Restriction après départ |
| **Conditions Spéciales** | Clauses particulières |
| **Notes Légales** | Remarques juridiques |

## 💾 Validation et Création

### 1. Cliquer sur "Prévisualiser et Créer"
Un modal s'ouvre avec le récapitulatif complet du contrat.

### 2. Vérifier les informations
Le modal affiche toutes les informations saisies organisées par section.

### 3. Confirmer ou Modifier
- **Modifier** : Retour au formulaire pour corrections
- **Confirmer et Créer** : Création du contrat

### 4. Confirmation
- Message de succès
- Redirection vers la liste des contrats

## 🎯 Cas d'usage courants

### CDI Standard
```
Onglet 1:
- Type: CDI
- Employé: Sélectionner
- Catégorie: Employé

Onglet 2:
- Horaires: 8h/jour, 5j/semaine
- Période essai: Activée (1.5 mois auto)
- Congés: 22 jours

Onglet 3:
- Salaire: ≥ 3112.85 MAD
- CNSS: Activée
- AMO: Activée
```

### CDD avec Shifts
```
Onglet 1:
- Type: CDD
- Date fin: Obligatoire
- Catégorie: Ouvrier

Onglet 2:
- Shifts: Activés
- Type: Rotation
- Rotation: 7 jours
- Prime Nuit: 500 MAD
- Période essai: 15 jours

Onglet 3:
- Salaire de base
- Prime Transport: 300 MAD
- CNSS: Activée
```

### Stage ANAPEC
```
Onglet 1:
- Type: ANAPEC (Idmaj)
- Employé: Stagiaire
- Catégorie: Employé

Onglet 2:
- Horaires: 8h/jour
- Pas de période d'essai
- Congés: Selon convention

Onglet 3:
- Indemnité mensuelle
- Pas de CNSS
- Pas d'IR
```

## ⚠️ Points d'attention

### Champs requis
Minimum pour créer un contrat :
- ✅ Type de contrat
- ✅ Employé
- ✅ Catégorie professionnelle
- ✅ Date de début
- ✅ Date de signature
- ✅ Salaire de base

### Validations automatiques
- **SMIG** : Salaire ≥ 3112.85 MAD (2025)
- **Heures** : Max 48h/semaine
- **Congés** : Min 18 jours/an
- **Date fin** : Obligatoire pour CDD

### Calculs automatiques
- Salaire brut = Base + Primes
- Salaire net = Brut - CNSS (4.48%)
- Période essai selon catégorie

## 🆘 Aide rapide

### Problèmes fréquents

**Employé non trouvé**
- Vérifier que l'employé existe dans le système
- Rafraîchir la page

**Salaire net incorrect**
- Vérifier que CNSS est coché
- Vérifier les primes saisies

**Erreur de validation**
- Vérifier tous les champs requis (*)
- Vérifier les dates (début avant fin)
- Vérifier le salaire (≥ SMIG)

## 📞 Support

- **Documentation complète** : `/docs/CONTRACT_CREATE_V2_SUMMARY.md`
- **Composants** : `/src/features/contract/components/README.md`
- **Support technique** : Contacter l'équipe IT

---
**Version** : 2.0  
**Dernière mise à jour** : Décembre 2024

