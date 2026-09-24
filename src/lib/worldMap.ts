import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import type { GeometryCollection, Topology } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';

/**
 * World map for "Coverage by Region": countries shaded by how often the brand
 * was covered there. Pure SVG path data, so the same map renders on the page
 * and in PowerPoint/PDF exports (converted to an image).
 */

export const MAP_COLORS = { none: '#E5E7EB', low: '#A9C1F0', high: '#1447E6', border: '#FFFFFF' } as const;

type CountryProps = { name: string };
const topology = world as unknown as Topology<{ countries: GeometryCollection<CountryProps> }>;
const countries = feature(topology, topology.objects.countries) as FeatureCollection<Geometry, CountryProps>;

const key = (name: string) => name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');

// Spellings used in editorial data → names in the world atlas.
const ALIASES: Record<string, string> = {
  usa: 'United States of America', us: 'United States of America', unitedstates: 'United States of America', america: 'United States of America',
  uk: 'United Kingdom', britain: 'United Kingdom', greatbritain: 'United Kingdom', england: 'United Kingdom', scotland: 'United Kingdom', wales: 'United Kingdom',
  uae: 'United Arab Emirates', drc: 'Dem. Rep. Congo', democraticrepublicofcongo: 'Dem. Rep. Congo', democraticrepublicofthecongo: 'Dem. Rep. Congo',
  congobrazzaville: 'Congo', republicofcongo: 'Congo', ivorycoast: "Côte d'Ivoire", cotedivoire: "Côte d'Ivoire",
  southkorea: 'South Korea', korea: 'South Korea', northkorea: 'North Korea', russianfederation: 'Russia', czechrepublic: 'Czechia',
  centralafricanrepublic: 'Central African Rep.', southsudan: 'S. Sudan', equatorialguinea: 'Eq. Guinea', eswatini: 'eSwatini', swaziland: 'eSwatini',
  bosniaandherzegovina: 'Bosnia and Herz.', dominicanrepublic: 'Dominican Rep.', westernsahara: 'W. Sahara', holland: 'Netherlands',
};
const BY_KEY = new Map(countries.features.map((f) => [key(f.properties.name), f.properties.name]));

/** Atlas name for a country as written in editorial data, or null if unknown. */
export function matchCountry(name: string): string | null {
  const k = key(name);
  if (!k) return null;
  return BY_KEY.get(k) ?? (ALIASES[k] ? ALIASES[k] : null);
}

function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

export interface WorldMap {
  width: number;
  height: number;
  paths: { name: string; d: string; fill: string; count: number }[];
  /** Countries in the data that could not be placed on the map. */
  unmatched: string[];
}

/** Builds the shaded map for `data` (country name → story count). */
export function buildWorldMap(data: { country: string; count: number }[], width = 960, height = 480): WorldMap {
  const counts = new Map<string, number>();
  const unmatched: string[] = [];
  for (const { country, count } of data) {
    const name = matchCountry(country);
    if (name) counts.set(name, (counts.get(name) ?? 0) + count);
    else unmatched.push(country);
  }
  const max = Math.max(1, ...counts.values());
  const projection = geoNaturalEarth1().fitExtent([[4, 4], [width - 4, height - 4]], {
    type: 'FeatureCollection',
    // Antarctica takes space without ever carrying coverage.
    features: countries.features.filter((f) => f.properties.name !== 'Antarctica'),
  });
  const path = geoPath(projection);
  const paths = countries.features
    .filter((f) => f.properties.name !== 'Antarctica')
    .map((f) => {
      const count = counts.get(f.properties.name) ?? 0;
      // Log scale so one very large market does not wash out the rest.
      const t = count ? Math.log(count + 1) / Math.log(max + 1) : 0;
      return { name: f.properties.name, d: path(f) ?? '', count, fill: count ? mix(MAP_COLORS.low, MAP_COLORS.high, t) : MAP_COLORS.none };
    })
    .filter((p) => p.d);
  return { width, height, paths, unmatched };
}

/** Standalone SVG markup of the map (for image export). */
export function worldMapSvg(map: WorldMap): string {
  const body = map.paths.map((p) => `<path d="${p.d}" fill="${p.fill}" stroke="${MAP_COLORS.border}" stroke-width="0.5"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${map.width} ${map.height}" width="${map.width}" height="${map.height}">${body}</svg>`;
}
