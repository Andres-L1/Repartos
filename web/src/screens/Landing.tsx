import { useEffect, useMemo, useState } from 'react';
import type { Lesson } from '../../../src/content/schema';
import { api, ApiError } from '../api';
import { Board, marksToShapes } from '../components/Board';
import { LessonPlayer } from '../components/LessonPlayer';
import { turnOf } from '../chess';
import { navigate } from '../router';
import { useSession } from '../session';
import { LichessLogin } from './Auth';
import { Icon, Loading } from '../components/Icon';

function useDemo() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api
      .demo()
      .then((r) => setLesson(r.lesson))
      .catch((e) => setError(e instanceof ApiError ? e.message : 'No se pudo cargar la demostración.'));
  }, []);
  return { lesson, error };
}

export function Landing() {
  const { user, billingMode } = useSession();
  const { lesson, error } = useDemo();
  const first = lesson?.explanation[0] ?? lesson?.practice[0];
  const shapes = useMemo(() => marksToShapes(first), [first]);
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">Ajedrez de 0 a 800 Elo</p>
          <h1>
            Aprende ajedrez <span className="hl">paso a paso</span>, sin prisas y sin ruido.
          </h1>
          <p className="lead">
            Lecciones cortas e interactivas: te explicamos una idea, practicas sobre el tablero y compruebas que la
            has entendido. Todas las posiciones están verificadas por código.
          </p>
          <div className="actions">
            {user ? (
              <button className="btn btn-primary btn-large" onClick={() => navigate('/mapa')}>
                Ir a mi ruta de aprendizaje
              </button>
            ) : (
              <>
                <LichessLogin large />
                <button className="btn btn-large" onClick={() => navigate('/demo')}>
                  Probar una lección gratis
                </button>
              </>
            )}
          </div>
          <p className="muted hero-note">
            <Icon name="gift" size={18} />{' '}
            {billingMode === 'beta_open'
              ? 'Beta abierta: todas las lecciones son gratis mientras la probamos.'
              : 'Sin permanencia: cancela cuando quieras.'}
          </p>
        </div>
        <div className="hero-board">
          {first ? (
            <Board fen={first.fen} orientation={turnOf(first.fen)} shapes={shapes} label="Vista previa de una lección" />
          ) : (
            <div className="board-placeholder" role="img" aria-label={error || 'Cargando tablero'}>
              {error && <p className="muted">{error}</p>}
            </div>
          )}
          {lesson && (
            <p className="muted center board-caption">
              Demostración: <strong>{lesson.title}</strong>
            </p>
          )}
        </div>
      </section>

      <section className="features" aria-label="Cómo funciona">
        <div className="card feature">
          <span className="feature-icon" aria-hidden="true">
            <Icon name="eye" size={24} />
          </span>
          <h2>
            <span className="feature-n" aria-hidden="true">1</span>Entiende
          </h2>
          <p>Una idea por lección, explicada sobre el tablero con casillas y flechas.</p>
        </div>
        <div className="card feature">
          <span className="feature-icon" aria-hidden="true">
            <Icon name="target" size={24} />
          </span>
          <h2>
            <span className="feature-n" aria-hidden="true">2</span>Practica
          </h2>
          <p>Mueve tú las piezas. Si fallas, te explicamos por qué y puedes reintentar.</p>
        </div>
        <div className="card feature">
          <span className="feature-icon" aria-hidden="true">
            <Icon name="trophy" size={24} />
          </span>
          <h2>
            <span className="feature-n" aria-hidden="true">3</span>Demuestra
          </h2>
          <p>Una evaluación con posiciones nuevas, sin pistas, para avanzar por la ruta.</p>
        </div>
      </section>
    </div>
  );
}

export function DemoScreen() {
  const { lesson, error } = useDemo();
  if (error) {
    return (
      <div className="card empty-state" role="alert">
        <span className="empty-icon" aria-hidden="true">
          <Icon name="alert" size={28} />
        </span>
        <p>{error}</p>
        <button className="btn" onClick={() => navigate('/')}>
          Volver
        </button>
      </div>
    );
  }
  if (!lesson) return <Loading label="Cargando demostración…" />;
  return (
    <>
      <p className="banner">
        <Icon name="gift" size={18} />{' '}
        Demostración gratuita: no necesitas cuenta. Tu progreso no se guarda.
      </p>
      <LessonPlayer lesson={lesson} demo />
    </>
  );
}
