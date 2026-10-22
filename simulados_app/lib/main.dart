import 'package:flutter/material.dart';
import 'data/database/seed_service.dart';
import 'data/repositories/exam_repository.dart';
import 'ui/core/app_theme.dart';
import 'ui/features/dashboard/dashboard_view.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inicializa o banco de dados e roda o seed inicial se necessário
  final seedService = SeedService();
  await seedService.seedInitialDataIfNeeded();

  final examRepository = ExamRepository();

  runApp(SimuladosApp(repository: examRepository));
}

class SimuladosApp extends StatelessWidget {
  final ExamRepository repository;

  const SimuladosApp({super.key, required this.repository});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sistema de Simulados',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: DashboardView(repository: repository),
    );
  }
}
