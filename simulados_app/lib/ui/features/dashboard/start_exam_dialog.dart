import 'package:flutter/material.dart';
import '../../../domain/models/exam_models.dart';

class ExamSessionConfig {
  final int questionCount;
  final bool shuffle;

  const ExamSessionConfig({
    required this.questionCount,
    required this.shuffle,
  });
}

class StartExamDialog extends StatefulWidget {
  final ExamSummary exam;

  const StartExamDialog({super.key, required this.exam});

  static Future<ExamSessionConfig?> show(BuildContext context, ExamSummary exam) {
    return showDialog<ExamSessionConfig>(
      context: context,
      builder: (ctx) => StartExamDialog(exam: exam),
    );
  }

  @override
  State<StartExamDialog> createState() => _StartExamDialogState();
}

class _StartExamDialogState extends State<StartExamDialog> {
  late int _selectedCount;
  bool _shuffle = true;

  @override
  void initState() {
    super.initState();
    _selectedCount = widget.exam.questionCount;
  }

  @override
  Widget build(BuildContext context) {
    final total = widget.exam.questionCount;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final options = <int>[];
    for (final count in [10, 20, 30, 50, 100]) {
      if (count < total) {
        options.add(count);
      }
    }
    if (!options.contains(total)) {
      options.add(total);
    }

    return AlertDialog(
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
              Icons.play_arrow_rounded,
              color: Color(0xFF4F46E5),
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Configurar Sessão',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : const Color(0xFF0F172A),
              ),
            ),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.exam.title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 16),

            // Informações do Banco
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.storage_outlined,
                    size: 18,
                    color: Color(0xFF4F46E5),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Banco com $total questões disponíveis',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: isDark ? const Color(0xFFE2E8F0) : const Color(0xFF334155),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Text(
              'Quantas questões deseja responder?',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),

            // Opções de Amostragem em Chips
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: options.map((count) {
                final isSelected = _selectedCount == count;
                return ChoiceChip(
                  label: Text(
                    count == total ? 'Todas ($count)' : '$count questões',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      color: isSelected ? Colors.white : null,
                    ),
                  ),
                  selected: isSelected,
                  selectedColor: const Color(0xFF4F46E5),
                  onSelected: (val) {
                    if (val) {
                      setState(() => _selectedCount = count);
                    }
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 20),

            // Switch de Embaralhamento
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text(
                'Embaralhar questões (Shuffle)',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
              ),
              subtitle: const Text(
                'Sorteia uma ordem aleatória a cada tentativa',
                style: TextStyle(fontSize: 11),
              ),
              value: _shuffle,
              activeThumbColor: const Color(0xFF4F46E5),
              onChanged: (val) => setState(() => _shuffle = val),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancelar'),
        ),
        ElevatedButton.icon(
          onPressed: () {
            Navigator.of(context).pop(
              ExamSessionConfig(
                questionCount: _selectedCount,
                shuffle: _shuffle,
              ),
            );
          },
          icon: const Icon(Icons.arrow_forward_rounded, size: 16),
          label: const Text('Iniciar Prova'),
        ),
      ],
    );
  }
}
