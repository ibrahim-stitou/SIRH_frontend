// Test file to verify the Avances/Acomptes types

// Test data - should compile without errors
import { AvanceInterface } from '@/types/avance';

const testAvance: AvanceInterface = {
  id: 1,
  employe_id: 1000,
  type: 'Avance',
  statut: 'Brouillon',
  date_demande: '2026-01-09',
  created_at: '2026-01-09T10:00:00Z',
  updated_at: '2026-01-09T10:00:00Z',
  periode_paie: {
    mois: 'Février',
    annee: 2026
  },
  montant_avance: 1500
};

const testAcompte: AvanceInterface = {
  id: 2,
  employe_id: 1001,
  type: 'Acompte',
  statut: 'En_attente',
  date_demande: '2026-01-09',
  created_at: '2026-01-09T10:00:00Z',
  updated_at: '2026-01-09T10:00:00Z',
  periode_paie: {
    mois: 'Mars',
    annee: 2026
  },
  montant_avance: 2000
};

console.log('Type validation test passed!');
console.log('Avance:', testAvance);
console.log('Acompte:', testAcompte);
