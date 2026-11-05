import { countries } from '../data.js';
import { requestJSON } from './requests.js';
let ready;
export function prepareCountries() {
  if (!ready)
    ready = requestJSON('/geo/catalog.json', { ttl: 3600000 })
      .then((rows) => {
        const existing = new Map(countries.map((country) => [country.code, country]));
        for (const p of rows) {
          const country = existing.get(p.code);
          if (country) {
            country.lng = p.lng;
            country.lat = p.lat;
            if (/^[A-Z]{3}$/.test(country.name)) {
              country.name = p.name;
              country.aliases = [p.name, p.english];
            }
          } else
            countries.push({
              code: p.code,
              name: p.name,
              aliases: [p.name, p.english],
              lng: p.lng,
              lat: p.lat,
            });
        }
      })
      .catch((error) => {
        ready = null;
        throw error;
      });
  return ready;
}
