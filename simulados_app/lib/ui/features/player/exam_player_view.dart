import 'package:flutter/material.dart';
import '../../../data/repositories/exam_repository.dart';
import '../../../domain/models/exam_models.dart';
import '../../core/exam_timer_widget.dart';
import '../../core/time_formatter.dart';
import '../dashboard/start_exam_dialog.dart';
import '../results/exam_results_view.dart';
import 'exam_player_view_model.dart';
import 'question_nav_sheet.dart';

const List<String> letters = ['A', 'B', 'C', 'D', 'E', 'F'];

class ExamPlayerView extends StatefulWidget {
  final String examId;
  final ExamRepository repository;
  final ExamSessionConfig config;

  const ExamPlayerView({
    super.key,
    required this.examId,
    required this.repository,
    required this.config,
  });

  @override
  State<ExamPlayerView> createState() => _ExamPlayerViewState();
}

class _ExamPlayerViewState extends State<ExamPlayerView> {
  late final ExamPlayerViewModel _viewModel;

  @override
  void initState() {
    super.initState();
    _viewModel = ExamPlayerViewModel(
      examId: widget.examId,
      repository: widget.repository,
      config: widget.config,
    );
    _viewModel.init();
  }

  void _onOpenNavSheet() {
    QuestionNavSheet.show(
      context,
      totalQuestions: _viewModel.totalQuestions,
      currentIndex: _viewModel.currentIndex,
      answeredQuestionIds: _viewModel.answers.keys.toSet(),
      questionIds: _viewModel.sessionQuestions.map((q) => q.id).toList(),
      onSelectQuestion: (idx) => _viewModel.goToQuestion(idx),
    );
  }

