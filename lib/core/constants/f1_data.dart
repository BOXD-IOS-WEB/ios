/// F1 Data Constants
/// Contains static data for circuits, drivers, and teams
library;

class Circuit {
  final String id;
  final String name;
  final String location;
  final String country;
  final String countryCode;

  const Circuit({
    required this.id,
    required this.name,
    required this.location,
    required this.country,
    required this.countryCode,
  });
}

class Driver {
  final String id;
  final String name;
  final String team;
  final int number;

  const Driver({
    required this.id,
    required this.name,
    required this.team,
    required this.number,
  });
}

class Team {
  final String id;
  final String name;
  final String color;

  const Team({
    required this.id,
    required this.name,
    required this.color,
  });
}

class F1Data {
  // 24 F1 Circuits for 2025 season
  static const List<Circuit> circuits = [
    Circuit(
      id: 'bahrain',
      name: 'Bahrain International Circuit',
      location: 'Sakhir',
      country: 'Bahrain',
      countryCode: 'bh',
    ),
    Circuit(
      id: 'jeddah',
      name: 'Jeddah Corniche Circuit',
      location: 'Jeddah',
      country: 'Saudi Arabia',
      countryCode: 'sa',
    ),
    Circuit(
      id: 'albert_park',
      name: 'Albert Park Circuit',
      location: 'Melbourne',
      country: 'Australia',
      countryCode: 'au',
    ),
    Circuit(
      id: 'suzuka',
      name: 'Suzuka International Racing Course',
      location: 'Suzuka',
      country: 'Japan',
      countryCode: 'jp',
    ),
    Circuit(
      id: 'shanghai',
      name: 'Shanghai International Circuit',
      location: 'Shanghai',
      country: 'China',
      countryCode: 'cn',
    ),
    Circuit(
      id: 'miami',
      name: 'Miami International Autodrome',
      location: 'Miami',
      country: 'United States',
      countryCode: 'us',
    ),
    Circuit(
      id: 'imola',
      name: 'Autodromo Enzo e Dino Ferrari',
      location: 'Imola',
      country: 'Italy',
      countryCode: 'it',
    ),
    Circuit(
      id: 'monaco',
      name: 'Circuit de Monaco',
      location: 'Monte Carlo',
      country: 'Monaco',
      countryCode: 'mc',
    ),
    Circuit(
      id: 'catalunya',
      name: 'Circuit de Barcelona-Catalunya',
      location: 'Barcelona',
      country: 'Spain',
      countryCode: 'es',
    ),
    Circuit(
      id: 'montreal',
      name: 'Circuit Gilles Villeneuve',
      location: 'Montreal',
      country: 'Canada',
      countryCode: 'ca',
    ),
    Circuit(
      id: 'red_bull_ring',
      name: 'Red Bull Ring',
      location: 'Spielberg',
      country: 'Austria',
      countryCode: 'at',
    ),
    Circuit(
      id: 'silverstone',
      name: 'Silverstone Circuit',
      location: 'Silverstone',
      country: 'United Kingdom',
      countryCode: 'gb',
    ),
    Circuit(
      id: 'hungaroring',
      name: 'Hungaroring',
      location: 'Budapest',
      country: 'Hungary',
      countryCode: 'hu',
    ),
    Circuit(
      id: 'spa',
      name: 'Circuit de Spa-Francorchamps',
      location: 'Spa',
      country: 'Belgium',
      countryCode: 'be',
    ),
    Circuit(
      id: 'zandvoort',
      name: 'Circuit Zandvoort',
      location: 'Zandvoort',
      country: 'Netherlands',
      countryCode: 'nl',
    ),
    Circuit(
      id: 'monza',
      name: 'Autodromo Nazionale di Monza',
      location: 'Monza',
      country: 'Italy',
      countryCode: 'it',
    ),
    Circuit(
      id: 'baku',
      name: 'Baku City Circuit',
      location: 'Baku',
      country: 'Azerbaijan',
      countryCode: 'az',
    ),
    Circuit(
      id: 'singapore',
      name: 'Marina Bay Street Circuit',
      location: 'Singapore',
      country: 'Singapore',
      countryCode: 'sg',
    ),
    Circuit(
      id: 'cota',
      name: 'Circuit of the Americas',
      location: 'Austin',
      country: 'United States',
      countryCode: 'us',
    ),
    Circuit(
      id: 'mexico',
      name: 'Autódromo Hermanos Rodríguez',
      location: 'Mexico City',
      country: 'Mexico',
      countryCode: 'mx',
    ),
    Circuit(
      id: 'interlagos',
      name: 'Autódromo José Carlos Pace',
      location: 'São Paulo',
      country: 'Brazil',
      countryCode: 'br',
    ),
    Circuit(
      id: 'las_vegas',
      name: 'Las Vegas Street Circuit',
      location: 'Las Vegas',
      country: 'United States',
      countryCode: 'us',
    ),
    Circuit(
      id: 'losail',
      name: 'Losail International Circuit',
      location: 'Lusail',
      country: 'Qatar',
      countryCode: 'qa',
    ),
    Circuit(
      id: 'yas_marina',
      name: 'Yas Marina Circuit',
      location: 'Abu Dhabi',
      country: 'United Arab Emirates',
      countryCode: 'ae',
    ),
  ];

