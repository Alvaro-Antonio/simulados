import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:sqflite/sqflite.dart';
import 'package:uuid/uuid.dart';
import 'database_service.dart';

class SeedService {
  final DatabaseService _dbService;
  final Uuid _uuid = const Uuid();

  SeedService({DatabaseService? dbService})
      : _dbService = dbService ?? DatabaseService.instance;

  /// Verifica se o banco já possui o simulado da OutSystems, caso contrário faz a importação
  Future<void> seedInitialDataIfNeeded() async {
    final db = await _dbService.database;

    // Checa se já existe algum simulado cadastrado
    final count = Sqflite.firstIntValue(
      await db.rawQuery('SELECT COUNT(*) FROM exams'),
    );

    if (count != null && count > 0) {
      // Já possui dados, não precisa rodar seed
      return;
    }

    try {
      final jsonString = await rootBundle.loadString('assets/data/outsystems_seed.json');
      final Map<String, dynamic> data = json.decode(jsonString) as Map<String, dynamic>;

      final title = data['title'] as String;
      final description = data['description'] as String?;
      final category = data['category'] as String?;
      final questionsList = data['questions'] as List<dynamic>;

      final now = DateTime.now().toIso8601String();
      final examId = _uuid.v4();

      await db.transaction((txn) async {
        // 1. Insere o simulado
        await txn.insert('exams', {
          'id': examId,
          'title': title,
          'description': description,
          'category': category,
          'created_at': now,
          'updated_at': now,
        });

        // 2. Insere as 150 questões e suas alternativas
        for (int qIdx = 0; qIdx < questionsList.length; qIdx++) {
          final q = questionsList[qIdx] as Map<String, dynamic>;
          final questionId = _uuid.v4();

          await txn.insert('questions', {
            'id': questionId,
            'exam_id': examId,
            'type': q['type'] as String,
            'statement': q['statement'] as String,
            'explanation': q['explanation'] as String?,
            'order_index': qIdx,
          });

          final optionsList = q['options'] as List<dynamic>;
          for (int oIdx = 0; oIdx < optionsList.length; oIdx++) {
            final opt = optionsList[oIdx] as Map<String, dynamic>;
            final optionId = _uuid.v4();

            await txn.insert('options', {
              'id': optionId,
              'question_id': questionId,
              'text': opt['text'] as String,
              'is_correct': (opt['isCorrect'] as bool) ? 1 : 0,
              'order_index': oIdx,
            });
          }
        }
      });
    } catch (e) {
      // Se falhar a leitura do asset (ex: ambiente de teste de unidade sem assets), apenas ignora
    }
  }
}
