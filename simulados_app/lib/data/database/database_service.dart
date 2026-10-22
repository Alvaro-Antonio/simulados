import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

class DatabaseService {
  static final DatabaseService instance = DatabaseService._internal();
  DatabaseService._internal();

  Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  @visibleForTesting
  void setDatabaseForTesting(Database db) {
    _database = db;
  }

  static Future<void> createSchema(Database db) async {
    await db.execute('''
      CREATE TABLE folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT,
        icon TEXT,
        is_pinned INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE exams (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        folder_id TEXT,
        is_pinned INTEGER NOT NULL DEFAULT 0,
        icon TEXT,
        image_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE SET NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE questions (
        id TEXT PRIMARY KEY,
        exam_id TEXT NOT NULL,
        statement TEXT NOT NULL,
        explanation TEXT,
        type TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE
      )
    ''');

    await db.execute('''
      CREATE TABLE options (
        id TEXT PRIMARY KEY,
        question_id TEXT NOT NULL,
        text TEXT NOT NULL,
        is_correct INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
      )
    ''');

    await db.execute('''
      CREATE TABLE exam_attempts (
        id TEXT PRIMARY KEY,
        exam_id TEXT NOT NULL,
        started_at TEXT NOT NULL,
        finished_at TEXT,
        total_score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        duration_seconds INTEGER,
        FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE
      )
    ''');

    await db.execute('''
      CREATE TABLE user_answers (
        id TEXT PRIMARY KEY,
        attempt_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        selected_option_id TEXT,
        is_correct INTEGER NOT NULL,
        FOREIGN KEY (attempt_id) REFERENCES exam_attempts (id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
      )
    ''');

    // Índices para otimização de busca e relacionamentos
    await db.execute('CREATE INDEX idx_folders_is_pinned ON folders(is_pinned)');
    await db.execute('CREATE INDEX idx_exams_folder_id ON exams(folder_id)');
    await db.execute('CREATE INDEX idx_exams_is_pinned ON exams(is_pinned)');
    await db.execute('CREATE INDEX idx_questions_exam_id ON questions(exam_id)');
    await db.execute('CREATE INDEX idx_options_question_id ON options(question_id)');
    await db.execute('CREATE INDEX idx_attempts_exam_id ON exam_attempts(exam_id)');
    await db.execute('CREATE INDEX idx_answers_attempt_id ON user_answers(attempt_id)');
  }

  Future<Database> _initDatabase() async {
    // Configura FFI para plataformas Desktop (Linux, Windows, macOS)
    if (!kIsWeb && (Platform.isLinux || Platform.isWindows || Platform.isMacOS)) {
      sqfliteFfiInit();
      databaseFactory = databaseFactoryFfi;
    }

    String dbPath;
    if (!kIsWeb && (Platform.isLinux || Platform.isWindows || Platform.isMacOS)) {
      final appDocDir = await getApplicationDocumentsDirectory();
      final dir = Directory(p.join(appDocDir.path, 'simulados_app'));
      if (!await dir.exists()) {
        await dir.create(recursive: true);
      }
      dbPath = p.join(dir.path, 'simulados.db');
    } else {
      final databasesPath = await getDatabasesPath();
      dbPath = p.join(databasesPath, 'simulados.db');
    }

    return await openDatabase(
      dbPath,
      version: 2,
      onConfigure: (db) async {
        // Habilita suporte a chaves estrangeiras com ON DELETE CASCADE
        await db.execute('PRAGMA foreign_keys = ON');
      },
      onCreate: (db, version) async {
        await createSchema(db);
      },
      onUpgrade: (db, oldVersion, newVersion) async {
        if (oldVersion < 2) {
          // Cria tabela folders
          await db.execute('''
            CREATE TABLE IF NOT EXISTS folders (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              color TEXT,
              icon TEXT,
              is_pinned INTEGER NOT NULL DEFAULT 0,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            )
          ''');

          // Adiciona colunas na tabela exams
          try {
            await db.execute('ALTER TABLE exams ADD COLUMN folder_id TEXT');
          } catch (_) {}
          try {
            await db.execute('ALTER TABLE exams ADD COLUMN is_pinned INTEGER NOT NULL DEFAULT 0');
          } catch (_) {}
          try {
            await db.execute('ALTER TABLE exams ADD COLUMN icon TEXT');
          } catch (_) {}
          try {
            await db.execute('ALTER TABLE exams ADD COLUMN image_url TEXT');
          } catch (_) {}

          // Cria novos índices
          await db.execute('CREATE INDEX IF NOT EXISTS idx_folders_is_pinned ON folders(is_pinned)');
          await db.execute('CREATE INDEX IF NOT EXISTS idx_exams_folder_id ON exams(folder_id)');
          await db.execute('CREATE INDEX IF NOT EXISTS idx_exams_is_pinned ON exams(is_pinned)');
        }
      },
    );
  }

  Future<void> close() async {
    final db = _database;
    if (db != null) {
      await db.close();
      _database = null;
    }
  }
}
