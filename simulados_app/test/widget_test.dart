import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:simulados_app/ui/core/exam_timer_widget.dart';

void main() {
  testWidgets('ExamTimerWidget renders time and toggles pause state',
      (WidgetTester tester) async {
    bool isPaused = false;
    int seconds = 125; // 02:05

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: StatefulBuilder(
            builder: (context, setState) {
              return ExamTimerWidget(
                seconds: seconds,
                isPaused: isPaused,
                onTogglePause: () {
                  setState(() {
                    isPaused = !isPaused;
                  });
                },
              );
            },
          ),
        ),
      ),
    );

    // Verifica que o tempo formatado 02:05 e o ícone de pausar estão presentes
    expect(find.text('02:05'), findsOneWidget);
    expect(find.byIcon(Icons.pause_rounded), findsOneWidget);
    expect(find.text('Pausado'), findsNothing);

    // Toca no ícone de pausar
    await tester.tap(find.byIcon(Icons.pause_rounded));
    await tester.pumpAndSettle();

    // Verifica que o estado mudou para Pausado e o ícone virou Play
    expect(find.text('02:05'), findsOneWidget);
    expect(find.byIcon(Icons.play_arrow_rounded), findsOneWidget);
    expect(find.text('Pausado'), findsOneWidget);
  });
}
