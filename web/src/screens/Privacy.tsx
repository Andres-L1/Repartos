import { Link } from '../components/Link';

export function PrivacyScreen() {
  return (
    <article className="prose t-card">
      <p className="kicker">Privacidad</p>
      <h1>Qué datos usamos y para qué</h1>
      <p className="lead">
        Chedex Pulse es la plataforma de entrenamiento de ajedrez de los alumnos de TopChess. Esto es todo lo que hacemos con tu cuenta, explicado sin letra pequeña.
      </p>

      <h2>Quién trata tus datos</h2>
      <p>
        Los datos los trata TopChess a través del administrador de la plataforma, que es quien autoriza el acceso. Esta
        página no incluye datos legales de contacto de una entidad: si tienes dudas o quieres ejercer tus derechos, díselo a tu profesor de TopChess.
      </p>

      <h2>Acceso solo para alumnos</h2>
      <p>
        Solo entran las cuentas de Lichess que el administrador ha autorizado. Si no estás autorizado, no creamos tu
        cuenta ni una sesión: solo anotamos el intento.
      </p>

      <h2>Acceso con Lichess</h2>
      <p>
        Entras con tu cuenta de Lichess. No pedimos contraseña ni permisos especiales: Lichess solo nos confirma quién
        eres. Usamos ese acceso una vez, al entrar, y después lo revocamos. <strong>No guardamos tu token de Lichess.</strong>
      </p>

      <h2>Qué guardamos en nuestros servidores</h2>
      <ul>
        <li>Si eres alumno: tu usuario de Lichess y las fechas de tu primer y último acceso, para identificarte.</li>
        <li>
          La lista de autorizados: el identificador y el nombre de usuario de Lichess de cada alumno autorizado, la fecha
          en que se añadió y quién lo añadió. Se borra de la lista cuando el administrador te quita el acceso (tus datos
          de aprendizaje no se borran, pero sin acceso no puedes usar «Borrar mi cuenta»: pide el borrado a tu profesor de TopChess).
        </li>
        <li>
          Las solicitudes de acceso: si entras con Lichess sin estar autorizado, guardamos tu identificador y nombre de
          usuario de Lichess, la fecha del primer y del último intento y cuántos intentos has hecho, para que el administrador
          pueda autorizarte. Se borran solas a los 90 días del último intento, o antes si el administrador las descarta o te autoriza.
        </li>
        <li>Tu Elo y número de partidas en rápidas, clásicas y blitz (bullet no cuenta), solo para recomendarte dónde empezar.</li>
        <li>El nivel que eliges, tu objetivo diario, las lecciones que completas, tus puntuaciones y tu racha de días, para mostrarte tu progreso.</li>
        <li>Tus Chedex (movimientos de saldo), los objetos que compras o equipas y tus protectores de racha.</li>
        <li>Los conceptos en los que has fallado, cuándo te toca repasarlos y, de las partidas que repasas, el identificador de la partida y la posición de tus errores (el tablero y la jugada mejor), para preparar los repasos y la sesión «Entrenar hoy».</li>
        <li>Las posiciones y respuestas de tus sesiones de «Entrenar hoy»; se borran a los 7 días.</li>
      </ul>
      <p>
        <strong>No guardamos</strong> tu contraseña, tu correo, tu token de Lichess ni tus partidas completas.
      </p>

      <h2>Lo que se queda en tu dispositivo</h2>
      <ul>
        <li>
          El análisis de tus partidas se hace en tu navegador, con el motor Stockfish, y su resultado se guarda en tu
          dispositivo (IndexedDB). No sube a nuestros servidores. Si compartes el dispositivo, sigue ahí tras salir de tu cuenta.
        </li>
        <li>Tu preferencia de sonido y los avisos de partidas repasadas que aún no se han enviado.</li>
      </ul>

      <h2>Qué se envía a Lichess y a otros servicios</h2>
      <ul>
        <li>
          Al entrar, nuestro servidor habla con Lichess para confirmar quién eres y leer tu Elo (y revoca el acceso al terminar).
        </li>
        <li>
          Cuando abres «Partidas», tu navegador pide directamente a Lichess tus últimas partidas públicas: Lichess ve tu
          usuario y tu dirección IP, igual que si visitaras su web.
        </li>
        <li>
          Para los puzles, nuestro servidor pide a Lichess lotes anónimos por tema y dificultad, sin ningún dato tuyo.
        </li>
        <li>
          Solo si el administrador activa las estadísticas de aperturas, nuestro servidor consulta a Lichess el diagrama
          (FEN) de la posición que miras en «Aperturas», para mostrar estadísticas de partidas de maestros. No se envían datos
          personales: ni tu usuario, ni tu cuenta de Lichess, ni cookies. El libro de aperturas básico no usa ningún servicio externo.
        </li>
        <li>La web y la base de datos se alojan en Cloudflare. No usamos analítica, publicidad ni rastreadores de terceros.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        Solo usamos cookies necesarias: la que mantiene tu sesión iniciada (7 días) y otra muy breve (10 minutos) mientras
        entras con Lichess. No las usamos para publicidad ni para seguirte por otras webs.
      </p>

      <h2>Tú decides</h2>
      <p>
        Puedes ignorar la recomendación y empezar desde el principio cuando quieras, y salir de tu cuenta en cualquier
        momento con el botón «Salir». Para borrar tu cuenta y todos tus datos, usa «Borrar mi cuenta» al final de tu
        Perfil: es inmediato y no se puede deshacer.
      </p>
      <p className="actions">
        <Link className="t-btn" href="/">
          Volver al inicio
        </Link>
      </p>
    </article>
  );
}
