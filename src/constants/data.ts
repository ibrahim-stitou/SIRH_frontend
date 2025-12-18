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
        // { title: t('sidebar.orgChart'), url: '/admin/personnel/organigramme', icon: 'companies', shortcut: ['o','g'], description: 'US-EMP-006' },
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
