import 'package:flutter/material.dart';
import '../../../domain/models/exam_models.dart';

class OptionDraft {
  final String id;
  final TextEditingController textController;
  bool isCorrect;

  OptionDraft({
    required this.id,
    required this.textController,
    required this.isCorrect,
  });

  void dispose() {
    textController.dispose();
  }
}

class QuestionDraft {
  final String id;
  final TextEditingController statementController;
  final TextEditingController explanationController;
  QuestionType type;
  List<OptionDraft> options;

  QuestionDraft({
    required this.id,
    required this.statementController,
    required this.explanationController,
    required this.type,
    required this.options,
  });

  void dispose() {
    statementController.dispose();
    explanationController.dispose();
    for (final opt in options) {
      opt.dispose();
    }
  }
}
