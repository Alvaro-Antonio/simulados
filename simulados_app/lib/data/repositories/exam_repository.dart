import 'package:sqflite/sqflite.dart';
import 'package:uuid/uuid.dart';
import '../../domain/models/exam_models.dart';
import '../database/database_service.dart';

class ExamRepository {
  final DatabaseService _dbService;
  final Uuid _uuid = const Uuid();

  ExamRepository({DatabaseService? dbService})
      : _dbService = dbService ?? DatabaseService.instance;

  /// Retorna as estatísticas globais para o topo do Dashboard
  Future<DashboardStats> getDashboardStats() async {
    final db = await _dbService.database;

    final totalExams = Sqflite.firstIntValue(
          await db.rawQuery('SELECT COUNT(*) FROM exams'),
        ) ??
        0;

    final totalQuestions = Sqflite.firstIntValue(
          await db.rawQuery('SELECT COUNT(*) FROM questions'),
        ) ??
        0;

    final totalAttempts = Sqflite.firstIntValue(
          await db.rawQuery('SELECT COUNT(*) FROM exam_attempts'),
        ) ??
        0;

    int? globalAveragePercentage;
    if (totalAttempts > 0) {
      final attemptsRows = await db.rawQuery(
        'SELECT total_score, total_questions FROM exam_attempts',
      );
      double sumPct = 0;
      int validCount = 0;
      for (final row in attemptsRows) {
        final score = row['total_score'] as int;
        final total = row['total_questions'] as int;
        if (total > 0) {
          sumPct += (score / total) * 100;
          validCount++;
        }
      }
      if (validCount > 0) {
        globalAveragePercentage = (sumPct / validCount).round();
      }
    }

    int? latestAttemptPercentage;
    final latestAttemptRow = await db.rawQuery(
      'SELECT total_score, total_questions FROM exam_attempts ORDER BY started_at DESC LIMIT 1',
    );
    if (latestAttemptRow.isNotEmpty) {
      final score = latestAttemptRow.first['total_score'] as int;
      final total = latestAttemptRow.first['total_questions'] as int;
      if (total > 0) {
        latestAttemptPercentage = ((score / total) * 100).round();
      }
    }

    return DashboardStats(
      totalExams: totalExams,
      totalQuestions: totalQuestions,
      totalAttempts: totalAttempts,
      globalAveragePercentage: globalAveragePercentage,
      latestAttemptPercentage: latestAttemptPercentage,
    );
  }

  /// Retorna a lista de resumos de simulados com contagem e histórico de tentativas
  Future<List<ExamSummary>> getExamSummaries({String? folderId}) async {
    final db = await _dbService.database;

    final String query = '''
      SELECT e.*, f.name as folder_name
      FROM exams e
      LEFT JOIN folders f ON e.folder_id = f.id
      ${folderId != null ? 'WHERE e.folder_id = ?' : ''}
      ORDER BY e.is_pinned DESC, e.created_at DESC
    ''';

    final examsRows = await db.rawQuery(
      query,
      folderId != null ? [folderId] : [],
    );

    final List<ExamSummary> summaries = [];

    for (final examRow in examsRows) {
      final examId = examRow['id'] as String;

      // Contagem de questões
      final questionCount = Sqflite.firstIntValue(
            await db.rawQuery(
              'SELECT COUNT(*) FROM questions WHERE exam_id = ?',
              [examId],
            ),
          ) ??
          0;

      // Histórico de tentativas do exame
      final attemptsRows = await db.query(
        'exam_attempts',
        where: 'exam_id = ?',
        whereArgs: [examId],
        orderBy: 'started_at DESC',
      );

      final attemptsCount = attemptsRows.length;
      int? averagePercentage;
      ExamAttemptModel? latestAttempt;

      if (attemptsCount > 0) {
        double sumPct = 0;
        int validCount = 0;
        for (final row in attemptsRows) {
          final score = row['total_score'] as int;
          final total = row['total_questions'] as int;
          if (total > 0) {
            sumPct += (score / total) * 100;
            validCount++;
          }
        }
        if (validCount > 0) {
          averagePercentage = (sumPct / validCount).round();
        }
        latestAttempt = ExamAttemptModel.fromMap(attemptsRows.first);
      }

      summaries.add(
        ExamSummary(
          id: examId,
          title: examRow['title'] as String,
          description: examRow['description'] as String?,
          category: examRow['category'] as String?,
          folderId: examRow['folder_id'] as String?,
          folderName: examRow['folder_name'] as String?,
          isPinned: (examRow['is_pinned'] as int?) == 1,
          icon: examRow['icon'] as String?,
          imageUrl: examRow['image_url'] as String?,
          createdAt: DateTime.parse(examRow['created_at'] as String),
          updatedAt: DateTime.parse(examRow['updated_at'] as String),
          questionCount: questionCount,
          attemptsCount: attemptsCount,
          averagePercentage: averagePercentage,
          latestAttempt: latestAttempt,
        ),
      );
    }

    return summaries;
  }

