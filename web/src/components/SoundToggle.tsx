import { setMuted, useMuted } from '../sound';
import { Icon } from './Icon';

/** Botón para activar o silenciar los sonidos. La preferencia se guarda en este navegador. */
export function SoundToggle() {
  const muted = useMuted();
  const label = muted ? 'Sonido desactivado' : 'Sonido activado';
  return (
    <button
      type="button"
      className="t-btn t-btn-ghost t-btn-sm sound-toggle"
      aria-pressed={!muted}
      title={label}
      onClick={() => setMuted(!muted)}
    >
      <Icon name={muted ? 'soundOff' : 'soundOn'} size={22} />
      <span className="sound-toggle-label">{label}</span>
    </button>
  );
}
