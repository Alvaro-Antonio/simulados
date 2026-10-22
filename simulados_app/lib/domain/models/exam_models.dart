/// Tipos de questão suportados
enum QuestionType {
  multipleChoice,
  trueFalse;

  String toDbString() {
    switch (this) {
      case QuestionType.multipleChoice:
        return 'MULTIPLE_CHOICE';
      case QuestionType.trueFalse:
        return 'TRUE_FALSE';
    }
  }

  static QuestionType fromDbString(String value) {
    if (value == 'TRUE_FALSE') {
      return QuestionType.trueFalse;
    }
    return QuestionType.multipleChoice;
  }
}

/// Alternativa de uma questão
class OptionModel {
  final String id;
  final String questionId;
  final String text;
  final bool isCorrect;
  final int orderIndex;

  const OptionModel({
    required this.id,
    required this.questionId,
    required this.text,
    required this.isCorrect,
    required this.orderIndex,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'question_id': questionId,
      'text': text,
      'is_correct': isCorrect ? 1 : 0,
      'order_index': orderIndex,
    };
  }

  factory OptionModel.fromMap(Map<String, dynamic> map) {
    return OptionModel(
      id: map['id'] as String,
      questionId: map['question_id'] as String,
      text: map['text'] as String,
      isCorrect: (map['is_correct'] as int) == 1,
      orderIndex: map['order_index'] as int,
    );
  }
}

/// Questão de um simulado
class QuestionModel {
  final String id;
  final String examId;
  final QuestionType type;
  final String statement;
  final String? explanation;
  final int orderIndex;
  final List<OptionModel> options;

  const QuestionModel({
    required this.id,
    required this.examId,
    required this.type,
    required this.statement,
    this.explanation,
    required this.orderIndex,
    this.options = const [],
  });

  QuestionModel copyWith({
    String? id,
    String? examId,
    QuestionType? type,
    String? statement,
    String? explanation,
    int? orderIndex,
    List<OptionModel>? options,
  }) {
    return QuestionModel(
      id: id ?? this.id,
      examId: examId ?? this.examId,
      type: type ?? this.type,
      statement: statement ?? this.statement,
      explanation: explanation ?? this.explanation,
      orderIndex: orderIndex ?? this.orderIndex,
      options: options ?? this.options,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'exam_id': examId,
      'type': type.toDbString(),
      'statement': statement,
      'explanation': explanation,
      'order_index': orderIndex,
    };
  }

  factory QuestionModel.fromMap(
    Map<String, dynamic> map, [
    List<OptionModel> options = const [],
  ]) {
    return QuestionModel(
      id: map['id'] as String,
      examId: map['exam_id'] as String,
      type: QuestionType.fromDbString(map['type'] as String),
      statement: map['statement'] as String,
      explanation: map['explanation'] as String?,
      orderIndex: map['order_index'] as int,
      options: options,
    );
  }
}

/// Pasta organizadora de simulados
class FolderModel {
  final String id;
  final String name;
  final String? color;
  final String? icon;
  final bool isPinned;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int examCount;