  /// Obtém um simulado completo com questões e alternativas
  Future<ExamModel?> getExamById(String id) async {
    final db = await _dbService.database;

    final examRows = await db.query(
      'exams',
      where: 'id = ?',
      whereArgs: [id],
      limit: 1,
    );

    if (examRows.isEmpty) return null;

    final questionsRows = await db.query(
      'questions',
      where: 'exam_id = ?',
      whereArgs: [id],
      orderBy: 'order_index ASC',
    );

    final List<QuestionModel> questions = [];

    for (final qRow in questionsRows) {
      final questionId = qRow['id'] as String;

      final optionsRows = await db.query(
        'options',
        where: 'question_id = ?',
        whereArgs: [questionId],
        orderBy: 'order_index ASC',
      );

      final options = optionsRows.map(OptionModel.fromMap).toList();
      questions.add(QuestionModel.fromMap(qRow, options));
    }

    return ExamModel.fromMap(examRows.first, questions);
  }

  /// Salva ou atualiza um simulado e suas questões
  Future<String> saveExam({
    String? id,
    required String title,
    String? description,
    String? category,
    String? folderId,
    bool isPinned = false,
    String? icon,
    String? imageUrl,
    required List<QuestionModel> questions,
  }) async {
    final db = await _dbService.database;
    final now = DateTime.now().toIso8601String();
    final examId = id ?? _uuid.v4();

    await db.transaction((txn) async {
      final existing = await txn.query(
        'exams',
        where: 'id = ?',
        whereArgs: [examId],
      );

      if (existing.isEmpty) {
        await txn.insert('exams', {
          'id': examId,
          'title': title,
          'description': description,
          'category': category,
          'folder_id': folderId,
          'is_pinned': isPinned ? 1 : 0,
          'icon': icon,
          'image_url': imageUrl,
          'created_at': now,
          'updated_at': now,
        });
      } else {
        await txn.update(
          'exams',
          {
            'title': title,
            'description': description,
            'category': category,
            'folder_id': folderId,
            'is_pinned': isPinned ? 1 : 0,
            'icon': icon,
            'image_url': imageUrl,
            'updated_at': now,
          },
          where: 'id = ?',
          whereArgs: [examId],
        );
        // Remove questões antigas para recriar (o cascade do SQLite remove opções filhas)
        await txn.delete('questions', where: 'exam_id = ?', whereArgs: [examId]);
      }

      for (int qIdx = 0; qIdx < questions.length; qIdx++) {
        final q = questions[qIdx];
        final questionId = q.id.isNotEmpty ? q.id : _uuid.v4();

        await txn.insert('questions', {
          'id': questionId,
          'exam_id': examId,
          'type': q.type.toDbString(),
          'statement': q.statement,
          'explanation': q.explanation,
          'order_index': qIdx,
        });

        for (int oIdx = 0; oIdx < q.options.length; oIdx++) {
          final opt = q.options[oIdx];
          final optionId = opt.id.isNotEmpty ? opt.id : _uuid.v4();

          await txn.insert('options', {
            'id': optionId,
            'question_id': questionId,
            'text': opt.text,
            'is_correct': opt.isCorrect ? 1 : 0,
            'order_index': oIdx,
          });
        }
      }
    });

    return examId;
  }

  /// Exclui um simulado
  Future<void> deleteExam(String id) async {
    final db = await _dbService.database;
    await db.delete('exams', where: 'id = ?', whereArgs: [id]);
  }

