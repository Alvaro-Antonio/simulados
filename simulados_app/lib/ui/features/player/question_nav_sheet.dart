import 'package:flutter/material.dart';

class QuestionNavSheet extends StatelessWidget {
  final int totalQuestions;
  final int currentIndex;
  final Set<String> answeredQuestionIds;
  final List<String> questionIds;
  final ValueChanged<int> onSelectQuestion;

  const QuestionNavSheet({
    super.key,
    required this.totalQuestions,
    required this.currentIndex,
    required this.answeredQuestionIds,
    required this.questionIds,
    required this.onSelectQuestion,
  });

  static void show(
    BuildContext context, {
    required int totalQuestions,
    required int currentIndex,
    required Set<String> answeredQuestionIds,
    required List<String> questionIds,
    required ValueChanged<int> onSelectQuestion,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => QuestionNavSheet(
        totalQuestions: totalQuestions,
        currentIndex: currentIndex,
        answeredQuestionIds: answeredQuestionIds,
        questionIds: questionIds,
        onSelectQuestion: onSelectQuestion,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.4,
      maxChildSize: 0.85,
      expand: false,
      builder: (context, scrollController) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF475569) : const Color(0xFFCBD5E1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Grade de Questões',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    '${answeredQuestionIds.length}/$totalQuestions respondidas',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                'Clique em qualquer número para pular diretamente para a questão.',
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                ),
              ),
              const SizedBox(height: 16),

              Expanded(
                child: GridView.builder(
                  controller: scrollController,
                  gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                    maxCrossAxisExtent: 60,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                  ),
                  itemCount: totalQuestions,
                  itemBuilder: (context, index) {
                    final qId = questionIds[index];
                    final isAnswered = answeredQuestionIds.contains(qId);
                    final isCurrent = index == currentIndex;

                    Color bgColor;
                    Color textColor;
                    Border? border;

                    if (isCurrent) {
                      bgColor = const Color(0xFF4F46E5);
                      textColor = Colors.white;
                      border = Border.all(color: const Color(0xFF6366F1), width: 2);
                    } else if (isAnswered) {
                      bgColor = isDark
                          ? const Color(0xFF312E81)
                          : const Color(0xFFEEF2FF);
                      textColor = const Color(0xFF4F46E5);
                      border = Border.all(color: const Color(0xFF818CF8));
                    } else {
                      bgColor = isDark
                          ? const Color(0xFF1E293B)
                          : const Color(0xFFF1F5F9);
                      textColor = isDark
                          ? const Color(0xFF94A3B8)
                          : const Color(0xFF64748B);
                      border = Border.all(
                        color: isDark
                            ? const Color(0xFF334155)
                            : const Color(0xFFE2E8F0),
                      );
                    }

                    return InkWell(
                      onTap: () {
                        Navigator.of(context).pop();
                        onSelectQuestion(index);
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: bgColor,
                          borderRadius: BorderRadius.circular(12),
                          border: border,
                        ),
                        child: Text(
                          '${index + 1}',
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: textColor,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
