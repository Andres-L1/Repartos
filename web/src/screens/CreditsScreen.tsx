import { CREDIT_GROUP_LABEL, LIBRARIES, catalogCredits, creditRows } from '../credits';
import { Link } from '../components/Link';
import { useSession } from '../session';

const REPO = 'https://github.com/Andres-L1/Repartos';

export function CreditsScreen() {
  const { user } = useSession();
  return (
    <article className="prose credits">
      <h1>Créditos y licencias</h1>
      <p className="lead">Quién ha hecho cada cosa y bajo qué licencia se puede usar.</p>

      <h2>El código de Chedex Pulse</h2>
      <p>
        El código de la aplicación es software libre, publicado bajo la licencia GNU GPL, versión 3 o posterior. Puedes leerlo,
        usarlo, modificarlo y compartirlo según esa licencia en{' '}
        <a href={REPO} rel="noopener noreferrer">
          el repositorio del proyecto
        </a>
        .
      </p>

      <h2>Lecciones y ejercicios</h2>
      <p>
        Las lecciones y los ejercicios son © Chedex, todos los derechos reservados. No forman parte del código y no están bajo la
        GPL.
      </p>

      <h2>Material propio de la tienda</h2>
      <p>
        Los temas de tablero, las piezas «Geométricas», los iconos y la ficha de Chedex son material propio y se publican junto
        con el código bajo GPL-3.0-or-later.
      </p>
      {catalogCredits().map((g) => (
        <section key={g.kind} aria-labelledby={`cr-${g.kind}`}>
          <h3 id={`cr-${g.kind}`}>{CREDIT_GROUP_LABEL[g.kind]}</h3>
          <ul className="credit-list">
            {creditRows(g.items).map((r) => (
              <li key={r.credit}>
                <strong>{r.names.join(', ')}</strong>
                <span className="muted">{r.credit}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <h2>Librerías y recursos de terceros</h2>
      <ul className="credit-list">
        {LIBRARIES.map((l) => (
          <li key={l.name}>
            <strong>
              <a href={l.url} rel="noopener noreferrer">
                {l.name}
              </a>
            </strong>
            <span className="muted">
              {l.use} {l.author}. Licencia {l.license}.
            </span>
          </li>
        ))}
      </ul>
      <p className="muted">
        Chedex Pulse no está afiliado a Lichess; usa su acceso para identificarte y varias piezas de software libre de su comunidad.
      </p>

      <p>
        {user ? <Link href="/tienda">Volver a la tienda</Link> : <Link href="/">Volver al inicio</Link>}
      </p>
    </article>
  );
}
