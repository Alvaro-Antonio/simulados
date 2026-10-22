import 'package:flutter/material.dart';
import '../../../data/repositories/exam_repository.dart';
import '../../../domain/models/exam_models.dart';
import '../../core/time_formatter.dart';
import '../dashboard/start_exam_dialog.dart';
import '../player/exam_player_view.dart';

const List<String> letters = ['A', 'B', 'C', 'D', 'E', 'F'];

class ExamResultsView extends StatefulWidget {
  final String attemptId;
  final ExamRepository repository;

  const ExamResultsView({
    super.key,
    required this.attemptId,
    required this.repository,
  });

  @override
  State<ExamResultsView> createState() => _ExamResultsViewState();
}

class _ExamResultsViewState extends State<ExamResultsView> {
  bool _isLoading = true;
  String? _errorMessage;
  AttemptResultDetail? _result;

  @override
  void initState() {
    super.initState();
    _loadResult();
  }

  Future<void> _loadResult() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await widget.repository.getAttemptResult(widget.attemptId);
      if (res == null) {
        _errorMessage = 'Resultado não encontrado.';
      } else {
        _result = res;
      }
    } catch (e) {
      _errorMessage = 'Erro ao carregar resultado: $e';
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _onRetakeExam() async {
    if (_result == null) return;
    final exam = await widget.repository.getExamById(_result!.examId);
    if (exam == null || !mounted) return;

    final config = ExamSessionConfig(
      questionCount: _result!.totalQuestions,
      shuffle: true,
    );

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (ctx) => ExamPlayerView(
          examId: exam.id,
          repository: widget.repository,
          config: config,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Resultado do Simulado'),
        actions: [
          IconButton(
            tooltip: 'Voltar ao Início',
            icon: const Icon(Icons.home_outlined),
            onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.error_outline,
                            size: 48, color: Colors.red),
                        const SizedBox(height: 12),
                        Text(_errorMessage!, textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: const Text('Voltar'),
                        ),
                      ],
                    ),
                  ),
                )
              : Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 900),
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Placar Superior
                          _buildScoreHeader(context, _result!),

                          const SizedBox(height: 32),

                          // Título da Revisão
                          Wrap(
                            alignment: WrapAlignment.spaceBetween,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            spacing: 8,
                            runSpacing: 4,
                            children: [
                              const Text(
                                'Revisão Detalhada das Questões',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                '${_result!.totalQuestions} questões analisadas',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: isDark
                                      ? const Color(0xFF94A3B8)
                                      : const Color(0xFF64748B),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),

                          // Lista de Questões com Gabarito
                          ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _result!.questions.length,
                            separatorBuilder: (_, _) =>
                                const SizedBox(height: 16),
                            itemBuilder: (context, index) {
                              return _buildQuestionReviewCard(
                                context,
                                _result!.questions[index],
                                index,
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
    );
  }

  Widget _buildScoreHeader(BuildContext context, AttemptResultDetail result) {
    final pct = result.percentage;
    final incorrectCount = result.totalQuestions - result.totalScore;

    String feedbackLabel;
    String feedbackSubtext;
    Color badgeColor;
    Color bannerBg;
    Color bannerBorder;

    if (pct >= 80) {
      feedbackLabel = 'Excelente Aproveitamento!';
      feedbackSubtext =
          'Parabéns! Você demonstrou forte domínio sobre o conteúdo avaliado.';
      badgeColor = const Color(0xFF10B981);
      bannerBg = const Color(0xFFECFDF5);
      bannerBorder = const Color(0xFFA7F3D0);
    } else if (pct >= 60) {
      feedbackLabel = 'Bom Desempenho!';
      feedbackSubtext =
          'Você está no caminho certo! Revise as questões que errou para fixar os conceitos.';
      badgeColor = const Color(0xFFF59E0B);
      bannerBg = const Color(0xFFFFFBEB);
      bannerBorder = const Color(0xFFFDE68A);
    } else {
      feedbackLabel = 'Continue Praticando!';
      feedbackSubtext =
          'Aproveite o gabarito comentado abaixo para aprender com os erros e tente novamente.';
      badgeColor = const Color(0xFFEF4444);
      bannerBg = const Color(0xFFFEF2F2);
      bannerBorder = const Color(0xFFFECACA);
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Topo do card com título e botões
            LayoutBuilder(
              builder: (context, constraints) {
                final isNarrow = constraints.maxWidth < 550;
                final buttons = Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    OutlinedButton.icon(
                      onPressed: () => Navigator.of(context)
                          .popUntil((route) => route.isFirst),
                      icon: const Icon(Icons.home_outlined, size: 16),
                      label: const Text('Início'),
                    ),
                    ElevatedButton.icon(
                      onPressed: _onRetakeExam,
                      icon: const Icon(Icons.refresh_rounded, size: 16),
                      label: const Text('Refazer Simulado'),
                    ),
                  ],
                );

                if (isNarrow) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'RESULTADO DO SIMULADO',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF4F46E5),
                          letterSpacing: 1,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        result.examTitle,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 12),
                      buttons,
                    ],
                  );
                }

                return Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'RESULTADO DO SIMULADO',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF4F46E5),
                              letterSpacing: 1,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            result.examTitle,
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    buttons,
                  ],
                );
              },
            ),
            const SizedBox(height: 20),

            // Banner de Feedback
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? badgeColor.withValues(alpha: 0.15) : bannerBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? badgeColor.withValues(alpha: 0.3) : bannerBorder,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: badgeColor,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: badgeColor.withValues(alpha: 0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Text(
                      '$pct%',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          feedbackLabel,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: isDark ? Colors.white : const Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          feedbackSubtext,
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark
                                ? const Color(0xFFCBD5E1)
                                : const Color(0xFF475569),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Grid de Métricas Quantitativas
            LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth > 600;
                return GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: isWide ? 4 : 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: isWide ? 1.8 : 1.4,
                  children: [
                    _buildMetricItem(
                      context,
                      title: 'Questões Corretas',
                      value: '${result.totalScore}',
                      icon: Icons.check_circle_outline_rounded,
                      iconColor: const Color(0xFF10B981),
                      bgColor: const Color(0xFFECFDF5),
                      darkBgColor: const Color(0xFF064E3B),
                    ),
                    _buildMetricItem(
                      context,
                      title: 'Erros ou Em Branco',
                      value: '$incorrectCount',
                      icon: Icons.highlight_off_rounded,
                      iconColor: const Color(0xFFEF4444),
                      bgColor: const Color(0xFFFEF2F2),
                      darkBgColor: const Color(0xFF7F1D1D),
                    ),
                    _buildMetricItem(
                      context,
                      title: 'Total de Questões',
                      value: '${result.totalScore} / ${result.totalQuestions}',
                      icon: Icons.quiz_outlined,
                      iconColor: const Color(0xFF6366F1),
                      bgColor: const Color(0xFFEEF2FF),
                      darkBgColor: const Color(0xFF1E1B4B),
                    ),
                    _buildMetricItem(
                      context,
                      title: 'Tempo de Prova',
                      value: result.durationSeconds != null
                          ? TimeFormatter.formatVerbose(result.durationSeconds!)
                          : '--',
                      icon: Icons.timer_outlined,
                      iconColor: const Color(0xFF8B5CF6),
                      bgColor: const Color(0xFFF5F3FF),
                      darkBgColor: const Color(0xFF2E1065),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricItem(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required Color darkBgColor,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: isDark ? darkBgColor : bgColor,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 18, color: iconColor),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 10,
                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionReviewCard(
    BuildContext context,
    AttemptResultQuestion q,
    int index,
  ) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status e Número
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: q.isCorrect
                            ? const Color(0xFF10B981).withValues(alpha: 0.1)
                            : const Color(0xFFEF4444).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        q.isCorrect
                            ? Icons.check_circle_rounded
                            : Icons.cancel_rounded,
                        size: 18,
                        color: q.isCorrect
                            ? const Color(0xFF10B981)
                            : const Color(0xFFEF4444),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'Questão #${index + 1}',
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: q.isCorrect
                        ? const Color(0xFFECFDF5)
                        : const Color(0xFFFEF2F2),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    q.isCorrect ? 'ACERTOU' : 'ERROU',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: q.isCorrect
                          ? const Color(0xFF059669)
                          : const Color(0xFFDC2626),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Enunciado
            Text(
              q.statement,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 18),

            // Alternativas
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: q.options.length,
              separatorBuilder: (_, _) => const SizedBox(height: 8),
              itemBuilder: (context, optIdx) {
                final option = q.options[optIdx];
                final isSelected = q.selectedOptionId == option.id;
                final isCorrectOption = option.isCorrect;

                Color cardBg;
                Color cardBorder;
                Widget? trailingTag;

                if (isCorrectOption) {
                  cardBg = isDark
                      ? const Color(0xFF064E3B).withValues(alpha: 0.3)
                      : const Color(0xFFECFDF5);
                  cardBorder = const Color(0xFF10B981);
                  trailingTag = Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'CORRETA',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  );
                } else if (isSelected && !isCorrectOption) {
                  cardBg = isDark
                      ? const Color(0xFF7F1D1D).withValues(alpha: 0.3)
                      : const Color(0xFFFEF2F2);
                  cardBorder = const Color(0xFFEF4444);
                  trailingTag = Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'SUA RESPOSTA',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  );
                } else {
                  cardBg = isDark
                      ? const Color(0xFF0F172A)
                      : const Color(0xFFF8FAFC);
                  cardBorder = isDark
                      ? const Color(0xFF334155)
                      : const Color(0xFFE2E8F0);
                }

                final letter = optIdx < letters.length
                    ? letters[optIdx]
                    : '${optIdx + 1}';

                return Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: cardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: cardBorder,
                      width: isSelected || isCorrectOption ? 1.5 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: isCorrectOption
                              ? const Color(0xFF10B981)
                              : (isSelected
                                  ? const Color(0xFFEF4444)
                                  : (isDark
                                      ? const Color(0xFF1E293B)
                                      : const Color(0xFFE2E8F0))),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          q.type == QuestionType.trueFalse
                              ? (option.text == 'Certo' ? 'C' : 'E')
                              : letter,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: isCorrectOption || isSelected
                                ? Colors.white
                                : (isDark
                                    ? const Color(0xFFCBD5E1)
                                    : const Color(0xFF334155)),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          option.text,
                          style: const TextStyle(fontSize: 13),
                        ),
                      ),
                      ?trailingTag,
                    ],
                  ),
                );
              },
            ),

            // Justificativa / Comentário Pedagógico
            if (q.explanation != null && q.explanation!.isNotEmpty) ...[
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0xFF1E1B4B).withValues(alpha: 0.5)
                      : const Color(0xFFEEF2FF),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isDark
                        ? const Color(0xFF4338CA).withValues(alpha: 0.4)
                        : const Color(0xFFC7D2FE),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.lightbulb_outline_rounded,
                            size: 16, color: Color(0xFF4F46E5)),
                        SizedBox(width: 6),
                        Text(
                          'Justificativa do Gabarito:',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF4F46E5),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      q.explanation!,
                      style: TextStyle(
                        fontSize: 12,
                        height: 1.4,
                        color: isDark
                            ? const Color(0xFFE0E7FF)
                            : const Color(0xFF312E81),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
