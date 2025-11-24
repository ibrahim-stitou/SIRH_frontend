# Application Web de Gestion de Transports

Cette application web vise à optimiser la gestion complète des opérations de transport, incluant la gestion de la flotte de véhicules, la maintenance, les stocks, les missions et toutes les opérations associées au secteur du transport.

## 📋 Fonctionnalités principales

- **Gestion du Parc de Véhicules** : Suivi complet des véhicules, documents associés, assurances, visites techniques, taxes et carburant
- **Gestion de Maintenance** : Planification et suivi des interventions préventives et curatives
- **Gestion de Stock** : Inventaire des pièces détachées et consommables avec mouvements d'entrée/sortie
- **Gestion des Achats** : Suivi des devis, commandes et factures
- **Gestion des Dossiers/Ordres de Mission** : Planification et suivi des transports
- **Gestion des Scellés** : Attribution et suivi des scellés douaniers
- **Gestion des Dépenses** : Enregistrement et suivi de toutes les dépenses liées aux opérations
- **Gestion des Partenaires** : Suivi des transitaires, importateurs et autres partenaires
- **Gestion du Personnel** : Administration des chauffeurs et employés
- **Tableau de Bord** : Visualisation des indicateurs clés de performance

## 🛠️ Technologies utilisées

Ce frontend est développé avec des technologies modernes pour garantir performance et maintenabilité :

- **[Next.js](https://nextjs.org/)** - Framework React pour le rendu côté serveur et la génération de sites statiques
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitaire pour des interfaces utilisateur personnalisables
- **[Shadcn UI](https://ui.shadcn.com/)** - Composants d'interface réutilisables construits sur Radix UI
- **[Zustand](https://github.com/pmndrs/zustand)** - Gestion d'état simplifiée et performante
- **[React Hook Form](https://react-hook-form.com/)** - Gestion efficace des formulaires avec validation
- **[Zod](https://github.com/colinhacks/zod)** - Validation de schéma TypeScript-first
- **[Tabler Icons](https://tabler-icons.io/)** - Ensemble d'icônes SVG simples et cohérentes

## 🚀 Installation

```bash
# Cloner le dépôt
git clone https://github.com/ibrahim-stitou/TMS-frontend.git
cd gestion-transport-frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## 📁 Structure du projet

```
├── app/                  # Organisation par routes (Next.js App Router)
│   ├── (auth)/           # Routes liées à l'authentification
│   ├── (dashboard)/      # Routes pour le tableau de bord et fonctionnalités principales
│   ├── api/              # Points d'API locaux pour Next.js
│   ├── layout.tsx        # Layout racine de l'application
│   └── page.tsx          # Page d'accueil
├── components/           # Composants réutilisables
│   ├── ui/               # Composants UI de Shadcn
│   ├── forms/            # Composants liés aux formulaires
│   ├── data-tables/      # Tableaux de données pour chaque entité
│   └── dashboard/        # Composants spécifiques au tableau de bord
├── lib/                  # Utilitaires et fonctions d'aide
│   ├── schemas/          # Schémas de validation Zod
│   ├── utils/            # Fonctions utilitaires
│   ├── hooks/            # Hooks personnalisés
│   └── config/           # Configurations de l'application
├── store/                # État global avec Zustand
│   ├── authStore.ts      # Gestion de l'authentification
│   ├── vehicleStore.ts   # Gestion des véhicules
│   └── ...autres stores
├── styles/               # Styles globaux et personnalisations de Tailwind
├── public/               # Fichiers statiques accessibles publiquement
└── types/                # Types TypeScript globaux
```

## 🔧 Configuration

### Configuration Environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=Gestion de Transports
```

### Configuration Tailwind

Le fichier `tailwind.config.js` est déjà configuré pour utiliser les couleurs et thèmes de l'application.

## 📄 Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Construit l'application pour la production
- `npm run start` - Démarre l'application construite
- `npm run lint` - Exécute ESLint pour vérifier le code
- `npm run test` - Lance les tests unitaires
- `npm run e2e` - Lance les tests end-to-end avec Cypress

## 🧪 Tests

Ce projet utilise :
- **Jest** pour les tests unitaires
- **Testing Library** pour les tests de composants
- **Cypress** pour les tests end-to-end

## 🌐 Déploiement

L'application peut être déployée sur diverses plateformes comme Vercel, Netlify ou un serveur personnalisé.

## 📝 Normes de codage

- Suivre les principes de Clean Code
- Utiliser des noms descriptifs pour les variables et fonctions
- Commenter le code complexe

