import { useRef, useState } from 'react';
import type { ExplainBody } from '../../../src/shared/api';
import { api, ApiError } from '../api';
import { useSession } from '../session';
import '../explain.css';

type State = { kind: 'idle' | 'loading' } | { kind: 'done'; text: string } | { kind: 'error'; text: string };

/**
 * «¿Por qué?»: una aclaración corta de la IA, solo a petición y solo tras ver la solución (quien lo monta decide cuándo).
 * Sin IA en el servidor no se muestra nada. Un fallo nunca afecta a la lección.
 */
export function ExplainButton({ body }: { body: ExplainBody }) {
  const { aiAvailable } = useSession();
  const [state, setState] = useState<State>({ kind: 'idle' });
  const busy = useRef(false);
  if (!aiAvailable) return null;

  async function ask() {
    if (busy.current) return;
    busy.current = true;
    setState({ kind: 'loading' });
    try {
      setState({ kind: 'done', text: (await api.explain(body)).text });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return;
      setState({ kind: 'error', text: e instanceof ApiError ? e.message : 'No se pudo cargar la explicación. Sigue con la lección.' });
    } finally {
      busy.current = false;
    }
  }

  return (
    <div className="explain">
      {state.kind !== 'done' && (
        <button type="button" className="t-btn t-btn-secondary explain-btn" onClick={() => void ask()} disabled={state.kind === 'loading'} aria-busy={state.kind === 'loading'}>
          {state.kind === 'loading' ? 'Pensando…' : state.kind === 'error' ? 'Intentar de nuevo' : '¿Por qué?'}
        </button>
      )}
      <div aria-live="polite" role="status">
        {state.kind === 'done' && <p className="explain-text">{state.text}</p>}
        {state.kind === 'error' && <p className="explain-error">{state.text}</p>}
      </div>
    </div>
  );
}
