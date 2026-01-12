/**
 * Export centralisé du module parametres
 */

export { ParametresPage } from './parametres-page';
export { ParameterCard } from './parameter-card';
export { ParametreCategorieCard } from './parametre-categorie-card';
export {
  PARAMETRES_LIST,
  PARAMETRES_CATEGORIES,
  getParametresByCategorie,
  getParametreByCode
} from './parametres-config';
export type { ParametreItem, ParametreCategorie } from './types';