  void _onFinishExam() async {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final total = _viewModel.totalQuestions;
    final answered = _viewModel.answeredCount;
    final remaining = total - answered;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF4F46E5).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(
                Icons.check_circle_outline_rounded,
                color: Color(0xFF4F46E5),
                size: 24,
              ),
            ),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'Finalizar Simulado?',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Você respondeu $answered de $total questões.',
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 12),

            // Tempo decorrido
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.timer_outlined,
                      size: 18, color: Color(0xFF4F46E5)),
                  const SizedBox(width: 8),
                  Text(
                    'Tempo de prova: ',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                  ),
                  Text(
                    TimeFormatter.formatVerbose(_viewModel.elapsedSeconds),
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
            ),

            if (remaining > 0) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFFBEB),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFFDE68A)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.warning_amber_rounded,
                        size: 18, color: Color(0xFFD97706)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Atenção: restam $remaining questão(ões) sem resposta marcada.',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF92400E),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Voltar à Prova'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Confirmar e Ver Resultado'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      try {
        final attemptId = await _viewModel.submitExam();
        if (mounted) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (ctx) => ExamResultsView(
                attemptId: attemptId,
                repository: widget.repository,
              ),
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Erro ao submeter tentativa: $e')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: ListenableBuilder(
          listenable: _viewModel,
          builder: (context, _) {
            final exam = _viewModel.exam;
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      Text(
                        exam?.category ?? 'Simulado',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF4F46E5),
                        ),
                      ),
                      if (widget.config.questionCount <
                          (exam?.questions.length ?? 0)) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 1),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFFBEB),
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: const Color(0xFFFDE68A)),
                          ),
                          child: Text(
                            '${widget.config.questionCount} de ${exam?.questions.length} do banco',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFFB45309),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                Text(
                  exam?.title ?? 'Carregando...',
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      fontSize: 14, fontWeight: FontWeight.bold),
                ),
              ],
            );
          },
        ),
        actions: [
          ListenableBuilder(
            listenable: _viewModel,
            builder: (context, _) {
              if (_viewModel.isLoading || _viewModel.errorMessage != null) {
                return const SizedBox.shrink();
              }

              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Cronômetro
                    ExamTimerWidget(
                      seconds: _viewModel.elapsedSeconds,
                      isPaused: _viewModel.isPaused,
                      onTogglePause: _viewModel.togglePause,
                    ),
                    const SizedBox(width: 4),

                    if (MediaQuery.of(context).size.width >= 600) ...[
                      // Botão da Grade (Desktop/Tablet)
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 8),
                        ),
                        onPressed: _onOpenNavSheet,
                        icon: const Icon(Icons.grid_view_rounded, size: 16),
                        label: Text(
                          '${_viewModel.answeredCount}/${_viewModel.totalQuestions}',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ),
                      const SizedBox(width: 8),

                      // Botão Finalizar (Desktop/Tablet)
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 8),
                        ),
                        onPressed: _onFinishExam,
                        icon: const Icon(Icons.send_rounded, size: 15),
                        label: const Text('Finalizar',
                            style: TextStyle(fontSize: 12)),
                      ),
                    ] else ...[
                      // Botão da Grade (Mobile)
                      IconButton(
                        tooltip:
                            'Navegar Questões (${_viewModel.answeredCount}/${_viewModel.totalQuestions})',
                        onPressed: _onOpenNavSheet,
                        icon: Badge.count(
                          count: _viewModel.answeredCount,
                          backgroundColor: const Color(0xFF4F46E5),
                          child: const Icon(Icons.grid_view_rounded),
                        ),
                      ),
                    ],
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: ListenableBuilder(
        listenable: _viewModel,
        builder: (context, _) {
          if (_viewModel.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (_viewModel.errorMessage != null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.error_outline, size: 48, color: Colors.red),
                    const SizedBox(height: 12),
                    Text(
                      _viewModel.errorMessage!,
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            );
          }

          final currentQ = _viewModel.currentQuestion;
          if (currentQ == null) {
            return const Center(child: Text('Nenhuma questão para exibir.'));
          }

          final selectedOptionId = _viewModel.answers[currentQ.id];

          return Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 850),
              child: Column(
                children: [
                  // Banner de Pausa
                  if (_viewModel.isPaused)
                    Container(
                      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF3C7),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFFDE68A)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.pause_circle_outline,
                              color: Color(0xFFD97706), size: 20),
                          const SizedBox(width: 10),
                          const Expanded(
                            child: Text(
                              'Cronômetro pausado. O tempo de prova está congelado.',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF92400E),
                              ),
                            ),
                          ),
                          TextButton.icon(
                            style: TextButton.styleFrom(
                              foregroundColor: const Color(0xFFB45309),
                            ),
                            onPressed: _viewModel.resume,
                            icon: const Icon(Icons.play_arrow, size: 16),
                            label: const Text('Retomar',
                                style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ),

                  // Barra de Progresso
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Questão ${_viewModel.currentIndex + 1} de ${_viewModel.totalQuestions}',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: isDark
                                    ? const Color(0xFFCBD5E1)
                                    : const Color(0xFF334155),
                              ),
                            ),
                            Text(
                              '${_viewModel.progressPercent}% respondido',
                              style: TextStyle(
                                fontSize: 12,
                                color: isDark
                                    ? const Color(0xFF94A3B8)
                                    : const Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(6),
                          child: LinearProgressIndicator(
                            value: _viewModel.totalQuestions > 0
                                ? _viewModel.answeredCount /
                                    _viewModel.totalQuestions
                                : 0,
                            minHeight: 6,
                            backgroundColor: isDark
                                ? const Color(0xFF1E293B)
                                : const Color(0xFFE2E8F0),
                            valueColor: const AlwaysStoppedAnimation<Color>(
                              Color(0xFF4F46E5),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Card da Questão com Rolagem
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(20),
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Cabeçalho da Questão: Tag e Limpar
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF4F46E5)
                                              .withValues(alpha: 0.1),
                                          borderRadius:
                                              BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          'Questão #${_viewModel.currentIndex + 1}',
                                          style: const TextStyle(
                                            fontFamily: 'monospace',
                                            fontSize: 12,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF4F46E5),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        currentQ.type ==
                                                QuestionType.trueFalse
                                            ? 'Certo / Errado'
                                            : 'Múltipla Escolha',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: isDark
                                              ? const Color(0xFF94A3B8)
                                              : const Color(0xFF64748B),
                                        ),
                                      ),
                                    ],
                                  ),
                                  if (selectedOptionId != null)
                                    TextButton.icon(
                                      style: TextButton.styleFrom(
                                        foregroundColor: const Color(0xFFEF4444),
                                        padding: EdgeInsets.zero,
                                      ),
                                      onPressed: () => _viewModel
                                          .clearAnswer(currentQ.id),
                                      icon: const Icon(Icons.refresh, size: 14),
                                      label: const Text('Limpar resposta',
                                          style: TextStyle(fontSize: 11)),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 16),

                              // Enunciado
                              Text(
                                currentQ.statement,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  height: 1.5,
                                ),
                              ),
                              const SizedBox(height: 24),

                              // Alternativas
                              ListView.separated(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: currentQ.options.length,
                                separatorBuilder: (_, _) =>
                                    const SizedBox(height: 12),
                                itemBuilder: (context, optIdx) {
                                  final option = currentQ.options[optIdx];
                                  final isSelected =
                                      selectedOptionId == option.id;

                                  final letter = optIdx < letters.length
                                      ? letters[optIdx]
                                      : '${optIdx + 1}';

                                  Color cardBg;
                                  Color cardBorder;
                                  if (isSelected) {
                                    cardBg = isDark
                                        ? const Color(0xFF312E81)
                                            .withValues(alpha: 0.5)
                                        : const Color(0xFFEEF2FF);
                                    cardBorder = const Color(0xFF4F46E5);
                                  } else {
                                    cardBg = isDark
                                        ? const Color(0xFF0F172A)
                                        : Colors.white;
                                    cardBorder = isDark
                                        ? const Color(0xFF334155)
                                        : const Color(0xFFE2E8F0);
                                  }

                                  return InkWell(
                                    onTap: () => _viewModel.selectOption(
                                        currentQ.id, option.id),
                                    borderRadius: BorderRadius.circular(16),
                                    child: AnimatedContainer(
                                      duration:
                                          const Duration(milliseconds: 150),
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        color: cardBg,
                                        borderRadius:
                                            BorderRadius.circular(16),
                                        border: Border.all(
                                          color: cardBorder,
                                          width: isSelected ? 2 : 1,
                                        ),
                                      ),
                                      child: Row(
                                        children: [
                                          // Badge da Letra
                                          Container(
                                            width: 32,
                                            height: 32,
                                            alignment: Alignment.center,
                                            decoration: BoxDecoration(
                                              color: isSelected
                                                  ? const Color(0xFF4F46E5)
                                                  : (isDark
                                                      ? const Color(0xFF1E293B)
                                                      : const Color(0xFFF1F5F9)),
                                              borderRadius:
                                                  BorderRadius.circular(8),
                                              border: Border.all(
                                                color: isSelected
                                                    ? const Color(0xFF4F46E5)
                                                    : (isDark
                                                        ? const Color(0xFF334155)
                                                        : const Color(0xFFCBD5E1)),
                                              ),
                                            ),
                                            child: Text(
                                              currentQ.type ==
                                                      QuestionType.trueFalse
                                                  ? (option.text == 'Certo'
                                                      ? 'C'
                                                      : 'E')
                                                  : letter,
                                              style: TextStyle(
                                                fontSize: 13,
                                                fontWeight: FontWeight.bold,
                                                color: isSelected
                                                    ? Colors.white
                                                    : (isDark
                                                        ? const Color(0xFFE2E8F0)
                                                        : const Color(0xFF334155)),
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 14),

                                          // Texto da Alternativa
                                          Expanded(
                                            child: Text(
                                              option.text,
                                              style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: isSelected
                                                    ? FontWeight.w600
                                                    : FontWeight.normal,
                                                color: isSelected && !isDark
                                                    ? const Color(0xFF1E1B4B)
                                                    : null,
                                              ),
                                            ),
                                          ),

                                          // Check Icon
                                          if (isSelected)
                                            const Icon(
                                              Icons.check_circle_rounded,
                                              color: Color(0xFF4F46E5),
                                              size: 20,
                                            ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Rodapé de Navegação
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF0F172A) : Colors.white,
                      border: Border(
                        top: BorderSide(
                          color: isDark
                              ? const Color(0xFF1E293B)
                              : const Color(0xFFE2E8F0),
                        ),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        OutlinedButton.icon(
                          onPressed: _viewModel.currentIndex > 0
                              ? _viewModel.previousQuestion
                              : null,
                          icon: const Icon(Icons.arrow_back_rounded, size: 16),
                          label: const Text('Anterior'),
                        ),
                        if (_viewModel.currentIndex <
                            _viewModel.totalQuestions - 1)
                          ElevatedButton.icon(
                            onPressed: _viewModel.nextQuestion,
                            icon: const Icon(Icons.arrow_forward_rounded,
                                size: 16),
                            label: const Text('Próxima'),
                          )
                        else
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF4F46E5),
                            ),
                            onPressed: _onFinishExam,
                            icon: const Icon(Icons.send_rounded, size: 16),
                            label: const Text('Revisar e Finalizar'),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
