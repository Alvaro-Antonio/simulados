class TimeFormatter {
  /// Formata segundos no formato MM:SS ou HH:MM:SS
  static String formatDigital(int totalSeconds) {
    final hours = totalSeconds ~/ 3600;
    final minutes = (totalSeconds % 3600) ~/ 60;
    final seconds = totalSeconds % 60;

    String pad(int n) => n.toString().padLeft(2, '0');

    if (hours > 0) {
      return '${pad(hours)}:${pad(minutes)}:${pad(seconds)}';
    }
    return '${pad(minutes)}:${pad(seconds)}';
  }

  /// Formata segundos por extenso (ex: "14 min 32 s" ou "1 h 12 min 5 s")
  static String formatVerbose(int totalSeconds) {
    final hours = totalSeconds ~/ 3600;
    final minutes = (totalSeconds % 3600) ~/ 60;
    final seconds = totalSeconds % 60;

    if (hours > 0) {
      return '${hours}h ${minutes}min ${seconds}s';
    }
    if (minutes > 0) {
      return '${minutes}min ${seconds}s';
    }
    return '${seconds}s';
  }
}
