import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../../../data/repositories/exam_repository.dart';
import '../../../domain/models/exam_models.dart';
import 'ai_prompt_service.dart';
import 'ai_question_generator_dialog.dart';
import 'exam_form_models.dart';

class ExamFormView extends StatefulWidget {
  final ExamRepository repository;
  final String? examId;
  final String? initialFolderId;

  const ExamFormView({
    super.key,
    required this.repository,
    this.examId,
    this.initialFolderId,
  });

  @override
  State<ExamFormView> createState() => _ExamFormViewState();
}

class _ExamFormViewState extends State<ExamFormView> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _categoryController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _imageUrlController = TextEditingController();
  final _jsonController = TextEditingController();

  final Uuid _uuid = const Uuid();

  bool _isLoading = false;
  bool _isSaving = false;
  bool _isProcessingAi = false;
  String? _errorMessage;

  String? _selectedFolderId;
  bool _isPinned = false;
  String _selectedIcon = 'graduation-cap';
  List<FolderModel> _availableFolders = [];

  List<QuestionDraft> _questions = [];

  final List<Map<String, dynamic>> _presetIcons = [
    {'id': 'graduation-cap', 'label': 'Geral / Concurso', 'icon': Icons.school_rounded},
    {'id': 'code', 'label': 'TI / Tecnologia', 'icon': Icons.code_rounded},
    {'id': 'scale', 'label': 'Direito / Leis', 'icon': Icons.gavel_rounded},
    {'id': 'calculator', 'label': 'Matemática', 'icon': Icons.calculate_outlined},
    {'id': 'book-open', 'label': 'Didática / Ensino', 'icon': Icons.menu_book_rounded},
    {'id': 'stethoscope', 'label': 'Saúde / Medicina', 'icon': Icons.medical_services_outlined},
    {'id': 'globe', 'label': 'Línguas / Atualidades', 'icon': Icons.language_rounded},
    {'id': 'award', 'label': 'Certificação', 'icon': Icons.emoji_events_outlined},
  ];

  @override
  void initState() {
    super.initState();
    _selectedFolderId = widget.initialFolderId;
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    setState(() => _isLoading = true);
    try {
      _availableFolders = await widget.repository.getFolders();
      if (widget.examId != null) {
        await _loadExamForEdit();
      } else {
        _addNewQuestion();
      }
    } catch (e) {
      _errorMessage = 'Erro ao inicializar formulário: $e';
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _loadExamForEdit() async {
    setState(() => _isLoading = true);
    try {
      final exam = await widget.repository.getExamById(widget.examId!);
      if (exam != null) {
        _titleController.text = exam.title;
        _categoryController.text = exam.category ?? '';
        _descriptionController.text = exam.description ?? '';
        _imageUrlController.text = exam.imageUrl ?? '';
        _selectedFolderId = exam.folderId;
        _isPinned = exam.isPinned;
        _selectedIcon = exam.icon ?? 'graduation-cap';

        _questions = exam.questions.map((q) {
          final options = q.options
              .map((o) => OptionDraft(
                    id: o.id,
                    textController: TextEditingController(text: o.text),
                    isCorrect: o.isCorrect,
                  ))
              .toList();

          return QuestionDraft(
            id: q.id,
            statementController: TextEditingController(text: q.statement),
            explanationController:
                TextEditingController(text: q.explanation ?? ''),
            type: q.type,
            options: options,
          );
        }).toList();
      }
    } catch (e) {
      _errorMessage = 'Erro ao carregar simulado para edição: $e';
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _addNewQuestion({QuestionType type = QuestionType.multipleChoice}) {
    List<OptionDraft> options;
    if (type == QuestionType.trueFalse) {
      options = [
        OptionDraft(
          id: _uuid.v4(),
          textController: TextEditingController(text: 'Certo'),
          isCorrect: true,
        ),
        OptionDraft(
          id: _uuid.v4(),
          textController: TextEditingController(text: 'Errado'),
          isCorrect: false,
        ),
      ];
    } else {
      options = [
        OptionDraft(
          id: _uuid.v4(),
          textController: TextEditingController(),
          isCorrect: true,
        ),
        OptionDraft(
          id: _uuid.v4(),
          textController: TextEditingController(),
          isCorrect: false,
        ),
        OptionDraft(
          id: _uuid.v4(),
          textController: TextEditingController(),
          isCorrect: false,
        ),
        OptionDraft(
          id: _uuid.v4(),
          textController: TextEditingController(),
          isCorrect: false,
        ),
      ];
    }

    setState(() {
      _questions.add(
        QuestionDraft(
          id: _uuid.v4(),
          statementController: TextEditingController(),
          explanationController: TextEditingController(),
          type: type,
          options: options,
        ),
      );
    });
  }

  void _removeQuestion(int index) {
    setState(() {
      _questions[index].dispose();
      _questions.removeAt(index);
    });
  }

  void _changeQuestionType(int qIndex, QuestionType newType) {
    setState(() {
      final q = _questions[qIndex];
      q.type = newType;
      if (newType == QuestionType.trueFalse) {
        q.options = [
          OptionDraft(
            id: _uuid.v4(),
            textController: TextEditingController(text: 'Certo'),
            isCorrect: true,
          ),
          OptionDraft(
            id: _uuid.v4(),
            textController: TextEditingController(text: 'Errado'),
            isCorrect: false,
          ),
        ];
      } else {
        q.options = [
          OptionDraft(
            id: _uuid.v4(),
            textController: TextEditingController(),
            isCorrect: true,
          ),
          OptionDraft(
            id: _uuid.v4(),
            textController: TextEditingController(),
            isCorrect: false,
          ),
          OptionDraft(
            id: _uuid.v4(),
            textController: TextEditingController(),
            isCorrect: false,
          ),
          OptionDraft(
            id: _uuid.v4(),
            textController: TextEditingController(),
            isCorrect: false,
          ),
        ];
      }
    });
  }

  void _importJson() {
    final raw = _jsonController.text.trim();
    if (raw.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cole o JSON antes de validar.')),
      );
      return;
    }

    try {
      String cleanJson = raw;
      // Remove delimitadores de markdown caso o usuário cole com ```json ... ```
      if (cleanJson.startsWith('```')) {
        final lines = cleanJson.split('\n');
        cleanJson = lines.sublist(1, lines.length - 1).join('\n');
      }

      dynamic decoded;
      try {
        decoded = json.decode(cleanJson);
      } catch (_) {
        cleanJson = AiPromptService.fixInvalidBackslashes(cleanJson);
        decoded = json.decode(cleanJson);
      }
      List<dynamic> items;
      if (decoded is List) {
        items = decoded;
      } else if (decoded is Map && decoded['questions'] is List) {
        items = decoded['questions'] as List;
        if (decoded['title'] is String && _titleController.text.isEmpty) {
          _titleController.text = decoded['title'] as String;
        }
        if (decoded['category'] is String && _categoryController.text.isEmpty) {
          _categoryController.text = decoded['category'] as String;
        }
        if (decoded['description'] is String &&
            _descriptionController.text.isEmpty) {
          _descriptionController.text = decoded['description'] as String;
        }
      } else {
        throw Exception(
            'Formato inválido. O JSON deve ser um array de questões ou um objeto contendo "questions".');
      }

      final List<QuestionDraft> importedDrafts = [];

      for (final item in items) {
        final statement = (item['statement'] ?? '').toString().trim();
        final explanation = (item['explanation'] ?? '').toString().trim();
        final typeStr = (item['type'] ?? 'MULTIPLE_CHOICE').toString();
        final type = typeStr == 'TRUE_FALSE'
            ? QuestionType.trueFalse
            : QuestionType.multipleChoice;

        final optionsList = item['options'] as List<dynamic>? ?? [];
        final List<OptionDraft> options = [];

        for (final opt in optionsList) {
          options.add(
            OptionDraft(
              id: _uuid.v4(),
              textController: TextEditingController(
                text: (opt['text'] ?? '').toString().trim(),
              ),
              isCorrect: (opt['isCorrect'] == true),
            ),
          );
        }

        importedDrafts.add(
          QuestionDraft(
            id: _uuid.v4(),
            statementController: TextEditingController(text: statement),
            explanationController: TextEditingController(text: explanation),
            type: type,
            options: options,
          ),
        );
      }

      setState(() {
        _questions.addAll(importedDrafts);
      });

      _jsonController.clear();
      Navigator.of(context).pop(); // Fecha o diálogo de importação

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            '${importedDrafts.length} questão(ões) importada(s) com sucesso!',
          ),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: Colors.red,
          content: Text('Erro ao analisar JSON: $e'),
        ),
      );
    }
  }

  void _openAiQuestionGenerator() {
    AiQuestionGeneratorDialog.show(
      context: context,
      initialTitle: _titleController.text.trim().isNotEmpty
          ? _titleController.text.trim()
          : null,
      initialCategory: _categoryController.text.trim().isNotEmpty
          ? _categoryController.text.trim()
          : null,
      existingQuestionsCount: _questions.length,
      isEditing: widget.examId != null,
      onStartBackgroundProcessing: ({
        required ParsedAiResult parsed,
        String? generatedTitle,
        String? generatedCategory,
        bool replaceExisting = false,
      }) {
        _startBackgroundAiProcessing(
          parsed: parsed,
          generatedTitle: generatedTitle,
          generatedCategory: generatedCategory,
          replaceExisting: replaceExisting,
        );
      },
    );
  }

  void _startBackgroundAiProcessing({
    required ParsedAiResult parsed,
    String? generatedTitle,
    String? generatedCategory,
    bool replaceExisting = false,
  }) {
    setState(() {
      _isProcessingAi = true;
    });

    // Processa a conversão das questões de forma assíncrona em segundo plano
    Future.microtask(() async {
      try {
        // Pequeno intervalo para animação visual do fechamento do modal e feedback
        await Future.delayed(const Duration(milliseconds: 500));

        final List<QuestionDraft> drafts = [];
        for (final q in parsed.questions) {
          final List<OptionDraft> optDrafts = [];
          for (final opt in q.options) {
            optDrafts.add(
              OptionDraft(
                id: _uuid.v4(),
                textController: TextEditingController(text: opt.text),
                isCorrect: opt.isCorrect,
              ),
            );
          }

          drafts.add(
            QuestionDraft(
              id: _uuid.v4(),
              statementController: TextEditingController(text: q.statement),
              explanationController: TextEditingController(text: q.explanation),
              type: q.type,
              options: optDrafts,
            ),
          );
        }

        if (!mounted) return;

        setState(() {
          if (replaceExisting) {
            for (final q in _questions) {
              q.dispose();
            }
            _questions = drafts;
          } else {
            _questions.addAll(drafts);
          }

          if (_titleController.text.trim().isEmpty &&
              generatedTitle != null &&
              generatedTitle.isNotEmpty) {
            _titleController.text = generatedTitle;
          }
          if (_categoryController.text.trim().isEmpty &&
              generatedCategory != null &&
              generatedCategory.isNotEmpty) {
            _categoryController.text = generatedCategory;
          }

          _isProcessingAi = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF10B981),
            content: Row(
              children: [
                const Icon(Icons.check_circle_outline, color: Colors.white, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '${drafts.length} questões importadas com sucesso da IA!',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        );
      } catch (err) {
        if (!mounted) return;
        setState(() {
          _isProcessingAi = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFFEF4444),
            content: Text('Erro ao processar questões em segundo plano: $err'),
          ),
        );
      }
    });
  }

  void _showImportDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Importar Questões via JSON'),
        content: SizedBox(
          width: 500,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Cole aqui o JSON gerado por IA (ChatGPT, Claude ou Gemini):',
                style: TextStyle(fontSize: 12),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _jsonController,
                maxLines: 8,
                style: const TextStyle(fontFamily: 'monospace', fontSize: 11),
                decoration: const InputDecoration(
                  hintText: '[\n  {\n    "statement": "...",\n    "type": "MULTIPLE_CHOICE",\n    "options": [...]\n  }\n]',
                ),
              ),
              const SizedBox(height: 10),
              TextButton.icon(
                onPressed: () {
                  _jsonController.text = '''[
  {
    "statement": "Qual é a capital da França?",
    "type": "MULTIPLE_CHOICE",
    "explanation": "Paris é a capital e maior cidade da França.",
    "options": [
      { "text": "Paris", "isCorrect": true },
      { "text": "Londres", "isCorrect": false },
      { "text": "Roma", "isCorrect": false },
      { "text": "Berlim", "isCorrect": false }
    ]
  }
]''';
                },
                icon: const Icon(Icons.code_rounded, size: 16),
                label: const Text('Preencher Exemplo de Prompt',
                    style: TextStyle(fontSize: 12)),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: _importJson,
            child: const Text('Importar Questões'),
          ),
        ],
      ),
    );
  }

  Future<void> _saveExam() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_questions.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Colors.red,
          content: Text('O simulado deve conter pelo menos uma questão.'),
        ),
      );
      return;
    }

    // Valida se cada questão possui enunciado e pelo menos uma alternativa correta
    for (int i = 0; i < _questions.length; i++) {
      final q = _questions[i];
      if (q.statementController.text.trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.red,
            content: Text('A questão #${i + 1} está com o enunciado vazio.'),
          ),
        );
        return;
      }

      final correctCount = q.options.where((o) => o.isCorrect).length;
      if (correctCount != 1) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.red,
            content: Text(
              'A questão #${i + 1} deve ter exatamente uma alternativa correta marcada.',
            ),
          ),
        );
        return;
      }
    }

    setState(() => _isSaving = true);

    try {
      final questionsToSave = _questions.asMap().entries.map((entry) {
        final qIdx = entry.key;
        final q = entry.value;

        final optionsToSave = q.options.asMap().entries.map((optEntry) {
          final oIdx = optEntry.key;
          final opt = optEntry.value;

          return OptionModel(
            id: opt.id,
            questionId: q.id,
            text: opt.textController.text.trim(),
            isCorrect: opt.isCorrect,
            orderIndex: oIdx,
          );
        }).toList();

        return QuestionModel(
          id: q.id,
          examId: widget.examId ?? '',
          type: q.type,
          statement: q.statementController.text.trim(),
          explanation: q.explanationController.text.trim().isNotEmpty
              ? q.explanationController.text.trim()
              : null,
          orderIndex: qIdx,
          options: optionsToSave,
        );
      }).toList();

      await widget.repository.saveExam(
        id: widget.examId,
        title: _titleController.text.trim(),
        category: _categoryController.text.trim().isNotEmpty
            ? _categoryController.text.trim()
            : null,
        description: _descriptionController.text.trim().isNotEmpty
            ? _descriptionController.text.trim()
            : null,
        folderId: _selectedFolderId,
        isPinned: _isPinned,
        icon: _selectedIcon,
        imageUrl: _imageUrlController.text.trim().isNotEmpty
            ? _imageUrlController.text.trim()
            : null,
        questions: questionsToSave,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Simulado salvo com sucesso!')),
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.red,
            content: Text('Erro ao salvar simulado: $e'),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _categoryController.dispose();
    _descriptionController.dispose();
    _jsonController.dispose();
    for (final q in _questions) {
      q.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.examId != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Editar Simulado' : 'Novo Simulado'),
        actions: [
          Builder(
            builder: (context) {
              final isNarrow = MediaQuery.of(context).size.width < 500;
              if (isNarrow) {
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (_isProcessingAi)
                      Tooltip(
                        message: 'Processando questões com IA em segundo plano...',
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEEF2FF),
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFFC7D2FE)),
                          ),
                          child: const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.2,
                              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF4F46E5)),
                            ),
                          ),
                        ),
                      ),
                    IconButton(
                      tooltip: 'Gerar com IA',
                      onPressed: _openAiQuestionGenerator,
                      icon: const Icon(Icons.auto_awesome, color: Color(0xFF4F46E5)),
                    ),
                    IconButton(
                      tooltip: 'Importar JSON',
                      onPressed: _showImportDialog,
                      icon: const Icon(Icons.file_upload_outlined),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: IconButton.filled(
                        tooltip: 'Salvar Simulado',
                        onPressed: _isSaving ? null : _saveExam,
                        icon: _isSaving
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2, color: Colors.white),
                              )
                            : const Icon(Icons.save_rounded),
                      ),
                    ),
                  ],
                );
              }

              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (_isProcessingAi) ...[
                    Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEEF2FF),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFC7D2FE)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF4F46E5)),
                            ),
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Processando IA...',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF4338CA),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  FilledButton.tonalIcon(
                    onPressed: _openAiQuestionGenerator,
                    icon: const Icon(Icons.auto_awesome, size: 16),
                    label: const Text('Gerar com IA'),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton.icon(
                    onPressed: _showImportDialog,
                    icon: const Icon(Icons.file_upload_outlined, size: 16),
                    label: const Text('Importar JSON'),
                  ),
                  const SizedBox(width: 8),
                  Padding(
                    padding: const EdgeInsets.only(right: 16),
                    child: ElevatedButton.icon(
                      onPressed: _isSaving ? null : _saveExam,
                      icon: _isSaving
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.save_rounded, size: 16),
                      label: Text(_isSaving ? 'Salvando...' : 'Salvar Simulado'),
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                if (_isProcessingAi)
                  const LinearProgressIndicator(
                    minHeight: 3,
                    backgroundColor: Color(0xFFE0E7FF),
                    valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF4F46E5)),
                  ),
                Expanded(
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 900),
                      child: Form(
                        key: _formKey,
                        child: ListView(
                          padding: const EdgeInsets.all(20),
                          children: [
                            if (_errorMessage != null) ...[
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFEF2F2),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: const Color(0xFFEF4444)),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.error_outline,
                                        color: Color(0xFFEF4444)),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        _errorMessage!,
                                        style: const TextStyle(
                                            color: Color(0xFFB91C1C), fontSize: 13),
                                      ),
                                    ),
                                  ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                      // Card de Dados Gerais
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Dados Gerais do Simulado',
                                style: TextStyle(
                                    fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 16),

                              // Título
                              TextFormField(
                                controller: _titleController,
                                decoration: const InputDecoration(
                                  labelText: 'Título do Simulado *',
                                  hintText: 'Ex: Certificação OutSystems O11',
                                ),
                                validator: (val) {
                                  if (val == null || val.trim().isEmpty) {
                                    return 'Informe o título do simulado.';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 16),

                              // Categoria
                              TextFormField(
                                controller: _categoryController,
                                decoration: const InputDecoration(
                                  labelText: 'Categoria / Assunto',
                                  hintText: 'Ex: TI, OutSystems, Direito',
                                ),
                              ),
                              const SizedBox(height: 16),

                              // Descrição
                              TextFormField(
                                controller: _descriptionController,
                                maxLines: 2,
                                decoration: const InputDecoration(
                                  labelText: 'Descrição / Instruções',
                                  hintText: 'Objetivo pedagógico do simulado...',
                                ),
                              ),
                              const SizedBox(height: 16),

                              // Pasta Organizadora
                              DropdownButtonFormField<String?>(
                                initialValue: _selectedFolderId,
                                isExpanded: true,
                                decoration: const InputDecoration(
                                  labelText: 'Pasta Organizadora',
                                  prefixIcon: Icon(Icons.folder_outlined, size: 20),
                                ),
                                items: [
                                  const DropdownMenuItem(
                                    value: null,
                                    child: Text(
                                      'Sem pasta (Geral)',
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  ..._availableFolders.map(
                                    (f) => DropdownMenuItem(
                                      value: f.id,
                                      child: Text(
                                        '📁 ${f.name}',
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ),
                                ],
                                onChanged: (val) {
                                  setState(() => _selectedFolderId = val);
                                },
                              ),
                              const SizedBox(height: 12),

                              // Fixar no Topo
                              Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: Theme.of(context).brightness == Brightness.dark
                                        ? const Color(0xFF334155)
                                        : const Color(0xFFE2E8F0),
                                  ),
                                ),
                                child: SwitchListTile(
                                  title: const Text(
                                    'Fixar este simulado no topo',
                                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                  ),
                                  subtitle: const Text(
                                    'Aparecerá com destaque na seção "Fixados" do app',
                                    style: TextStyle(fontSize: 11),
                                  ),
                                  secondary: Icon(
                                    _isPinned ? Icons.push_pin_rounded : Icons.push_pin_outlined,
                                    color: _isPinned ? const Color(0xFFF59E0B) : const Color(0xFF94A3B8),
                                  ),
                                  value: _isPinned,
                                  onChanged: (val) {
                                    setState(() => _isPinned = val);
                                  },
                                ),
                              ),
                              const SizedBox(height: 16),

                              // Escolha de Ícone
                              const Text(
                                'Ícone Representativo',
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 8,
                                runSpacing: 8,
                                children: _presetIcons.map((item) {
                                  final isSelected = _selectedIcon == item['id'];
                                  return ChoiceChip(
                                    selected: isSelected,
                                    avatar: Icon(
                                      item['icon'] as IconData,
                                      size: 16,
                                      color: isSelected ? Colors.white : const Color(0xFF4F46E5),
                                    ),
                                    label: Text(item['label'] as String),
                                    onSelected: (_) {
                                      setState(() => _selectedIcon = item['id'] as String);
                                    },
                                  );
                                }).toList(),
                              ),
                              const SizedBox(height: 16),

                              // URL da Imagem personalizada
                              TextFormField(
                                controller: _imageUrlController,
                                decoration: const InputDecoration(
                                  labelText: 'URL de Imagem Personalizada (Opcional)',
                                  hintText: 'https://exemplo.com/icone.png',
                                  prefixIcon: Icon(Icons.image_outlined, size: 20),
                                ),
                              ),
                              const SizedBox(height: 16),

                              // Banner Assistente de IA
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF4F46E5).withValues(alpha: 0.08),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: const Color(0xFF4F46E5).withValues(alpha: 0.2),
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(6),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF4F46E5).withValues(alpha: 0.15),
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(
                                        Icons.auto_awesome,
                                        color: Color(0xFF4F46E5),
                                        size: 18,
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            widget.examId != null
                                                ? 'Adicionar mais questões com IA'
                                                : 'Gerar questões automaticamente com IA',
                                            style: const TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          Text(
                                            widget.examId != null
                                                ? 'Adicione novas perguntas deste tema usando ChatGPT ou Gemini.'
                                                : 'Informe o título e monte o prompt ideal em poucos segundos.',
                                            style: const TextStyle(
                                              fontSize: 11,
                                              color: Color(0xFF64748B),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    FilledButton.tonal(
                                      onPressed: _openAiQuestionGenerator,
                                      style: FilledButton.styleFrom(
                                        visualDensity: VisualDensity.compact,
                                        padding: const EdgeInsets.symmetric(horizontal: 12),
                                      ),
                                      child: const Text('Gerar com IA', style: TextStyle(fontSize: 11)),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Cabeçalho da Seção de Questões
                      LayoutBuilder(
                        builder: (context, constraints) {
                          final isNarrow = constraints.maxWidth < 600;
                          final actionButtons = Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              FilledButton.tonalIcon(
                                onPressed: _openAiQuestionGenerator,
                                icon: const Icon(Icons.auto_awesome, size: 16),
                                label: Text(widget.examId != null
                                    ? '+ Adicionar com IA'
                                    : 'Gerar com IA'),
                              ),
                              OutlinedButton.icon(
                                onPressed: () => _addNewQuestion(
                                    type: QuestionType.trueFalse),
                                icon: const Icon(Icons.add, size: 16),
                                label: const Text('Certo/Errado'),
                              ),
                              ElevatedButton.icon(
                                onPressed: () => _addNewQuestion(
                                    type: QuestionType.multipleChoice),
                                icon: const Icon(Icons.add, size: 16),
                                label: const Text('Múltipla Escolha'),
                              ),
                            ],
                          );

                          if (isNarrow) {
                            return Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Questões (${_questions.length})',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                const Text(
                                  'Cadastre o enunciado e marque a alternativa correta',
                                  style: TextStyle(
                                      fontSize: 12, color: Color(0xFF64748B)),
                                ),
                                const SizedBox(height: 12),
                                actionButtons,
                              ],
                            );
                          }

                          return Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Questões (${_questions.length})',
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const Text(
                                    'Cadastre o enunciado e marque a alternativa correta',
                                    style: TextStyle(
                                        fontSize: 12, color: Color(0xFF64748B)),
                                  ),
                                ],
                              ),
                              actionButtons,
                            ],
                          );
                        },
                      ),
                      const SizedBox(height: 16),

                      // Lista de Questões ou Empty State
                      if (_questions.isEmpty) ...[
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 32),
                            child: Column(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF4F46E5).withValues(alpha: 0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.auto_awesome,
                                    size: 36,
                                    color: Color(0xFF4F46E5),
                                  ),
                                ),
                                const SizedBox(height: 14),
                                const Text(
                                  'Nenhuma questão cadastrada ainda',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                ),
                                const SizedBox(height: 6),
                                const Text(
                                  'Adicione questões manualmente usando os botões acima ou gere um banco de questões completo em poucos segundos com IA.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                                ),
                                const SizedBox(height: 18),
                                FilledButton.icon(
                                  onPressed: _openAiQuestionGenerator,
                                  icon: const Icon(Icons.auto_awesome, size: 16),
                                  label: const Text('Gerar Questões com IA'),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ] else ...[
                        ListView.separated(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _questions.length,
                          separatorBuilder: (_, _) => const SizedBox(height: 16),
                          itemBuilder: (context, qIndex) {
                            return _buildQuestionCard(context, qIndex);
                          },
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionCard(BuildContext context, int qIndex) {
    final q = _questions[qIndex];
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Topo do card da questão
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF4F46E5).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '#${qIndex + 1}',
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF4F46E5),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<QuestionType>(
                            value: q.type,
                            isDense: true,
                            onChanged: (newType) {
                              if (newType != null && newType != q.type) {
                                _changeQuestionType(qIndex, newType);
                              }
                            },
                            items: const [
                              DropdownMenuItem(
                                value: QuestionType.multipleChoice,
                                child: Text('Múltipla Escolha',
                                    overflow: TextOverflow.ellipsis),
                              ),
                              DropdownMenuItem(
                                value: QuestionType.trueFalse,
                                child: Text('Certo / Errado',
                                    overflow: TextOverflow.ellipsis),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  tooltip: 'Remover Questão',
                  icon: const Icon(Icons.delete_outline, color: Colors.red),
                  onPressed: () => _removeQuestion(qIndex),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Enunciado
            TextFormField(
              controller: q.statementController,
              maxLines: 3,
              decoration: InputDecoration(
                labelText: 'Enunciado da Questão #${qIndex + 1} *',
                hintText: 'Digite o texto da pergunta...',
              ),
            ),
            const SizedBox(height: 16),

            // Alternativas
            const Text(
              'Alternativas (Selecione a correta):',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: q.options.length,
              separatorBuilder: (_, _) => const SizedBox(height: 8),
              itemBuilder: (context, optIndex) {
                final opt = q.options[optIndex];

                return Row(
                  children: [
                    IconButton(
                      tooltip: opt.isCorrect
                          ? 'Alternativa Correta'
                          : 'Marcar como Correta',
                      icon: Icon(
                        opt.isCorrect
                            ? Icons.radio_button_checked
                            : Icons.radio_button_unchecked,
                        color: opt.isCorrect
                            ? const Color(0xFF10B981)
                            : const Color(0xFF94A3B8),
                      ),
                      onPressed: () {
                        setState(() {
                          for (final other in q.options) {
                            other.isCorrect = false;
                          }
                          opt.isCorrect = true;
                        });
                      },
                    ),
                    Expanded(
                      child: TextFormField(
                        controller: opt.textController,
                        readOnly: q.type == QuestionType.trueFalse,
                        decoration: InputDecoration(
                          hintText: 'Texto da alternativa ${optIndex + 1}',
                          filled: true,
                          fillColor: opt.isCorrect
                              ? (isDark
                                  ? const Color(0xFF064E3B).withValues(alpha: 0.2)
                                  : const Color(0xFFECFDF5))
                              : null,
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 16),

            // Justificativa / Comentário do Gabarito
            TextFormField(
              controller: q.explanationController,
              maxLines: 2,
              decoration: const InputDecoration(
                labelText: 'Justificativa pedagógica / Comentário do Gabarito',
                hintText: 'Explicação detalhada para a revisão do aluno...',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