  /// Submete as respostas de uma tentativa, calcula pontuação e persiste no SQLite
  Future<String> submitAttempt({
    required String examId,
    required Map<String, String> answers, // questionId -> selectedOptionId
    List<String>? questionIds,
    int? durationSeconds,
  }) async {
    final db = await _dbService.database;
    final exam = await getExamById(examId);

    if (exam == null || exam.questions.isEmpty) {
      throw Exception('Simulado não encontrado ou sem questões.');
    }

    List<QuestionModel> questionsToEvaluate = exam.questions;
    if (questionIds != null && questionIds.isNotEmpty) {
      final idSet = questionIds.toSet();
      questionsToEvaluate =
          exam.questions.where((q) => idSet.contains(q.id)).toList();
    }

    final finishedAt = DateTime.now();
    final startedAt = durationSeconds != null && durationSeconds >= 0
        ? finishedAt.subtract(Duration(seconds: durationSeconds))
        : finishedAt;

    final attemptId = _uuid.v4();
    int totalScore = 0;
    final totalQuestions = questionsToEvaluate.length;

    final List<Map<String, dynamic>> answersToInsert = [];

    for (final q in questionsToEvaluate) {
      final selectedOptionId = answers[q.id];
      bool isCorrect = false;

      if (selectedOptionId != null) {
        final option = q.options.firstWhere(
          (o) => o.id == selectedOptionId,
          orElse: () => OptionModel(
            id: '',
            questionId: '',
            text: '',
            isCorrect: false,
            orderIndex: 0,
          ),
        );
        if (option.isCorrect) {
          isCorrect = true;
          totalScore++;
        }
      }

      answersToInsert.add({
        'id': _uuid.v4(),
        'attempt_id': attemptId,
        'question_id': q.id,
        'selected_option_id': selectedOptionId,
        'is_correct': isCorrect ? 1 : 0,
      });
    }

    await db.transaction((txn) async {
      await txn.insert('exam_attempts', {
        'id': attemptId,
        'exam_id': examId,
        'started_at': startedAt.toIso8601String(),
        'finished_at': finishedAt.toIso8601String(),
        'total_score': totalScore,
        'total_questions': totalQuestions,
        'duration_seconds': durationSeconds,
      });

      for (final ans in answersToInsert) {
        await txn.insert('user_answers', ans);
      }
    });

    return attemptId;
  }

  /// Obtém o resultado consolidado para a tela de revisão
  Future<AttemptResultDetail?> getAttemptResult(String attemptId) async {
    final db = await _dbService.database;

    final attemptRows = await db.query(
      'exam_attempts',
      where: 'id = ?',
      whereArgs: [attemptId],
      limit: 1,
    );

    if (attemptRows.isEmpty) return null;
    final attempt = ExamAttemptModel.fromMap(attemptRows.first);

    final examRows = await db.query(
      'exams',
      columns: ['title'],
      where: 'id = ?',
      whereArgs: [attempt.examId],
      limit: 1,
    );
    final examTitle =
        examRows.isNotEmpty ? examRows.first['title'] as String : 'Simulado';

    final answersRows = await db.query(
      'user_answers',
      where: 'attempt_id = ?',
      whereArgs: [attemptId],
    );

    final List<AttemptResultQuestion> resultQuestions = [];

    for (final ansRow in answersRows) {
      final questionId = ansRow['question_id'] as String;
      final selectedOptionId = ansRow['selected_option_id'] as String?;
      final isCorrect = (ansRow['is_correct'] as int) == 1;

      final qRows = await db.query(
        'questions',
        where: 'id = ?',
        whereArgs: [questionId],
        limit: 1,
      );

      if (qRows.isNotEmpty) {
        final qRow = qRows.first;

        final optionsRows = await db.query(
          'options',
          where: 'question_id = ?',
          whereArgs: [questionId],
          orderBy: 'order_index ASC',
        );

        final options = optionsRows.map(OptionModel.fromMap).toList();

        resultQuestions.add(
          AttemptResultQuestion(
            id: questionId,
            statement: qRow['statement'] as String,
            type: QuestionType.fromDbString(qRow['type'] as String),
            explanation: qRow['explanation'] as String?,
            orderIndex: qRow['order_index'] as int,
            selectedOptionId: selectedOptionId,
            isCorrect: isCorrect,
            options: options,
          ),
        );
      }
    }

    // Ordena de acordo com a ordem original das questões
    resultQuestions.sort((a, b) => a.orderIndex.compareTo(b.orderIndex));

    return AttemptResultDetail(
      attemptId: attempt.id,
      examId: attempt.examId,
      examTitle: examTitle,
      totalScore: attempt.totalScore,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      finishedAt: attempt.finishedAt,
      durationSeconds: attempt.durationSeconds,
      questions: resultQuestions,
    );
  }

