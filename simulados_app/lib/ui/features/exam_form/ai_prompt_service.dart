import 'dart:convert';
import '../../../domain/models/exam_models.dart';

class ParsedAiOption {
  final String text;
  final bool isCorrect;

  const ParsedAiOption({
    required this.text,
    required this.isCorrect,
  });
}

class ParsedAiQuestion {
  final String statement;
  final String explanation;
  final QuestionType type;
  final List<ParsedAiOption> options;

  const ParsedAiQuestion({
    required this.statement,
    required this.explanation,
    required this.type,
    required this.options,
  });
}

class ParsedAiResult {
  final String? title;
  final String? category;
  final String? description;
  final List<ParsedAiQuestion> questions;

  const ParsedAiResult({
    this.title,
    this.category,
    this.description,
    required this.questions,
  });
}

enum AiQuestionStyle {
  multipleChoice4,
  multipleChoice5,
  trueFalse,
  mixed,
}

class AiPromptService {
  /// Constrói o prompt ideal otimizado para ChatGPT, Gemini, Claude e DeepSeek
  /// para gerar questões que correspondam perfeitamente ao formato do simulado.
  static String buildPrompt({
    required String subject,
    int count = 10,
    AiQuestionStyle style = AiQuestionStyle.multipleChoice4,
    String? extraFocus,
    bool isAppending = false,
    int currentQuestionsCount = 0,
  }) {
    final buffer = StringBuffer();
    buffer.writeln(
        'Você é um examinador e especialista sênior na elaboração de questões para provas, concursos e certificações.');
    
    if (isAppending && currentQuestionsCount > 0) {
      buffer.writeln(
          'Preciso adicionar mais $count novas questões inéditas a um simulado existente (que já possui $currentQuestionsCount questões) sobre: "$subject".');
    } else {
      buffer.writeln(
          'Elabore um simulado com exatamente $count questões inéditas e pedagógicas sobre o tema: "$subject".');
    }

    if (extraFocus != null && extraFocus.trim().isNotEmpty) {
      buffer.writeln('Tópicos específicos / Foco desejado: ${extraFocus.trim()}.');
    }

    buffer.writeln();
    buffer.writeln('DIRETRIZES DE FORMATO DAS QUESTÕES:');

    switch (style) {
      case AiQuestionStyle.multipleChoice4:
        buffer.writeln('- Formato: Múltipla Escolha ("type": "MULTIPLE_CHOICE").');
        buffer.writeln('- Cada questão deve conter EXATAMENTE 4 alternativas no array "options".');
        buffer.writeln('- RIGOROSAMENTE apenas 1 alternativa com "isCorrect": true e as outras 3 com "isCorrect": false.');
        break;
      case AiQuestionStyle.multipleChoice5:
        buffer.writeln('- Formato: Múltipla Escolha ("type": "MULTIPLE_CHOICE").');
        buffer.writeln('- Cada questão deve conter EXATAMENTE 5 alternativas no array "options".');
        buffer.writeln('- RIGOROSAMENTE apenas 1 alternativa com "isCorrect": true e as outras 4 com "isCorrect": false.');
        break;
      case AiQuestionStyle.trueFalse:
        buffer.writeln('- Formato: Certo ou Errado ("type": "TRUE_FALSE").');
        buffer.writeln('- Cada questão apresenta uma afirmação técnica e contextualizada no "statement".');
        buffer.writeln('- O array "options" deve ter exatamente 2 itens: um com "text": "Certo" e outro com "text": "Errado".');
        buffer.writeln('- Exatamente uma das duas opções deve ter "isCorrect": true.');
        break;
      case AiQuestionStyle.mixed:
        buffer.writeln('- Formato Misto: intercale questões de Múltipla Escolha ("type": "MULTIPLE_CHOICE") e Certo/Errado ("type": "TRUE_FALSE").');
        buffer.writeln('- Para Múltipla Escolha: 4 opções, apenas 1 correta.');
        buffer.writeln('- Para Certo/Errado: opções "Certo" e "Errado", apenas 1 correta.');
        break;
    }

    buffer.writeln('- "statement": Deve ser um enunciado claro, sem dubiedades, simulando o nível de bancas conceituadas.');
    buffer.writeln('- "explanation": Justificativa fundamentada e didática que explique a razão do gabarito.');
    buffer.writeln();
    buffer.writeln('FORMATO DE RESPOSTA OBRIGATÓRIO:');
    buffer.writeln('Retorne EXCLUSIVAMENTE a estrutura JSON válida abaixo, sem qualquer texto, introdução, comentários ou saudações antes ou depois:');
    buffer.writeln('```json');
    buffer.writeln('[');
    buffer.writeln('  {');
    buffer.writeln('    "statement": "Enunciado da questão...",');
    buffer.writeln('    "type": "${style == AiQuestionStyle.trueFalse ? 'TRUE_FALSE' : 'MULTIPLE_CHOICE'}",');
    buffer.writeln('    "explanation": "Explicação completa e fundamentada do gabarito...",');
    buffer.writeln('    "options": [');
    if (style == AiQuestionStyle.trueFalse) {
      buffer.writeln('      { "text": "Certo", "isCorrect": true },');
      buffer.writeln('      { "text": "Errado", "isCorrect": false }');
    } else {
      buffer.writeln('      { "text": "Alternativa A", "isCorrect": true },');
      buffer.writeln('      { "text": "Alternativa B", "isCorrect": false },');
      buffer.writeln('      { "text": "Alternativa C", "isCorrect": false },');
      buffer.writeln('      { "text": "Alternativa D", "isCorrect": false }');
    }
    buffer.writeln('    ]');
    buffer.writeln('  }');
    buffer.writeln(']');
    buffer.writeln('```');

    return buffer.toString();
  }

