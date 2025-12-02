# 🎯 Module Attestations - Référence Rapide

## 📋 Commandes essentielles

```bash
# Démarrer le serveur mock
npm run mock-server

# Démarrer l'application
npm run dev

# Accéder au module
# → http://localhost:3003/admin/personnel/attestations
```

---

## 🗂️ Fichiers clés

| Fichier | Description |
|---------|-------------|
| `src/app/admin/personnel/attestations/page.tsx` | Interface principale |
| `src/lib/pdf/attestation-generator.ts` | Générateur PDF |
| `src/types/attestation.ts` | Types TypeScript |
| `mock-data/attestationRequests.json` | Données demandes |
| `mock-data/attestations.json` | Données attestations |

---

## 🎨 Types d'attestations

| Type | Code | Usage |
|------|------|-------|
| Travail | `travail` | Emploi + ancienneté |
| Salaire | `salaire` | Emploi + salaire |
| Travail + Salaire | `travail_salaire` | Document complet |
| Stage | `stage` | Pour stagiaires |

---

## 🔄 Statuts des demandes

| Statut | Badge | Signification |
|--------|-------|---------------|
| `en_attente` | 🟡 | À traiter |
| `approuve` | 🟢 | Validée |
| `rejete` | 🔴 | Refusée |
| `genere` | 🔵 | PDF créé |

---

## 🎯 Actions rapides

### Créer une demande
```
Bouton [+ Nouvelle demande]
→ Sélectionner employé
→ Choisir type
→ [Soumettre]
```

### Approuver
```
Demande en attente
→ Bouton [✓ Approuver]
```

### Rejeter
```
Demande en attente
→ Bouton [✗ Rejeter]
→ Indiquer raison
→ [Rejeter]
```

### Générer PDF
```
Demande approuvée
→ Bouton [Générer PDF]
→ Téléchargement auto
```

### Génération directe
```
Bouton [Générer une attestation]
→ Sélectionner employé
→ Choisir type
→ [Générer PDF]
```

---

## 📊 API Endpoints

```
GET    /attestationRequests     # Liste demandes
POST   /attestationRequests     # Créer demande
PATCH  /attestationRequests/:id # Modifier demande

GET    /attestations            # Liste attestations
POST   /attestations            # Créer attestation

GET    /employees               # Liste employés
```

---

## 🔧 Personnalisation rapide

### Changer l'entreprise
```typescript
// src/lib/pdf/attestation-generator.ts
const DEFAULT_COMPANY = {
  name: 'VOTRE NOM',
  address: 'VOTRE ADRESSE',
  // ...
};
```

### Modifier numérotation
```typescript
// src/app/admin/personnel/attestations/page.tsx (ligne ~200)
const numeroAttestation = `ATT-${year}-${String(nextNum).padStart(3, '0')}`;
```

---

## 🌍 Traductions

### Ajouter une clé
```json
// public/locales/fr.json
{
  "attestations": {
    "votre_cle": "Votre texte"
  }
}
```

### Utiliser dans le code
```typescript
const { t } = useLanguage();
t('attestations.votre_cle')
```

---

## 🐛 Debug rapide

### Vérifier API
```bash
curl http://localhost:3001/attestationRequests
curl http://localhost:3001/employees
```

### Console navigateur
```javascript
// F12 → Console
// Vérifier les erreurs
// Onglet Network pour les requêtes
```

### Réinitialiser les données
```bash
# Supprimer db.json
rm db.json

# Redémarrer le serveur
npm run mock-server
```

---

## 📈 Statistiques

```
Total demandes    →  requests.length
En attente        →  status === 'en_attente'
Approuvées        →  status === 'approuve'
Générées          →  status === 'genere'
```

---

## 🎨 Composants UI clés

```typescript
// Dialogue
<Dialog open={state} onOpenChange={setState}>

// Select employé
<Select value={employeeId} onValueChange={...}>

// Badge statut
<Badge variant={variants[status]}>

// Table
<Table>
  <TableHeader>...
  <TableBody>...
```

---

## 🔐 Validation

### Formulaire demande
- ✅ employeeId requis
- ✅ typeAttestation requis
- ⚪ notes optionnel

### Formulaire rejet
- ✅ raisonRejet requis

### Génération stage
- ✅ stageStartDate requis
- ✅ stageEndDate requis

---

## 📄 Structure PDF

```
┌─────────────────┐
│ EN-TÊTE         │ ← Infos entreprise
├─────────────────┤
│ TITRE           │ ← Type d'attestation
├─────────────────┤
│ LIEU & DATE     │ ← Génération
├─────────────────┤
│ CORPS           │ ← Contenu principal
│                 │   - Identité
│                 │   - Poste
│                 │   - Dates
│                 │   - Salaire (si applicable)
├─────────────────┤
│ SIGNATURE       │ ← DRH + Cachet
├─────────────────┤
│ PIED DE PAGE    │ ← Numéro + Date
└─────────────────┘
```

---

## 🚦 Workflow simplifié

```
DEMANDE → EN_ATTENTE → APPROUVE → GENERE
                    ↘
                     REJETE
```

---

## 💡 Astuces

1. **Raccourci clavier** : `a` + `t` pour accéder au module
2. **Génération rapide** : Utilisez le bouton "Générer une attestation"
3. **Filtre rapide** : Changez d'onglet pour voir demandes vs générées
4. **Employés test** : 5 employés disponibles par défaut
5. **Numérotation** : Format ATT-YYYY-XXX automatique

---

## 📚 Documentation complète

Pour plus de détails, consultez :
- `ATTESTATIONS_MODULE.md` - Documentation technique
- `ATTESTATIONS_QUICK_START.md` - Guide démarrage
- `ATTESTATIONS_WORKFLOW.md` - Diagrammes
- `ATTESTATIONS_SUMMARY.md` - Résumé
- `ATTESTATIONS_VALIDATION.md` - Validation

---

## ✅ Checklist avant démarrage

- [ ] Dépendances installées (`pnpm install`)
- [ ] Serveur mock démarré (port 3001)
- [ ] Application démarrée (port 3003)
- [ ] Navigateur ouvert sur `/admin/personnel/attestations`
- [ ] Documentation lue

---

## 🎯 Points clés à retenir

1. **Deux workflows** : Avec demande ou direct
2. **Quatre types** : Travail, Salaire, Les deux, Stage
3. **Multi-langues** : FR/EN/AR
4. **PDF automatique** : jsPDF + templates
5. **Mock data** : Données de test complètes

---

## 🔗 Liens rapides

```
Module      : /admin/personnel/attestations
API Mock    : http://localhost:3001
Documentation: /docs/ATTESTATIONS_*.md
```

---

## 📞 Aide rapide

**Problème ?**
1. Console navigateur (F12)
2. Documentation dans `docs/`
3. Vérifier serveur mock
4. Réinitialiser `db.json`

---

**✨ Carte de référence - Module Attestations v1.0.0 ✨**

