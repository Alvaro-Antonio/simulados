import 'package:flutter/material.dart';
import 'time_formatter.dart';

class ExamTimerWidget extends StatefulWidget {
  final int seconds;
  final bool isPaused;
  final VoidCallback onTogglePause;

  const ExamTimerWidget({
    super.key,
    required this.seconds,
    required this.isPaused,
    required this.onTogglePause,
  });

  @override
  State<ExamTimerWidget> createState() => _ExamTimerWidgetState();
}

class _ExamTimerWidgetState extends State<ExamTimerWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);
  }

  @override
  void didUpdateWidget(covariant ExamTimerWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isPaused && _animController.isAnimating) {
      _animController.stop();
    } else if (!widget.isPaused && !_animController.isAnimating) {
      _animController.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final bgColor = widget.isPaused
        ? (isDark ? const Color(0xFF451A03) : const Color(0xFFFEF3C7))
        : (isDark ? const Color(0xFF1E293B) : Colors.white);

    final borderColor = widget.isPaused
        ? (isDark ? const Color(0xFFB45309) : const Color(0xFFFDE68A))
        : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0));

    final textColor = widget.isPaused
        ? (isDark ? const Color(0xFFFDE68A) : const Color(0xFF92400E))
        : (isDark ? const Color(0xFFF1F5F9) : const Color(0xFF1E293B));

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Ponto pulsante
          if (widget.isPaused)
            Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: Color(0xFFF59E0B),
                shape: BoxShape.circle,
              ),
            )
          else
            AnimatedBuilder(
              animation: _animController,
              builder: (context, child) {
                return Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: Color.lerp(
                      const Color(0xFF10B981),
                      const Color(0xFF34D399),
                      _animController.value,
                    ),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF10B981).withValues(
                          alpha: 0.4 * _animController.value,
                        ),
                        blurRadius: 6,
                        spreadRadius: 1,
                      ),
                    ],
                  ),
                );
              },
            ),
          const SizedBox(width: 8),

          // Ícone de Relógio
          Icon(
            Icons.timer_outlined,
            size: 16,
            color: widget.isPaused
                ? const Color(0xFFD97706)
                : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
          ),
          const SizedBox(width: 6),

          // Texto do tempo formatado
          Text(
            TimeFormatter.formatDigital(widget.seconds),
            style: TextStyle(
              fontFamily: 'monospace',
              fontSize: 13,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
              color: textColor,
            ),
          ),

          if (widget.isPaused) ...[
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF78350F) : const Color(0xFFFDE68A),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                'Pausado',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: isDark ? const Color(0xFFFEF3C7) : const Color(0xFF78350F),
                ),
              ),
            ),
          ],

          const SizedBox(width: 4),

          // Botão Pausar / Retomar
          InkWell(
            onTap: widget.onTogglePause,
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.all(4),
              child: Icon(
                widget.isPaused ? Icons.play_arrow_rounded : Icons.pause_rounded,
                size: 18,
                color: widget.isPaused
                    ? const Color(0xFFD97706)
                    : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
