import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:simulados_app/domain/models/exam_models.dart';
import 'package:simulados_app/ui/features/exam_form/ai_question_generator_dialog.dart';
import 'package:simulados_app/ui/features/exam_form/exam_form_models.dart';

void main() {
  testWidgets('AiQuestionGeneratorDialog renders and parses pasted questions',
      (tester) async {
    tester.view.physicalSize = const Size(1000, 1400);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    List<QuestionDraft>? imported;
    String? titleImported;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Builder(
            builder: (context) => ElevatedButton(
              onPressed: () {
                AiQuestionGeneratorDialog.show(
                  context: context,
                  initialTitle: 'Direito Penal',
                  existingQuestionsCount: 0,
                  isEditing: false,
                  onQuestionsImported: ({
                    required List<QuestionDraft> questions,
                    String? generatedTitle,
                    String? generatedCategory,
                    bool replaceExisting = false,
                  }) {
                    imported = questions;
                    titleImported = generatedTitle;
                  },
                );
              },
              child: const Text('Abrir Dialog'),
            ),
          ),
        ),
      ),
    );

    // Abre o diálogo
    await tester.tap(find.text('Abrir Dialog'));
    await tester.pumpAndSettle();

    expect(find.text('Gerar Simulado com IA'), findsOneWidget);

    // Rola o diálogo para baixo
    await tester.drag(find.byType(ListView), const Offset(0, -300));
    await tester.pumpAndSettle();

    final copyButtonFinder = find.text('Copiar Prompt para ChatGPT / Gemini');
    expect(copyButtonFinder, findsOneWidget);

    // Rola mais para baixo até o campo de resposta da IA
    await tester.drag(find.byType(ListView), const Offset(0, -300));
    await tester.pumpAndSettle();

    final textField = find.byType(TextField).last;
    await tester.enterText(
      textField,
      '''[
        {
          "statement": "Não há crime sem lei anterior que o defina.",
          "type": "TRUE_FALSE",
          "explanation": "Princípio da Legalidade ou Reserva Legal.",
          "options": [
            { "text": "Certo", "isCorrect": true },
            { "text": "Errado", "isCorrect": false }
          ]
        }
      ]''',
    );
    await tester.pumpAndSettle();

    // Clica em processar
    await tester.tap(find.text('Processar e Adicionar Questões'));
    await tester.pumpAndSettle();

    expect(imported, isNotNull);
    expect(imported!.length, 1);
    expect(imported![0].statementController.text,
        'Não há crime sem lei anterior que o defina.');
    expect(imported![0].type, QuestionType.trueFalse);
    expect(imported![0].options.length, 2);
    expect(titleImported, 'Direito Penal');
  });
}
