import 'package:flutter_test/flutter_test.dart';
import 'package:simulados_app/ui/core/time_formatter.dart';

void main() {
  group('TimeFormatter Tests', () {
    test('formatDigital formats seconds to MM:SS and HH:MM:SS', () {
      expect(TimeFormatter.formatDigital(0), equals('00:00'));
      expect(TimeFormatter.formatDigital(59), equals('00:59'));
      expect(TimeFormatter.formatDigital(60), equals('01:00'));
      expect(TimeFormatter.formatDigital(125), equals('02:05'));
      expect(TimeFormatter.formatDigital(3600), equals('01:00:00'));
      expect(TimeFormatter.formatDigital(3665), equals('01:01:05'));
    });

    test('formatVerbose formats into friendly Portuguese text', () {
      expect(TimeFormatter.formatVerbose(0), equals('0s'));
      expect(TimeFormatter.formatVerbose(45), equals('45s'));
      expect(TimeFormatter.formatVerbose(60), equals('1min 0s'));
      expect(TimeFormatter.formatVerbose(125), equals('2min 5s'));
      expect(TimeFormatter.formatVerbose(3600), equals('1h 0min 0s'));
      expect(TimeFormatter.formatVerbose(3665), equals('1h 1min 5s'));
    });
  });
}
