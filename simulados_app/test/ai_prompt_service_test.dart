import 'package:flutter_test/flutter_test.dart';
import 'package:simulados_app/domain/models/exam_models.dart';
import 'package:simulados_app/ui/features/exam_form/ai_prompt_service.dart';

void main() {
  group('AiPromptService Tests', () {
    test('buildPrompt generates complete prompt with expected structure', () {
      final prompt = AiPromptService.buildPrompt(
        subject: 'Direito Constitucional',
        count: 5,
        style: AiQuestionStyle.multipleChoice4,
        extraFocus: 'Artigo 5º e Direitos Fundamentais',
      );

      expect(prompt, contains('Direito Constitucional'));
      expect(prompt, contains('5 questões'));
      expect(prompt, contains('Artigo 5º e Direitos Fundamentais'));
      expect(prompt, contains('MULTIPLE_CHOICE'));
      expect(prompt, contains('"statement"'));
      expect(prompt, contains('"explanation"'));
      expect(prompt, contains('"options"'));
    });

    test('buildPrompt includes append context when editing', () {
      final prompt = AiPromptService.buildPrompt(
        subject: 'OutSystems O11',
        count: 3,
        style: AiQuestionStyle.trueFalse,
        isAppending: true,
        currentQuestionsCount: 12,
      );

      expect(prompt, contains('adicionar mais 3 novas questões'));
      expect(prompt, contains('já possui 12 questões'));
      expect(prompt, contains('TRUE_FALSE'));
      expect(prompt, contains('Certo'));
      expect(prompt, contains('Errado'));
    });

    test('parseAiResponse parses clean raw JSON array', () {
      const raw = '''
      [
        {
          "statement": "Qual a capital do Brasil?",
          "type": "MULTIPLE_CHOICE",
          "explanation": "Brasília é a capital federal desde 1960.",
          "options": [
            { "text": "Brasília", "isCorrect": true },
            { "text": "São Paulo", "isCorrect": false },
            { "text": "Rio de Janeiro", "isCorrect": false },
            { "text": "Salvador", "isCorrect": false }
          ]
        }
      ]
      ''';

      final result = AiPromptService.parseAiResponse(raw);
      expect(result.questions.length, 1);
      expect(result.questions[0].statement, 'Qual a capital do Brasil?');
      expect(result.questions[0].type, QuestionType.multipleChoice);
      expect(result.questions[0].options.length, 4);
      expect(result.questions[0].options[0].text, 'Brasília');
      expect(result.questions[0].options[0].isCorrect, true);
    });

    test('parseAiResponse handles markdown codeblock with conversational fluff', () {
      const raw = '''
      Olá! Aqui estão as questões solicitadas sobre o concurso:

      ```json
      [
        {
          "statement": "A soberania popular é exercida pelo sufrágio universal.",
          "type": "TRUE_FALSE",
          "explanation": "Art. 14 da CF/88.",
          "options": [
            { "text": "Certo", "isCorrect": true },
            { "text": "Errado", "isCorrect": false }
          ]
        }
      ]
      ```

      Espero ter ajudado! Bons estudos.
      ''';

      final result = AiPromptService.parseAiResponse(raw);
      expect(result.questions.length, 1);
      expect(result.questions[0].statement,
          'A soberania popular é exercida pelo sufrágio universal.');
      expect(result.questions[0].type, QuestionType.trueFalse);
      expect(result.questions[0].options.length, 2);
      expect(result.questions[0].options[0].isCorrect, true);
    });

    test('parseAiResponse parses object with questions and metadata', () {
      const raw = '''
      {
        "title": "Simulado de TI",
        "category": "Redes",
        "questions": [
          {
            "statement": "O protocolo HTTPS opera por padrão na porta 443.",
            "type": "TRUE_FALSE",
            "options": [
              { "text": "Certo", "isCorrect": true },
              { "text": "Errado", "isCorrect": false }
            ]
          }
        ]
      }
      ''';

      final result = AiPromptService.parseAiResponse(raw);
      expect(result.title, 'Simulado de TI');
      expect(result.category, 'Redes');
      expect(result.questions.length, 1);
    });

    test('fixInvalidBackslashes fixes Gemini invalid escape sequences', () {
      const invalidJson = r'{"statement": "A fórmula é \alpha + \beta e \{x \in A\} no caminho C:\dados\teste.", "options": [{"text": "Regex \d+ e \s+", "isCorrect": true}]}';
      final fixed = AiPromptService.fixInvalidBackslashes(invalidJson);

      expect(fixed, contains(r'\\alpha'));
      expect(fixed, contains(r'\\{'));
      expect(fixed, contains(r'\\in'));
      expect(fixed, contains(r'\\d+'));
      expect(fixed, contains(r'\\s+'));
    });

    test('parseAiResponse successfully decodes Gemini response with invalid backslashes', () {
      // Este payload quebra o json.decode padrão com FormatException: Invalid escape character
      const geminiBrokenPayload = r'''
      [
        {
          "statement": "No conjunto \{1, 2, 3\}, a proposição \forall x é verdadeira e o regex é \d+\s*.",
          "type": "MULTIPLE_CHOICE",
          "explanation": "Explicação com barra avulsa \alpha e caminho C:\teste\novo.",
          "options": [
            { "text": "Alternativa com \(expressão\) e \d", "isCorrect": true },
            { "text": "Alternativa normal", "isCorrect": false }
          ]
        }
      ]
      ''';

      final result = AiPromptService.parseAiResponse(geminiBrokenPayload);
      expect(result.questions.length, 1);
      expect(result.questions[0].statement, contains(r'\{1, 2, 3\}'));
      expect(result.questions[0].explanation, contains('caminho C:'));
      expect(result.questions[0].options[0].isCorrect, true);
    });

    test('fixInvalidBackslashes strips backslashes before structural brackets from ChatGPT app copy', () {
      const chatGptCopied = r'\[ { "statement": "Teste", "options": \[ { "text": "Opção A", "isCorrect": true } \] } \]';
      final fixed = AiPromptService.fixInvalidBackslashes(chatGptCopied);
      expect(fixed.trim().startsWith('['), true);
      expect(fixed.trim().endsWith(']'), true);
      expect(fixed, contains('"options": ['));
    });

    test('parseAiResponse successfully parses ChatGPT app payload with escaped brackets', () {
      const userSnippet = r'''
      \[ { "statement": "De acordo com o art. 37, caput, da Constituição Federal de 1988, a administração pública direta e indireta de qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos Municípios deve obedecer aos princípios expressamente previstos no texto constitucional. Assinale a alternativa que apresenta corretamente esses princípios.", "type": "MULTIPLE_CHOICE", "explanation": "O art. 37, caput, da Constituição Federal estabelece expressamente os princípios da legalidade, impessoalidade, moralidade, publicidade e eficiência, conhecidos pelo acrônimo LIMPE.", "options": \[ { "text": "Legalidade, impessoalidade, moralidade, publicidade e eficiência.", "isCorrect": true }, { "text": "Legalidade, isonomia, economicidade, hierarquia e eficiência.", "isCorrect": false } \] }, { "statement": "O princípio da legalidade, aplicado à administração pública, permite que o agente público pratique qualquer ato que não seja expressamente proibido por lei, desde que considere a medida conveniente ao interesse público.", "type": "TRUE_FALSE", "explanation": "A afirmação está errada.", "options": \[ { "text": "Certo", "isCorrect": false }, { "text": "Errado", "isCorrect": true } \] } \]
      ''';

      final result = AiPromptService.parseAiResponse(userSnippet);
      expect(result.questions.length, 2);
      expect(result.questions[0].type, QuestionType.multipleChoice);
      expect(result.questions[0].options.length, 2);
      expect(result.questions[0].options[0].isCorrect, true);
      expect(result.questions[1].type, QuestionType.trueFalse);
      expect(result.questions[1].options[1].text, 'Errado');
      expect(result.questions[1].options[1].isCorrect, true);
    });
  });
}

