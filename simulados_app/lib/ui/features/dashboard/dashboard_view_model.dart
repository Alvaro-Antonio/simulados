import 'package:flutter/material.dart';
import '../../../data/repositories/exam_repository.dart';
import '../../../domain/models/exam_models.dart';

class DashboardViewModel extends ChangeNotifier {
  final ExamRepository repository;

  DashboardViewModel({required this.repository});

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  DashboardStats? _stats;
  DashboardStats? get stats => _stats;

  List<FolderModel> _folders = [];
  List<FolderModel> get folders => _folders;

  String? _selectedFolderId;
  String? get selectedFolderId => _selectedFolderId;

  List<ExamSummary> _exams = [];
  List<ExamSummary> get exams => _exams;

  List<ExamSummary> get pinnedExams => _exams.where((e) => e.isPinned).toList();
  List<ExamSummary> get regularExams => _exams.where((e) => !e.isPinned).toList();

  void selectFolder(String? folderId) {
    _selectedFolderId = folderId;
    loadDashboard();
  }

  Future<void> loadDashboard() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        repository.getDashboardStats(),
        repository.getExamSummaries(folderId: _selectedFolderId),
        repository.getFolders(),
      ]);

      _stats = results[0] as DashboardStats;
      _exams = results[1] as List<ExamSummary>;
      _folders = results[2] as List<FolderModel>;
    } catch (e) {
      _errorMessage = 'Falha ao carregar dados do painel: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createFolder(String name, {String? color, String? icon}) async {
    try {
      await repository.saveFolder(name: name, color: color, icon: icon);
      await loadDashboard();
      return true;
    } catch (e) {
      _errorMessage = 'Erro ao criar pasta: $e';
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteFolder(String folderId) async {
    try {
      await repository.deleteFolder(folderId);
      if (_selectedFolderId == folderId) {
        _selectedFolderId = null;
      }
      await loadDashboard();
      return true;
    } catch (e) {
      _errorMessage = 'Erro ao excluir pasta: $e';
      notifyListeners();
      return false;
    }
  }

  Future<void> togglePinExam(String examId) async {
    try {
      await repository.togglePinExam(examId);
      await loadDashboard();
    } catch (e) {
      _errorMessage = 'Erro ao fixar/desafixar simulado: $e';
      notifyListeners();
    }
  }

  Future<void> togglePinFolder(String folderId) async {
    try {
      await repository.togglePinFolder(folderId);
      await loadDashboard();
    } catch (e) {
      _errorMessage = 'Erro ao fixar/desafixar pasta: $e';
      notifyListeners();
    }
  }

  Future<bool> deleteExam(String id) async {
    try {
      await repository.deleteExam(id);
      await loadDashboard();
      return true;
    } catch (e) {
      _errorMessage = 'Erro ao excluir simulado: $e';
      notifyListeners();
      return false;
    }
  }
}
