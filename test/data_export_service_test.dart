import 'package:flutter_test/flutter_test.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'dart:convert';

// Helper function to sanitize data (extracted from DataExportService for testing)
Map<String, dynamic> sanitizeData(Map<String, dynamic> data) {
  final sanitized = <String, dynamic>{};
  
  data.forEach((key, value) {
    if (value is Timestamp) {
      sanitized[key] = value.toDate().toIso8601String();
    } else if (value is Map) {
      sanitized[key] = sanitizeData(Map<String, dynamic>.from(value));
    } else if (value is List) {
      sanitized[key] = value.map((item) {
        if (item is Map) {
          return sanitizeData(Map<String, dynamic>.from(item));
        } else if (item is Timestamp) {
          return item.toDate().toIso8601String();
        }
        return item;
      }).toList();
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
}

String exportToJsonString(Map<String, dynamic> data) {
  const encoder = JsonEncoder.withIndent('  ');
  return encoder.convert(data);
}

void main() {
  group('DataExportService', () {
    test('exportToJsonString formats JSON with indentation', () {
      final data = {
        'key1': 'value1',
        'key2': {
          'nested': 'value2',
        },
      };

      final jsonString = exportToJsonString(data);
      
      // Check for indentation (2 spaces)
      expect(jsonString, contains('  "key1"'));
      expect(jsonString, contains('  "key2"'));
      expect(jsonString, contains('    "nested"'));
    });

    test('sanitizeData converts Timestamps to ISO strings', () {
      final now = DateTime.now();
      final timestamp = Timestamp.fromDate(now);
      
      final data = {
        'createdAt': timestamp,
        'name': 'Test',
        'count': 42,
      };

      final sanitized = sanitizeData(data);
      
      expect(sanitized['createdAt'], equals(now.toIso8601String()));
      expect(sanitized['name'], equals('Test'));
      expect(sanitized['count'], equals(42));
    });

    test('sanitizeData handles nested maps', () {
      final now = DateTime.now();
      final timestamp = Timestamp.fromDate(now);
      
      final data = {
        'user': {
          'createdAt': timestamp,
          'profile': {
            'updatedAt': timestamp,
          },
        },
      };

      final sanitized = sanitizeData(data);
      final user = sanitized['user'] as Map<String, dynamic>;
      final profile = user['profile'] as Map<String, dynamic>;
      
      expect(user['createdAt'], equals(now.toIso8601String()));
      expect(profile['updatedAt'], equals(now.toIso8601String()));
    });

    test('sanitizeData handles lists with Timestamps', () {
      final now = DateTime.now();
      final timestamp = Timestamp.fromDate(now);
      
      final data = {
        'items': [
          {'date': timestamp},
          {'date': timestamp},
        ],
      };

      final sanitized = sanitizeData(data);
      final items = sanitized['items'] as List;
      
      expect((items[0] as Map)['date'], equals(now.toIso8601String()));
      expect((items[1] as Map)['date'], equals(now.toIso8601String()));
    });

    test('sanitizeData handles mixed data types', () {
      final now = DateTime.now();
      final timestamp = Timestamp.fromDate(now);
      
      final data = {
        'string': 'test',
        'number': 123,
        'boolean': true,
        'null': null,
        'timestamp': timestamp,
        'list': [1, 2, 3],
        'map': {'key': 'value'},
      };

      final sanitized = sanitizeData(data);
      
      expect(sanitized['string'], equals('test'));
      expect(sanitized['number'], equals(123));
      expect(sanitized['boolean'], equals(true));
      expect(sanitized['null'], isNull);
      expect(sanitized['timestamp'], equals(now.toIso8601String()));
      expect(sanitized['list'], equals([1, 2, 3]));
      expect(sanitized['map'], equals({'key': 'value'}));
    });
  });
}
