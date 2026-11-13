/** Parejas texto/fondo (y componentes gráficos) de la app, que es siempre oscura. Los valores salen de web/src/tactile.css y styles.css. */
export interface Pair {
  name: string;
  fg: string;
  bg: string;
  /** 4.5 para texto normal, 3 para texto grande o componentes gráficos. */
  min: number;
}

const INK = '#0b0c0e';
const GRAPHITE = '#191a1e';
const GRAPHITE2 = '#202126';
const SIDEBAR = '#101114';
const ORANGE = '#f18b42';
const ORANGE_TEXT = '#ffa563';
const PAPER = '#f5f5f2';
const MUTED = '#b9bbc0';
const BTN_TEXT = '#efefeb';

export const PAIRS: Pair[] = [
  { name: 'Texto principal sobre tinta (fondo de página)', fg: PAPER, bg: INK, min: 4.5 },
  { name: 'Texto principal sobre tarjeta grafito', fg: PAPER, bg: GRAPHITE, min: 4.5 },
  { name: 'Texto principal sobre grafito 2 (pieza/pestaña)', fg: PAPER, bg: GRAPHITE2, min: 4.5 },
  { name: 'Texto secundario sobre tinta', fg: MUTED, bg: INK, min: 4.5 },
  { name: 'Texto secundario sobre tarjeta grafito', fg: MUTED, bg: GRAPHITE, min: 4.5 },
  { name: 'Texto secundario sobre grafito 2', fg: MUTED, bg: GRAPHITE2, min: 4.5 },
  { name: 'Texto secundario sobre barra lateral/inferior', fg: MUTED, bg: SIDEBAR, min: 4.5 },
  { name: 'Texto secundario sobre pie #08090b', fg: MUTED, bg: '#08090b', min: 4.5 },
  { name: 'Texto secundario sobre banda #121316 (landing)', fg: MUTED, bg: '#121316', min: 4.5 },
  { name: 'Texto secundario sobre tarjeta de título #26272d', fg: MUTED, bg: '#26272d', min: 4.5 },
  { name: 'Enlace / naranja de texto sobre tinta', fg: ORANGE_TEXT, bg: INK, min: 4.5 },
  { name: 'Naranja de texto sobre tarjeta grafito (kicker, enlaces)', fg: ORANGE_TEXT, bg: GRAPHITE, min: 4.5 },
  { name: 'Naranja de texto sobre grafito 2 (nav activo, nodo)', fg: ORANGE_TEXT, bg: GRAPHITE2, min: 4.5 },
  { name: 'Naranja de texto sobre naranja suave (chip recomendado, beta)', fg: ORANGE_TEXT, bg: '#2b1e14', min: 4.5 },
  { name: 'Botón primario: tinta sobre naranja', fg: INK, bg: ORANGE, min: 4.5 },
  { name: 'Botón primario (hover)', fg: INK, bg: '#f79a58', min: 4.5 },
  { name: 'Botón secundario', fg: BTN_TEXT, bg: GRAPHITE2, min: 4.5 },
  { name: 'Botón secundario (hover)', fg: BTN_TEXT, bg: '#2a2b31', min: 4.5 },
  { name: 'Botón fantasma: naranja de texto sobre tarjeta', fg: ORANGE_TEXT, bg: GRAPHITE, min: 4.5 },
  { name: 'Botón fantasma (hover: blanco 8 % sobre tarjeta)', fg: ORANGE_TEXT, bg: '#2b2c30', min: 4.5 },
  { name: 'Botón de peligro', fg: '#1a0505', bg: '#ff9c94', min: 4.5 },
  { name: 'Botón de peligro (hover)', fg: '#1a0505', bg: '#ffaea8', min: 4.5 },
  { name: 'Pestaña/chip activo: tinta sobre naranja', fg: INK, bg: ORANGE, min: 4.5 },
  { name: 'Pestaña/chip inactivo', fg: BTN_TEXT, bg: GRAPHITE2, min: 4.5 },
  { name: 'Fase actual de la lección', fg: INK, bg: ORANGE, min: 4.5 },
  { name: 'Número de fase (naranja de texto sobre tinta)', fg: ORANGE_TEXT, bg: INK, min: 4.5 },
  { name: 'Fase pendiente: secundario sobre grafito 2', fg: MUTED, bg: GRAPHITE2, min: 4.5 },
  { name: 'Estado «Siguiente» (chip-next)', fg: INK, bg: ORANGE, min: 4.5 },
  { name: 'Estado completada: verde sobre fondo verde', fg: '#7fdca4', bg: '#173325', min: 4.5 },
  { name: 'Estado cancelada: rojo sobre fondo rojo', fg: '#ff9c94', bg: '#3b1d1b', min: 4.5 },
  { name: 'Estado bloqueada: secundario sobre grafito', fg: MUTED, bg: GRAPHITE, min: 4.5 },
  { name: 'Aviso de éxito: texto principal', fg: PAPER, bg: '#173325', min: 4.5 },
  { name: 'Aviso de error: texto principal', fg: PAPER, bg: '#3b1d1b', min: 4.5 },
  { name: 'Aviso de pista: texto sobre fondo ámbar', fg: '#ffe9a8', bg: '#3a2f10', min: 4.5 },
  { name: 'Aviso informativo: texto principal', fg: PAPER, bg: '#2b1e14', min: 4.5 },
  { name: 'Barra «modo simulado»', fg: '#ffe9a8', bg: '#3a2f10', min: 4.5 },
  { name: '¡Correcto!: verde sobre feedback', fg: '#7fdca4', bg: '#173325', min: 4.5 },
  { name: 'Incorrecto: rojo sobre feedback', fg: '#ff9c94', bg: '#3b1d1b', min: 4.5 },
  { name: 'Error de campo: rojo sobre tarjeta', fg: '#ff9c94', bg: GRAPHITE, min: 4.5 },
  { name: 'Éxito en línea (.ok, «Equipado») sobre tarjeta', fg: '#7fdca4', bg: GRAPHITE, min: 4.5 },
  { name: 'Entrada de texto: texto sobre campo hundido', fg: PAPER, bg: INK, min: 4.5 },
  { name: 'Marcador de posición (placeholder) sobre campo', fg: '#a2a5ac', bg: INK, min: 4.5 },
  { name: 'Navegación inactiva sobre barra lateral', fg: MUTED, bg: SIDEBAR, min: 4.5 },
  { name: 'Texto naranja sobre barra lateral (marca)', fg: ORANGE_TEXT, bg: SIDEBAR, min: 4.5 },
  { name: 'Número de nodo claro de la landing', fg: '#1a0f06', bg: '#d98f55', min: 4.5 },
  { name: 'Número de nodo oscuro de la landing', fg: '#ffb27a', bg: '#34302e', min: 4.5 },
  { name: 'Hero de la landing: texto sobre #08090b', fg: '#d0d2d8', bg: '#08090b', min: 4.5 },
  { name: 'Enlace de salto: tinta sobre naranja', fg: INK, bg: ORANGE, min: 4.5 },
  // Landing 4 (producto completo): estados, ciclo, entrenador, camino, calidad y precio
  { name: 'Landing: naranja de texto sobre banda #121316 (rango de Elo, enlaces)', fg: ORANGE_TEXT, bg: '#121316', min: 4.5 },
  { name: 'Landing: texto principal sobre banda #121316', fg: PAPER, bg: '#121316', min: 4.5 },
  { name: 'Landing: texto secundario sobre banda #0b0c0e', fg: MUTED, bg: '#0b0c0e', min: 4.5 },
  { name: 'Landing: estado «Hoy / Disponible ahora» (naranja sobre naranja suave)', fg: ORANGE_TEXT, bg: '#2b1e14', min: 4.5 },
  { name: 'Landing: estado «En desarrollo» (naranja sobre rayado, peor caso)', fg: ORANGE_TEXT, bg: '#3c2c24', min: 4.5 },
  { name: 'Landing: estado «En preparación» (secundario sobre tarjeta)', fg: MUTED, bg: GRAPHITE, min: 4.5 },
  { name: 'Landing: borde del estado «En preparación» sobre tarjeta', fg: '#70737b', bg: GRAPHITE, min: 3 },
  { name: 'Landing: borde del estado «En preparación» sobre tinta', fg: '#70737b', bg: '#0b0c0e', min: 3 },
  { name: 'Landing: texto principal sobre el cuadro «Hoy / El compromiso» (grafito)', fg: PAPER, bg: GRAPHITE, min: 4.5 },
  { name: 'Landing: texto de las lecciones sobre lista #121316', fg: PAPER, bg: '#121316', min: 4.5 },
  { name: 'Landing: flecha del ciclo (naranja sobre tinta)', fg: ORANGE_TEXT, bg: '#0b0c0e', min: 3 },
  { name: 'Landing: precio, tinta sobre naranja', fg: '#0b0c0e', bg: ORANGE, min: 4.5 },
  // componentes gráficos y anillos (3:1)
  { name: 'Anillo de foco sobre tinta', fg: '#ffb27a', bg: INK, min: 3 },
  { name: 'Anillo de foco sobre tarjeta grafito', fg: '#ffb27a', bg: GRAPHITE, min: 3 },
  { name: 'Anillo de foco sobre barra lateral', fg: '#ffb27a', bg: SIDEBAR, min: 3 },
  { name: 'Borde de campo de texto sobre tinta', fg: '#70737b', bg: INK, min: 3 },
  { name: 'Borde de campo de texto sobre tarjeta grafito', fg: '#70737b', bg: GRAPHITE, min: 3 },
  { name: 'Relleno de progreso sobre carril', fg: ORANGE, bg: INK, min: 3 },
  { name: 'Relleno de progreso sobre tarjeta', fg: ORANGE, bg: GRAPHITE, min: 3 },
  { name: 'Marca de racha rellena sobre vacía', fg: ORANGE, bg: INK, min: 3 },
  { name: 'Borde discontinuo de bloqueado sobre tinta', fg: '#62656d', bg: INK, min: 3 },
  { name: 'Icono verde de completada sobre fondo verde', fg: '#7fdca4', bg: '#173325', min: 3 },
];

const lin = (c: number) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
