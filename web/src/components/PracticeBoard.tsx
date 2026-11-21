import { useEffect, useMemo, useRef, useState } from 'react';
import type { PracticeStep } from '../../../src/content/schema';
import { followMove } from '../../../src/shared/moves';
import { Board, marksToShapes } from './Board';
import { Icon } from './Icon';
import { playSound } from '../sound';
import { applyUci, canonicalUci, lastMoveOf, needsPromotion, PROMO_ROLES, sanOfUci, turnOf } from '../chess';
import { TypedMove } from './TypedMove';
import { ExplainButton } from './ExplainButton';

export interface StepResult {
  /** acertado a la primera (sin errores) */
  ok: boolean;
  mistakes: number;
}

type Status = 'playing' | 'rival' | 'wrong' | 'correct';

interface Props {
  step: PracticeStep;
  mode: 'practice' | 'evaluation';
  onDone(r: StepResult): void;
  isLast: boolean;
  /** Tablero y piezas por defecto (portada). */
  plain?: boolean;
  /** Clases de tablero y piezas propias (landing). */
  appearance?: string;
  /** Vitrina de la landing: sin pista, sin jugada escrita y con la marca de la pieza solo hasta mover. */
  showcase?: boolean;
  /** Qué paso de qué lección es: con esto se ofrece «¿Por qué?» tras ver la solución (el servidor toma los hechos de su contenido). */
  explain?: { lessonId: string; stepKind: 'practice' | 'evaluation'; stepIndex: number };
}