  /// Extrai e decodifica com tolerância a falhas o JSON fornecido pela IA
  static ParsedAiResult parseAiResponse(String rawText) {
    if (rawText.trim().isEmpty) {
      throw const FormatException('O texto fornecido está vazio.');
    }

    final sanitizedJson = _extractJsonBlock(rawText);
    dynamic decoded;

    try {
      decoded = json.decode(sanitizedJson);
    } catch (_) {
      try {
        final fixed = fixInvalidBackslashes(sanitizedJson);
        decoded = json.decode(fixed);
      } catch (_) {
        try {
          final fixedRaw = fixInvalidBackslashes(rawText);
          final extractedFromFixed = _extractJsonBlock(fixedRaw);
          decoded = json.decode(extractedFromFixed);
        } catch (_) {
          final cleaned = fixInvalidBackslashes(_sanitizeRawLineBreaks(sanitizedJson));
          decoded = json.decode(cleaned);
        }
      }
    }

    String? extractedTitle;
    String? extractedCategory;
    String? extractedDescription;
    List<dynamic> rawQuestionsList;

    if (decoded is List) {
      rawQuestionsList = decoded;
    } else if (decoded is Map<String, dynamic>) {
      if (decoded['questions'] is List) {
        rawQuestionsList = decoded['questions'] as List;
      } else {
        throw const FormatException('O objeto JSON não contém a chave "questions" como lista.');
      }

      if (decoded['title'] is String) {
        extractedTitle = (decoded['title'] as String).trim();
      }
      if (decoded['category'] is String) {
        extractedCategory = (decoded['category'] as String).trim();
      }
      if (decoded['description'] is String) {
        extractedDescription = (decoded['description'] as String).trim();
      }
    } else {
      throw const FormatException('Estrutura JSON inválida. Esperado array ou objeto com "questions".');
    }

    if (rawQuestionsList.isEmpty) {
      throw const FormatException('Nenhuma questão encontrada no JSON retornado.');
    }

    final List<ParsedAiQuestion> questions = [];

    for (int i = 0; i < rawQuestionsList.length; i++) {
      final item = rawQuestionsList[i];
      if (item is! Map) {
        continue;
      }

      final statement = (item['statement'] ?? '').toString().trim();
      if (statement.isEmpty) {
        continue;
      }

      final explanation = (item['explanation'] ?? '').toString().trim();
      final typeStr = (item['type'] ?? 'MULTIPLE_CHOICE').toString().toUpperCase();
      final type = (typeStr == 'TRUE_FALSE' || typeStr == 'CERTO_ERRADO')
          ? QuestionType.trueFalse
          : QuestionType.multipleChoice;

      final rawOptions = item['options'] as List<dynamic>? ?? [];
      final List<ParsedAiOption> options = [];

      for (final opt in rawOptions) {
        if (opt is Map) {
          final text = (opt['text'] ?? '').toString().trim();
          final isCorrect = opt['isCorrect'] == true || opt['correct'] == true;
          if (text.isNotEmpty) {
            options.add(ParsedAiOption(text: text, isCorrect: isCorrect));
          }
        } else if (opt is String && opt.trim().isNotEmpty) {
          options.add(ParsedAiOption(text: opt.trim(), isCorrect: false));
        }
      }

      // Se nenhuma opção foi marcada como correta, marcar a primeira como fallback
      if (options.isNotEmpty && !options.any((o) => o.isCorrect)) {
        options[0] = ParsedAiOption(text: options[0].text, isCorrect: true);
      }

      // Se for do tipo Certo/Errado e não tiver opções completas, auto-preencher
      if (type == QuestionType.trueFalse && options.length < 2) {
        options.clear();
        options.add(const ParsedAiOption(text: 'Certo', isCorrect: true));
        options.add(const ParsedAiOption(text: 'Errado', isCorrect: false));
      }

      if (options.isNotEmpty) {
        questions.add(
          ParsedAiQuestion(
            statement: statement,
            explanation: explanation,
            type: type,
            options: options,
          ),
        );
      }
    }

    if (questions.isEmpty) {
      throw const FormatException('Nenhuma questão válida com enunciado e alternativas pôde ser processada.');
    }

    return ParsedAiResult(
      title: extractedTitle,
      category: extractedCategory,
      description: extractedDescription,
      questions: questions,
    );
  }

