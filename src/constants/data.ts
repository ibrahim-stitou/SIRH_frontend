import { NavItem } from 'types';
import { useLanguage } from '@/context/LanguageContext';

export const useNavItems = (): NavItem[] => {
  const { t } = useLanguage();
  return [
    {
      title: t('sidebar.dashboard'),
      url:'/admin/overview',
      icon:'dashboard',
      isActive:true,
      items:[]
    },
    {
      title: t('sidebar.employeeFolder'),
      url: '#',
      icon: 'users',
      isActive: false,
      items: [
        { title: t('sidebar.searchList'), url: '/admin/personnel/employes', icon: 'user', shortcut: ['r','e'], description: 'US-EMP-001' },
        { title: t('sidebar.createEmployee'), url: '/admin/personnel/employes/create', icon: 'userPen', shortcut: ['c','r'], description: 'US-EMP-002' },
        { title: t('sidebar.orgChart'), url: '/admin/personnel/organigramme', icon: 'companies', shortcut: ['o','g'], description: 'US-EMP-006' },
        { title: t('sidebar.certificates'), url: '/admin/personnel/attestations', icon: 'fileText', shortcut: ['a','t'], description: 'US-EMP-007' }
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