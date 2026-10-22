import 'dart:async';
import 'package:flutter/material.dart';
import '../../../data/repositories/exam_repository.dart';
import '../../../domain/models/exam_models.dart';
import '../dashboard/start_exam_dialog.dart';

class ExamPlayerViewModel extends ChangeNotifier {
  final String examId;
  final ExamRepository repository;
  final ExamSessionConfig config;

  ExamPlayerViewModel({
    required this.examId,
    required this.repository,
    required this.config,
  });

  bool _isLoading = true;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  ExamModel? _exam;
  ExamModel? get exam => _exam;

  List<QuestionModel> _sessionQuestions = [];
  List<QuestionModel> get sessionQuestions => _sessionQuestions;

  int _currentIndex = 0;
  int get currentIndex => _currentIndex;

  final Map<String, String> _answers = {}; // questionId -> optionId
  Map<String, String> get answers => _answers;

  // Cronômetro
  int _elapsedSeconds = 0;
  int get elapsedSeconds => _elapsedSeconds;

  bool _isPaused = false;
  bool get isPaused => _isPaused;

  Timer? _timer;

  int get totalQuestions => _sessionQuestions.length;
  int get answeredCount => _answers.length;
  int get progressPercent =>
      totalQuestions > 0 ? ((answeredCount / totalQuestions) * 100).round() : 0;

  QuestionModel? get currentQuestion =>
      _sessionQuestions.isNotEmpty && _currentIndex < _sessionQuestions.length
          ? _sessionQuestions[_currentIndex]
          : null;

  Future<void> init() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final exam = await repository.getExamById(examId);
      if (exam == null || exam.questions.isEmpty) {
        _errorMessage = 'Simulado não possui questões cadastradas.';
        return;
      }

      _exam = exam;
      List<QuestionModel> list = List.from(exam.questions);

      // Aplica shuffle se configurado
      if (config.shuffle) {
        list.shuffle();
      }

      // Aplica amostragem se solicitada
      if (config.questionCount < list.length) {
        list = list.take(config.questionCount).toList();
      }

      _sessionQuestions = list;
      _startTimer();
    } catch (e) {
      _errorMessage = 'Erro ao carregar simulado: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!_isPaused) {
        _elapsedSeconds++;
        notifyListeners();
      }
    });
  }

  void togglePause() {
    _isPaused = !_isPaused;
    notifyListeners();
  }

  void resume() {
    if (_isPaused) {
      _isPaused = false;
      notifyListeners();
    }
  }

  void selectOption(String questionId, String optionId) {
    _answers[questionId] = optionId;
    notifyListeners();
  }

  void clearAnswer(String questionId) {
    _answers.remove(questionId);
    notifyListeners();
  }

  void goToQuestion(int index) {
    if (index >= 0 && index < _sessionQuestions.length) {
      _currentIndex = index;
      notifyListeners();
    }
  }

  void nextQuestion() {
    if (_currentIndex < _sessionQuestions.length - 1) {
      _currentIndex++;
      notifyListeners();
    }
  }

  void previousQuestion() {
    if (_currentIndex > 0) {
      _currentIndex--;
      notifyListeners();
    }
  }

  Future<String> submitExam() async {
    _timer?.cancel();
    final questionIds = _sessionQuestions.map((q) => q.id).toList();

    return await repository.submitAttempt(
      examId: examId,
      answers: _answers,
      questionIds: questionIds,
      durationSeconds: _elapsedSeconds,
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
