export const getAlertNavigationPath = (modelName: string): string => {
  const modelRoutes: Record<string, string> = {
    'App\\Models\\Assurance': '/admin/flotte/assurances',
    'App\\Models\\Autorisation': '/admin/flotte/autorisations',
    'App\\Models\\Vignette': '/admin/flotte/vignettes',
    'App\\Models\\VisiteTechnique': '/admin/flotte/visites-techniques',
    'App\\Models\\Acquisition': '/admin/flotte/acquisitions',
    'App\\Models\\Acquesition': '/admin/flotte/acquisitions', // Handle typo in backend
    'App\\Models\\Extincteur': '/admin/flotte/extincteurs',
    'App\\Models\\Vehicule': '/admin/flotte/vehicules',
    'App\\Models\\Maintenance': '/admin/flotte/maintenances',
    'App\\Models\\Carburant': '/admin/flotte/carburants'
  };

  return modelRoutes[modelName] || '/admin/flotte';
};

export const getAlertColor = (count: number): string => {
  if (count === 0) return 'border-l-gray-300 bg-gray-50';
  if (count <= 2) return 'border-l-yellow-400 bg-yellow-50';
  if (count <= 5) return 'border-l-orange-400 bg-orange-50';
  return 'border-l-red-500 bg-red-50';
};

export const getAlertTextColor = (count: number): string => {
  if (count === 0) return 'text-gray-500';
  if (count <= 2) return 'text-yellow-600';
  if (count <= 5) return 'text-orange-600';
  return 'text-red-600';
};
