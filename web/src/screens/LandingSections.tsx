import { useEffect, useMemo, useState } from 'react';
import type { Level } from '../../../src/types';
import type { OutlineUnit } from '../../../src/shared/api';
import { LEVELS as SHARED_LEVELS, eloRange } from '../../../src/shared/levels';
import { numberUnits, type Numbered } from '../../../src/shared/unitNumber';
import { STREAK_DAYS_PER_CHEDEX } from '../../../src/shop/catalog';
import { api } from '../api';
import { Board, marksToShapes } from '../components/Board';
import { Icon } from '../components/Icon';
import { Coin, MiniBoard as ShopMiniBoard } from '../components/ShopVisuals';

/** Tablero Noche y piezas Contorno: el aspecto de Chedex (coincide con lo predeterminado de la app). */
const LOOK = 'theme-noche pieces-contorno';

/* ---------- Estado de cada cosa: siempre con texto, nunca solo color ---------- */

export type Status = 'now' | 'dev' | 'soon';

const STATUS_TEXT: Record<Status, string> = { now: 'Hoy', dev: 'En desarrollo', soon: 'En preparación' };

export function StatusTag({ status, label }: { status: Status; label?: string }) {
  return (
    <span className={`st st-${status}`}>
      {status === 'now' && <Icon name="check" size={16} />}
      {label ?? STATUS_TEXT[status]}
    </span>
  );
}

/* ---------- El problema ---------- */

const PROBLEMS = [
  'No sabes qué estudiar ni en qué orden.',
  'Resuelves ejercicios sin comprender los conceptos.',
  'Repites errores que no consigues identificar.',
  'Recibes análisis de motor difíciles de interpretar.',
  'Consumes contenidos sin metodología.',
  'Desconoces cuáles son tus debilidades.',
];

