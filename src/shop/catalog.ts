/**
 * Catálogo de la tienda de Chedex Pulse. Única fuente de verdad: ids, tipos y precios.
 * El servidor decide el precio; la web solo lo muestra. Precios y parámetros iniciales: ajustables aquí.
 */
export type ShopKind = 'pieces' | 'board' | 'protector';

export interface CatalogItem {
  id: string;
  kind: ShopKind;
  name: string;
  description: string;
  /** En Chedex. 0 = incluido desde el inicio. */
  price: number;
  /** Autoría y licencia, para la página de créditos. */
  credit: string;
}

/** Racha necesaria para ganar 1 Chedex (días 5, 10, 15...). */
export const STREAK_DAYS_PER_CHEDEX = 5;
/** Máximo de protectores de racha guardados a la vez. */
export const PROTECTOR_MAX = 2;
export const PROTECTOR_ID = 'protector';
export const DEFAULT_PIECES = 'contorno';
export const DEFAULT_BOARD = 'noche';

export const CATALOG: CatalogItem[] = [
  {
    id: 'contorno',
    kind: 'pieces',
    name: 'Contorno',
    description: 'Piezas clásicas con contorno naranja, hechas para Chedex.',
    price: 0,
    credit: 'Chedex, material propio',
  },
  {
    id: 'cburnett',
    kind: 'pieces',
    name: 'Clásicas',
    description: 'Las piezas de siempre, claras y conocidas.',
    price: 0,
    credit: 'Colin M.L. Burnett, licencia GPLv2+ (conjunto «cburnett» de Lichess)',
  },
  {
    id: 'geo',
    kind: 'pieces',
    name: 'Geométricas',
    description: 'Formas simples y limpias, dibujadas para Chedex.',
    price: 3,
    credit: 'Chedex, material propio',
  },
  { id: 'noche', kind: 'board', name: 'Noche', description: 'Pizarra oscura con marco: el aspecto de Chedex.', price: 0, credit: 'Chedex, material propio' },
  { id: 'clasico', kind: 'board', name: 'Clásico', description: 'Madera clara y oscura.', price: 0, credit: 'Chedex, material propio' },
  { id: 'pizarra', kind: 'board', name: 'Pizarra', description: 'Grises azulados, para concentrarse.', price: 2, credit: 'Chedex, material propio' },
  { id: 'bosque', kind: 'board', name: 'Bosque', description: 'Verde profundo y marfil.', price: 2, credit: 'Chedex, material propio' },
  { id: 'papel', kind: 'board', name: 'Papel', description: 'Tonos suaves de bajo contraste.', price: 2, credit: 'Chedex, material propio' },
  { id: 'brasa', kind: 'board', name: 'Brasa', description: 'Negro y naranja de Chedex.', price: 2, credit: 'Chedex, material propio' },
  {
    id: PROTECTOR_ID,
    kind: 'protector',
    name: 'Protector de racha',
    description: 'Si pasa un día sin estudiar, tu racha continúa. Cubre un solo día seguido.',
    price: 2,
    credit: 'Chedex, material propio',
  },
];

export const getItem = (id: string): CatalogItem | undefined => CATALOG.find((i) => i.id === id);
