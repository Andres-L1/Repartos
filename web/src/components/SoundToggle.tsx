import { setMuted, useMuted } from '../sound';
import { Icon } from './Icon';

/**
 * Botón para activar o silenciar los sonidos. La preferencia se guarda en este navegador.
 * El nombre accesible es siempre «Sonido» y el estado lo da aria-pressed (un interruptor no cambia de nombre:
 * «Sonido desactivado, no pulsado» sería una doble negación). El estado visible se oculta a los lectores.
 */
export function SoundToggle() {
  const muted = useMuted();
  const state = muted ? 'desactivado' : 'activado';
  return (
    <button
      type="button"
      className="t-btn t-btn-ghost t-btn-sm sound-toggle"
      aria-pressed={!muted}
      title={`Sonido ${state}`}
      onClick={() => setMuted(!muted)}
    >
      <Icon name={muted ? 'soundOff' : 'soundOn'} size={22} />
      <span className="sound-toggle-label">
        Sonido<span aria-hidden="true"> {state}</span>
      </span>
    </button>
  );
}
