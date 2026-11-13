/** Créditos visibles al usuario: objetos del catálogo (campo `credit`) y librerías o recursos de terceros. */
import { CATALOG, type CatalogItem, type ShopKind } from '../../src/shop/catalog';

export interface Library {
  name: string;
  author: string;
  license: string;
  url: string;
  use: string;
}

export const LIBRARIES: Library[] = [
  {
    name: 'chessground',
    author: 'Thibault Duplessis y colaboradores de Lichess',
    license: 'GPL-3.0-or-later',
    url: 'https://github.com/lichess-org/chessground',
    use: 'El tablero interactivo.',
  },
  {
    name: 'chessops',
    author: 'Niklas Fiekas',
    license: 'GPL-3.0-or-later',
    url: 'https://github.com/niklasf/chessops',
    use: 'Las reglas del ajedrez: jugadas legales y notación.',
  },
  {
    name: 'Piezas «cburnett» de Lichess',
    author: 'Colin M.L. Burnett',
    license: 'GPLv2+',
    url: 'https://github.com/lichess-org/lila/blob/master/COPYING.md',
    use: 'El juego de piezas clásicas, incluido en chessground.',
  },
  {
    name: 'DM Sans',
    author: 'The DM Sans Project Authors',
    license: 'SIL Open Font License 1.1',
    url: 'https://github.com/googlefonts/dm-fonts',
    use: 'La tipografía de la aplicación.',
  },
];

const ORDER: ShopKind[] = ['pieces', 'board', 'protector'];

export const CREDIT_GROUP_LABEL: Record<ShopKind, string> = {
  pieces: 'Juegos de piezas',
  board: 'Temas de tablero',
  protector: 'Protector de racha',
};

/** Objetos del catálogo agrupados por tipo, para la página de créditos. */
export function catalogCredits(): { kind: ShopKind; label: string; items: CatalogItem[] }[] {
  return ORDER.map((kind) => ({
    kind,
    label: CREDIT_GROUP_LABEL[kind],
    items: CATALOG.filter((i) => i.kind === kind),
  })).filter((g) => g.items.length > 0);
}

/** Une los objetos que comparten el mismo crédito en una sola fila («Pizarra, Bosque: Chedex, material propio»). */
export function creditRows(items: CatalogItem[]): { names: string[]; credit: string }[] {
  const rows: { names: string[]; credit: string }[] = [];
  for (const it of items) {
    const row = rows.find((r) => r.credit === it.credit);
    if (row) row.names.push(it.name);
    else rows.push({ names: [it.name], credit: it.credit });
  }
  return rows;
}
