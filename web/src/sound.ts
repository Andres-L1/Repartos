/**
 * Sonidos del tablero (juego «sfx» de Lichess, AGPLv3+; ver web/public/sound/LICENSE.md).
 * Nunca bloquea ni lanza: sin audio, con el autoplay bloqueado o sin localStorage, la web sigue igual.
 * No suena nada al cargar la página: los elementos se preparan al montar un tablero y se desbloquean
 * con el primer gesto del usuario (toque, clic o tecla).
 */
import { useSyncExternalStore } from 'react';

export type SoundName = 'move' | 'capture' | 'check' | 'correct' | 'victory';

const FILES: Record<SoundName, string> = {
  move: '/sound/Move.mp3',
  capture: '/sound/Capture.mp3',
  check: '/sound/Check.mp3',
  correct: '/sound/GenericNotify.mp3',
  victory: '/sound/Victory.mp3',
};

/** Varios elementos por sonido para que dos jugadas seguidas no se corten entre sí. */
const POOL: Record<SoundName, number> = { move: 3, capture: 2, check: 2, correct: 1, victory: 1 };
export const SOUND_VOLUME = 0.5;
export const MUTE_KEY = 'chedex.sound.muted';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

/** Lee la preferencia de silencio. Cualquier fallo del almacenamiento cuenta como «con sonido». */
export function readMuted(storage: StorageLike | null | undefined): boolean {
  try {
    return storage?.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Guarda la preferencia; devuelve false si no se pudo (modo privado, almacenamiento bloqueado). */
export function writeMuted(storage: StorageLike | null | undefined, muted: boolean): boolean {
  try {
    if (!storage) return false;
    storage.setItem(MUTE_KEY, muted ? '1' : '0');
    return true;
  } catch {
    return false;
  }
}

function countPieces(fen: string): number {
  const board = fen.split(' ')[0] ?? '';
  let n = 0;
  for (const ch of board) if (/[pnbrqk]/i.test(ch)) n++;
  return n;
}

/**
 * Sonido de una jugada a partir de la posición anterior y la nueva (como en Lichess: el jaque manda sobre la captura).
 * `inCheck` es si la nueva posición deja al rey en jaque.
 */
export function moveSoundOf(prevFen: string, nextFen: string, inCheck: boolean): SoundName {
  if (inCheck) return 'check';
  return countPieces(nextFen) < countPieces(prevFen) ? 'capture' : 'move';
}

// ---------- Estado (solo en el navegador) ----------

const hasWindow = typeof window !== 'undefined';
function storage(): Storage | null {
  try {
    return hasWindow ? window.localStorage : null;
  } catch {
    return null;
  }
}

let muted = hasWindow ? readMuted(storage()) : false;
const listeners = new Set<() => void>();
const pool = new Map<SoundName, HTMLAudioElement[]>();
let unlocked = false;
/** Contador de depuración: cuántas veces se pidió reproducir cada sonido (para comprobarlo sin oírlo). */
export const soundStats: Record<SoundName, number> = { move: 0, capture: 0, check: 0, correct: 0, victory: 0 };

export function isMuted(): boolean {
  return muted;
}

export function setMuted(next: boolean): void {
  muted = next;
  writeMuted(storage(), next);
  if (next) for (const list of pool.values()) for (const a of list) try { a.pause(); } catch { /* nada */ }
  for (const l of listeners) l();
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Estado de silencio reactivo (para el botón de sonido). */
export function useMuted(): boolean {
  return useSyncExternalStore(subscribe, isMuted, () => false);
}

/** Crea y precarga los elementos de audio. No reproduce nada. Seguro de llamar varias veces. */
export function primeSounds(): void {
  if (!hasWindow || pool.size || typeof Audio === 'undefined') return;
  try {
    for (const name of Object.keys(FILES) as SoundName[]) {
      const list: HTMLAudioElement[] = [];
      for (let i = 0; i < POOL[name]; i++) {
        const a = new Audio();
        a.preload = 'auto';
        a.volume = SOUND_VOLUME;
        a.src = FILES[name];
        list.push(a);
      }
      pool.set(name, list);
    }
    installUnlock();
  } catch {
    pool.clear();
  }
}

/** Safari y algunos móviles exigen un gesto antes del primer sonido: se «arranca» cada elemento en silencio. */
function installUnlock(): void {
  if (unlocked || !hasWindow) return;
  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    for (const ev of EVENTS) window.removeEventListener(ev, unlock, true);
    for (const list of pool.values())
      for (const a of list) {
        try {
          a.muted = true;
          const p = a.play();
          const reset = () => {
            try {
              a.pause();
              a.currentTime = 0;
            } catch { /* nada */ }
            a.muted = false;
          };
          if (p && typeof p.then === 'function') p.then(reset, () => { a.muted = false; });
          else reset();
        } catch {
          a.muted = false;
        }
      }
  };
  const EVENTS = ['pointerdown', 'keydown', 'touchend'] as const;
  for (const ev of EVENTS) window.addEventListener(ev, unlock, { capture: true, passive: true });
}

/** Reproduce un sonido si el usuario no lo ha silenciado. Nunca lanza ni espera. */
export function playSound(name: SoundName): void {
  soundStats[name]++;
  if (muted || !hasWindow) return;
  try {
    if (!pool.size) primeSounds();
    const list = pool.get(name);
    if (!list?.length) return;
    // Primer elemento libre; si todos suenan, se reinicia el más antiguo.
    const a = list.find((x) => x.paused || x.ended) ?? list[0]!;
    a.muted = false;
    a.volume = SOUND_VOLUME;
    try {
      a.currentTime = 0;
    } catch { /* aún sin datos */ }
    const p = a.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch {
    /* sin sonido: no pasa nada */
  }
}
