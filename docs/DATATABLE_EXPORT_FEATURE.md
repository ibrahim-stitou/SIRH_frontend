# Fonctionnalité d'Export dans DataTable

## Vue d'ensemble

Le composant `CustomTable` intègre désormais automatiquement des actions d'export PDF et Excel pour toutes les datatables de l'application. Ces boutons d'export apparaissent automatiquement dans la barre de bulk actions sans aucune configuration supplémentaire.

## Fonctionnalités

- ✅ **Export PDF** : Exporte toutes les données visibles de la datatable en format PDF
- ✅ **Export Excel** : Exporte toutes les données visibles de la datatable en format Excel (.xlsx)
- ✅ **Automatique** : Les boutons d'export sont ajoutés automatiquement à toutes les datatables
- ✅ **Filtrage intelligent** : Seules les colonnes simples (sans fonction `render`) sont exportées
- ✅ **Notifications** : Toast de succès après chaque export
- ✅ **Désactivation intelligente** : Les boutons sont désactivés quand il n'y a pas de données

## Comment ça fonctionne

### 1. Intégration automatique

Les actions d'export sont automatiquement ajoutées à **toutes** les datatables qui utilisent le composant `CustomTable`. Aucune configuration supplémentaire n'est nécessaire.

```typescript
// Avant - sans export
<CustomTable<EmployeeRow>
  columns={columns}
  url={apiRoutes.admin.employees.list}
  filters={filters}
/>

// Après - avec export automatique (même code !)
<CustomTable<EmployeeRow>
  columns={columns}
  url={apiRoutes.admin.employees.list}
  filters={filters}
/>
```

### 2. Colonnes exportées

Par défaut, le système exporte uniquement les colonnes qui :

- Ont un `label` défini
- N'ont PAS de fonction `render` personnalisée (colonnes simples uniquement)
- Ne sont PAS nommées "actions"

Cela signifie que les colonnes avec des boutons, des badges personnalisés, ou des rendus complexes sont automatiquement exclues de l'export.

### 3. Personnalisation des colonnes exportées

Si vous souhaitez contrôler quelles colonnes sont exportées, vous pouvez modifier le filtre dans `custom-table.tsx` :

```typescript
const exportColumns = columns.filter(
  (col) => col.data !== 'actions' && !col.render // Logique actuelle
);
```

## Structure des fichiers

### Fichiers créés

1. **`src/utils/table-export.tsx`**

   - Contient les fonctions `exportToPDF()` et `exportToExcel()`
   - Gère la conversion des données en formats PDF et Excel
   - Ajoute les notifications de succès

2. **`src/utils/table-bulk-actions.tsx`**
   - Contient les factory functions pour créer les actions d'export
   - `createExportPDFAction()` et `createExportExcelAction()`
   - (Optionnel - utilisé seulement si vous voulez créer des actions manuellement)

### Fichiers modifiés

1. **`src/components/custom/data-table/custom-table.tsx`**

   - Ajout automatique des actions d'export
   - Utilise `useMemo` pour optimiser les performances
   - Combine les actions personnalisées avec les actions d'export

2. **`public/locales/fr.json`**
   - Ajout des traductions pour les boutons d'export
   - Section `table.export.pdf` et `table.export.excel`

## Dépendances

Les packages suivants ont été installés :

- `jspdf` : Génération de fichiers PDF
- `jspdf-autotable` : Création de tableaux dans les PDFs
- `xlsx` : Génération de fichiers Excel

## Utilisation avec BulkActions personnalisées

Si vous avez déjà des `bulkActions` personnalisées, les actions d'export seront automatiquement ajoutées à la fin :

```typescript
const customBulkActions: CustomTableBulkAction<EmployeeRow>[] = [
  {
    label: 'Supprimer',
    icon: <Trash2 className="h-4 w-4" />,
    action: (selected, refresh) => {
      // Logique de suppression
    }
  }
];

<CustomTable<EmployeeRow>
  columns={columns}
  url={apiRoutes.admin.employees.list}
  bulkActions={customBulkActions}
  // Les actions PDF et Excel seront automatiquement ajoutées après
/>
```

## Exemples de sortie

### Export PDF

- Format A4
- En-tête avec titre
- Tableau avec styles (en-têtes bleus, lignes alternées)
- Police de taille 8pt pour optimiser l'espace

### Export Excel

- Format .xlsx
- En-têtes en première ligne
- Largeur de colonnes automatiquement ajustée
- Compatible avec Microsoft Excel, LibreOffice, Google Sheets

## Personnalisation avancée

### Modifier les styles PDF

Éditez `src/utils/table-export.tsx` dans la fonction `exportToPDF()` :

```typescript
autoTable(doc, {
  // ...
  headStyles: {
    fillColor: [41, 128, 185], // Changez la couleur de l'en-tête
    textColor: 255
  },
  alternateRowStyles: {
    fillColor: [245, 245, 245] // Changez la couleur des lignes alternées
  }
});
```

### Modifier le nom du fichier exporté

Par défaut, les fichiers sont nommés "export.pdf" ou "export.xlsx". Pour personnaliser, modifiez les actions dans `custom-table.tsx` :

```typescript
action: () => {
  exportToPDF(table.data, exportColumns, 'mon-fichier-personnalise');
};
```

## Limitations actuelles

1. **Colonnes avec render** : Les colonnes avec fonction `render` personnalisée ne sont pas exportées (pour éviter d'exporter du HTML ou des composants React)
2. **Images** : Les images dans les cellules ne sont pas exportées
3. **Données paginées** : Seules les données actuellement chargées dans `table.data` sont exportées (pas tout le dataset si pagination côté serveur)

## Améliorations futures possibles

- [ ] Option pour exporter toutes les pages (appel API pour récupérer toutes les données)
- [ ] Support des colonnes avec render (extraire les valeurs textuelles)
- [ ] Export CSV
- [ ] Choix des colonnes à exporter (modal de configuration)
- [ ] Templates d'export personnalisés par type de données
- [ ] Export avec images et logos

## Support

Pour toute question ou amélioration, contactez l'équipe de développement.
