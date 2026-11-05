import { Map, NavigationControl, AttributionControl } from './vendor/maplibre-gl.mjs';
import { countries } from './data.js';
const maps = new globalThis.Map();
let geography;
const loadGeography = async () => {
  if (!geography) geography = fetch('/geo/countries.geojson').then(r => { if (!r.ok) throw new Error('geo'); return r.json(); }).then(data => {
    for (const feature of data.features) {
      const p = feature.properties, existing = countries.find(c => c.code === p.code);
      if (existing) { existing.lng = p.lng; existing.lat = p.lat; if (/^[A-Z]{3}$/.test(existing.name)) { existing.name = p.name; existing.aliases = [p.name,p.english]; } }
      else countries.push({ code: p.code, name: p.name, aliases: [p.name, p.english], lng: p.lng, lat: p.lat });
    }
    return data;
  });
  return geography;
};
export async function prepareGeography() { await loadGeography(); }
function graticule() {
  const features = [];
  for (let lng = -180; lng <= 180; lng += 30) features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[lng, -80], [lng, 84]] } });
  for (let lat = -60; lat <= 60; lat += 30) features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: Array.from({ length: 37 }, (_, i) => [-180 + i * 10, lat]) } });
  return { type: 'FeatureCollection', features };
}
export async function updateMap(id, { list, selected, broadcasts = [], filter = 'all', onSelect, onReady }) {
  const container = document.getElementById(id);
  if (!container || !container.offsetWidth || !container.offsetHeight) return;
  let state = maps.get(id);
  if (!state) {
    try {
      const geo = await loadGeography();
      // Otra actualización puede haber creado ya la instancia durante la descarga.
      if (maps.has(id)) return updateMap(id, { list, selected, broadcasts, filter, onSelect });
      container.innerHTML = '';
      const map = new Map({ container, center: [8, 18], zoom: Math.min(1.2, Math.log2(container.clientWidth / 512) - .1), minZoom: -2, maxZoom: 5.5, renderWorldCopies: false, attributionControl: false, scrollZoom: false,
        locale: { 'NavigationControl.ZoomIn': 'Acercar', 'NavigationControl.ZoomOut': 'Alejar', 'AttributionControl.ToggleAttribution': 'Ver atribución' },
        style: { version: 8, sources: { countries: { type: 'geojson', data: geo }, grid: { type: 'geojson', data: graticule() } }, layers: [
          { id: 'ocean', type: 'background', paint: { 'background-color': '#101318' } },
          { id: 'grid', type: 'line', source: 'grid', paint: { 'line-color': '#343b46', 'line-opacity': .35, 'line-width': .5 } },
          { id: 'land', type: 'fill', source: 'countries', paint: { 'fill-color': '#262b33', 'fill-opacity': .95 } },
          { id: 'borders', type: 'line', source: 'countries', paint: { 'line-color': '#555963', 'line-width': .65, 'line-opacity': .7 } },
          { id: 'selection', type: 'line', source: 'countries', filter: ['==', ['get', 'code'], ''], paint: { 'line-color': '#f18b42', 'line-width': 1.8 } }
        ] }
      });
      state = { map, selected: null, latest: null, ready: false }; maps.set(id, state);
      map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
      map.addControl(new AttributionControl({ compact: true, customAttribution: '<a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a> · Fronteras de referencia' }), 'bottom-right');
      map.on('load', () => { state.ready = true; applyState(state); onReady?.(); });
      map.on('click', 'land', event => { const code = event.features?.[0]?.properties.code; if (code) onSelect(code); });
      map.on('mousemove', 'land', event => {
        map.getCanvas().style.cursor = 'pointer';
        const feature = event.features?.[0];
        const label = document.getElementById(`${id}-hover`);
        if (label && feature) label.textContent = feature.properties.name;
      });
      map.on('mouseleave', 'land', () => { map.getCanvas().style.cursor = ''; const label = document.getElementById(`${id}-hover`); if (label) label.textContent = 'Selecciona un país'; });
      map.on('error', () => { const label = document.getElementById(`${id}-hover`); if (label) label.textContent = 'Cartografía no disponible · Usa el directorio'; });
      new ResizeObserver(() => { if (container.offsetWidth) map.resize(); }).observe(container);
    } catch {
      container.innerHTML = '<p class="empty">El mapa no está disponible en este dispositivo. Puedes explorar los países en el directorio.</p>';
      return;
    }
  }
  state.latest = { list, selected, broadcasts, filter };
  if (state.ready) applyState(state);
}
function applyState(state) {
  const { map, latest } = state;
  if (!latest) return;
  const { list, selected, broadcasts, filter } = latest;
  map.resize();
  map.setFilter('selection', ['==', ['get', 'code'], selected || '']);
  map.setPaintProperty('land', 'fill-color', ['case', ['==', ['get', 'code'], selected || ''], '#77482c', ['in', ['get', 'code'], ['literal', list.map(c => c.code)]], '#30353d', '#1a1e25']);
  const points = list.flatMap(country => {
    if (!Number.isFinite(country.lng)) return [];
    const count = broadcasts.filter(t => country.aliases.some(alias => new RegExp(`(^|[^\\p{L}])${alias}([^\\p{L}]|$)`, 'iu').test(t.location))).length;
    if (!count && filter !== 'players') return [];
    return [{ type: 'Feature', geometry: { type: 'Point', coordinates: [country.lng, country.lat] }, properties: { code: country.code, count, name: country.name } }];
  });
  const data = { type: 'FeatureCollection', features: points };
  if (map.getSource('activity')) map.getSource('activity').setData(data);
  else {
    map.addSource('activity', { type: 'geojson', data });
    map.addLayer({ id: 'activity-halo', type: 'circle', source: 'activity', paint: { 'circle-color': '#f18b42', 'circle-opacity': .13, 'circle-radius': ['+', 8, ['*', ['get', 'count'], 1.5]] } });
    map.addLayer({ id: 'activity-points', type: 'circle', source: 'activity', paint: { 'circle-color': '#f6a162', 'circle-radius': ['+', 3, ['min', ['get', 'count'], 4]], 'circle-stroke-width': 1.5, 'circle-stroke-color': '#15171c' } });
  }
  if (selected && selected !== state.selected) {
    const country = countries.find(c => c.code === selected);
    if (country && Number.isFinite(country.lng)) map.easeTo({ center: [country.lng, country.lat], zoom: 2.4, duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600 });
  }
  state.selected = selected;
}
export function resetMaps() { for (const { map } of maps.values()) map.easeTo({ center: [8, 18], zoom: Math.min(1.2, Math.log2(map.getContainer().clientWidth / 512) - .1), duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300 }); }