  /// Limpa marcadores Markdown (```json ... ```) ou texto extra antes/depois do JSON
  static String _extractJsonBlock(String raw) {
    var text = raw.trim();

    // 1. Procura bloco explicitado em markdown ```json ... ``` ou ``` ... ```
    final codeBlockRegex = RegExp(r'```(?:json)?\s*([\s\S]*?)\s*```', caseSensitive: false);
    final match = codeBlockRegex.firstMatch(text);
    if (match != null && match.group(1) != null) {
      return match.group(1)!.trim();
    }

    // 2. Busca do primeiro delimitador JSON até o último
    final firstBracket = text.indexOf('[');
    final firstBrace = text.indexOf('{');

    int startIdx = -1;
    int endIdx = -1;

    if (firstBracket != -1 && (firstBrace == -1 || firstBracket < firstBrace)) {
      startIdx = firstBracket;
      endIdx = text.lastIndexOf(']');
    } else if (firstBrace != -1) {
      startIdx = firstBrace;
      endIdx = text.lastIndexOf('}');
    }

    if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
      return text.substring(startIdx, endIdx + 1).trim();
    }

    return text;
  }

  /// Corrige barras invertidas inválidas ou avulsas geradas por IAs como Gemini e ChatGPT.
  /// Trata tanto escapes inválidos dentro de strings (ex: \d, \s, \alpha, \{, caminhos C:\)
  /// quanto barras escapando colchetes estruturais do JSON geradas pelo app do ChatGPT (ex: \[, \]).
  static String fixInvalidBackslashes(String input) {
    final buffer = StringBuffer();
    final len = input.length;
    bool inString = false;

    for (int i = 0; i < len; i++) {
      final char = input[i];

      // Quando estamos FORA de uma string JSON
      if (!inString) {
        if (char == '"') {
          inString = true;
          buffer.write(char);
          continue;
        }

        if (char == '\\') {
          // Barras invertidas fora de strings JSON são resquícios de formatação Markdown
          // (ex: ChatGPT app copiando \[, \], \{, \}, etc).
          // Fora de strings, uma barra invertida nunca é válida no JSON e deve ser descartada.
          continue;
        }

        buffer.write(char);
        continue;
      }

      // Quando estamos DENTRO de uma string JSON
      if (char == '"') {
        int backslashCount = 0;
        int j = i - 1;
        while (j >= 0 && input[j] == '\\') {
          backslashCount++;
          j--;
        }
        // Se a quantidade de barras antes da aspa for par, a aspa não está escapada (fim da string)
        if (backslashCount % 2 == 0) {
          inString = false;
        }
        buffer.write(char);
        continue;
      }

      if (char == '\\') {
        // Se a barra invertida estiver no final do texto
        if (i + 1 >= len) {
          buffer.write('\\\\');
          continue;
        }

        final next = input[i + 1];

        // Escapes válidos padrão JSON: \", \\, \/, \b, \f, \n, \r, \t
        if (next == '"' ||
            next == '\\' ||
            next == '/' ||
            next == 'b' ||
            next == 'f' ||
            next == 'n' ||
            next == 'r' ||
            next == 't') {
          buffer.write(char);
          buffer.write(next);
          i++; // Consome o caractere seguinte já validado
          continue;
        }

        // Escape unicode válido: \uXXXX (4 dígitos hexadecimais)
        if (next == 'u' && i + 5 < len) {
          final hex = input.substring(i + 2, i + 6);
          if (RegExp(r'^[0-9a-fA-F]{4}$').hasMatch(hex)) {
            buffer.write(char);
            buffer.write(next);
            buffer.write(hex);
            i += 5;
            continue;
          }
        }

        // Qualquer outra barra invertida dentro de string é INVÁLIDA para o JSON.
        // Convertemos para '\\' para que seja interpretada como caractere literal seguro.
        buffer.write('\\\\');
        continue;
      }

      buffer.write(char);
    }

    return buffer.toString();
  }

  /// Alias conveniente para [fixInvalidBackslashes]
  static String sanitizeJsonBackslashes(String input) => fixInvalidBackslashes(input);

  /// Substitui quebras de linha cruas e caracteres de controle dentro de strings JSON por escapes válidos
  static String _sanitizeRawLineBreaks(String input) {
    final buffer = StringBuffer();
    bool inString = false;
    final len = input.length;

    for (int i = 0; i < len; i++) {
      final char = input[i];

      if (char == '"') {
        int backslashes = 0;
        int j = i - 1;
        while (j >= 0 && input[j] == '\\') {
          backslashes++;
          j--;
        }
        if (backslashes % 2 == 0) {
          inString = !inString;
        }
        buffer.write(char);
        continue;
      }

      if (inString) {
        if (char == '\n') {
          buffer.write(r'\n');
          continue;
        } else if (char == '\r') {
          continue;
        } else if (char == '\t') {
          buffer.write(r'\t');
          continue;
        }
      }

      buffer.write(char);
    }

    return buffer.toString();
  }
}
