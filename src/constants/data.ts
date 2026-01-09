import { NavItem } from 'types';
import { useLanguage } from '@/context/LanguageContext';

export const useNavItems = (): NavItem[] => {
  const { t } = useLanguage();
  return [
    {
      title: t('sidebar.dashboard'),
      url: '/admin/overview',
      icon: 'dashboard',
      isActive: true,
      items: []
    },
    {
      title: t('sidebar.employeeFolder'),
      url: '#',
      icon: 'users',
      isActive: false,
      items: [
        {
          title: t('sidebar.employes'),
          url: '/admin/personnel/employes',
          icon: 'user',
          shortcut: ['r', 'e'],
          description: 'US-EMP-001'
        },
        {
          title: t('sidebar.certificates'),
          url: '/admin/personnel/attestations',
          icon: 'fileText',
          shortcut: ['a', 't'],
          description: 'US-EMP-007'
        }
      ]
    },
    {
      title: t('sidebar.contratEtMovements'),
      url: '#',
      icon: 'fileText',
      isActive: false,
      items: [
        {
          title: t('sidebar.contrat'),
          url: '/admin/contrats-mouvements/contrats',
          icon: 'fileText',
          shortcut: ['r', 'e'],
          description: 'US-PRO-001'
        },
        {
          title: t('sidebar.avenants'),
          url: '/admin/contrats-mouvements/avenants',
          icon: 'file',
          shortcut: ['a', 'v'],
          description: 'US-PRO-002'
        }
      ]
    },
    {
      title: t('sidebar.siegeEtGroupe'),
      url: '/admin/sieges-groupes',
      icon: 'companies',
      description: 'US-PRO-003'
    },
    {
      title: t('sidebar.absencesConges'),
      url: '#',
      icon: 'calendar',
      description: 'US-EMP-008',
      items: [
        {
          title: t('sidebar.absences'),
          url: '/admin/absences',
          icon: 'userRoundCheck',
          shortcut: ['a', 'b'],
          description: 'US-EMP-009'
        },
        {
          title: t('sidebar.calendrier'),
          url: '/admin/absences/calendrier',
          icon: 'calendarRange',
          shortcut: ['c', 'o'],
          description: 'US-EMP-010'
        },
        {
          title: t('sidebar.conges'),
          url: '/admin/conges',
          icon: 'receipt',
          shortcut: ['c', 'o'],
          description: 'US-EMP-010'
        }
      ]
    },
    {
      title: t('sidebar.tempsEtActivites'),
      icon: 'clock',
      url: '#',
      description: 'US-EMP-011',
      items: [
        {
          title: t('sidebar.pointages'),
          url: '/admin/pointages',
          icon: 'pointage',
          shortcut: ['p', 'o'],
          description: 'US-EMP-012'
        },
        {
          title: t('sidebar.tableauPresence'),
          url: '/admin/tableau-presence',
          icon: 'IconTablePlus',
          shortcut: ['t', 'p'],
          description: 'US-EMP-014'
        }
      ]
    },
    {
      title: t('sidebar.paie'),
      url: '#',
      icon: 'bank',
      description: 'US-EMP-013',
      items: [
        {
          title: t('sidebar.periodesPaie'),
          url: '/admin/paie/periode',
          icon: 'iconcCashRegister',
          shortcut: ['p', 'p'],
          description: 'US-EMP-015'
        },
        {
          title: t('sidebar.avancesAcomptes'),
          url: '/admin/paie/avance',
          icon: 'iconTicket',
          shortcut: ['p', 'p'],
          description: 'US-EMP-016'
        },
        {
          title: t('sidebar.prets'),
          url: '/admin/paie/pret',
          icon: 'cashPlus',
          shortcut: ['p', 'p'],
          description: 'US-EMP-015'
        },
        {
          title: t('sidebar.fraisDeplacements'),
          url: '/admin/paie/frais',
          icon: 'car',
          shortcut: ['f', 'd'],
          description: 'US-FRA-001'
        }
      ]
    },
    {
      title: t('sidebar.accidentsTravail'),
      url: '/admin/gestion-social/accidents-travail',
      icon: 'ambulance',
      shortcut: ['a', 't'],
      description: 'US-AT-001'
    }
  ];
};

export const getNavItemsByRole = (role: 'admin' | 'consultant'): NavItem[] => {
  // Hook cannot be used outside component; keep fallback static if needed
  return [];
};

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}
