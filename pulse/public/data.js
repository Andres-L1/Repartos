export const countries = [
  { code: 'ESP', name: 'España', aliases: ['Spain', 'España'], x: 469, y: 161 },
  { code: 'FRA', name: 'Francia', aliases: ['France', 'Francia'], x: 484, y: 145 },
  { code: 'GER', name: 'Alemania', aliases: ['Germany', 'Alemania'], x: 503, y: 132 },
  { code: 'NOR', name: 'Noruega', aliases: ['Norway', 'Noruega'], x: 505, y: 91 },
  { code: 'SRB', name: 'Serbia', aliases: ['Serbia'], x: 528, y: 151 },
  { code: 'IND', name: 'India', aliases: ['India'], x: 673, y: 204 },
  { code: 'CHN', name: 'China', aliases: ['China'], x: 754, y: 166 },
  { code: 'USA', name: 'Estados Unidos', aliases: ['United States', 'USA', 'Estados Unidos'], x: 214, y: 158 },
  { code: 'BRA', name: 'Brasil', aliases: ['Brazil', 'Brasil'], x: 322, y: 298 },
  { code: 'ARG', name: 'Argentina', aliases: ['Argentina'], x: 284, y: 361 },
  { code: 'RSA', name: 'Sudáfrica', aliases: ['South Africa', 'Sudáfrica'], x: 533, y: 327 },
  { code: 'MAS', name: 'Malasia', aliases: ['Malaysia', 'Malasia'], x: 738, y: 254 }
];
export const players = [
  { id: '1503014', name: 'Magnus Carlsen', country: 'NOR', initials: 'MC', aliases: ['Carlsen'] },
  { id: '46616543', name: 'Gukesh D', country: 'IND', initials: 'GD', aliases: ['Gukesh'] },
  { id: '8602980', name: 'Hou Yifan', country: 'CHN', initials: 'HY', aliases: ['Hou Yifan'] }
];
export const indices = {
  performance: { name: 'Performance', title: 'La evolución sobre el tablero.', description: 'Una perspectiva sobre progresión y rendimiento competitivo. El Elo de un mes, por sí solo, no explica una trayectoria.', source: 'Listas mensuales FIDE y partidas verificadas cuando estén disponibles.', period: 'Ventana propuesta de 12 meses, comparada con el periodo anterior. Se exigirán suficientes partidas y meses de actividad.', calculation: 'Propuesta: combinar variación de Elo, actividad y rendimiento frente al nivel de los oponentes. Los pesos, mínimos de muestra y normalización se validarán y publicarán antes del primer ranking.', limitation: 'Las listas mensuales no bastan para calcular performance por partida. No se publicará esta componente sin resultados y rivales verificables.', url: 'https://ratings.fide.com/download.phtml', state: 'Pendiente de importación e histórico FIDE', formula: 'Todavía no hay una fórmula de puntuación aprobada. No se calculan ni publican valores.' },
  trending: { name: 'Trending', title: 'La atención también se mueve.', description: 'Una perspectiva sobre el interés público. Mide atención, nunca nivel de juego ni mérito deportivo.', source: 'Wikimedia Pageviews. Solo consultas de usuarios (agent=user), con edición e identificador de artículo publicados.', period: 'Propuesta: últimos 7 días completos frente a los 7 anteriores. Fechas en UTC; no se compara un día incompleto con uno completo.', calculation: 'Variación porcentual propuesta: 100 × (visitas del periodo actual − visitas del anterior) / visitas del anterior. Si el periodo anterior es cero, el cambio se declara no comparable.', limitation: 'Antes de ordenar habrá que fijar el mínimo de visitas, la edición de Wikipedia y el tratamiento de redirecciones. Una noticia puntual puede producir picos.', url: 'https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/', state: 'Pendiente de integración y validación', formula: 'Cambio relativo de visitas, acompañado siempre del volumen absoluto. Esta propuesta aún no produce un ranking.' },
  global: { name: 'Global', title: 'El ajedrez, a escala de país.', description: 'Una perspectiva sobre la actividad y la evolución de las federaciones. La cobertura desigual debe ser visible, nunca disimulada.', source: 'Listas FIDE y registros de torneos con fecha, federación y cobertura documentadas.', period: 'Propuesta: actividad de los últimos 12 meses, con actualización mensual y comparación interanual.', calculation: 'Propuesta: combinar jugadores activos, participación competitiva y evolución del conjunto. Se publicarán por separado los valores absolutos, relativos y la cobertura.', limitation: 'Una retransmisión no representa toda la actividad de un país. No se inferirán índices nacionales a partir de la selección de Lichess.', url: 'https://ratings.fide.com/', state: 'Pendiente de series nacionales comparables', formula: 'Los componentes y pesos se publicarán tras validar la calidad y cobertura. Todavía no hay puntuaciones nacionales.' }
};
export const countryByCode = code => countries.find(c => c.code === code);
export function matchesCountry(text, country) {
  return country.aliases.some(alias => new RegExp(`(^|[^\\p{L}])${alias}([^\\p{L}]|$)`, 'iu').test(text));
}
