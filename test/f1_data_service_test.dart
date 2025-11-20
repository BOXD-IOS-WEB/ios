import 'package:flutter_test/flutter_test.dart';
import 'package:boxboxd/core/services/f1_data_service.dart';

void main() {
  late F1DataService service;

  setUp(() {
    service = F1DataService();
  });

  group('F1DataService', () {
    test('getCircuits returns 24 circuits', () {
      final circuits = service.getCircuits();
      expect(circuits.length, 24);
    });

    test('getDrivers returns 20 drivers', () {
      final drivers = service.getDrivers();
      expect(drivers.length, 20);
    });

    test('getTeams returns 10 teams', () {
      final teams = service.getTeams();
      expect(teams.length, 10);
    });

    test('getCountryCode returns correct code for valid country', () {
      expect(service.getCountryCode('United States'), 'us');
      expect(service.getCountryCode('united states'), 'us');
      expect(service.getCountryCode('Italy'), 'it');
      expect(service.getCountryCode('Japan'), 'jp');
    });

    test('getCountryCode returns null for invalid country', () {
      expect(service.getCountryCode('Invalid Country'), null);
    });

    test('getCircuitById returns correct circuit', () {
      final circuit = service.getCircuitById('monaco');
      expect(circuit, isNotNull);
      expect(circuit!.name, 'Circuit de Monaco');
      expect(circuit.country, 'Monaco');
    });

    test('getCircuitById returns null for invalid id', () {
      final circuit = service.getCircuitById('invalid');
      expect(circuit, null);
    });

    test('getDriverById returns correct driver', () {
      final driver = service.getDriverById('verstappen');
      expect(driver, isNotNull);
      expect(driver!.name, 'Max Verstappen');
      expect(driver.team, 'Red Bull Racing');
    });

    test('getTeamById returns correct team', () {
      final team = service.getTeamById('ferrari');
      expect(team, isNotNull);
      expect(team!.name, 'Ferrari');
    });

    test('getDriversByTeam returns correct drivers', () {
      final drivers = service.getDriversByTeam('Ferrari');
      expect(drivers.length, 2);
      expect(drivers.any((d) => d.name == 'Charles Leclerc'), true);
      expect(drivers.any((d) => d.name == 'Lewis Hamilton'), true);
    });

    test('getCircuitsByCountry returns correct circuits', () {
      final circuits = service.getCircuitsByCountry('United States');
      expect(circuits.length, 3); // Miami, COTA, Las Vegas
    });

    test('circuits have all required fields', () {
      final circuits = service.getCircuits();
      for (final circuit in circuits) {
        expect(circuit.id.isNotEmpty, true);
        expect(circuit.name.isNotEmpty, true);
        expect(circuit.location.isNotEmpty, true);
        expect(circuit.country.isNotEmpty, true);
        expect(circuit.countryCode.isNotEmpty, true);
      }
    });

    test('drivers have all required fields', () {
      final drivers = service.getDrivers();
      for (final driver in drivers) {
        expect(driver.id.isNotEmpty, true);
        expect(driver.name.isNotEmpty, true);
        expect(driver.team.isNotEmpty, true);
        expect(driver.number > 0, true);
      }
    });

    test('teams have all required fields', () {
      final teams = service.getTeams();
      for (final team in teams) {
        expect(team.id.isNotEmpty, true);
        expect(team.name.isNotEmpty, true);
        expect(team.color.isNotEmpty, true);
      }
    });
  });
}
