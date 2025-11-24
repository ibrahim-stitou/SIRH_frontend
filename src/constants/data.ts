import { NavItem } from 'types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

// Main export (keep for backward compatibility)
export const navItems: NavItem[] = [
  {
    title: 'Tableau de bord',
    url: '/admin/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Flotte',
    url: '#',
    icon: 'truck',
    isActive: true,
    items: [
      {
        title: 'Véhicules',
        url: '/admin/flotte/vehicules',
        icon: 'truck',
        shortcut: ['v', 'v']
      },
      {
        title: 'Assurances',
        url: '/admin/flotte/assurances',
        icon: 'briefcase',
        shortcut: ['a', 'a']
      },
      {
        title: 'Visites techniques',
        url: '/admin/flotte/visites-techniques',
        icon: 'calendar',
        shortcut: ['t', 't']
      },
      {
        title: 'Vignettes',
        url: '/admin/flotte/vignettes',
        icon: 'receipt',
        shortcut: ['g', 'g']
      },
      {
        title: 'docs & Autorisations',
        url: '/admin/flotte/autorisations',
        icon: 'lisence',
        shortcut: ['a', 'u']
      },
      {
        title: 'Carburants',
        url: '/admin/flotte/carburants',
        icon: 'fuel',
        shortcut: ['c', 'c']
      },
      {
        title: 'Acquisitions',
        url: '/admin/flotte/acquisitions',
        icon: 'shoppingCart',
        shortcut: ['a', 'q']
      },
      {
        title: 'Extincteurs',
        url: '/admin/flotte/extincteurs',
        icon: 'flame',
        shortcut: ['e', 'x']
      },
      {
        title: 'Paramètres',
        url: '/admin/flotte/parametres',
        icon: 'settings',
        shortcut: ['p', 'p'],
        // items: [
        //   {
        //     title: 'Modèles',
        //     url: '/admin/flotte/parametres/modeles',
        //     icon: 'template',
        //     shortcut: ['m', 'd']
        //   },
        //   {
        //     title: 'Alertes',
        //     url: '/admin/flotte/parametres/alertes',
        //     icon: 'bell',
        //     shortcut: ['a', 'l']
        //   }
        // ]
      }
    ]
  },
  {
    title: 'Personnel',
    url: '#',
    icon: 'users',
    isActive: false,
    items: [
      {
        title: 'Collaborateurs (203)',
        url: '/admin/personnel/collaborateurs',
        icon: 'user',
        shortcut: ['c', 'o']
      },
      {
        title: 'Contrats (183)',
        url: '/admin/personnel/contrats',
        icon: 'fileText',
        shortcut: ['c', 't']
      },
      {
        title: 'Epis',
        url: '/admin/personnel/epis',
        icon: 'shirt',
        shortcut: ['e', 'p']
      },
      {
        title: 'Permis de conduire (163)',
        url: '/admin/personnel/permis',
        icon: 'id',
        shortcut: ['p', 'd']
      },
      {
        title: 'Infractions routières (117)',
        url: '/admin/personnel/infractions',
        icon: 'alertTriangle',
        shortcut: ['i', 'r']
      },
      {
        title: 'Salaires (104)',
        url: '/admin/personnel/salaires',
        icon: 'currencyDollar',
        shortcut: ['s', 'a']
      },
      {
        title: 'Passeports (166)',
        url: '/admin/personnel/passeports',
        icon: 'passport',
        shortcut: ['p', 'p']
      },
      {
        title: 'Visas (122)',
        url: '/admin/personnel/visas',
        icon: 'plane',
        shortcut: ['v', 's']
      },
      {
        title: 'Assurances (107)',
        url: '/admin/personnel/assurances',
        icon: 'shield',
        shortcut: ['a', 's']
      },
      {
        title: 'Absences (1495)',
        url: '/admin/personnel/absences',
        icon: 'calendarx',
        shortcut: ['a', 'b']
      },
      {
        title: 'Congés (169)',
        url: '/admin/personnel/conges',
        icon: 'calendarcheck',
        shortcut: ['c', 'g']
      },
      {
        title: 'Formations (0)',
        url: '/admin/personnel/formations',
        icon: 'book',
        shortcut: ['f', 'o']
      },
      {
        title: 'Entretiens (0)',
        url: '/admin/personnel/entretiens',
        icon: 'message',
        shortcut: ['e', 'n']
      }
    ]
  },
  {
    title: 'Consommation',
    url: '#',
    icon: 'consommation',
    isActive: false,
    items: [
      {
        title: 'Carburant',
        url: '/admin/consommation/carburant',
        icon: 'fuel',
        shortcut: ['c', 'a']
      },
      {
        title: 'AdBlue',
        url: '/admin/consommation/adblue',
        icon: 'fuel',
        shortcut: ['a', 'd']
      },
      {
        title: 'Cartes',
        url: '/admin/consommation/cartes',
        icon: 'creditCard',
        shortcut: ['c', 't']
      },
      {
        title: 'Recharges des cartes',
        url: '/admin/consommation/recharges-cartes',
        icon: 'import',
        shortcut: ['r', 'c']
      },
      {
        title: 'Citernes',
        url: '/admin/consommation/citernes',
        icon: 'truck',
        shortcut: ['c', 'i']
      },
      {
        title: 'Recharges des citernes',
        url: '/admin/consommation/recharges-citernes',
        icon: 'import',
        shortcut: ['r', 't']
      },
      {
        title: 'Services',
        url: '/admin/consommation/services',
        icon: 'settings',
        shortcut: ['s', 'v']
      },
      {
        title: 'Autoroutes',
        url: '/admin/consommation/autoroutes',
        icon: 'road',
        shortcut: ['a', 'u']
      },
      {
        title: 'Dépenses',
        url: '/admin/consommation/depenses',
        icon: 'expenseNote',
        shortcut: ['d', 'p']
      },
      {
        title: 'Frais généraux',
        url: '/admin/consommation/frais-generaux',
        icon: 'expenseNote',
        shortcut: ['f', 'g']
      }
    ]
  },
  {
    title: 'Affectation',
    url: '#',
    icon: 'affectation',
    isActive: false,
    items: [
      {
        title: 'Affectation',
        url: '/admin/affectation',
        icon: 'affectation',
        shortcut: ['a', 'f']
      },
      {
        title: 'Remorques',
        url: '/admin/affectation/remorques',
        icon: 'truck',
        shortcut: ['r', 'm']
      }
    ]
  },
  {
    title: 'Maintenance',
    url: '#',
    icon: 'maintenance',
    isActive: false,
    items: [
      {
        title: 'Garages',
        url: '/admin/maintenance/garages',
        icon: 'garage',
        shortcut: ['g', 'g']
      },
      {
        title: 'Interventions',
        url: '/admin/maintenance/interventions',
        icon: 'zoom',
        shortcut: ['i', 't']
      },
      {
        title: 'Paramètres',
        url: '/admin/maintenance/parametres',
        icon: 'settings',
        shortcut: ['p', 'p'],
      }
    ]
  }
];



// New role-based exports
export const adminNavItems: NavItem[] = [...navItems];

export const consultantNavItems: NavItem[] = [
];

export const getNavItemsByRole = (role: 'admin' | 'consultant'): NavItem[] => {
  switch (role) {
    case 'admin':
      return adminNavItems;
    case 'consultant':
      return consultantNavItems;
    default:
      return [];
  }
};

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}