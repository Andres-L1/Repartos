import type { GameAnalysis, ReviewGame } from '../../../src/review/types';
import { keyErrors } from '../../../src/review/select';
import { Link } from '../components/Link';
import { Icon } from '../components/Icon';

/** Repaso de una partida. La tarea 11 sustituye el cuerpo por la mini lección de cada error clave. */
export function ReviewGameScreen({ index, game, analysis }: { index: number; game?: ReviewGame; analysis?: GameAnalysis }) {
  const back = (
    <Link className="t-btn t-btn-secondary" href="/partidas">
      <Icon name="back" size={20} />
      Volver a mis partidas
    </Link>
  );
  if (!game || !analysis) {
    return (
      <section className="t-card rv-card" aria-labelledby="rg-title">
        <h1 id="rg-title">Partida {index}</h1>
        <p>Esta partida todavía no está analizada. Analiza tus partidas primero.</p>
        <div className="rv-actions">{back}</div>
      </section>
    );
  }
  const n = keyErrors(analysis).length;
  return (
    <section className="t-card rv-card" aria-labelledby="rg-title">
      <h1 id="rg-title">Partida {index}</h1>
      <p aria-live="polite">
        {n === 0
          ? 'En esta partida no hay errores clave con una causa clara.'
          : n === 1
            ? 'Hay 1 error clave para repasar en esta partida.'
            : `Hay ${n} errores clave para repasar en esta partida.`}
      </p>
      <div className="rv-actions">{back}</div>
    </section>
  );
}