  const FolderModel({
    required this.id,
    required this.name,
    this.color,
    this.icon,
    this.isPinned = false,
    required this.createdAt,
    required this.updatedAt,
    this.examCount = 0,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'color': color,
      'icon': icon,
      'is_pinned': isPinned ? 1 : 0,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  factory FolderModel.fromMap(Map<String, dynamic> map, [int examCount = 0]) {
    return FolderModel(
      id: map['id'] as String,
      name: map['name'] as String,
      color: map['color'] as String?,
      icon: map['icon'] as String?,
      isPinned: (map['is_pinned'] as int?) == 1,
      createdAt: DateTime.parse(map['created_at'] as String),
      updatedAt: DateTime.parse(map['updated_at'] as String),
      examCount: examCount,
    );
  }
}

/// Simulado completo
class ExamModel {
  final String id;
  final String title;
  final String? description;
  final String? category;
  final String? folderId;
  final bool isPinned;
  final String? icon;
  final String? imageUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<QuestionModel> questions;

  const ExamModel({
    required this.id,
    required this.title,
    this.description,
    this.category,
    this.folderId,
    this.isPinned = false,
    this.icon,
    this.imageUrl,
    required this.createdAt,
    required this.updatedAt,
    this.questions = const [],
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'folder_id': folderId,
      'is_pinned': isPinned ? 1 : 0,
      'icon': icon,
      'image_url': imageUrl,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  factory ExamModel.fromMap(
    Map<String, dynamic> map, [
    List<QuestionModel> questions = const [],
  ]) {
    return ExamModel(
      id: map['id'] as String,
      title: map['title'] as String,
      description: map['description'] as String?,
      category: map['category'] as String?,
      folderId: map['folder_id'] as String?,
      isPinned: (map['is_pinned'] as int?) == 1,
      icon: map['icon'] as String?,
      imageUrl: map['image_url'] as String?,
      createdAt: DateTime.parse(map['created_at'] as String),
      updatedAt: DateTime.parse(map['updated_at'] as String),
      questions: questions,
    );
  }
}

/// Registro de tentativa de um simulado
class ExamAttemptModel {
  final String id;
  final String examId;
  final DateTime startedAt;
  final DateTime? finishedAt;
  final int totalScore;
  final int totalQuestions;
  final int? durationSeconds;

  const ExamAttemptModel({
    required this.id,
    required this.examId,
    required this.startedAt,
    this.finishedAt,
    required this.totalScore,
    required this.totalQuestions,
    this.durationSeconds,
  });

  int get percentage =>
      totalQuestions > 0 ? ((totalScore / totalQuestions) * 100).round() : 0;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'exam_id': examId,
      'started_at': startedAt.toIso8601String(),
      'finished_at': finishedAt?.toIso8601String(),
      'total_score': totalScore,
      'total_questions': totalQuestions,
      'duration_seconds': durationSeconds,
    };
  }

  factory ExamAttemptModel.fromMap(Map<String, dynamic> map) {
    return ExamAttemptModel(
      id: map['id'] as String,
      examId: map['exam_id'] as String,
      startedAt: DateTime.parse(map['started_at'] as String),
      finishedAt: map['finished_at'] != null
          ? DateTime.parse(map['finished_at'] as String)
          : null,
      totalScore: map['total_score'] as int,
      totalQuestions: map['total_questions'] as int,
      durationSeconds: map['duration_seconds'] as int?,
    );
  }
}

/// Resposta dada a uma questão em uma tentativa
class UserAnswerModel {
  final String id;
  final String attemptId;
  final String questionId;
  final String? selectedOptionId;
  final bool isCorrect;

  const UserAnswerModel({
    required this.id,
    required this.attemptId,
    required this.questionId,
    this.selectedOptionId,
    required this.isCorrect,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'attempt_id': attemptId,
      'question_id': questionId,
      'selected_option_id': selectedOptionId,
      'is_correct': isCorrect ? 1 : 0,
    };
  }

  factory UserAnswerModel.fromMap(Map<String, dynamic> map) {
    return UserAnswerModel(
      id: map['id'] as String,
      attemptId: map['attempt_id'] as String,
      questionId: map['question_id'] as String,
      selectedOptionId: map['selected_option_id'] as String?,
      isCorrect: (map['is_correct'] as int) == 1,
    );
  }
}

/// Resumo de Simulado para o Dashboard
class ExamSummary {
  final String id;
  final String title;
  final String? description;
  final String? category;
  final String? folderId;
  final String? folderName;
  final bool isPinned;
  final String? icon;
  final String? imageUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int questionCount;
  final int attemptsCount;
  final int? averagePercentage;
  final ExamAttemptModel? latestAttempt;

  const ExamSummary({
    required this.id,
    required this.title,
    this.description,
    this.category,
    this.folderId,
    this.folderName,
    this.isPinned = false,
    this.icon,
    this.imageUrl,
    required this.createdAt,
    required this.updatedAt,
    required this.questionCount,
    required this.attemptsCount,
    this.averagePercentage,
    this.latestAttempt,
  });
}

/// Estatísticas Globais do Dashboard
class DashboardStats {
  final int totalExams;
  final int totalQuestions;
  final int totalAttempts;
  final int? globalAveragePercentage;
  final int? latestAttemptPercentage;

  const DashboardStats({
    required this.totalExams,
    required this.totalQuestions,
    required this.totalAttempts,
    this.globalAveragePercentage,
    this.latestAttemptPercentage,
  });
}

/// Detalhe completo da revisão de uma tentativa
class AttemptResultQuestion {
  final String id;
  final String statement;
  final QuestionType type;
  final String? explanation;
  final int orderIndex;
  final String? selectedOptionId;
  final bool isCorrect;
  final List<OptionModel> options;

  const AttemptResultQuestion({
    required this.id,
    required this.statement,
    required this.type,
    this.explanation,
    required this.orderIndex,
    this.selectedOptionId,
    required this.isCorrect,
    required this.options,
  });
}

class AttemptResultDetail {
  final String attemptId;
  final String examId;
  final String examTitle;
  final int totalScore;
  final int totalQuestions;
  final int percentage;
  final DateTime? finishedAt;
  final int? durationSeconds;
  final List<AttemptResultQuestion> questions;

  const AttemptResultDetail({
    required this.attemptId,
    required this.examId,
    required this.examTitle,
    required this.totalScore,
    required this.totalQuestions,
    required this.percentage,
    this.finishedAt,
    this.durationSeconds,
    required this.questions,
  });
}
