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
const AI_CREDIT = 'Chedex, material propio (ilustraciones generadas con IA por el equipo)';

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
  ...(
    [
      ['plano', 'Plano', 'Siluetas grises y negras sin adornos, fáciles de leer.', 4],
      ['pixel', 'Píxel', 'Piezas de videojuego retro: oro y azul contra sombra y rojo.', 5],
      ['neon', 'Neón', 'Piezas cyberpunk que brillan en cian y magenta.', 5],
      ['catedral', 'Catedral', 'Reyes y obispos góticos de marfil y piedra negra con vidrieras.', 6],
      ['egipto', 'Egipto', 'Faraones y dioses de oro y turquesa contra lapislázuli.', 6],
      ['vikingo', 'Vikingo', 'Guerreros tallados en madera con runas y escudos.', 6],
      ['olimpo', 'Olimpo', 'Dioses griegos de mármol y oro contra bronce.', 7],
      ['samurai', 'Samurái', 'Samuráis, castillos y templos del Japón feudal.', 7],
      ['sombras', 'Sombras', 'Paladines de plata contra un ejército de no muertos.', 7],
      ['cosmos', 'Cosmos', 'Astronautas y estaciones contra naves y soldados oscuros.', 8],
    ] as const
  ).map(([id, name, description, price]) => ({ id, kind: 'pieces' as const, name, description, price, credit: AI_CREDIT })),
  { id: 'noche', kind: 'board', name: 'Noche', description: 'Pizarra oscura con marco: el aspecto de Chedex.', price: 0, credit: 'Chedex, material propio' },
  { id: 'clasico', kind: 'board', name: 'Clásico', description: 'Madera clara y oscura.', price: 0, credit: 'Chedex, material propio' },
  { id: 'pizarra', kind: 'board', name: 'Pizarra', description: 'Grises azulados, para concentrarse.', price: 2, credit: 'Chedex, material propio' },
  { id: 'bosque', kind: 'board', name: 'Bosque', description: 'Verde profundo y marfil.', price: 2, credit: 'Chedex, material propio' },
  { id: 'papel', kind: 'board', name: 'Papel', description: 'Tonos suaves de bajo contraste.', price: 2, credit: 'Chedex, material propio' },
  { id: 'brasa', kind: 'board', name: 'Brasa', description: 'Negro y naranja de Chedex.', price: 2, credit: 'Chedex, material propio' },
  // Los tableros a juego llevan «-tablero»: cp_inventory guarda solo item_id, sin tipo, y los ids deben ser únicos.
  ...(
    [
      ['plano', 'Plano', 'Grises limpios y planos, sin distracciones.', 2],
      ['pixel', 'Píxel', 'Casillas de color plano con bordes duros, como un juego retro.', 2],
      ['catedral', 'Catedral', 'Piedra gris cálida y azul de vidriera.', 3],
      ['neon', 'Neón', 'Casi negro con una cuadrícula tenue de cian y magenta.', 3],
      ['olimpo', 'Olimpo', 'Mármol claro y bronce.', 3],
      ['samurai', 'Samurái', 'Tatami y madera lacada con marco negro y rojo.', 3],
      ['egipto', 'Egipto', 'Arena del desierto y lapislázuli.', 3],
      ['vikingo', 'Vikingo', 'Madera y piedra con detalles azules.', 3],
      ['sombras', 'Sombras', 'Piedra oscura con un brillo verde tenue.', 3],
      ['cosmos', 'Cosmos', 'Casillas translúcidas sobre un cielo estrellado.', 4],
    ] as const
  ).map(([id, name, description, price]) => ({ id: `${id}-tablero`, kind: 'board' as const, name, description, price, credit: 'Chedex, material propio' })),
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
