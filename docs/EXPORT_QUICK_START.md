# Export DataTable - Guide Rapide

## ✨ Nouvelle fonctionnalité : Export automatique PDF & Excel

Tous les `CustomTable` de l'application ont maintenant des boutons d'export PDF et Excel **automatiques** !

## 🎯 Utilisation

### Aucun changement nécessaire !

Vos datatables existantes fonctionnent déjà avec l'export :

```tsx
<CustomTable<EmployeeRow>
  columns={columns}
  url={apiRoutes.admin.employees.list}
  filters={filters}
/>
```

### Comment utiliser l'export

1. **Ouvrez n'importe quelle datatable** dans l'application (ex: Liste des employés)
2. **Cochez une ou plusieurs lignes** (les boutons d'export apparaissent automatiquement)
3. **Cliquez sur "Export PDF"** ou **"Export Excel"**
4. Le fichier est téléchargé automatiquement ! 🎉

## 📦 Ce qui est exporté

- ✅ Toutes les données visibles dans la datatable
- ✅ Colonnes simples (texte, nombres, dates)
- ❌ Colonnes "actions" (boutons)
- ❌ Colonnes avec rendu personnalisé complexe

## 🎨 Apparence

### Boutons d'export

- **Export PDF** : Bouton rouge avec icône 📄
- **Export Excel** : Bouton vert avec icône 📊

### Localisation

Les boutons sont traduits automatiquement selon la langue de l'interface :

- 🇫🇷 Français : "Export PDF" / "Export Excel"
- 🇬🇧 Anglais : "Export PDF" / "Export Excel"
- 🇸🇦 Arabe : (à ajouter dans les traductions si nécessaire)

## 🔧 Packages installés

```bash
pnpm add jspdf jspdf-autotable xlsx
```

## 📝 Fichiers modifiés

1. `src/components/custom/data-table/custom-table.tsx` - Ajout des actions automatiques
2. `src/utils/table-export.tsx` - Fonctions d'export
3. `public/locales/fr.json` - Traductions

## 🚀 Prochaines étapes

Si vous voulez personnaliser l'export pour une datatable spécifique, consultez la documentation complète dans `docs/DATATABLE_EXPORT_FEATURE.md`.

---

**Note** : Cette fonctionnalité est disponible pour **toutes les datatables** de l'application sans aucune modification de code nécessaire !