  // 20 F1 Drivers for 2025 season
  static const List<Driver> drivers = [
    Driver(id: 'verstappen', name: 'Max Verstappen', team: 'Red Bull Racing', number: 1),
    Driver(id: 'perez', name: 'Sergio Pérez', team: 'Red Bull Racing', number: 11),
    Driver(id: 'leclerc', name: 'Charles Leclerc', team: 'Ferrari', number: 16),
    Driver(id: 'hamilton', name: 'Lewis Hamilton', team: 'Ferrari', number: 44),
    Driver(id: 'norris', name: 'Lando Norris', team: 'McLaren', number: 4),
    Driver(id: 'piastri', name: 'Oscar Piastri', team: 'McLaren', number: 81),
    Driver(id: 'russell', name: 'George Russell', team: 'Mercedes', number: 63),
    Driver(id: 'antonelli', name: 'Andrea Kimi Antonelli', team: 'Mercedes', number: 12),
    Driver(id: 'alonso', name: 'Fernando Alonso', team: 'Aston Martin', number: 14),
    Driver(id: 'stroll', name: 'Lance Stroll', team: 'Aston Martin', number: 18),
    Driver(id: 'gasly', name: 'Pierre Gasly', team: 'Alpine', number: 10),
    Driver(id: 'doohan', name: 'Jack Doohan', team: 'Alpine', number: 7),
    Driver(id: 'hulkenberg', name: 'Nico Hülkenberg', team: 'Sauber', number: 27),
    Driver(id: 'bortoleto', name: 'Gabriel Bortoleto', team: 'Sauber', number: 5),
    Driver(id: 'ocon', name: 'Esteban Ocon', team: 'Haas', number: 31),
    Driver(id: 'bearman', name: 'Oliver Bearman', team: 'Haas', number: 87),
    Driver(id: 'tsunoda', name: 'Yuki Tsunoda', team: 'RB', number: 22),
    Driver(id: 'hadjar', name: 'Isack Hadjar', team: 'RB', number: 6),
    Driver(id: 'albon', name: 'Alexander Albon', team: 'Williams', number: 23),
    Driver(id: 'sainz', name: 'Carlos Sainz', team: 'Williams', number: 55),
  ];

  // 10 F1 Teams
  static const List<Team> teams = [
    Team(id: 'red_bull', name: 'Red Bull Racing', color: '#0600EF'),
    Team(id: 'ferrari', name: 'Ferrari', color: '#DC0000'),
    Team(id: 'mclaren', name: 'McLaren', color: '#FF8700'),
    Team(id: 'mercedes', name: 'Mercedes', color: '#00D2BE'),
    Team(id: 'aston_martin', name: 'Aston Martin', color: '#006F62'),
    Team(id: 'alpine', name: 'Alpine', color: '#0090FF'),
    Team(id: 'sauber', name: 'Sauber', color: '#00E701'),
    Team(id: 'haas', name: 'Haas', color: '#FFFFFF'),
    Team(id: 'rb', name: 'RB', color: '#0600EF'),
    Team(id: 'williams', name: 'Williams', color: '#005AFF'),
  ];

  // Country code mapping for additional countries
  static const Map<String, String> countryCodeMap = {
    'bahrain': 'bh',
    'saudi arabia': 'sa',
    'australia': 'au',
    'japan': 'jp',
    'china': 'cn',
    'united states': 'us',
    'italy': 'it',
    'monaco': 'mc',
    'spain': 'es',
    'canada': 'ca',
    'austria': 'at',
    'united kingdom': 'gb',
    'hungary': 'hu',
    'belgium': 'be',
    'netherlands': 'nl',
    'azerbaijan': 'az',
    'singapore': 'sg',
    'mexico': 'mx',
    'brazil': 'br',
    'qatar': 'qa',
    'united arab emirates': 'ae',
  };
}
