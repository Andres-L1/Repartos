import { useEffect, useMemo, useReducer, useRef } from 'react';
import type { GameAnalysis } from '../../../src/review/types';
import { keyErrors } from '../../../src/review/select';
import { describeMove } from '../../../src/pedagogy/error-lesson';
import { fenAt, indexBeforePly, initViewer, lastMoveAt, moveAt, viewerReducer } from '../review/gameViewer';
import { Board } from './Board';
import { Icon } from './Icon';
import '../review-viewer.css';

interface Props {
  analysis: GameAnalysis;
  /** Posición con la que se abre (0 = inicio). */
  startIndex?: number;
  /** Texto del botón de cierre (por defecto, «Volver a la lección»). */
  closeLabel?: string;
  onClose: () => void;
}

const KEY_ACTION = { ArrowLeft: 'prev', ArrowRight: 'next', Home: 'first', End: 'last' } as const;

function isTextField(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
  return el.tagName === 'INPUT' && !['button', 'checkbox', 'radio'].includes((el as HTMLInputElement).type);
}

export function GameViewer({ analysis, startIndex = 0, closeLabel = 'Volver a la lección', onClose }: Props) {
  const { moves } = analysis;
  const [state, dispatch] = useReducer(viewerReducer, undefined, () => initViewer(moves.length, startIndex));
  const { index, count } = state;
  const errors = useMemo(() => keyErrors(analysis), [analysis]);
  const errorPlies = useMemo(() => new Set(errors.map((e) => e.move.ply)), [errors]);
  const listRef = useRef<HTMLOListElement>(null);

  // El visor solo está montado mientras se ve, así que las flechas solo actúan sobre él en ese caso.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || isTextField(e.target)) return;
      const type = KEY_ACTION[e.key as keyof typeof KEY_ACTION];
      if (!type) return;
      e.preventDefault();
      dispatch({ type });
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // La jugada actual siempre queda a la vista dentro de la lista.
  useEffect(() => {
    // Solo se desplaza la lista (en vertical o, en el móvil, en horizontal), nunca la página.
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!list || !el) return;
    const l = list.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    // En horizontal se centra, para ver también las jugadas que vienen.
    if (r.left < l.left || r.right > l.right) list.scrollLeft += r.left + r.width / 2 - (l.left + l.width / 2);
    if (r.top < l.top) list.scrollTop += r.top - l.top - 4;
    else if (r.bottom > l.bottom) list.scrollTop += r.bottom - l.bottom + 4;
  }, [index]);

  const fen = fenAt(moves, index);
  if (!fen) return null;

  const current = moveAt(moves, index);
  const mine = current?.color === analysis.color;
  let headline = 'Posición inicial: todavía no se ha movido ninguna pieza.';
  if (current) {
    const w = describeMove(current.fenBefore, current.uci, current.san);
    const what = `${w.inf.replace(/^mover /, '')}${w.san ? ` (${w.san})` : ''}`;
    headline = `Jugada ${Math.ceil(current.ply / 2)} · ${mine ? 'tú movías' : 'movía tu rival'} con ${current.color === 'white' ? 'blancas' : 'negras'}: ${what}`;
  }
  const lostHere = !!current && mine && errorPlies.has(current.ply) && (current.classification === 'mistake' || current.classification === 'blunder');

  const rows: { n: number; items: { i: number; san: string; ply: number }[] }[] = [];
  moves.forEach((m, k) => {
    const n = Math.ceil(m.ply / 2);
    let row = rows[rows.length - 1];
    if (!row || row.n !== n) {
      row = { n, items: [] };
      rows.push(row);
    }
    row.items.push({ i: k + 1, san: m.san, ply: m.ply });
  });

  return (
    <section className="gv t-card" aria-label="Visor de la partida">
      <div className="gv-top">
        <button type="button" className="t-btn t-btn-secondary t-btn-sm" onClick={onClose}>
          <Icon name="back" size={20} />
          {closeLabel}
        </button>
      </div>
      <div className="gv-main">
        <div className="gv-board">
          <Board fen={fen} orientation={analysis.color} lastMove={lastMoveAt(moves, index)} label="Tablero de la partida" />
        </div>
        <div className="gv-side">
          <p className="gv-now" aria-live="polite">
            {headline}
          </p>
          {lostHere && <p className="gv-lost">Aquí fue donde se te escapó la ventaja.</p>}
          <div className="gv-nav" role="group" aria-label="Moverse por la partida">
            <button type="button" className="t-btn t-btn-secondary t-btn-sm t-btn-icon" aria-label="Ir al inicio" disabled={index === 0} onClick={() => dispatch({ type: 'first' })}>
              <Icon name="skipStart" size={22} />
            </button>
            <button type="button" className="t-btn t-btn-secondary t-btn-sm t-btn-icon" aria-label="Jugada anterior" disabled={index === 0} onClick={() => dispatch({ type: 'prev' })}>
              <Icon name="prev" size={22} />
            </button>
            <button type="button" className="t-btn t-btn-secondary t-btn-sm t-btn-icon" aria-label="Jugada siguiente" disabled={index === count} onClick={() => dispatch({ type: 'next' })}>
              <Icon name="next" size={22} />
            </button>
            <button type="button" className="t-btn t-btn-secondary t-btn-sm t-btn-icon" aria-label="Ir al final" disabled={index === count} onClick={() => dispatch({ type: 'last' })}>
              <Icon name="skipEnd" size={22} />
            </button>
          </div>
          <p className="gv-hint muted">Usa las flechas ← → del teclado para moverte por la partida</p>
          {errors.length > 0 && (
            <div className="gv-errors">
              {errors.map((e) => (
                <button key={e.move.ply} type="button" className="t-btn t-btn-ghost t-btn-sm" onClick={() => dispatch({ type: 'goto', index: indexBeforePly(moves, e.move.ply) })}>
                  <Icon name="flag" size={18} />
                  Ir al error de la jugada {Math.ceil(e.move.ply / 2)}
                </button>
              ))}
            </div>
          )}
          <ol className="gv-list" ref={listRef} aria-label="Jugadas de la partida">
            {rows.map((row) => (
              <li key={row.n} className="gv-row">
                <span className="gv-num">{row.n}.</span>
                {row.items.map((it) => {
                  const isErr = errorPlies.has(it.ply);
                  return (
                    <button
                      key={it.i}
                      type="button"
                      className={`gv-move${isErr ? ' gv-move-err' : ''}`}
                      aria-current={it.i === index ? 'step' : undefined}
                      onClick={() => dispatch({ type: 'goto', index: it.i })}
                    >
                      {it.san}
                      {isErr && (
                        <>
                          <Icon name="flag" size={14} />
                          <span className="gv-tag">Error</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
