import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:simulados_app/data/database/database_service.dart';
import 'package:simulados_app/data/repositories/exam_repository.dart';
import 'package:simulados_app/domain/models/exam_models.dart';
import 'package:simulados_app/ui/features/dashboard/start_exam_dialog.dart';
import 'package:simulados_app/ui/features/player/exam_player_view_model.dart';

void main() {
  // Inicializa FFI para SQLite em memória nos testes
  sqfliteFfiInit();
  databaseFactory = databaseFactoryFfi;

  late Database db;
  late ExamRepository repository;

  setUp(() async {
    db = await databaseFactoryFfi.openDatabase(
      inMemoryDatabasePath,
      options: OpenDatabaseOptions(
        version: 1,
        onConfigure: (d) async => await d.execute('PRAGMA foreign_keys = ON'),
        onCreate: (d, v) async => await DatabaseService.createSchema(d),
      ),
    );

    DatabaseService.instance.setDatabaseForTesting(db);
    repository = ExamRepository(dbService: DatabaseService.instance);
  });

  tearDown(() async {
    await db.close();
  });

  group('ExamRepository SQLite Tests', () {
    test('saveExam inserts an exam with questions and options', () async {
      final question1 = QuestionModel(
        id: 'q1',
        examId: 'exam1',
        statement: 'Qual o papel de uma Client Action?',
        type: QuestionType.multipleChoice,
        orderIndex: 0,
        explanation: 'Client actions rodam no browser/dispositivo.',
        options: [
          OptionModel(
            id: 'opt1',
            questionId: 'q1',
            text: 'Executar lógica no navegador',
            isCorrect: true,
            orderIndex: 0,
          ),
          OptionModel(
            id: 'opt2',
            questionId: 'q1',
            text: 'Acessar diretamente o banco de dados',
            isCorrect: false,
            orderIndex: 1,
          ),
        ],
      );

      final question2 = QuestionModel(
        id: 'q2',
        examId: 'exam1',
        statement: 'Client Variables podem guardar senhas de forma segura?',
        type: QuestionType.trueFalse,
        orderIndex: 1,
        explanation: 'Client Variables ficam na memória do cliente e não são seguras para senhas.',
        options: [
          OptionModel(
            id: 'opt3',
            questionId: 'q2',
            text: 'Certo',
            isCorrect: false,
            orderIndex: 0,
          ),
          OptionModel(
            id: 'opt4',
            questionId: 'q2',
            text: 'Errado',
            isCorrect: true,
            orderIndex: 1,
          ),
        ],
      );

      final savedExamId = await repository.saveExam(
        id: 'exam1',
        title: 'Simulado OutSystems Teste',
        category: 'OutSystems',
        description: 'Simulado de teste para persistência SQLite',
        questions: [question1, question2],
      );

      expect(savedExamId, equals('exam1'));

      // Verificar listagem
      final summaries = await repository.getExamSummaries();
      expect(summaries.length, equals(1));
      expect(summaries.first.id, equals('exam1'));
      expect(summaries.first.title, equals('Simulado OutSystems Teste'));
      expect(summaries.first.questionCount, equals(2));
      expect(summaries.first.attemptsCount, equals(0));

      // Verificar busca completa
      final loadedExam = await repository.getExamById('exam1');
      expect(loadedExam, isNotNull);
      expect(loadedExam!.questions.length, equals(2));
      expect(loadedExam.questions[0].options.length, equals(2));
      expect(loadedExam.questions[0].options[0].isCorrect, isTrue);
    });

    test('ExamPlayerViewModel samples and shuffles questions from question bank', () async {
      // Criar 10 questões
      final questions = List.generate(
        10,
        (i) => QuestionModel(
          id: 'q_$i',
          examId: 'sample_exam',
          statement: 'Questão $i',
          type: QuestionType.multipleChoice,
          orderIndex: i,
          options: [
            OptionModel(
              id: 'opt_${i}_1',
              questionId: 'q_$i',
              text: 'Opção A',
              isCorrect: true,
              orderIndex: 0,
            ),
          ],
        ),
      );

      await repository.saveExam(
        id: 'sample_exam',
        title: 'Banco com 10 questões',
        questions: questions,
      );

      // Inicia ViewModel com amostragem de 4 questões
      final vm = ExamPlayerViewModel(
        examId: 'sample_exam',
        repository: repository,
        config: const ExamSessionConfig(
          questionCount: 4,
          shuffle: true,
        ),
      );

      await vm.init();

      expect(vm.totalQuestions, equals(4));
      expect(vm.sessionQuestions.length, equals(4));
      vm.dispose();
    });

    test('submitAttempt records attempt, answers, duration, and updates stats', () async {
      final question = QuestionModel(
        id: 'q_stat',
        examId: 'stat_exam',
        statement: 'Questão 1',
        type: QuestionType.multipleChoice,
        orderIndex: 0,
        options: [
          OptionModel(
            id: 'opt_correct',
            questionId: 'q_stat',
            text: 'Correta',
            isCorrect: true,
            orderIndex: 0,
          ),
          OptionModel(
            id: 'opt_wrong',
            questionId: 'q_stat',
            text: 'Incorreta',
            isCorrect: false,
            orderIndex: 1,
          ),
        ],
      );

      await repository.saveExam(
        id: 'stat_exam',
        title: 'Simulado Stats',
        questions: [question],
      );

      // Submeter tentativa com acerto e tempo gasto
      final attemptId = await repository.submitAttempt(
        examId: 'stat_exam',
        durationSeconds: 42,
        answers: {
          'q_stat': 'opt_correct',
        },
      );

      expect(attemptId, isNotEmpty);

      // Verificar detalhes da tentativa
      final resultDetail = await repository.getAttemptResult(attemptId);
      expect(resultDetail, isNotNull);
      expect(resultDetail!.totalScore, equals(1));
      expect(resultDetail.durationSeconds, equals(42));
      expect(resultDetail.questions.length, equals(1));
      expect(resultDetail.questions.first.isCorrect, isTrue);

      // Verificar Dashboard Stats
      final stats = await repository.getDashboardStats();
      expect(stats.totalAttempts, equals(1));
      expect(stats.globalAveragePercentage, equals(100));
      expect(stats.latestAttemptPercentage, equals(100));
    });
  });
}
