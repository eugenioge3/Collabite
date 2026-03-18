export type MexicoStateCities = {
  state: string;
  cities: string[];
};

export const MEXICO_STATES_WITH_CITIES: MexicoStateCities[] = [
  { state: 'Aguascalientes', cities: ['Aguascalientes', 'Jesus Maria', 'Calvillo'] },
  { state: 'Baja California', cities: ['Tijuana', 'Mexicali', 'Ensenada', 'Rosarito'] },
  { state: 'Baja California Sur', cities: ['La Paz', 'Los Cabos', 'Loreto'] },
  { state: 'Campeche', cities: ['Campeche', 'Ciudad del Carmen', 'Champoton'] },
  { state: 'Chiapas', cities: ['Tuxtla Gutierrez', 'San Cristobal de las Casas', 'Tapachula'] },
  { state: 'Chihuahua', cities: ['Chihuahua', 'Ciudad Juarez', 'Delicias'] },
  { state: 'Ciudad de Mexico', cities: ['Ciudad de Mexico'] },
  { state: 'Coahuila', cities: ['Saltillo', 'Torreon', 'Monclova'] },
  { state: 'Colima', cities: ['Colima', 'Manzanillo', 'Tecoman'] },
  { state: 'Durango', cities: ['Durango', 'Gomez Palacio', 'Lerdo'] },
  { state: 'Estado de Mexico', cities: ['Toluca', 'Naucalpan', 'Ecatepec', 'Nezahualcoyotl', 'Metepec'] },
  { state: 'Guanajuato', cities: ['Leon', 'Irapuato', 'Celaya', 'Guanajuato', 'Salamanca'] },
  { state: 'Guerrero', cities: ['Acapulco', 'Chilpancingo', 'Iguala'] },
  { state: 'Hidalgo', cities: ['Pachuca', 'Tula de Allende', 'Tulancingo'] },
  { state: 'Jalisco', cities: ['Guadalajara', 'Zapopan', 'Puerto Vallarta', 'Tlaquepaque'] },
  { state: 'Michoacan', cities: ['Morelia', 'Uruapan', 'Zamora'] },
  { state: 'Morelos', cities: ['Cuernavaca', 'Jiutepec', 'Cuautla'] },
  { state: 'Nayarit', cities: ['Tepic', 'Bahia de Banderas', 'Compostela'] },
  { state: 'Nuevo Leon', cities: ['Monterrey', 'San Pedro Garza Garcia', 'Guadalupe', 'Apodaca'] },
  { state: 'Oaxaca', cities: ['Oaxaca de Juarez', 'Salina Cruz', 'Juchitan'] },
  { state: 'Puebla', cities: ['Puebla', 'Tehuacan', 'Cholula'] },
  { state: 'Queretaro', cities: ['Queretaro', 'San Juan del Rio', 'El Marques'] },
  { state: 'Quintana Roo', cities: ['Cancun', 'Playa del Carmen', 'Cozumel', 'Tulum', 'Chetumal'] },
  { state: 'San Luis Potosi', cities: ['San Luis Potosi', 'Soledad de Graciano Sanchez', 'Ciudad Valles'] },
  { state: 'Sinaloa', cities: ['Culiacan', 'Mazatlan', 'Los Mochis'] },
  { state: 'Sonora', cities: ['Hermosillo', 'Ciudad Obregon', 'Nogales'] },
  { state: 'Tabasco', cities: ['Villahermosa', 'Comalcalco', 'Cardenas'] },
  { state: 'Tamaulipas', cities: ['Reynosa', 'Tampico', 'Matamoros', 'Nuevo Laredo'] },
  { state: 'Tlaxcala', cities: ['Tlaxcala', 'Apizaco', 'Huamantla'] },
  { state: 'Veracruz', cities: ['Veracruz', 'Xalapa', 'Coatzacoalcos', 'Boca del Rio'] },
  { state: 'Yucatan', cities: ['Merida', 'Valladolid', 'Progreso'] },
  { state: 'Zacatecas', cities: ['Zacatecas', 'Fresnillo', 'Guadalupe'] },
];

const STATE_ALIAS_MAP: Record<string, string> = {
  cdmx: 'Ciudad de Mexico',
  'ciudad de mexico': 'Ciudad de Mexico',
  'distrito federal': 'Ciudad de Mexico',
  df: 'Ciudad de Mexico',
  'd f': 'Ciudad de Mexico',
  edomex: 'Estado de Mexico',
  'edo mex': 'Estado de Mexico',
  'estado de mexico': 'Estado de Mexico',
};

const CITY_ALIAS_MAP: Record<string, string> = {
  cdmx: 'Ciudad de Mexico',
  'ciudad de mexico': 'Ciudad de Mexico',
  'mexico city': 'Ciudad de Mexico',
  'cd de mexico': 'Ciudad de Mexico',
  'distrito federal': 'Ciudad de Mexico',
  df: 'Ciudad de Mexico',
  'd f': 'Ciudad de Mexico',
};

const STATE_BY_KEY = new Map<string, string>();
const CITY_BY_KEY = new Map<string, string>();
const STATE_TO_CITIES = new Map<string, string[]>();
const CITY_TO_STATE = new Map<string, string>();

for (const entry of MEXICO_STATES_WITH_CITIES) {
  STATE_BY_KEY.set(normalizeLocationKey(entry.state), entry.state);
  STATE_TO_CITIES.set(entry.state, entry.cities);

  for (const city of entry.cities) {
    CITY_BY_KEY.set(normalizeLocationKey(city), city);
    CITY_TO_STATE.set(city, entry.state);
  }
}

function normalizeLocationText(value?: string | null): string | null {
  if (!value) return null;
  const cleaned = value.trim().replace(/\s+/g, ' ');
  return cleaned || null;
}

export function normalizeLocationKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeMexicoState(value?: string | null): string | null {
  const text = normalizeLocationText(value);
  if (!text) return null;

  const key = normalizeLocationKey(text);
  return STATE_ALIAS_MAP[key] || STATE_BY_KEY.get(key) || text;
}

export function normalizeMexicoCity(value?: string | null): string | null {
  const text = normalizeLocationText(value);
  if (!text) return null;

  const key = normalizeLocationKey(text);
  return CITY_ALIAS_MAP[key] || CITY_BY_KEY.get(key) || text;
}

export function inferMexicoStateFromCity(city?: string | null): string | null {
  const canonicalCity = normalizeMexicoCity(city);
  if (!canonicalCity) return null;
  return CITY_TO_STATE.get(canonicalCity) || null;
}

export function normalizeMexicoLocationSelection(state?: string | null, city?: string | null) {
  const canonicalCity = normalizeMexicoCity(city);
  const inferredState = inferMexicoStateFromCity(canonicalCity);
  const canonicalState = inferredState || normalizeMexicoState(state);

  return {
    state: canonicalState,
    city: canonicalCity,
  };
}

export function getMexicoStateOptions(currentState?: string | null): string[] {
  const canonicalState = normalizeMexicoState(currentState);
  const options = MEXICO_STATES_WITH_CITIES.map((entry) => entry.state);

  if (canonicalState && !options.includes(canonicalState)) {
    return [canonicalState, ...options];
  }

  return options;
}

export function getMexicoCitiesByState(state?: string | null, currentCity?: string | null): string[] {
  const canonicalState = normalizeMexicoState(state);
  const canonicalCity = normalizeMexicoCity(currentCity);
  const cities = canonicalState ? (STATE_TO_CITIES.get(canonicalState) || []) : [];

  if (canonicalCity && !cities.includes(canonicalCity)) {
    return [canonicalCity, ...cities];
  }

  return cities;
}
