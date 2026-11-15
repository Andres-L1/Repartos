import { useId, useState, type FormEvent } from 'react';
import { parseTypedMove } from '../chess';

/**
 * Alternativa al tablero para quien no puede arrastrar ni tocar casillas (teclado, lector de pantalla, motricidad):
 * se escribe la jugada y se entrega ya como UCI. Se usa en todas las pantallas donde el alumno mueve una pieza.
 */
export function TypedMove({ fen, onUci }: { fen: string; onUci: (uci: string) => void }) {
  const uid = useId();
  const [typed, setTyped] = useState('');
  const [err, setErr] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    const uci = parseTypedMove(fen, typed);
    if (!uci) {
      setErr('No entiendo esa jugada o no es legal. Ejemplos: e4, Nf3, Rxa8, e8=Q.');
      return;
    }
    setErr('');
    setTyped('');
    onUci(uci);
  }

  return (
    <details className="typed">
      <summary>Escribir la jugada (alternativa al tablero)</summary>
      <form onSubmit={submit}>
        <label htmlFor={`${uid}-move`}>Jugada</label>
        <input
          id={`${uid}-move`}
          className="t-input"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-describedby={`${uid}-help`}
          placeholder="p. ej. e4 o Nf3"
        />
        <button className="t-btn" type="submit">
          Jugar
        </button>
        <p id={`${uid}-help`} className="muted">
          Notación de Lichess (N caballo, B alfil, R torre, Q dama, K rey) o coordenadas (e2e4).
        </p>
        {err && (
          <p className="field-error" role="alert">
            {err}
          </p>
        )}
      </form>
    </details>
  );
}

/** Misma idea para las preguntas de «toca una casilla»: se escribe la casilla (p. ej. e4). */
export function TypedSquare({ onSquare }: { onSquare: (square: string) => void }) {
  const uid = useId();
  const [typed, setTyped] = useState('');
  const [err, setErr] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    const sq = typed.trim().toLowerCase();
    if (!/^[a-h][1-8]$/.test(sq)) {
      setErr('Escribe una casilla con una letra de la a a la h y un número del 1 al 8. Ejemplo: e4.');
      return;
    }
    setErr('');
    setTyped('');
    onSquare(sq);
  }

  return (
    <details className="typed">
      <summary>Escribir la casilla (alternativa al tablero)</summary>
      <form onSubmit={submit}>
        <label htmlFor={`${uid}-sq`}>Casilla</label>
        <input
          id={`${uid}-sq`}
          className="t-input"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={2}
          placeholder="p. ej. e4"
        />
        <button className="t-btn" type="submit">
          Elegir
        </button>
        {err && (
          <p className="field-error" role="alert">
            {err}
          </p>
        )}
      </form>
    </details>
  );
}
