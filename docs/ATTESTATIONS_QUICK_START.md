# Guide Rapide - Module Attestations

## 🚀 Démarrage Rapide

### 1. Installation

Les dépendances nécessaires sont déjà installées :
```bash
# Déjà exécuté
pnpm add jspdf jspdf-autotable
```

### 2. Démarrer le projet

```bash
# Terminal 1 - Démarrer le serveur mock
npm run mock-server

# Terminal 2 - Démarrer l'application
npm run dev
```

### 3. Accéder au module

Ouvrez votre navigateur et naviguez vers :
```
http://localhost:3003/admin/personnel/attestations
```

## 📋 Checklist des fichiers créés

✅ **Types TypeScript**
- `src/types/attestation.ts` - Définitions de types

✅ **Générateur PDF**
- `src/lib/pdf/attestation-generator.ts` - Logique de génération PDF

✅ **Interface utilisateur**
- `src/app/admin/personnel/attestations/page_old.tsx` - Page principale

✅ **Mock Data**
- `mock-data/attestationRequests.json` - Demandes de test
- `mock-data/attestations.json` - Attestations de test

✅ **Base de données mock**
- `db.js` - Mis à jour avec les nouvelles collections

✅ **Traductions**
- `public/locales/fr.json` - Français ✓
- `public/locales/en.json` - Anglais ✓
- `public/locales/ar.json` - Arabe ✓

✅ **Navigation**
- Déjà présente dans `src/constants/data.ts`

✅ **Documentation**
- `docs/ATTESTATIONS_MODULE.md` - Documentation complète
- `docs/ATTESTATIONS_QUICK_START.md` - Guide rapide

## 🎯 Scénarios de test

### Scénario 1 : Créer une demande d'attestation

1. Cliquer sur le bouton **"Nouvelle demande"**
2. Sélectionner un employé (ex: Admin User, Alice Martin)
3. Choisir le type : **"Attestation de travail"**
4. Ajouter une note : "Pour dossier bancaire"
5. Cliquer sur **"Soumettre"**
6. ✅ La demande apparaît dans la liste avec le statut "En attente"

### Scénario 2 : Approuver une demande

1. Dans l'onglet **"Demandes"**, trouver une demande en attente
2. Cliquer sur le bouton **"Approuver"**
3. ✅ Le statut passe à "Approuvée"
4. Un bouton **"Générer PDF"** apparaît

### Scénario 3 : Générer le PDF

1. Pour une demande approuvée, cliquer sur **"Générer PDF"**
2. ✅ Le PDF est généré et téléchargé automatiquement
3. ✅ Le statut passe à "Générée"
4. ✅ L'attestation apparaît dans l'onglet "Attestations générées"

### Scénario 4 : Rejeter une demande

1. Trouver une demande en attente
2. Cliquer sur **"Rejeter"**
3. Saisir la raison : "Informations incomplètes"
4. Cliquer sur **"Rejeter"**
5. ✅ Le statut passe à "Rejetée"

### Scénario 5 : Génération directe

1. Cliquer sur **"Générer une attestation"** (bouton outline)
2. Sélectionner un employé
3. Choisir **"Attestation de salaire"**
4. Ajouter une note (optionnel)
5. Cliquer sur **"Générer PDF"**
6. ✅ Le PDF est téléchargé immédiatement
7. ✅ L'attestation est enregistrée dans l'historique

### Scénario 6 : Attestation de stage

1. Générer une attestation directe
2. Choisir **"Attestation de stage"**
3. ✅ Les champs de dates apparaissent
4. Sélectionner date de début et fin
5. Générer le PDF
6. ✅ Le PDF contient les dates de stage

## 📊 Données de test disponibles

### Employés (employees)
- Admin User (id: 100) - System Administrator
- HR Manager (id: 101) - HR Manager
- Alice Martin (id: 102) - Frontend Developer
- Bruno Leclerc (id: 103) - Engineering Manager
- Chloe Dupont (id: 104) - HR Specialist

