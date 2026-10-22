import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../data/repositories/exam_repository.dart';
import '../../../domain/models/exam_models.dart';
import '../exam_form/exam_form_view.dart';
import '../player/exam_player_view.dart';
import 'dashboard_view_model.dart';
import 'start_exam_dialog.dart';

class DashboardView extends StatefulWidget {
  final ExamRepository repository;

  const DashboardView({super.key, required this.repository});

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  late final DashboardViewModel _viewModel;

  @override
  void initState() {
    super.initState();
    _viewModel = DashboardViewModel(repository: widget.repository);
    _viewModel.loadDashboard();
  }

  void _onStartExam(ExamSummary exam) async {
    final config = await StartExamDialog.show(context, exam);
    if (config != null && mounted) {
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (ctx) => ExamPlayerView(
            examId: exam.id,
            repository: widget.repository,
            config: config,
          ),
        ),
      ).then((_) => _viewModel.loadDashboard());
    }
  }

  void _onNewExam({String? folderId}) async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (ctx) => ExamFormView(
          repository: widget.repository,
          initialFolderId: folderId ?? _viewModel.selectedFolderId,
        ),
      ),
    );
    if (result == true && mounted) {
      _viewModel.loadDashboard();
    }
  }

  void _onEditExam(ExamSummary exam) async {
    final result = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (ctx) => ExamFormView(
          repository: widget.repository,
          examId: exam.id,
        ),
      ),
    );
    if (result == true && mounted) {
      _viewModel.loadDashboard();
    }
  }

  void _onDeleteExam(ExamSummary exam) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Excluir Simulado'),
        content: Text(
          'Tem certeza que deseja excluir "${exam.title}" e todo o histórico de tentativas? Esta ação não pode ser desfeita.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
            ),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Excluir Definitivamente'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      final success = await _viewModel.deleteExam(exam.id);
      if (success && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Simulado excluído com sucesso.')),
        );
      }
    }
  }

  void _onCreateFolderDialog() async {
    final controller = TextEditingController();
    final formKey = GlobalKey<FormState>();

    final created = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.create_new_folder_outlined, color: Color(0xFF4F46E5)),
            SizedBox(width: 10),
            Text('Nova Pasta'),
          ],
        ),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Agrupe seus simulados por concurso, disciplina ou matéria.',
                style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: controller,
                autofocus: true,
                decoration: InputDecoration(
                  labelText: 'Nome da Pasta *',
                  hintText: 'Ex: Concurso Professor Municipal',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                validator: (val) {
                  if (val == null || val.trim().length < 2) {
                    return 'Informe ao menos 2 caracteres.';
                  }
                  return null;
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (formKey.currentState?.validate() == true) {
                final success = await _viewModel.createFolder(controller.text.trim());
                if (ctx.mounted) {
                  Navigator.of(ctx).pop(success);
                }
              }
            },
            child: const Text('Criar Pasta'),
          ),
        ],
      ),
    );

    if (created == true && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pasta criada com sucesso!')),
      );
    }
  }

  void _onDeleteFolderDialog(FolderModel folder) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Excluir Pasta'),
        content: Text(
          'Deseja excluir a pasta "${folder.name}"? Os simulados desta pasta não serão apagados, apenas desvinculados.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
            ),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Excluir Pasta'),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      await _viewModel.deleteFolder(folder.id);
    }
  }

  IconData _getIconData(String? iconName) {
    switch (iconName) {
      case 'code':
        return Icons.code_rounded;
      case 'scale':
        return Icons.gavel_rounded;
      case 'calculator':
        return Icons.calculate_outlined;
      case 'book-open':
        return Icons.menu_book_rounded;
      case 'stethoscope':
        return Icons.medical_services_outlined;
      case 'globe':
        return Icons.language_rounded;
      case 'award':
        return Icons.emoji_events_outlined;
      case 'graduation-cap':
      default:
        return Icons.school_rounded;
    }
  }

  void _showAboutDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.person_rounded, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 12),
            const Text(
              'Sobre o Desenvolvedor',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: SizedBox(
          width: 420,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Álvaro Antônio',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 2),
              const Text(
                'Desenvolvedor Full-Stack & Mobile',
                style: TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 12),
              const Text(
                'Criador do Sistema de Simulados para estudos pessoais e preparatórios com banco de questões, estatísticas e IA integrada.',
                style: TextStyle(fontSize: 13, height: 1.4),
              ),
              const SizedBox(height: 18),
              // GitHub Card
              InkWell(
                onTap: () {
                  Clipboard.setData(const ClipboardData(text: 'https://github.com/Alvaro-Antonio'));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Link do GitHub copiado para a área de transferência!')),
                  );
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: Theme.of(context).brightness == Brightness.dark
                        ? const Color(0xFF1E293B)
                        : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Theme.of(context).brightness == Brightness.dark
                          ? const Color(0xFF334155)
                          : const Color(0xFFE2E8F0),
                    ),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.code_rounded, size: 20, color: Color(0xFF4F46E5)),
                      SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'GitHub',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              'github.com/Alvaro-Antonio',
                              style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                            ),
                          ],
                        ),
                      ),
                      Icon(Icons.copy_rounded, size: 16, color: Color(0xFF94A3B8)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10),
              // Instagram Card
              InkWell(
                onTap: () {
                  Clipboard.setData(const ClipboardData(text: 'https://instagram.com/hakaishin.dev'));
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Instagram @hakaishin.dev copiado para a área de transferência!')),
                  );
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: Theme.of(context).brightness == Brightness.dark
                        ? const Color(0xFF1E293B)
                        : const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Theme.of(context).brightness == Brightness.dark
                          ? const Color(0xFF334155)
                          : const Color(0xFFE2E8F0),
                    ),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.camera_alt_outlined, size: 20, color: Color(0xFFE1306C)),
                      SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Instagram',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              '@hakaishin.dev',
                              style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                            ),
                          ],
                        ),
                      ),
                      Icon(Icons.copy_rounded, size: 16, color: Color(0xFF94A3B8)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // AI Attribution note
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFEEF2FF),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.auto_awesome, color: Color(0xFF4F46E5), size: 16),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Desenvolvido com auxílio do Agente de IA Antigravity (Google DeepMind).',
                        style: TextStyle(fontSize: 11, color: Color(0xFF4338CA), fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Fechar'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
                ),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                Icons.school_rounded,
                color: Colors.white,
                size: 18,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Sistema de Simulados',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    'SQLite Local Offline',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: _showAboutDialog,
            tooltip: 'Sobre o Desenvolvedor',
            icon: const Icon(Icons.info_outline_rounded, size: 20),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: IconButton.outlined(
              onPressed: _onCreateFolderDialog,
              tooltip: 'Criar Pasta',
              icon: const Icon(Icons.create_new_folder_outlined, size: 20),
            ),
          ),
          Builder(
            builder: (context) {
              final isNarrow = MediaQuery.of(context).size.width < 500;
              if (isNarrow) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: IconButton.filled(
                    onPressed: () => _onNewExam(),
                    tooltip: 'Novo Simulado',
                    icon: const Icon(Icons.add_rounded),
                  ),
                );
              }
              return Padding(
                padding: const EdgeInsets.only(right: 16),
                child: ElevatedButton.icon(
                  onPressed: () => _onNewExam(),
                  icon: const Icon(Icons.add_rounded, size: 18),
                  label: const Text('Novo Simulado'),
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
                      style: const TextStyle(fontSize: 14),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _viewModel.loadDashboard,
                      child: const Text('Tentar Novamente'),
                    ),
                  ],
                ),
              ),
            );
          }

          final pinned = _viewModel.pinnedExams;
          final regular = _viewModel.regularExams;

          return RefreshIndicator(
            onRefresh: _viewModel.loadDashboard,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Barra de Pastas
                  _buildFolderBar(context),

                  const SizedBox(height: 20),

                  // Seção de Fixados no Topo (se houver)
                  if (pinned.isNotEmpty) ...[
                    Row(
                      children: [
                        const Icon(Icons.push_pin_rounded, size: 16, color: Color(0xFFF59E0B)),
                        const SizedBox(width: 6),
                        Text(
                          'FIXADOS NO TOPO (${pinned.length})',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.8,
                            color: Color(0xFFF59E0B),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    _buildExamsGrid(context, pinned),
                    const SizedBox(height: 28),
                  ],

                  // Cabeçalho da Lista Regular
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _viewModel.selectedFolderId != null
                                  ? 'Simulados na Pasta'
                                  : (pinned.isNotEmpty ? 'Outros Simulados' : 'Meus Simulados'),
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Selecione um simulado para estudar ou revisar',
                              style: TextStyle(
                                fontSize: 11,
                                color: isDark
                                    ? const Color(0xFF94A3B8)
                                    : const Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '${_viewModel.exams.length} simulado(s)',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Lista / Grid de Simulados Regulares ou Estado Vazio
                  if (_viewModel.exams.isEmpty)
                    _buildEmptyState(context)
                  else if (regular.isNotEmpty)
                    _buildExamsGrid(context, regular),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildFolderBar(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(Icons.folder_open_rounded, size: 18, color: Color(0xFF4F46E5)),
                const SizedBox(width: 8),
                Text(
                  'PASTAS ORGANIZADORAS',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.8,
                    color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                  ),
                ),
              ],
            ),
            TextButton.icon(
              onPressed: _onCreateFolderDialog,
              icon: const Icon(Icons.add, size: 16),
              label: const Text('Nova Pasta', style: TextStyle(fontSize: 12)),
            ),
          ],
        ),
        const SizedBox(height: 8),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              // Chip "Todos"
              Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  selected: _viewModel.selectedFolderId == null,
                  label: const Text('Todos'),
                  avatar: const Icon(Icons.all_inbox_rounded, size: 16),
                  onSelected: (_) => _viewModel.selectFolder(null),
                ),
              ),

              // Chips das pastas cadastradas
              ..._viewModel.folders.map((folder) {
                final isSelected = _viewModel.selectedFolderId == folder.id;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: InputChip(
                    selected: isSelected,
                    showCheckmark: false,
                    avatar: Icon(
                      folder.isPinned ? Icons.push_pin_rounded : Icons.folder_rounded,
                      size: 16,
                      color: folder.isPinned ? const Color(0xFFF59E0B) : const Color(0xFF4F46E5),
                    ),
                    label: Text('${folder.name} (${folder.examCount})'),
                    onSelected: (_) => _viewModel.selectFolder(isSelected ? null : folder.id),
                    onDeleted: () => _onDeleteFolderDialog(folder),
                    deleteIcon: const Icon(Icons.close, size: 14),
                  ),
                );
              }),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildExamsGrid(BuildContext context, List<ExamSummary> examsList) {
    return LayoutBuilder(
      builder: (context, constraints) {
        int crossAxisCount = 1;
        if (constraints.maxWidth > 900) {
          crossAxisCount = 2;
        }
        if (constraints.maxWidth > 1300) {
          crossAxisCount = 3;
        }

        if (crossAxisCount == 1) {
          return ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: examsList.length,
            separatorBuilder: (_, _) => const SizedBox(height: 14),
            itemBuilder: (context, index) {
              return _buildExamCard(context, examsList[index]);
            },
          );
        }

        return GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            mainAxisExtent: 310,
          ),
          itemCount: examsList.length,
          itemBuilder: (context, index) {
            return _buildExamCard(context, examsList[index]);
          },
        );
      },
    );
  }

  Widget _buildExamCard(BuildContext context, ExamSummary exam) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Linha superior: Categoria, Pasta, Pin e Menu
                Row(
                  children: [
                    // Categoria
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF4F46E5).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        exam.category ?? 'Geral',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF4F46E5),
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),

                    // Pasta
                    if (exam.folderName != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.folder_rounded, size: 12, color: Color(0xFF64748B)),
                            const SizedBox(width: 4),
                            Text(
                              exam.folderName!,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                      ),

                    const Spacer(),

                    // Botão Pin
                    IconButton(
                      icon: Icon(
                        exam.isPinned ? Icons.push_pin_rounded : Icons.push_pin_outlined,
                        size: 18,
                        color: exam.isPinned ? const Color(0xFFF59E0B) : const Color(0xFF94A3B8),
                      ),
                      tooltip: exam.isPinned ? 'Desafixar do topo' : 'Fixar no topo',
                      onPressed: () => _viewModel.togglePinExam(exam.id),
                    ),

                    // Menu Mais Opções
                    PopupMenuButton<String>(
                      icon: const Icon(Icons.more_vert, size: 18),
                      onSelected: (val) {
                        if (val == 'edit') _onEditExam(exam);
                        if (val == 'delete') _onDeleteExam(exam);
                      },
                      itemBuilder: (ctx) => [
                        const PopupMenuItem(
                          value: 'edit',
                          child: Row(
                            children: [
                              Icon(Icons.edit_outlined, size: 18),
                              SizedBox(width: 8),
                              Text('Editar Simulado'),
                            ],
                          ),
                        ),
                        const PopupMenuItem(
                          value: 'delete',
                          child: Row(
                            children: [
                              Icon(Icons.delete_outline, size: 18, color: Colors.red),
                              SizedBox(width: 8),
                              Text('Excluir', style: TextStyle(color: Colors.red)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Ícone / Imagem + Título e Descrição
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: const Color(0xFF4F46E5).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: exam.imageUrl != null && exam.imageUrl!.isNotEmpty
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(10),
                              child: Image.network(
                                exam.imageUrl!,
                                fit: BoxFit.cover,
                                errorBuilder: (_, _, _) => Icon(
                                  _getIconData(exam.icon),
                                  color: const Color(0xFF4F46E5),
                                  size: 22,
                                ),
                              ),
                            )
                          : Icon(
                              _getIconData(exam.icon),
                              color: const Color(0xFF4F46E5),
                              size: 22,
                            ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            exam.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (exam.description != null && exam.description!.isNotEmpty) ...[
                            const SizedBox(height: 2),
                            Text(
                              exam.description!,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 11,
                                color: isDark
                                    ? const Color(0xFF94A3B8)
                                    : const Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),

            // Informações Analíticas do Simulado em Foco: Banco, Tentativas, Média e Última Nota
            Column(
              children: [
                const Divider(height: 16),

                // Grid 2x2 de Métricas do Simulado
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
                    ),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          // Banco de Questões
                          Row(
                            children: [
                              const Icon(Icons.help_outline_rounded, size: 14, color: Color(0xFF6366F1)),
                              const SizedBox(width: 5),
                              Text(
                                '${exam.questionCount} no banco',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                          // Tentativas
                          Row(
                            children: [
                              const Icon(Icons.history_rounded, size: 14, color: Color(0xFF0EA5E9)),
                              const SizedBox(width: 5),
                              Text(
                                exam.attemptsCount > 0 ? '${exam.attemptsCount} tentativa(s)' : 'Sem tentativas',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          // Média de Acerto
                          Row(
                            children: [
                              const Icon(Icons.analytics_outlined, size: 14, color: Color(0xFF10B981)),
                              const SizedBox(width: 5),
                              Text(
                                exam.averagePercentage != null ? 'Média: ${exam.averagePercentage}%' : 'Média: --',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: exam.averagePercentage != null && exam.averagePercentage! >= 70
                                      ? const Color(0xFF10B981)
                                      : const Color(0xFFF59E0B),
                                ),
                              ),
                            ],
                          ),
                          // Última Nota
                          Row(
                            children: [
                              const Icon(Icons.emoji_events_outlined, size: 14, color: Color(0xFFF59E0B)),
                              const SizedBox(width: 5),
                              Text(
                                exam.latestAttempt != null
                                    ? 'Última: ${exam.latestAttempt!.percentage}% (${exam.latestAttempt!.totalScore}/${exam.latestAttempt!.totalQuestions})'
                                    : 'Última: --',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: exam.latestAttempt != null && exam.latestAttempt!.percentage >= 70
                                      ? const Color(0xFF10B981)
                                      : const Color(0xFFF59E0B),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // Botão de Iniciar Simulado
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: exam.questionCount > 0 ? () => _onStartExam(exam) : null,
                    icon: const Icon(Icons.play_arrow_rounded, size: 18),
                    label: const Text('Iniciar Simulado'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          children: [
            const Icon(Icons.menu_book_outlined, size: 54, color: Color(0xFF94A3B8)),
            const SizedBox(height: 12),
            Text(
              _viewModel.selectedFolderId != null
                  ? 'Nenhum simulado nesta pasta'
                  : 'Nenhum simulado cadastrado',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text(
              _viewModel.selectedFolderId != null
                  ? 'Crie um novo simulado nesta pasta ou limpe o filtro.'
                  : 'Crie o seu primeiro simulado para testar seus conhecimentos.',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => _onNewExam(),
              icon: const Icon(Icons.add),
              label: const Text('Criar Simulado'),
            ),
          ],
        ),
      ),
    );
  }
}
