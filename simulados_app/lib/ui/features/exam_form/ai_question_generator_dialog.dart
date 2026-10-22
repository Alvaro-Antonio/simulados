import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:uuid/uuid.dart';
import 'ai_prompt_service.dart';
import 'exam_form_models.dart';

class AiQuestionGeneratorDialog extends StatefulWidget {
  final String? initialTitle;
  final String? initialCategory;
  final int existingQuestionsCount;
  final bool isEditing;
  final void Function({
    required ParsedAiResult parsed,
    String? generatedTitle,
    String? generatedCategory,
    bool replaceExisting,
  })? onStartBackgroundProcessing;

  final void Function({
    required List<QuestionDraft> questions,
    String? generatedTitle,
    String? generatedCategory,
    bool replaceExisting,
  })? onQuestionsImported;

  const AiQuestionGeneratorDialog({
    super.key,
    this.initialTitle,
    this.initialCategory,
    required this.existingQuestionsCount,
    required this.isEditing,
    this.onStartBackgroundProcessing,
    this.onQuestionsImported,
  });

  static Future<void> show({
    required BuildContext context,
    String? initialTitle,
    String? initialCategory,
    required int existingQuestionsCount,
    required bool isEditing,
    void Function({
      required ParsedAiResult parsed,
      String? generatedTitle,
      String? generatedCategory,
      bool replaceExisting,
    })? onStartBackgroundProcessing,
    void Function({
      required List<QuestionDraft> questions,
      String? generatedTitle,
      String? generatedCategory,
      bool replaceExisting,
    })? onQuestionsImported,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AiQuestionGeneratorDialog(
        initialTitle: initialTitle,
        initialCategory: initialCategory,
        existingQuestionsCount: existingQuestionsCount,
        isEditing: isEditing,
        onStartBackgroundProcessing: onStartBackgroundProcessing,
        onQuestionsImported: onQuestionsImported,
      ),
    );
  }

  @override
  State<AiQuestionGeneratorDialog> createState() =>
      _AiQuestionGeneratorDialogState();
}

class _AiQuestionGeneratorDialogState extends State<AiQuestionGeneratorDialog> {
  final Uuid _uuid = const Uuid();
  late final TextEditingController _subjectController;
  late final TextEditingController _extraFocusController;
  late final TextEditingController _responseController;

