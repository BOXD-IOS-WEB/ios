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

  try {
    const response = await fetch(`${F1_API_BASE}/meetings?year=${year}`);
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (error) {
    console.error('OpenF1 API error:', error);
  }

  return [];
};

export const getRacesBySeason = async (year: number): Promise<F1Meeting[]> => {
  // Use Ergast for years before 2023
  if (year < 2023) {
    return getRacesFromErgast(year);
  }

  try {
    const response = await fetch(`${F1_API_BASE}/meetings?year=${year}`);
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (error) {
    console.error('OpenF1 API error for year', year, ', falling back to Ergast:', error);
  }

  // Fallback to Ergast for historical data
  return getRacesFromErgast(year);
};

const getRacesFromErgast = async (year: number): Promise<F1Meeting[]> => {
  // Static historical race data for 2020-2022
  const historicalRaces = getHistoricalRaces(year);
  if (historicalRaces.length > 0) {
    return historicalRaces;
  }
  return [];
};

const getHistoricalRaces = (year: number): F1Meeting[] => {
  const races2022 = [
    { meeting_name: 'Bahrain Grand Prix', circuit_short_name: 'Bahrain International Circuit', country_code: 'BRN', date_start: '2022-03-20', meeting_key: 1 },
    { meeting_name: 'Saudi Arabian Grand Prix', circuit_short_name: 'Jeddah Corniche Circuit', country_code: 'SAU', date_start: '2022-03-27', meeting_key: 2 },
    { meeting_name: 'Australian Grand Prix', circuit_short_name: 'Albert Park Circuit', country_code: 'AUS', date_start: '2022-04-10', meeting_key: 3 },
    { meeting_name: 'Emilia Romagna Grand Prix', circuit_short_name: 'Autodromo Enzo e Dino Ferrari', country_code: 'ITA', date_start: '2022-04-24', meeting_key: 4 },
    { meeting_name: 'Miami Grand Prix', circuit_short_name: 'Miami International Autodrome', country_code: 'USA', date_start: '2022-05-08', meeting_key: 5 },
    { meeting_name: 'Spanish Grand Prix', circuit_short_name: 'Circuit de Barcelona-Catalunya', country_code: 'ESP', date_start: '2022-05-22', meeting_key: 6 },
    { meeting_name: 'Monaco Grand Prix', circuit_short_name: 'Circuit de Monaco', country_code: 'MCO', date_start: '2022-05-29', meeting_key: 7 },
    { meeting_name: 'Azerbaijan Grand Prix', circuit_short_name: 'Baku City Circuit', country_code: 'AZE', date_start: '2022-06-12', meeting_key: 8 },
    { meeting_name: 'Canadian Grand Prix', circuit_short_name: 'Circuit Gilles Villeneuve', country_code: 'CAN', date_start: '2022-06-19', meeting_key: 9 },
    { meeting_name: 'British Grand Prix', circuit_short_name: 'Silverstone Circuit', country_code: 'GBR', date_start: '2022-07-03', meeting_key: 10 },
    { meeting_name: 'Austrian Grand Prix', circuit_short_name: 'Red Bull Ring', country_code: 'AUT', date_start: '2022-07-10', meeting_key: 11 },
    { meeting_name: 'French Grand Prix', circuit_short_name: 'Circuit Paul Ricard', country_code: 'FRA', date_start: '2022-07-24', meeting_key: 12 },
    { meeting_name: 'Hungarian Grand Prix', circuit_short_name: 'Hungaroring', country_code: 'HUN', date_start: '2022-07-31', meeting_key: 13 },
    { meeting_name: 'Belgian Grand Prix', circuit_short_name: 'Circuit de Spa-Francorchamps', country_code: 'BEL', date_start: '2022-08-28', meeting_key: 14 },
    { meeting_name: 'Dutch Grand Prix', circuit_short_name: 'Circuit Zandvoort', country_code: 'NLD', date_start: '2022-09-04', meeting_key: 15 },
    { meeting_name: 'Italian Grand Prix', circuit_short_name: 'Autodromo Nazionale di Monza', country_code: 'ITA', date_start: '2022-09-11', meeting_key: 16 },
    { meeting_name: 'Singapore Grand Prix', circuit_short_name: 'Marina Bay Street Circuit', country_code: 'SGP', date_start: '2022-10-02', meeting_key: 17 },
    { meeting_name: 'Japanese Grand Prix', circuit_short_name: 'Suzuka Circuit', country_code: 'JPN', date_start: '2022-10-09', meeting_key: 18 },
    { meeting_name: 'United States Grand Prix', circuit_short_name: 'Circuit of the Americas', country_code: 'USA', date_start: '2022-10-23', meeting_key: 19 },
    { meeting_name: 'Mexican Grand Prix', circuit_short_name: 'Autódromo Hermanos Rodríguez', country_code: 'MEX', date_start: '2022-10-30', meeting_key: 20 },
    { meeting_name: 'Brazilian Grand Prix', circuit_short_name: 'Autódromo José Carlos Pace', country_code: 'BRA', date_start: '2022-11-13', meeting_key: 21 },
    { meeting_name: 'Abu Dhabi Grand Prix', circuit_short_name: 'Yas Marina Circuit', country_code: 'ARE', date_start: '2022-11-20', meeting_key: 22 },
  ];

  const races2021 = [
    { meeting_name: 'Bahrain Grand Prix', circuit_short_name: 'Bahrain International Circuit', country_code: 'BRN', date_start: '2021-03-28', meeting_key: 1 },
    { meeting_name: 'Emilia Romagna Grand Prix', circuit_short_name: 'Autodromo Enzo e Dino Ferrari', country_code: 'ITA', date_start: '2021-04-18', meeting_key: 2 },
    { meeting_name: 'Portuguese Grand Prix', circuit_short_name: 'Algarve International Circuit', country_code: 'PRT', date_start: '2021-05-02', meeting_key: 3 },
    { meeting_name: 'Spanish Grand Prix', circuit_short_name: 'Circuit de Barcelona-Catalunya', country_code: 'ESP', date_start: '2021-05-09', meeting_key: 4 },
    { meeting_name: 'Monaco Grand Prix', circuit_short_name: 'Circuit de Monaco', country_code: 'MCO', date_start: '2021-05-23', meeting_key: 5 },
    { meeting_name: 'Azerbaijan Grand Prix', circuit_short_name: 'Baku City Circuit', country_code: 'AZE', date_start: '2021-06-06', meeting_key: 6 },
    { meeting_name: 'French Grand Prix', circuit_short_name: 'Circuit Paul Ricard', country_code: 'FRA', date_start: '2021-06-20', meeting_key: 7 },
    { meeting_name: 'Styrian Grand Prix', circuit_short_name: 'Red Bull Ring', country_code: 'AUT', date_start: '2021-06-27', meeting_key: 8 },
    { meeting_name: 'Austrian Grand Prix', circuit_short_name: 'Red Bull Ring', country_code: 'AUT', date_start: '2021-07-04', meeting_key: 9 },
    { meeting_name: 'British Grand Prix', circuit_short_name: 'Silverstone Circuit', country_code: 'GBR', date_start: '2021-07-18', meeting_key: 10 },
    { meeting_name: 'Hungarian Grand Prix', circuit_short_name: 'Hungaroring', country_code: 'HUN', date_start: '2021-08-01', meeting_key: 11 },
    { meeting_name: 'Belgian Grand Prix', circuit_short_name: 'Circuit de Spa-Francorchamps', country_code: 'BEL', date_start: '2021-08-29', meeting_key: 12 },
    { meeting_name: 'Dutch Grand Prix', circuit_short_name: 'Circuit Zandvoort', country_code: 'NLD', date_start: '2021-09-05', meeting_key: 13 },
    { meeting_name: 'Italian Grand Prix', circuit_short_name: 'Autodromo Nazionale di Monza', country_code: 'ITA', date_start: '2021-09-12', meeting_key: 14 },
    { meeting_name: 'Russian Grand Prix', circuit_short_name: 'Sochi Autodrom', country_code: 'RUS', date_start: '2021-09-26', meeting_key: 15 },
    { meeting_name: 'Turkish Grand Prix', circuit_short_name: 'Istanbul Park', country_code: 'TUR', date_start: '2021-10-10', meeting_key: 16 },
    { meeting_name: 'United States Grand Prix', circuit_short_name: 'Circuit of the Americas', country_code: 'USA', date_start: '2021-10-24', meeting_key: 17 },
    { meeting_name: 'Mexican Grand Prix', circuit_short_name: 'Autódromo Hermanos Rodríguez', country_code: 'MEX', date_start: '2021-11-07', meeting_key: 18 },
    { meeting_name: 'São Paulo Grand Prix', circuit_short_name: 'Autódromo José Carlos Pace', country_code: 'BRA', date_start: '2021-11-14', meeting_key: 19 },
    { meeting_name: 'Qatar Grand Prix', circuit_short_name: 'Losail International Circuit', country_code: 'QAT', date_start: '2021-11-21', meeting_key: 20 },
    { meeting_name: 'Saudi Arabian Grand Prix', circuit_short_name: 'Jeddah Corniche Circuit', country_code: 'SAU', date_start: '2021-12-05', meeting_key: 21 },
    { meeting_name: 'Abu Dhabi Grand Prix', circuit_short_name: 'Yas Marina Circuit', country_code: 'ARE', date_start: '2021-12-12', meeting_key: 22 },
  ];

  const races2020 = [
    { meeting_name: 'Austrian Grand Prix', circuit_short_name: 'Red Bull Ring', country_code: 'AUT', date_start: '2020-07-05', meeting_key: 1 },
    { meeting_name: 'Styrian Grand Prix', circuit_short_name: 'Red Bull Ring', country_code: 'AUT', date_start: '2020-07-12', meeting_key: 2 },
    { meeting_name: 'Hungarian Grand Prix', circuit_short_name: 'Hungaroring', country_code: 'HUN', date_start: '2020-07-19', meeting_key: 3 },
    { meeting_name: 'British Grand Prix', circuit_short_name: 'Silverstone Circuit', country_code: 'GBR', date_start: '2020-08-02', meeting_key: 4 },
    { meeting_name: '70th Anniversary Grand Prix', circuit_short_name: 'Silverstone Circuit', country_code: 'GBR', date_start: '2020-08-09', meeting_key: 5 },
    { meeting_name: 'Spanish Grand Prix', circuit_short_name: 'Circuit de Barcelona-Catalunya', country_code: 'ESP', date_start: '2020-08-16', meeting_key: 6 },
    { meeting_name: 'Belgian Grand Prix', circuit_short_name: 'Circuit de Spa-Francorchamps', country_code: 'BEL', date_start: '2020-08-30', meeting_key: 7 },
    { meeting_name: 'Italian Grand Prix', circuit_short_name: 'Autodromo Nazionale di Monza', country_code: 'ITA', date_start: '2020-09-06', meeting_key: 8 },
    { meeting_name: 'Tuscan Grand Prix', circuit_short_name: 'Mugello Circuit', country_code: 'ITA', date_start: '2020-09-13', meeting_key: 9 },
    { meeting_name: 'Russian Grand Prix', circuit_short_name: 'Sochi Autodrom', country_code: 'RUS', date_start: '2020-09-27', meeting_key: 10 },
    { meeting_name: 'Eifel Grand Prix', circuit_short_name: 'Nürburgring', country_code: 'DEU', date_start: '2020-10-11', meeting_key: 11 },
    { meeting_name: 'Portuguese Grand Prix', circuit_short_name: 'Algarve International Circuit', country_code: 'PRT', date_start: '2020-10-25', meeting_key: 12 },
    { meeting_name: 'Emilia Romagna Grand Prix', circuit_short_name: 'Autodromo Enzo e Dino Ferrari', country_code: 'ITA', date_start: '2020-11-01', meeting_key: 13 },
    { meeting_name: 'Turkish Grand Prix', circuit_short_name: 'Istanbul Park', country_code: 'TUR', date_start: '2020-11-15', meeting_key: 14 },
    { meeting_name: 'Bahrain Grand Prix', circuit_short_name: 'Bahrain International Circuit', country_code: 'BRN', date_start: '2020-11-29', meeting_key: 15 },
    { meeting_name: 'Sakhir Grand Prix', circuit_short_name: 'Bahrain International Circuit', country_code: 'BRN', date_start: '2020-12-06', meeting_key: 16 },
    { meeting_name: 'Abu Dhabi Grand Prix', circuit_short_name: 'Yas Marina Circuit', country_code: 'ARE', date_start: '2020-12-13', meeting_key: 17 },
  ];

  const racesByYear: Record<number, typeof races2022> = {
    2022: races2022,
    2021: races2021,
    2020: races2020,
  };

  const races = racesByYear[year] || [];

  return races.map(race => ({
    ...race,
    circuit_key: race.meeting_key,
    country_key: race.meeting_key,
    country_name: '',
    gmt_offset: '+00:00',
    location: '',
    meeting_official_name: race.meeting_name,
    year: year,
  }));
};

const getCountryCodeFromName = (country: string): string => {
  const countryMap: { [key: string]: string } = {
    'Australia': 'AUS',
    'Austria': 'AUT',
    'Azerbaijan': 'AZE',
    'Bahrain': 'BRN',
    'Belgium': 'BEL',
    'Brazil': 'BRA',
    'Canada': 'CAN',
    'China': 'CHN',
    'France': 'FRA',
    'Germany': 'DEU',
    'Hungary': 'HUN',
    'Italy': 'ITA',
    'Japan': 'JPN',
    'Mexico': 'MEX',
    'Monaco': 'MCO',
    'Netherlands': 'NLD',
    'Portugal': 'PRT',
    'Qatar': 'QAT',
    'Russia': 'RUS',
    'Saudi Arabia': 'SAU',
    'Singapore': 'SGP',
    'Spain': 'ESP',
    'Turkey': 'TUR',
    'UAE': 'ARE',
    'UK': 'GBR',
    'USA': 'USA',
    'United States': 'USA',
  };
  return countryMap[country] || 'XXX';
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
