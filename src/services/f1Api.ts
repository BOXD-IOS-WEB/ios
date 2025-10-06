const F1_API_BASE = 'https://api.openf1.org/v1';

export interface F1Meeting {
  circuit_key: number;
  circuit_short_name: string;
  country_code: string;
  country_key: number;
  country_name: string;
  date_start: string;
  gmt_offset: string;
  location: string;
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  year: number;
}

export const getCurrentSeasonRaces = async (): Promise<F1Meeting[]> => {
  const year = new Date().getFullYear();
  console.log(`[F1 API] Fetching races for year ${year}...`);

  try {
    const url = `${F1_API_BASE}/meetings?year=${year}`;
    console.log(`[F1 API] Request URL: ${url}`);
    const response = await fetch(url);
    console.log(`[F1 API] Response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[F1 API] Received ${Array.isArray(data) ? data.length : 0} meetings`);

    if (Array.isArray(data) && data.length > 0) {
      const races = data.filter(m => !m.meeting_name.toLowerCase().includes('testing'));
      console.log(`[F1 API] Returning ${races.length} races`);
      return races;
    }
  } catch (error) {
    console.error('[F1 API] Error fetching races:', error);
    throw error;
  }

  return [];
};

export const getRacesBySeason = async (year: number): Promise<F1Meeting[]> => {
  console.log(`[F1 API] getRacesBySeason called for year ${year}`);

  try {
    const url = `${F1_API_BASE}/meetings?year=${year}`;
    console.log(`[F1 API] Fetching from: ${url}`);
    const response = await fetch(url);
    console.log(`[F1 API] Response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[F1 API] Received data:`, data);

    if (Array.isArray(data) && data.length > 0) {
      const races = data.filter(m => !m.meeting_name.toLowerCase().includes('testing'));
      console.log(`[F1 API] Returning ${races.length} races`);
      return races;
    }
  } catch (error) {
    console.error('[F1 API] Error for year', year, ':', error);
    throw error;
  }

  return [];
};

export const getRaceByYearAndRound = async (year: number, round: number): Promise<F1Meeting | null> => {
  console.log(`[F1 API] getRaceByYearAndRound: year=${year}, round=${round}`);
  const races = await getRacesBySeason(year);
  console.log(`[F1 API] Found ${races.length} races for year ${year}`);
  const race = races.find(r => r.meeting_key === round);
  console.log(`[F1 API] Race found?`, race ? 'YES' : 'NO', race);
  return race || null;
};

const countryCodeMap: { [key: string]: string } = {
  'AUS': 'au',
  'AUT': 'at',
  'AZE': 'az',
  'BEL': 'be',
  'BRN': 'bh',
  'BRA': 'br',
  'CAN': 'ca',
  'CHN': 'cn',
  'ESP': 'es',
  'FRA': 'fr',
  'GBR': 'gb',
  'DEU': 'de',
  'HUN': 'hu',
  'ITA': 'it',
  'JPN': 'jp',
  'KSA': 'sa',
  'MEX': 'mx',
  'MON': 'mc',
  'MCO': 'mc',
  'NED': 'nl',
  'NLD': 'nl',
  'PRT': 'pt',
  'QAT': 'qa',
  'RUS': 'ru',
  'SAU': 'sa',
  'SGP': 'sg',
  'TUR': 'tr',
  'ARE': 'ae',
  'USA': 'us',
};

export const getCountryFlag = (countryCode: string): string => {
  const alpha2Code = countryCodeMap[countryCode.toUpperCase()] || countryCode.toLowerCase();
  return `https://flagcdn.com/w320/${alpha2Code}.png`;
};

export const getPosterUrl = (circuitName: string): string | null => {
  return null;
};