export function Problem() {
  return (
    <section className="band band-raised" aria-labelledby="problem-title">
      <div className="wrap split">
        <header className="split-head">
          <h2 id="problem-title">Por qué cuesta tanto mejorar</h2>
          <p>
            Chedex Pulse es una academia digital: un sistema que combina aprendizaje, práctica, diagnóstico y seguimiento para que mejorar tenga un camino.
          </p>
        </header>
        <ul className="problems">
          {PROBLEMS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- El ciclo ---------- */

const CYCLE: { name: string; text: string; status: Status }[] = [
  { name: 'Detectar', text: 'Se analiza tu partida y se localizan los errores.', status: 'dev' },
  { name: 'Comprender', text: 'Cada lección explica la idea sobre un tablero interactivo.', status: 'now' },
  { name: 'Entrenar', text: 'Practicas con ejercicios y te corregimos al momento.', status: 'now' },
  { name: 'Evaluar', text: 'Al cierre de cada lección, posiciones nuevas y sin pistas.', status: 'now' },
  { name: 'Repasar', text: 'Lo que se te resiste vuelve a aparecer a su debido tiempo.', status: 'soon' },
];

export function Cycle() {
  return (
    <section className="band band-ink" aria-labelledby="cycle-title">
      <div className="wrap">
        <header className="band-head">
          <h2 id="cycle-title">Mejoras en un ciclo que no se corta</h2>
          <p>Detectas, comprendes, entrenas, evalúas y repasas. Esto es lo que funciona hoy y lo que viene.</p>
        </header>
        <ol className="cycle">
          {CYCLE.map((c, i) => (
            <li key={c.name} className="cycle-step">
              <div className="cycle-card">
                <h3>{c.name}</h3>
                <p>{c.text}</p>
                <StatusTag status={c.status} />
              </div>
              {i < CYCLE.length - 1 && (
                <span className="cycle-arrow" aria-hidden="true">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- El entrenador pedagógico: ejemplo real del prototipo ---------- */

/** Posición real tras 7... Nd5 en samples/v04_pieza_colgada.pgn (juegan blancas). */
const TRAINER_FEN = 'r1bq1rk1/ppp2ppp/2np4/2bnp3/2B1P3/2PP1N1P/PP3PP1/RNBQ1RK1 w - - 1 8';

/** Textos literales de `npm run chedex -- samples/v04_pieza_colgada.pgn --level beginner|competitive`. */
const FACT = 'El caballo en d5, recién movido, queda sin defensa y es capturado por el alfil desde c4 (Bxd5).';
const EXPLAINED = [
  {
    level: 'Para un principiante',
    lines: [
      FACT,
      'Una pieza «colgada» es una pieza que nadie protege: el rival se la puede comer gratis.',
      'El caballo en d5 se quedó sin protección.',
      'Antes de mover, pregúntate: ¿alguna de mis piezas queda sin protección?',
      'Una jugada mejor era a5.',
    ],
  },
  {
    level: 'Para un jugador competitivo',
    lines: [
      FACT,
      'Secuencia: Nd5 Bxd5. El caballo en d5 carece de cobertura suficiente y la captura no tiene compensación.',
      'Material perdido: 3 peones.',
      'Al calcular, incluye siempre la comprobación de defensores tras cada movimiento propio: es el filtro mínimo antes de profundizar en tu línea.',
      'Alternativa del motor: a5; con Nd5, tu jugada pierde unos 2,7 peones de evaluación respecto a la mejor.',
    ],
  },
];

const DETECTS = ['Piezas sin defensa', 'Cambios desfavorables', 'Ataques dobles', 'Clavadas', 'Jaques a la descubierta', 'Amenazas de mate y mates desaprovechados'];

export function Trainer() {
  const shapes = useMemo(() => marksToShapes({ squares: ['d5'], arrows: [['c4', 'd5']] }), []);
  return (
    <section className="band band-ink" aria-labelledby="trainer-title">
      <div className="wrap">
        <header className="band-head band-head-wide">
          <h2 id="trainer-title">Un entrenador que explica por qué, no solo si</h2>
          <p>
            Stockfish analiza tu partida, un sistema propio de reglas diagnostica la causa del error y la explicación se adapta a tu nivel. No se limita a decir si una jugada es buena o mala: cuenta qué ocurrió, qué concepto hay detrás y cómo corregirlo.
          </p>
          <p className="trainer-status">
            <StatusTag status="dev" /> <span>Hoy existe como prototipo por línea de comandos. Todavía no está dentro de la web.</span>
          </p>
        </header>

        <div className="trainer">
          <figure className="trainer-board">
            <Board fen={TRAINER_FEN} orientation="white" lastMove={['f6', 'd5']} shapes={shapes} plain appearance={LOOK} label="Posición tras 7... Nd5: el alfil de c4 ataca el caballo de d5, que nadie protege" />
            <figcaption>
              Una partida de prueba: las negras acaban de jugar 7... Nd5. El motor prefería a5.
            </figcaption>
          </figure>
          <div className="trainer-says">
            <p className="trainer-lead">Ejemplo real del prototipo del entrenador, en desarrollo. El mismo error, explicado a dos niveles.</p>
            <div className="trainer-levels">
              {EXPLAINED.map((e) => (
                <article key={e.level} className="says">
                  <h3>{e.level}</h3>
                  <p className="says-title">Pieza colgada</p>
                  {e.lines.map((l) => (
                    <p key={l}>{l}</p>
                  ))}
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="trainer-more">
          <div className="honest">
            <h3>Si no está seguro, lo dice</h3>
            <p>
              No inventa amenazas ni razones. Si no puede determinar la causa de forma fiable, lo reconoce y muestra solo el análisis verificado. Así lo dice el prototipo en otro error de la misma partida:
            </p>
            <blockquote>Esta jugada no fue la mejor, pero todavía no sé explicarte el motivo con seguridad.</blockquote>
          </div>
          <div className="detects">
            <h3>Qué reconoce el prototipo</h3>
            <ul>
              {DETECTS.map((d) => (
                <li key={d}>
                  <Icon name="check" size={20} /> {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Tu camino hasta los 2000 Elo ---------- */

interface LevelInfo {
  id: Level;
  name: string;
  range: string;
  focus: string;
}

const LEVELS: LevelInfo[] = SHARED_LEVELS.map((l) => ({
  id: l.id,
  name: l.label,
  range: l.id === 'beginner' ? 'Sin Elo todavía' : `${eloRange(l)} de Elo en Lichess (rápidas)`,
  focus: `${l.blurb}.`,
}));

/** Mientras carga el temario (o si falla) se muestran como disponibles los dos primeros; después decide el temario. */
const AVAILABLE_FALLBACK: Level[] = ['beginner', 'initiation'];

export function Path() {
  const [units, setUnits] = useState<Numbered<OutlineUnit>[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [openLevels, setOpenLevels] = useState<Set<Level>>(new Set(['beginner']));
  const [openUnits, setOpenUnits] = useState<Set<string>>(new Set());
  useEffect(() => {
    let live = true;
    api
      .outline()
      .then((r) => {
        if (live) setUnits(numberUnits(r.units));
      })
      .catch(() => {
        if (live) setFailed(true);
      });
    return () => {
      live = false;
    };
  }, [attempt]);
  const flip = <T,>(set: Set<T>, v: T) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    return next;
  };
  return (
    <section className="band band-raised" aria-labelledby="path-title">
      <div className="wrap split">
        <header className="split-head">
          <h2 id="path-title">Tu camino hasta los 2000 Elo</h2>
          <p>
            Seis niveles, de las reglas a la preparación de competición.{' '}
            {units
              ? ((n) => (n === LEVELS.length ? 'Hoy hay lecciones en los seis.' : `Hoy hay lecciones en ${n} de los seis.`))(
                  LEVELS.filter((lv) => units.some((u) => u.level === lv.id)).length,
                )
              : ''}
          </p>
          <p>
            Los niveles no son compartimentos cerrados, y el Elo es una referencia, no una nota. Empiezas donde te corresponde: usamos tu Elo de Lichess (rápidas, clásicas o blitz) para recomendarte dónde empezar; los rangos son de Lichess, no de FIDE.
          </p>
        </header>
        <ol className="levels">
          {LEVELS.map((lv, i) => {
            const avail = units ? units.some((u) => u.level === lv.id) : AVAILABLE_FALLBACK.includes(lv.id);
            const mine = units?.filter((u) => u.level === lv.id) ?? [];
            const lessons = mine.reduce((n, u) => n + u.lessons.length, 0);
            const isOpen = openLevels.has(lv.id);
            const panel = `level-${lv.id}`;
            return (
              <li key={lv.id} className={avail ? 'level level-now' : 'level level-soon'}>
                <span className={`route-node ${avail ? 'light' : 'dark'}`} aria-hidden="true">
                  {i + 1}
                </span>
                <div className="level-head">
                  <h3>
                    <span className="sr-only">Nivel {i + 1}: </span>
                    {lv.name}
                  </h3>
                  <StatusTag status={avail ? 'now' : 'soon'} label={avail ? 'Disponible ahora' : 'En preparación'} />
                </div>
                <p className="level-range">{lv.range}</p>
                <p className="level-focus">{lv.focus}</p>
                {avail && (
                  <>
                    {failed && (
                      <div className="route-error" role="alert">
                        <p>No hemos podido cargar las unidades. Comprueba tu conexión e inténtalo de nuevo.</p>
                        <button
                          className="t-btn t-btn-secondary"
                          onClick={() => {
                            setFailed(false);
                            setAttempt((n) => n + 1);
                          }}
                        >
                          Reintentar
                        </button>
                      </div>
                    )}
                    {units && mine.length > 0 && (
                      <>
                        <button className="route-toggle" aria-expanded={isOpen} aria-controls={panel} onClick={() => setOpenLevels((s) => flip(s, lv.id))}>
                          <span className="route-chev" aria-hidden="true" />
                          {isOpen ? 'Ocultar' : 'Ver'} {mine.length} unidades y {lessons} lecciones
                          <span className="sr-only"> del nivel {lv.name}</span>
                        </button>
                        <ol id={panel} className="units" hidden={!isOpen}>
                          {mine.map((u) => {
                            const uOpen = openUnits.has(u.id);
                            const lid = `lessons-${u.id}`;
                            return (
                              <li key={u.id} className="unit">
                                <h4>
                                  <span className="unit-n">Unidad {u.n}</span> {u.title}
                                </h4>
                                <p>{u.description}</p>
                                <button className="route-toggle route-toggle-sm" aria-expanded={uOpen} aria-controls={lid} onClick={() => setOpenUnits((s) => flip(s, u.id))}>
                                  <span className="route-chev" aria-hidden="true" />
                                  {uOpen ? 'Ocultar' : 'Ver'} las {u.lessons.length} lecciones
                                  <span className="sr-only"> de la unidad {u.n}</span>
                                </button>
                                <ol id={lid} className="route-lessons" hidden={!uOpen}>
                                  {u.lessons.map((l, j) => (
                                    <li key={l.id}>
                                      <span className="route-ln" aria-hidden="true">
                                        {u.n}.{j + 1}
                                      </span>
                                      {l.title}
                                    </li>
                                  ))}
                                </ol>
                              </li>
                            );
                          })}
                        </ol>
                      </>
                    )}
                    {!units && !failed && <span className="skeleton level-skel" role="status" aria-label="Cargando las unidades" />}
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Calidad ---------- */

const PRINCIPLES = [
  { name: 'Rigor ajedrecístico', text: 'Lo que se enseña tiene que ser correcto.' },
  { name: 'Claridad por nivel', text: 'Cada explicación está escrita para quien la lee.' },
  { name: 'Progresión coherente', text: 'Cada lección se apoya en la anterior.' },
  { name: 'Aplicación a partidas reales', text: 'Las ideas se ven en posiciones que salen al jugar.' },
  { name: 'Evaluación con situaciones nuevas', text: 'Se comprueba que entiendes, no que recuerdas la respuesta.' },
];

export function Quality() {
  return (
    <section className="band band-ink" aria-labelledby="quality-title">
      <div className="wrap split">
        <header className="split-head">
          <h2 id="quality-title">El contenido es lo que importa</h2>
          <p>Cinco principios guían cada lección. El objetivo es que entiendas el ajedrez, no solo que aciertes ejercicios.</p>
          <div className="promise">
            <p>
              <strong>Hoy:</strong> ningún profesor ha revisado todavía los contenidos. Lo que sí hacemos es verificar por código cada posición y cada solución.
            </p>
            <p>
              <strong>El compromiso:</strong> los revisarán profesores de ajedrez, y no publicaremos contenido generado por IA sin esa revisión.
            </p>
          </div>
        </header>
        <ul className="principles">
          {PRINCIPLES.map((p) => (
            <li key={p.name}>
              <h3>{p.name}</h3>
              <p>{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Cómo funciona ---------- */

const STEPS = [
  { title: 'Entra con tu cuenta de Lichess', text: 'No pedimos contraseña: Lichess solo nos confirma quién eres.' },
  { title: 'Tu profesor de TopChess te autoriza', text: 'Él te da acceso con tu nombre de usuario de Lichess. Hasta entonces no se crea tu cuenta.' },
  { title: 'Empieza tu ruta', text: 'Lecciones por niveles, análisis de tus partidas y la sesión Entrenar hoy.' },
];

export function HowItWorks() {
  return (
    <section className="band band-ink" aria-labelledby="how-title">
      <div className="wrap">
        <header className="band-head">
          <h2 id="how-title">Cómo funciona</h2>
        </header>
        <ol className="steps">
          {STEPS.map((x, i) => (
            <li key={x.title} className="step">
              <span className="step-n" aria-hidden="true">{i + 1}</span>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Visita al producto: capturas reales de la app, sin soluciones de ejercicios ---------- */

const TOUR = [
  {
    src: '/landing/aprender.webp', w: 800, h: 620, title: 'Tu ruta de aprendizaje',
    text: 'Siempre sabes cuál es tu próxima lección, tu racha y cuánto llevas de cada unidad.',
    alt: 'Pantalla Aprender de Chedex Pulse: la lección recomendada para empezar, tu racha actual, las lecciones aprendidas y la lista de unidades con tu progreso.',
  },
  {
    src: '/landing/leccion.webp', w: 1000, h: 680, title: 'Lecciones con tablero',
    text: 'Una idea cada vez: explicación, práctica con pista y una evaluación al final.',
    alt: 'Una lección de práctica: a la izquierda un tablero con piezas de contorno naranja, arriba las fases de la lección y a la derecha el enunciado del ejercicio con el botón de pista.',
  },
  {
    src: '/landing/tienda.webp', w: 800, h: 620, title: 'Tienda de Chedex',
    text: 'Tu constancia se convierte en Chedex para personalizar tablero y piezas.',
    alt: 'Pantalla Tienda: tu saldo de Chedex, el progreso de tu racha, los protectores y las piezas disponibles, con las piezas Contorno equipadas.',
  },
];

export function Tour() {
  return (
    <section className="band band-raised" aria-labelledby="tour-title">
      <div className="wrap">
        <header className="band-head">
          <h2 id="tour-title">Una visita por dentro</h2>
          <p>Así se ve Chedex Pulse una vez que tu profesor te ha dado acceso.</p>
        </header>
        <ul className="tour">
          {TOUR.map((x) => (
            <li key={x.src}>
              <figure>
                <img src={x.src} width={x.w} height={x.h} alt={x.alt} loading="lazy" decoding="async" />
                <figcaption>
                  <strong>{x.title}</strong>
                  <span>{x.text}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- La tienda, en una frase ---------- */

export function ShopLine() {
  const looks = [
    { board: 'noche', name: 'Noche' },
    { board: 'clasico', name: 'Clásico' },
    { board: 'bosque', name: 'Bosque' },
    { board: 'brasa', name: 'Brasa' },
  ];
  return (
    <div className="shop-line">
      <Coin size={56} className="shop-coin" />
      <div className="shop-copy">
        <h3>Tu racha se convierte en Chedex</h3>
        <p>
          Cada {STREAK_DAYS_PER_CHEDEX} días seguidos de estudio ganas 1 Chedex, la moneda con la que personalizas tu tablero y tus piezas en la tienda.
        </p>
      </div>
      <ul className="shop-minis" aria-label="Algunos tableros de la tienda">
        {looks.map((l) => (
          <li key={l.board}>
            <ShopMiniBoard board={l.board} pieces="contorno" label={`Tablero ${l.name} con piezas Contorno`} />
          </li>
        ))}
      </ul>
    </div>
  );
}