export function PracticeBoard({ step, mode, onDone, isLast, plain = false, appearance, showcase = false, explain }: Props) {
  const [fen, setFen] = useState(step.fen);
  // Línea efectiva: la principal, o la de la rama si el alumno jugó una alternativa intermedia verificada.
  const [line, setLine] = useState<readonly string[]>(step.solutionUci);
  const [idx, setIdx] = useState(0); // índice en solutionUci del próximo movimiento del alumno
  const [status, setStatus] = useState<Status>('playing');
  const [feedback, setFeedback] = useState('');
  const [lastMove, setLastMove] = useState<[string, string] | undefined>();
  const [mistakes, setMistakes] = useState(0);
  const [hint, setHint] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [promo, setPromo] = useState<{ from: string; to: string } | null>(null);
  const [solutionSan, setSolutionSan] = useState('');
  const timer = useRef<number | undefined>(undefined);
  const fenBefore = useRef(step.fen);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Cada ejercicio nuevo nace tras pulsar un botón que desaparece: sin esto el foco cae al documento y el teclado vuelve a empezar desde arriba.
  const prompt = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (!showcase) prompt.current?.focus({ preventScroll: true });
  }, [showcase]);

  const shapes = useMemo(() => {
    const s = showcase && lastMove ? [] : marksToShapes(step);
    if (hint && status === 'playing') {
      const next = line[idx];
      if (next) s.push({ orig: next.slice(0, 2) as never, brush: 'yellow' });
    }
    return s;
  }, [step, hint, idx, status, showcase, lastMove, line]);

  const orientation = turnOf(step.fen);
  const interactive = status === 'playing' && !promo;
  const canHint = mode === 'practice' && !!step.hint && !showcase;

  function finishCorrect(msg: string) {
    setStatus('correct');
    setFeedback(msg);
    // Tras el sonido de la jugada, un aviso breve de acierto (uno por ejercicio).
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => playSound('correct'), 180);
  }

  function attempt(rawUci: string) {
    const uci = canonicalUci(fen, rawUci); // enroque como e1g1 (forma del contenido)
    const expected = line[idx];
    const res = applyUci(fen, uci);
    if (!res) {
      // ilegal (no debería ocurrir con dests): se devuelve la pieza
      setNonce((n) => n + 1);
      return;
    }
    fenBefore.current = fen;
    const followed = followMove(step, line, idx, uci);
    if (followed) {
      setLine(followed);
      setFen(res.fen);
      setLastMove(lastMoveOf(uci));
      setHint(false);
      const next = idx + 1;
      if (next >= followed.length) {
        finishCorrect(step.explanationCorrect);
        return;
      }
      setStatus('rival');
      setFeedback('¡Bien! El rival responde…');
      timer.current = window.setTimeout(() => {
        const reply = followed[next] as string;
        const r2 = applyUci(res.fen, reply);
        if (!r2) {
          finishCorrect(step.explanationCorrect);
          return;
        }
        setFen(r2.fen);
        setLastMove(lastMoveOf(reply));
        if (next + 1 >= followed.length) {
          finishCorrect(step.explanationCorrect);
        } else {
          setIdx(next + 1);
          setStatus('playing');
          setFeedback('Sigue: es tu turno.');
        }
      }, 650);
    } else {
      setFen(res.fen);
      setLastMove(lastMoveOf(uci));
      setMistakes((m) => m + 1);
      setStatus('wrong');
      setHint(false);
      setFeedback(step.wrongByMove?.[uci] ?? step.explanationWrong);
      setSolutionSan(expected ? sanOfUci(fenBefore.current, expected) : '');
    }
  }

  function onBoardMove(from: string, to: string) {
    if (needsPromotion(fen, from, to)) {
      setPromo({ from, to });
      return;
    }
    attempt(from + to);
  }

  function retry() {
    setFen(fenBefore.current);
    setLastMove(undefined);
    setStatus('playing');
    setFeedback('');
    setNonce((n) => n + 1);
  }

  return (
    <div className="step-layout">
      <div className="step-board">
        <Board
          fen={fen}
          interactive={interactive}
          orientation={orientation}
          lastMove={lastMove}
          shapes={shapes}
          nonce={nonce}
          plain={plain}
          {...(appearance ? { appearance } : {})}
          label={`Tablero. Mueven ${orientation === 'white' ? 'blancas' : 'negras'}.`}
          onMove={onBoardMove}
        />
        {promo && (
          <div
            className="promo"
            role="dialog"
            aria-label="Elige la pieza de promoción"
            onKeyDown={(e) => {
              if (e.key !== 'Escape') return;
              setPromo(null);
              setNonce((n) => n + 1);
            }}
          >
            <p>Elige la pieza para coronar:</p>
            <div className="promo-options">
              {PROMO_ROLES.map((p, k) => (
                <button
                  key={p.role}
                  autoFocus={k === 0}
                  className="t-btn"
                  onClick={() => {
                    const m = promo;
                    setPromo(null);
                    attempt(m.from + m.to + p.letter);
                  }}
                >
                  {p.label}
                </button>
              ))}
              <button
                className="t-btn t-btn-ghost"
                onClick={() => {
                  setPromo(null);
                  setNonce((n) => n + 1);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="step-side">
        <p className="step-kicker" hidden={showcase}>
          {mode === 'practice' ? 'Práctica' : 'Evaluación'}{plain ? ':' : ' ·'} mueven {orientation === 'white' ? 'las blancas' : 'las negras'}
        </p>
        <p className="step-prompt" ref={prompt} tabIndex={-1}>
          {step.prompt}
        </p>

        <div className={`feedback feedback-${status}`} aria-live="polite" role="status">
          {status === 'correct' && (
            <p>
              <strong>
                <Icon name="check" size={18} /> Correcto.
              </strong>{' '}
              {feedback}
            </p>
          )}
          {status === 'wrong' && (
            <>
              <p>
                <strong>
                  <Icon name="x" size={18} /> Incorrecto.
                </strong>{' '}
                {feedback}
              </p>
              {/* Política de avisos: la jugada solo se dice en la evaluación o tras el segundo fallo de la práctica. */}
              {(mode === 'evaluation' || mistakes >= 2) && solutionSan && (
                <p>
                  La jugada correcta era <strong>{solutionSan}</strong>.
                </p>
              )}
            </>
          )}
          {(status === 'rival' || (status === 'playing' && feedback)) && <p>{feedback}</p>}
        </div>

        {/* Solo cuando la solución ya se ha visto (acierto, evaluación fallada o segundo fallo de la práctica): nunca la adelanta. */}
        {explain && (status === 'correct' || (status === 'wrong' && (mode === 'evaluation' || mistakes >= 2))) && (
          <ExplainButton key={`${status}-${mistakes}`} body={{ kind: 'lesson', ...explain }} />
        )}

        {hint && status === 'playing' && step.hint && (
          <p className="t-alert t-alert-warn">
            <Icon name="bulb" size={18} /> <strong>Pista:</strong> {step.hint}
          </p>
        )}

        <div className="actions">
          {status === 'playing' && canHint && !hint && (
            <button className="t-btn t-btn-ghost" onClick={() => setHint(true)}>
              Pista
            </button>
          )}
          {status === 'wrong' && mode === 'practice' && (
            <button className="t-btn t-btn-primary" onClick={retry} autoFocus>
              Reintentar
            </button>
          )}
          {status === 'wrong' && mode === 'evaluation' && (
            <button
              className="t-btn t-btn-primary"
              onClick={() => onDone({ ok: false, mistakes })}
              autoFocus
            >
              {isLast ? 'Ver resultado' : 'Continuar'}
            </button>
          )}
          {status === 'correct' && (
            <button
              className="t-btn t-btn-primary"
              onClick={() => onDone({ ok: mistakes === 0, mistakes })}
              autoFocus
            >
              {isLast && mode === 'evaluation' ? 'Ver resultado' : 'Continuar'}
            </button>
          )}
        </div>

        {status === 'playing' && !showcase && <TypedMove fen={fen} onUci={attempt} />}
      </div>
    </div>
  );
}
