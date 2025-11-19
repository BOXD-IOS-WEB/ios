import 'package:dio/dio.dart';
import 'package:boxboxd/core/models/race.dart';

class F1ApiService {
  static const String _openF1Base = 'https://api.openf1.org/v1';
  static const String _jolpicaBase = 'https://api.jolpi.ca/ergast/f1';
  
  final Dio _dio;

  F1ApiService({Dio? dio}) : _dio = dio ?? Dio() {
    if (dio == null) {
      _dio.interceptors.add(LogInterceptor(responseBody: true));
    }
  }

  Future<List<Race>> getCurrentSeasonRaces() async {
    final year = DateTime.now().year;
    return getRacesBySeason(year);
  }

  Future<List<Race>> getRacesBySeason(int year) async {
    try {
      // Try OpenF1 first
      final url = '$_openF1Base/meetings?year=$year';
      final response = await _dio.get(url);

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        if (data.isNotEmpty) {
          final races = data
              .where((m) => !m['meeting_name'].toString().toLowerCase().contains('testing'))
              .toList();
          
          // Sort by date
          races.sort((a, b) => DateTime.parse(a['date_start']).compareTo(DateTime.parse(b['date_start'])));

          return races.asMap().entries.map((entry) {
            final index = entry.key;
            final race = entry.value;
            return Race(
              season: race['year'],
              round: index + 1,
              gpName: race['meeting_name'],
              circuit: race['circuit_short_name'],
              date: DateTime.parse(race['date_start']),
              country: getCountryCodeFromName(race['country_name']),
              // location: race['location'],
            );
          }).toList();
        }
      }
    } catch (e) {
      print('OpenF1 failed: $e');
    }

    // Fallback to Jolpica
    try {
      final url = '$_jolpicaBase/$year.json';
      final response = await _dio.get(url);

      if (response.statusCode == 200) {
        final data = response.data;
        final List<dynamic> races = data['MRData']['RaceTable']['Races'];
        
        return races.map((race) {
          return Race(
            season: int.parse(race['season']),
            round: int.parse(race['round']),
            gpName: race['raceName'],
            circuit: race['Circuit']['circuitName'],
            date: DateTime.parse('${race['date']}T${race['time'] ?? "00:00:00Z"}'),
            country: getCountryCodeFromName(race['Circuit']['Location']['country']),
          );
        }).toList();
      }
    } catch (e) {
      print('Jolpica failed: $e');
    }

    return [];
  }

  String getCountryCodeFromName(String country) {
    const countryMap = {
      'Australia': 'AU',
      'Austria': 'AT',
      'Azerbaijan': 'AZ',
      'Bahrain': 'BH',
      'Belgium': 'BE',
      'Brazil': 'BR',
      'Canada': 'CA',
      'China': 'CN',
      'France': 'FR',
      'Germany': 'DE',
      'Hungary': 'HU',
      'Italy': 'IT',
      'Japan': 'JP',
      'Mexico': 'MX',
      'Monaco': 'MC',
      'Netherlands': 'NL',
      'Portugal': 'PT',
      'Qatar': 'QA',
      'Russia': 'RU',
      'Saudi Arabia': 'SA',
      'Singapore': 'SG',
      'Spain': 'ES',
      'Turkey': 'TR',
      'UAE': 'AE',
      'United Arab Emirates': 'AE',
      'UK': 'GB',
      'United Kingdom': 'GB',
      'USA': 'US',
      'United States': 'US',
    };
    return countryMap[country] ?? 'XX';
  }
}
