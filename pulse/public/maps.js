import { prepareCountries } from './lib/geography.js';
import { requestJSON } from './lib/requests.js';
let engine;
const mapEngine = () => (engine ||= import('./vendor/maplibre-gl.mjs'));
import { countries } from './data.js';
import { countryActivity } from './lib/observatory.js';
const maps = new globalThis.Map();
let geography;
const loadGeography = () =>
  (geography ||= requestJSON('/geo/countries.geojson', { ttl: 3600000 }).catch((error) => {
    geography = null;
    throw error;
  }));
export const prepareGeography = prepareCountries;
function graticule() {
  const features = [];
  for (let lng = -180; lng <= 180; lng += 30)
    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [lng, -80],
          [lng, 84],
        ],
      },
    });
  for (let lat = -60; lat <= 60; lat += 30)
    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: Array.from({ length: 37 }, (_, i) => [-180 + i * 10, lat]),
      },
    });
  return { type: 'FeatureCollection', features };
}
export async function updateMap(
  id,
  { list, selected, broadcasts = [], players = [], filter = 'all', onSelect, onReady },
) {
  const container = document.getElementById(id);
  if (!container || !container.offsetWidth || !container.offsetHeight) return;
  let state = maps.get(id);
  if (!state) {
    try {
      const [geo, library] = await Promise.all([loadGeography(), mapEngine(), prepareCountries()]);
      const { Map, NavigationControl, AttributionControl, Popup } = library;
      // Otra actualización puede haber creado ya la instancia durante la descarga.
      if (maps.has(id))
        return updateMap(id, { list, selected, broadcasts, players, filter, onSelect });
      container.innerHTML = '';
      const map = new Map({
        container,
        center: [8, 18],
        zoom: Math.min(1.2, Math.log2(container.clientWidth / 512) - 0.1),
        minZoom: -2,
        maxZoom: 5.5,
        renderWorldCopies: false,
        attributionControl: false,
        scrollZoom: false,
        locale: {
          'NavigationControl.ZoomIn': 'Acercar',
          'NavigationControl.ZoomOut': 'Alejar',
          'AttributionControl.ToggleAttribution': 'Ver atribución',
        },
        style: {
          version: 8,
          sources: {
            countries: { type: 'geojson', data: geo },
            grid: { type: 'geojson', data: graticule() },
          },
          layers: [
            { id: 'ocean', type: 'background', paint: { 'background-color': '#101318' } },
            {
              id: 'grid',
              type: 'line',
              source: 'grid',
              paint: { 'line-color': '#343b46', 'line-opacity': 0.35, 'line-width': 0.5 },
            },
            {
              id: 'land',
              type: 'fill',
              source: 'countries',
              paint: { 'fill-color': '#262b33', 'fill-opacity': 0.95 },
            },
            {
              id: 'borders',
              type: 'line',
              source: 'countries',
              paint: { 'line-color': '#555963', 'line-width': 0.65, 'line-opacity': 0.7 },
            },
            {
              id: 'selection',
              type: 'line',
              source: 'countries',
              filter: ['==', ['get', 'code'], ''],
              paint: { 'line-color': '#f18b42', 'line-width': 1.8 },
            },
          ],
        },
      });
      state = {
        map,
        selected: null,
        latest: null,
        ready: false,
        popup: new Popup({ closeButton: true, maxWidth: '290px', focusAfterOpen: false }),
      };
      maps.set(id, state);
      map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(
        new AttributionControl({
          compact: true,
          customAttribution:
            '<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a> · Fronteras de referencia',
        }),
        'bottom-right',
      );
      map.on('load', () => {
        state.ready = true;
        applyState(state);
        onReady?.();
      });
      map.on('click', 'land', (event) => {
        if (
          map.getLayer('activity-points') &&
          map.queryRenderedFeatures(event.point, { layers: ['activity-hit'] }).length
        )
          return;
        const code = event.features?.[0]?.properties.code;
        if (code) onSelect(code);
      });
      map.on('click', 'activity-hit', (event) => {
        const point = event.features?.[0];
        if (!point) return;
        const row = state.activity.find((entry) => entry.country.code === point.properties.code);
        if (!row) return;
        const content = document.createElement('div');
        content.className = 'map-detail';
        const title = document.createElement('strong');
        title.textContent = row.country.name;
        content.append(title);
        const note = document.createElement('p');
        note.textContent =
          state.latest.filter === 'players'
            ? `${row.players} jugadores en seguimiento · Federación registrada, no residencia.`
            : `${row.items.length} retransmisiones · ${row.live} en directo · ${row.upcoming} próximas. Ubicación aproximada por país.`;
        content.append(note);
        const items =
          state.latest.filter === 'live'
            ? row.items.filter((item) => item.status === 'live')
            : state.latest.filter === 'upcoming'
              ? row.items.filter((item) => item.status === 'upcoming')
              : row.items;
        if (state.latest.filter !== 'players')
          for (const item of items.slice(0, 3)) {
            const link = document.createElement('a');
            link.href = `/torneo/${encodeURIComponent(item.id)}`;
            link.textContent = `${item.status === 'live' ? '● ' : ''}${item.name} ↗`;
            content.append(link);
          }
        const link = document.createElement('a');
        link.href = `/mundo/${row.country.code}`;
        link.textContent = 'Explorar país ↗';
        content.append(link);
        state.popup.setLngLat(point.geometry.coordinates).setDOMContent(content).addTo(map);
      });
      map.on('mouseenter', 'activity-hit', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mousemove', 'land', (event) => {
        map.getCanvas().style.cursor = 'pointer';
        const point = map.getLayer('activity-hit')
          ? map.queryRenderedFeatures(event.point, { layers: ['activity-hit'] })[0]
          : null;
        const feature = point || event.features?.[0];
        const label = document.getElementById(`${id}-hover`);
        if (label && feature) label.textContent = feature.properties.name;
      });
      map.on('mouseleave', 'land', () => {
        map.getCanvas().style.cursor = '';
        const label = document.getElementById(`${id}-hover`);
        if (label) label.textContent = 'Selecciona un país';
      });
      map.on('error', () => {
        const label = document.getElementById(`${id}-hover`);
        if (label) label.textContent = 'Cartografía no disponible · Usa el directorio';
      });
      new ResizeObserver(() => {
        if (container.offsetWidth) map.resize();
      }).observe(container);
    } catch {
      container.innerHTML =
        '<p class="empty">El mapa no está disponible en este dispositivo. Puedes explorar los países en el directorio.</p>';
      return;
    }
  }
  state.latest = { list, selected, broadcasts, players, filter };
  if (state.ready) applyState(state);
}
function applyState(state) {
  const { map, latest } = state;
  if (!latest) return;
  const { list, selected, broadcasts, players, filter } = latest;
  const signature = JSON.stringify([
    list.map((c) => c.code),
    selected,
    filter,
    broadcasts.map((t) => [t.id, t.status, t.location]),
    players.map((p) => [p.id, p.country]),
  ]);
  if (state.signature === signature) return;
  state.signature = signature;
  map.setFilter('selection', ['==', ['get', 'code'], selected || '']);
  map.setPaintProperty('land', 'fill-color', [
    'case',
    ['==', ['get', 'code'], selected || ''],
    '#77482c',
    ['in', ['get', 'code'], ['literal', list.map((c) => c.code)]],
    '#30353d',
    '#1a1e25',
  ]);
  state.popup.remove();
  state.activity = countryActivity(list, broadcasts, players, filter);
  const points = state.activity.flatMap(({ country, count, live }) => {
    if (!Number.isFinite(country.lng) || !count) return [];
    return [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [country.lng, country.lat] },
        properties: {
          code: country.code,
          count,
          live: ['players', 'upcoming'].includes(filter) ? 0 : live,
          name: country.name,
        },
      },
    ];
  });
  const data = { type: 'FeatureCollection', features: points };
  if (map.getSource('activity')) map.getSource('activity').setData(data);
  else {
    map.addSource('activity', { type: 'geojson', data });
    map.addLayer({
      id: 'activity-halo',
      type: 'circle',
      source: 'activity',
      paint: {
        'circle-color': ['case', ['>', ['get', 'live'], 0], '#f18b42', '#a3a7b3'],
        'circle-opacity': 0.13,
        'circle-radius': ['+', 9, ['min', ['get', 'count'], 8]],
      },
    });
    map.addLayer({
      id: 'activity-points',
      type: 'circle',
      source: 'activity',
      paint: {
        'circle-color': ['case', ['>', ['get', 'live'], 0], '#f6a162', '#a3a7b3'],
        'circle-radius': ['+', 3, ['min', ['get', 'count'], 4]],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#15171c',
      },
    });
  }
  if (!map.getLayer('activity-hit'))
    map.addLayer({
      id: 'activity-hit',
      type: 'circle',
      source: 'activity',
      paint: { 'circle-radius': 16, 'circle-opacity': 0 },
    });
  if (selected && selected !== state.selected) {
    const country = countries.find((c) => c.code === selected);
    if (country && Number.isFinite(country.lng))
      map.easeTo({
        center: [country.lng, country.lat],
        zoom: 2.4,
        duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600,
      });
  }
  state.selected = selected;
}
export function resetMaps() {
  for (const { map } of maps.values())
    map.easeTo({
      center: [8, 18],
      zoom: Math.min(1.2, Math.log2(map.getContainer().clientWidth / 512) - 0.1),
      duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300,
    });
}