  /// Retorna todas as pastas com a contagem de simulados
  Future<List<FolderModel>> getFolders() async {
    final db = await _dbService.database;

    final foldersRows = await db.rawQuery('''
      SELECT f.*, COUNT(e.id) as exam_count
      FROM folders f
      LEFT JOIN exams e ON f.id = e.folder_id
      GROUP BY f.id
      ORDER BY f.is_pinned DESC, f.name ASC
    ''');

    return foldersRows.map((row) {
      final examCount = (row['exam_count'] as int?) ?? 0;
      return FolderModel.fromMap(row, examCount);
    }).toList();
  }

  /// Cria ou edita uma pasta
  Future<String> saveFolder({
    String? id,
    required String name,
    String? color,
    String? icon,
    bool isPinned = false,
  }) async {
    final db = await _dbService.database;
    final now = DateTime.now().toIso8601String();
    final folderId = id ?? _uuid.v4();

    final existing = await db.query(
      'folders',
      where: 'id = ?',
      whereArgs: [folderId],
    );

    if (existing.isEmpty) {
      await db.insert('folders', {
        'id': folderId,
        'name': name.trim(),
        'color': color,
        'icon': icon,
        'is_pinned': isPinned ? 1 : 0,
        'created_at': now,
        'updated_at': now,
      });
    } else {
      await db.update(
        'folders',
        {
          'name': name.trim(),
          'color': color,
          'icon': icon,
          'is_pinned': isPinned ? 1 : 0,
          'updated_at': now,
        },
        where: 'id = ?',
        whereArgs: [folderId],
      );
    }

    return folderId;
  }

  /// Exclui uma pasta (os simulados pertencentes passam a ter folder_id null)
  Future<void> deleteFolder(String folderId) async {
    final db = await _dbService.database;
    await db.transaction((txn) async {
      await txn.update(
        'exams',
        {'folder_id': null},
        where: 'folder_id = ?',
        whereArgs: [folderId],
      );
      await txn.delete(
        'folders',
        where: 'id = ?',
        whereArgs: [folderId],
      );
    });
  }

  /// Alterna o estado de fixação de um simulado no topo
  Future<bool> togglePinExam(String examId) async {
    final db = await _dbService.database;
    final rows = await db.query(
      'exams',
      columns: ['is_pinned'],
      where: 'id = ?',
      whereArgs: [examId],
    );
    if (rows.isEmpty) return false;

    final currentPinned = (rows.first['is_pinned'] as int?) == 1;
    final newPinned = !currentPinned;

    await db.update(
      'exams',
      {'is_pinned': newPinned ? 1 : 0},
      where: 'id = ?',
      whereArgs: [examId],
    );

    return newPinned;
  }

  /// Alterna o estado de fixação de uma pasta no topo
  Future<bool> togglePinFolder(String folderId) async {
    final db = await _dbService.database;
    final rows = await db.query(
      'folders',
      columns: ['is_pinned'],
      where: 'id = ?',
      whereArgs: [folderId],
    );
    if (rows.isEmpty) return false;

    final currentPinned = (rows.first['is_pinned'] as int?) == 1;
    final newPinned = !currentPinned;

    await db.update(
      'folders',
      {'is_pinned': newPinned ? 1 : 0},
      where: 'id = ?',
      whereArgs: [folderId],
    );

    return newPinned;
  }

  /// Move um simulado para dentro de uma pasta (ou retira dela se folderId for null)
  Future<void> moveExamToFolder(String examId, String? folderId) async {
    final db = await _dbService.database;
    await db.update(
      'exams',
      {'folder_id': folderId},
      where: 'id = ?',
      whereArgs: [examId],
    );
  }
}
