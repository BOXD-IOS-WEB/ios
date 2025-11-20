import '../constants/f1_data.dart';

/// Service for accessing F1 static data
/// Provides methods to retrieve circuits, drivers, teams, and country codes
class F1DataService {
  /// Get all F1 circuits
  /// Returns a list of 24 F1 circuits with their details
  List<Circuit> getCircuits() {
    return F1Data.circuits;
  }

  /// Get all F1 drivers for a specific year
  /// Currently returns the 2025 season lineup
  /// [year] parameter is for future extensibility
  List<Driver> getDrivers([int? year]) {
    // For now, we only have 2025 data
    // In the future, this could be extended to support multiple years
    return F1Data.drivers;
  }

  /// Get all F1 teams for a specific year
  /// Currently returns the 2025 season teams
  /// [year] parameter is for future extensibility
  List<Team> getTeams([int? year]) {
    // For now, we only have 2025 data
    // In the future, this could be extended to support multiple years
    return F1Data.teams;
  }

  /// Get country code from country name
  /// Returns the two-letter country code (e.g., 'us' for United States)
  /// Returns null if country is not found
  String? getCountryCode(String countryName) {
    final normalizedName = countryName.toLowerCase().trim();
    return F1Data.countryCodeMap[normalizedName];
  }

  /// Get a circuit by ID
  Circuit? getCircuitById(String id) {
    try {
      return F1Data.circuits.firstWhere((circuit) => circuit.id == id);
    } catch (e) {
      return null;
    }
  }

  /// Get a driver by ID
  Driver? getDriverById(String id) {
    try {
      return F1Data.drivers.firstWhere((driver) => driver.id == id);
    } catch (e) {
      return null;
    }
  }

  /// Get a team by ID
  Team? getTeamById(String id) {
    try {
      return F1Data.teams.firstWhere((team) => team.id == id);
    } catch (e) {
      return null;
    }
  }

  /// Get drivers by team name
  List<Driver> getDriversByTeam(String teamName) {
    return F1Data.drivers
        .where((driver) => driver.team.toLowerCase() == teamName.toLowerCase())
        .toList();
  }

  /// Get circuits by country
  List<Circuit> getCircuitsByCountry(String country) {
    return F1Data.circuits
        .where((circuit) =>
            circuit.country.toLowerCase() == country.toLowerCase())
        .toList();
  }
}