### Demandes pré-créées (attestationRequests)
- 5 demandes avec différents statuts
- Types variés : travail, salaire, stage, travail_salaire

### Attestations pré-générées (attestations)
- 3 attestations déjà générées
- Numéros : ATT-2024-001, ATT-2024-002, ATT-2024-003

## 🎨 Fonctionnalités UI

### Statistiques en temps réel
- **Demandes totales** : Nombre total de demandes
- **En attente** : Demandes nécessitant une action
- **Approuvées** : Demandes validées
- **Générées** : Attestations créées

### Badges de statut
- 🟡 **En attente** : Jaune avec icône horloge
- 🟢 **Approuvée** : Vert avec icône check
- 🔴 **Rejetée** : Rouge avec icône X
- 🔵 **Générée** : Bleu avec icône document

### Tables interactives
- Tri et pagination automatiques
- Actions contextuelles selon le statut
- Affichage des dates formatées
- Noms d'employés automatiquement récupérés

## 🔍 Contenu des PDFs générés

### Attestation de travail
- En-tête avec informations de l'entreprise
- Titre centré et formaté
- Identité complète de l'employé (nom, CIN, date de naissance)
- Poste occupé
- Date d'embauche et ancienneté calculée
- Formule de certification
- Section signature et cachet
- Pied de page avec numéro et date

### Attestation de salaire
- Même structure que l'attestation de travail
- **+ Information salariale** : Salaire mensuel brut formaté

### Attestation de travail et salaire
- Combine les deux informations complètes

### Attestation de stage
- Adaptation pour les stagiaires
- Dates de début et fin du stage
- Appréciation du travail effectué

## 🌍 Support multi-langues

Le module s'adapte automatiquement à la langue sélectionnée :
- Interface traduite en FR/EN/AR
- Changement de langue en temps réel
- Toutes les clés traduites

## 🐛 Debugging

### Vérifier que le serveur mock fonctionne
```bash
curl http://localhost:3001/attestationRequests
curl http://localhost:3001/attestations
curl http://localhost:3001/employees
```

### Console du navigateur
Ouvrir les DevTools (F12) pour voir :
- Les requêtes API
- Les erreurs éventuelles
- Les logs de génération PDF

### Données persistées
Les données sont stockées dans `db.json` (généré automatiquement par json-server)

## 💡 Astuces

### Raccourcis clavier
- Dans la navigation, utilisez `a` + `t` pour accéder rapidement au module

### Personnalisation des PDFs
Modifiez `DEFAULT_COMPANY` dans `attestation-generator.ts` :
```typescript
const DEFAULT_COMPANY = {
  name: 'VOTRE ENTREPRISE',
  address: 'Votre adresse',
  city: 'Votre ville',
  phone: 'Votre téléphone',
  email: 'votre@email.com',
  ice: 'Votre ICE',
  rc: 'Votre RC',
};
```

### Numérotation personnalisée
Dans `page_old.tsx`, ligne ~200 :
```typescript
const numeroAttestation = `ATT-${year}-${String(nextNum).padStart(3, '0')}`;
// Exemple : ATT-2024-001

// Personnalisez selon vos besoins :
const numeroAttestation = `CERT-${company}-${year}-${nextNum}`;
// Exemple : CERT-SIRH-2024-1
```

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez `docs/ATTESTATIONS_MODULE.md` pour la documentation complète
2. Vérifiez que toutes les dépendances sont installées
3. Assurez-vous que le serveur mock est démarré
4. Vérifiez la console pour les erreurs

## ✅ Prochaines étapes

Fonctionnalités recommandées à ajouter :
1. 📧 Envoi par email automatique
2. 🔐 Signatures électroniques
3. 🎨 Templates personnalisables
4. 📱 Version mobile optimisée
5. 📊 Statistiques et rapports avancés
6. 🔔 Notifications en temps réel
7. 🌐 PDFs multi-langues (AR/EN)
8. 💾 Export Excel des listes

## 🎉 Félicitations !

Votre module d'attestations est maintenant complètement fonctionnel et prêt à l'emploi !

