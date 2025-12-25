import { Metadata } from 'next';

export const metadata :Metadata = {
  title: '|Gestion des paies',
  description: 'Gérer et consulter les paies des employés'
}
export default async function PaieLayout() {
  // ici on va ajouter tabs avec redirection on aura 4
  // 1 - période paie : path = /     (/admin/paie/[id])
  // 2 - element variable  : path =/ev  (/admin/paie/[id]/ev)
  // 3 - virements : path = /virements  (/admin/paie/[id]/virements)
  // 4 - bulletin de paie : path = /bulletins  (/admin/paie/[id]/bulletins)

}