  int _selectedCount = 10;
  AiQuestionStyle _selectedStyle = AiQuestionStyle.multipleChoice4;
  bool _appendQuestions = true;
  bool _copied = false;
  String? _parseError;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _subjectController = TextEditingController(text: widget.initialTitle ?? '');
    _extraFocusController = TextEditingController(
      text: widget.initialCategory != null && widget.initialCategory!.isNotEmpty
          ? 'Foco: ${widget.initialCategory}'
          : '',
    );
    _responseController = TextEditingController();
    _appendQuestions = widget.existingQuestionsCount > 0;
  }

  @override
  void dispose() {
    _subjectController.dispose();
    _extraFocusController.dispose();
    _responseController.dispose();
    super.dispose();
  }

  String get _currentPrompt {
    final subject = _subjectController.text.trim().isEmpty
        ? 'Conhecimentos Gerais / Concurso'
        : _subjectController.text.trim();

    return AiPromptService.buildPrompt(
      subject: subject,
      count: _selectedCount,
      style: _selectedStyle,
      extraFocus: _extraFocusController.text.trim(),
      isAppending: _appendQuestions && widget.existingQuestionsCount > 0,
      currentQuestionsCount: widget.existingQuestionsCount,
    );
  }

  Future<void> _copyPrompt() async {
    final prompt = _currentPrompt;
    await Clipboard.setData(ClipboardData(text: prompt));
    setState(() => _copied = true);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Prompt copiado com sucesso! Abra o ChatGPT ou Gemini e cole lá.',
          ),
          duration: Duration(seconds: 3),
        ),
      );
    }

    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) setState(() => _copied = false);
    });
  }

  Future<void> _pasteFromClipboard() async {
    final data = await Clipboard.getData(Clipboard.kTextPlain);
    if (data != null && data.text != null && data.text!.isNotEmpty) {
      setState(() {
        _responseController.text = data.text!;
        _parseError = null;
      });
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('A área de transferência está vazia.')),
        );
      }
    }
  }

  void _processAndImport() {
    final rawText = _responseController.text.trim();
    if (rawText.isEmpty) {
      setState(() => _parseError = 'Cole a resposta gerada pela IA antes de processar.');
      return;
    }

    setState(() {
      _isProcessing = true;
      _parseError = null;
    });

    ParsedAiResult parsed;
    try {
      // 1. Valida se o JSON é válido. Se falhar, captura a exceção e NÃO fecha o modal.
      parsed = AiPromptService.parseAiResponse(rawText);
    } catch (e) {
      setState(() {
        _isProcessing = false;
        _parseError = 'Erro no formato do JSON: ${e.toString().replaceAll('FormatException: ', '')}';
      });
      return;
    }

    // 2. O JSON É VÁLIDO!
    // Fecha / minimiza o modal imediatamente
    Navigator.of(context).pop();

    final enteredTitle = _subjectController.text.trim();

    // 3. Notifica a tela para processar a tarefa em segundo plano
    if (widget.onStartBackgroundProcessing != null) {
      widget.onStartBackgroundProcessing!(
        parsed: parsed,
        generatedTitle: enteredTitle.isNotEmpty ? enteredTitle : parsed.title,
        generatedCategory: parsed.category,
        replaceExisting: !_appendQuestions,
      );
    } else if (widget.onQuestionsImported != null) {
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

      widget.onQuestionsImported!(
        questions: drafts,
        generatedTitle: enteredTitle.isNotEmpty ? enteredTitle : parsed.title,
        generatedCategory: parsed.category,
        replaceExisting: !_appendQuestions,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = const Color(0xFF4F46E5);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 680, maxHeight: 780),
        child: Column(
          children: [
            // Cabeçalho do Diálogo
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                border: Border(
                  bottom: BorderSide(
                    color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                  ),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: primaryColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(Icons.auto_awesome, color: primaryColor, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.isEditing
                              ? 'Adicionar Questões com IA'
                              : 'Gerar Simulado com IA',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Crie o prompt ideal para ChatGPT, Gemini, Claude ou DeepSeek',
                          style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                    tooltip: 'Fechar',
                  ),
                ],
              ),
            ),

            // Conteúdo Rolável
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  // PASSO 1: Configuração do Simulado
                  Row(
                    children: [
                      _buildStepBadge('1'),
                      const SizedBox(width: 8),
                      const Text(
                        'Defina os Parâmetros do Simulado',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Título / Tema
                  TextFormField(
                    controller: _subjectController,
                    onChanged: (_) => setState(() {}),
                    decoration: const InputDecoration(
                      labelText: 'Título / Tema do Simulado *',
                      hintText: 'Ex: Direito Constitucional - Art. 5º, AWS Practitioner, etc.',
                      prefixIcon: Icon(Icons.title, size: 20),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Foco / Instruções Extras
                  TextFormField(
                    controller: _extraFocusController,
                    onChanged: (_) => setState(() {}),
                    decoration: const InputDecoration(
                      labelText: 'Tópicos Específicos / Banca / Nível (Opcional)',
                      hintText: 'Ex: Focar na banca Cebraspe, nível intermediário a avançado',
                      prefixIcon: Icon(Icons.filter_center_focus_outlined, size: 20),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Quantidade de Questões
                  const Text(
                    'Quantidade de Questões',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: [5, 10, 15, 20].map((count) {
                      final isSelected = _selectedCount == count;
                      return ChoiceChip(
                        selected: isSelected,
                        label: Text('$count questões'),
                        onSelected: (_) => setState(() => _selectedCount = count),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),

                  // Formato das Questões
                  const Text(
                    'Formato das Questões',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildStyleChip(
                        'Múltipla Escolha (4 alt.)',
                        AiQuestionStyle.multipleChoice4,
                      ),
                      _buildStyleChip(
                        'Múltipla Escolha (5 alt.)',
                        AiQuestionStyle.multipleChoice5,
                      ),
                      _buildStyleChip(
                        'Certo ou Errado',
                        AiQuestionStyle.trueFalse,
                      ),
                      _buildStyleChip(
                        'Misto (Ambos)',
                        AiQuestionStyle.mixed,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Se houver questões existentes: modo de mesclagem
                  if (widget.existingQuestionsCount > 0) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isDark ? const Color(0xFF334155) : const Color(0xFFCBD5E1),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.layers_outlined, size: 18, color: Color(0xFF4F46E5)),
                              const SizedBox(width: 8),
                              Text(
                                'Simulado já possui ${widget.existingQuestionsCount} questão(ões)',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          SwitchListTile(
                            dense: true,
                            contentPadding: EdgeInsets.zero,
                            title: const Text(
                              'Adicionar às questões existentes',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                            subtitle: Text(
                              _appendQuestions
                                  ? 'Manterá as ${widget.existingQuestionsCount} questões atuais e adicionará as novas'
                                  : 'Substituirá todas as ${widget.existingQuestionsCount} questões existentes pelas novas',
                              style: const TextStyle(fontSize: 11),
                            ),
                            value: _appendQuestions,
                            onChanged: (val) => setState(() => _appendQuestions = val),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // PASSO 2: Prompt Otimizado e Cópia
                  const Divider(height: 32),
                  Row(
                    children: [
                      _buildStepBadge('2'),
                      const SizedBox(width: 8),
                      const Text(
                        'Copie o Prompt Otimizado',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'O prompt foi formulado para garantir que a IA responda exatamente no formato compatível com o aplicativo.',
                    style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 12),

                  // Caixa de visualização do prompt
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                      ),
                    ),
                    child: Text(
                      _currentPrompt,
                      maxLines: 8,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF475569),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Botão de Copiar Prompt
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton.icon(
                      onPressed: _copyPrompt,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _copied ? const Color(0xFF10B981) : primaryColor,
                        foregroundColor: Colors.white,
                      ),
                      icon: Icon(_copied ? Icons.check_circle_rounded : Icons.copy_rounded, size: 18),
                      label: Text(
                        _copied ? 'Prompt Copiado com Sucesso!' : 'Copiar Prompt para ChatGPT / Gemini',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),

                  // PASSO 3: Colar e Processar
                  const Divider(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          _buildStepBadge('3'),
                          const SizedBox(width: 8),
                          const Text(
                            'Cole a Resposta da IA',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                        ],
                      ),
                      TextButton.icon(
                        onPressed: _pasteFromClipboard,
                        icon: const Icon(Icons.paste_rounded, size: 16),
                        label: const Text('Colar', style: TextStyle(fontSize: 12)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Cole o texto retornado pela IA. O aplicativo extrai e valida as questões automaticamente.',
                    style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 10),

                  TextField(
                    controller: _responseController,
                    maxLines: 7,
                    style: const TextStyle(fontFamily: 'monospace', fontSize: 11),
                    decoration: InputDecoration(
                      hintText: '[\n  {\n    "statement": "...",\n    "type": "MULTIPLE_CHOICE",\n    "options": [...]\n  }\n]',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),

                  if (_parseError != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFEF4444)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.error_outline, color: Color(0xFFEF4444), size: 18),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _parseError!,
                              style: const TextStyle(color: Color(0xFFB91C1C), fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),

            // Rodapé com Ações
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(20)),
                border: Border(
                  top: BorderSide(
                    color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                  ),
                ),
              ),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final isNarrow = constraints.maxWidth < 420;
                  if (isNarrow) {
                    return Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        FilledButton.icon(
                          onPressed: _isProcessing ? null : _processAndImport,
                          icon: _isProcessing
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2, color: Colors.white),
                                )
                              : const Icon(Icons.add_task_rounded, size: 18),
                          label: Text(
                            _isProcessing
                                ? 'Processando...'
                                : 'Processar e Adicionar Questões',
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(height: 6),
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: const Text('Cancelar'),
                        ),
                      ],
                    );
                  }

                  return Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Cancelar'),
                      ),
                      const SizedBox(width: 12),
                      Flexible(
                        child: FilledButton.icon(
                          onPressed: _isProcessing ? null : _processAndImport,
                          icon: _isProcessing
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(
                                      strokeWidth: 2, color: Colors.white),
                                )
                              : const Icon(Icons.add_task_rounded, size: 18),
                          label: Text(
                            _isProcessing
                                ? 'Processando...'
                                : 'Processar e Adicionar Questões',
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepBadge(String number) {
    return Container(
      width: 24,
      height: 24,
      alignment: Alignment.center,
      decoration: const BoxDecoration(
        color: Color(0xFF4F46E5),
        shape: BoxShape.circle,
      ),
      child: Text(
        number,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildStyleChip(String label, AiQuestionStyle style) {
    final isSelected = _selectedStyle == style;
    return ChoiceChip(
      selected: isSelected,
      label: Text(label),
      onSelected: (_) => setState(() => _selectedStyle = style),
    );
  }
}
