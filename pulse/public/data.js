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
  "performance": {
    "name": "Performance",
    "title": "Progresión medible de Elo.",
    "description": "Performance v1.0 expresa la progresión del Elo estándar en doce meses. La unidad son puntos Elo, sin una escala artificial de 0 a 100.",
    "source": "Trece listas mensuales estándar FIDE consecutivas, con URLs y huellas SHA-256 conservadas.",
    "period": "Lista actual frente al mismo mes del año anterior. Partidas: suma de los doce periodos posteriores a la lista base. Recopilación mensual; se vuelve a intentar a diario si la lista aún no se ha publicado.",
    "calculation": "Puntuación = Elo actual − Elo de hace doce meses. Para ordenar se exigen trece listas consecutivas con Elo, al menos doce partidas en los doce periodos y estado activo en la última lista.",
    "limitation": "No es performance por partida ni mide el nivel de los rivales. La selección se forma por Elo actual, mujeres, jóvenes y catálogo Wikipedia; no constituye un ranking de progresión de todos los jugadores del mundo.",
    "url": "https://ratings.fide.com/download_lists.phtml",
    "state": "Activo · v1.0 · Unidad: puntos Elo",
    "formula": "Performance = Elo del mes actual − Elo del mismo mes del año anterior. Datos insuficientes → sin puntuación."
  },
  "trending": {
    "name": "Trending",
    "title": "La evolución del interés público.",
    "description": "Trending v1.0 compara el volumen de consultas de Wikipedia en inglés. Mide atención, nunca mérito deportivo ni fuerza de juego.",
    "source": "Wikimedia Pageviews: en.wikipedia.org, all-access y agent=user. Artículos canónicos vinculados a FIDE mediante la propiedad P1440 de Wikidata.",
    "period": "Siete días completos UTC frente a los siete inmediatamente anteriores. Se dejan dos días de margen de publicación. Recopilación diaria a las 07:23 de Madrid en invierno y 08:23 en verano, sujeta a ejecución de GitHub Actions.",
    "calculation": "Puntuación = 100 × (visitas actuales − visitas anteriores) / visitas anteriores. Mínimo de 100 visitas en el periodo base y los catorce días presentes. Los datos de una consulta fallida se conservan como históricos pero se excluyen del ranking.",
    "limitation": "Catálogo editorial de 28 artículos en inglés. No incluye todo el ajedrez ni otros idiomas, redes sociales o búsquedas. No se suman redirecciones: se consulta el artículo canónico verificado.",
    "url": "https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/reference/page-views.html",
    "state": "Activo · v1.0 · Unidad: variación porcentual",
    "formula": "Trending = 100 × (visitas de los últimos 7 días completos − visitas de los 7 anteriores) / visitas de los 7 anteriores. Base inferior a 100 → no comparable."
  },
  "global": {
    "name": "Global",
    "title": "El cambio del censo activo FIDE.",
    "description": "Global v1.0 mide cómo varía el número de jugadores activos con Elo estándar registrados en cada federación. Es una medida concreta del censo competitivo publicado.",
    "source": "Listas estándar FIDE completas, agregadas por código de federación. Se muestran también titulados activos, jóvenes por año de nacimiento y media de Elo de los diez activos con mayor puntuación.",
    "period": "Lista del mes actual frente al mismo mes del año anterior. Base mínima de cien jugadores activos para reducir variaciones extremas en muestras pequeñas. Recopilación mensual.",
    "calculation": "Puntuación = 100 × (activos actuales − activos hace doce meses) / activos hace doce meses. Activo significa: registro con Elo válido sin bandera de inactividad en la lista FIDE.",
    "limitation": "Puede cambiar por altas, bajas, transferencias o revisiones de la fuente. No mide todos los torneos, el ajedrez escolar ni el éxito de una federación. Federación y territorio no son equivalentes; no se usan retransmisiones como censo nacional.",
    "url": "https://ratings.fide.com/download_lists.phtml",
    "state": "Activo · v1.0 · Unidad: variación porcentual del censo",
    "formula": "Global = 100 × (jugadores activos actuales − jugadores activos de la lista base) / jugadores activos de la lista base. Base inferior a 100 → no comparable."
  }
};
export const countryByCode = code => countries.find(c => c.code === code);
export function matchesCountry(text, country) {
  return country.aliases.some(alias => new RegExp(`(^|[^\\p{L}])${alias}([^\\p{L}]|$)`, 'iu').test(text));
}
