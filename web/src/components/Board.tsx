import { useEffect, useRef } from 'react';
import { Chessground } from 'chessground';
import type { Api } from 'chessground/api';
import type { DrawShape } from 'chessground/draw';
import type { Key } from 'chessground/types';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';
import type { BoardMark } from '../../../src/content/schema';
import { isInCheck, legalDests, turnOf } from '../chess';
import { useSession } from '../session';
import { appearanceClass } from '../shop';

export function marksToShapes(mark: BoardMark | undefined): DrawShape[] {
  const shapes: DrawShape[] = [];
  for (const s of mark?.squares ?? []) shapes.push({ orig: s as Key, brush: 'green' });
  for (const [a, b] of mark?.arrows ?? []) shapes.push({ orig: a as Key, dest: b as Key, brush: 'green' });
  return shapes;
}

interface Props {
  fen: string;
  interactive?: boolean;
  orientation?: 'white' | 'black';
  lastMove?: [string, string] | undefined;
  shapes?: DrawShape[];
  /** cambia para forzar el redibujado de la misma posición (reintentos) */
  nonce?: number;
  label: string;
  /** Usa el tablero y las piezas por defecto (landing y demostración pública), no lo equipado. */
  plain?: boolean;
  /** Clases de tablero y piezas a aplicar en lugar de lo equipado (p. ej. `theme-noche pieces-contorno` en la landing). */
  appearance?: string;
  onMove?: (from: string, to: string) => void;
  /** Se llama al tocar una casilla (también con el tablero no interactivo); no mueve piezas por sí sola. */
  onSelectSquare?: (sq: string) => void;
  /** Casilla marcada (solo con onSelectSquare): se resalta con un círculo. */
  selectedSquare?: string | null;
}

export function Board({ fen, interactive = false, orientation, lastMove, shapes = [], nonce = 0, label, plain = false, appearance, onMove, onSelectSquare, selectedSquare }: Props) {
  const { equipped } = useSession();
  const el = useRef<HTMLDivElement>(null);
  const cg = useRef<Api | null>(null);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const onSelectRef = useRef(onSelectSquare);
  onSelectRef.current = onSelectSquare;
  const wantsSelect = !!onSelectSquare;

  useEffect(() => {
    if (!el.current) return;
    cg.current = Chessground(el.current, { drawable: { enabled: false }, coordinates: true });
    return () => {
      cg.current?.destroy();
      cg.current = null;
    };
  }, []);

  useEffect(() => {
    const api = cg.current;
    if (!api) return;
    const turn = turnOf(fen);
    api.set({
      fen,
      orientation: orientation ?? turn,
      turnColor: turn,
      check: isInCheck(fen),
      lastMove: lastMove as Key[] | undefined,
      viewOnly: !interactive && !wantsSelect,
      movable: {
        free: false,
        color: interactive ? turn : undefined,
        dests: interactive ? (legalDests(fen) as Map<Key, Key[]>) : new Map(),
        showDests: true,
        events: { after: (o, d) => onMoveRef.current?.(o, d) },
      },
      events: { select: (k) => onSelectRef.current?.(k) },
      premovable: { enabled: false },
      draggable: wantsSelect && !interactive ? { enabled: false } : { showGhost: true },
      animation: { enabled: true, duration: 200 },
    });
  }, [fen, interactive, wantsSelect, orientation, lastMove?.[0], lastMove?.[1], nonce]);

  const allShapes: DrawShape[] = selectedSquare && wantsSelect ? [...shapes, { orig: selectedSquare as Key, brush: 'yellow' }] : shapes;
  const shapesKey = JSON.stringify(allShapes);
  useEffect(() => {
    cg.current?.setAutoShapes(allShapes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapesKey, nonce]);

  return (
    <div className={`board-frame ${appearance ?? appearanceClass(plain ? null : equipped)}`} role="group" aria-label={label}>
      <div className="board-square">
        <div ref={el} className="board-cg" />
      </div>
    </div>
  );
}
