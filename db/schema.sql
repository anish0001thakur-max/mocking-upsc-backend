-- MocKing UPSC database schema (SQLite)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student', -- 'student' or 'admin'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT NOT NULL,            -- 'Polity', 'History', 'Geography', 'Economy', etc.
  topic TEXT,                       -- optional finer-grained tag
  difficulty TEXT NOT NULL DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A','B','C','D')),
  explanation TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  subject_filter TEXT,              -- null means mixed subjects
  total_questions INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  marks_per_correct REAL NOT NULL DEFAULT 2,
  negative_marks REAL NOT NULL DEFAULT 0.66,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  submitted_at TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'submitted', 'expired'
  score REAL,
  correct_count INTEGER,
  wrong_count INTEGER,
  skipped_count INTEGER
);

CREATE TABLE IF NOT EXISTS test_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_id INTEGER NOT NULL REFERENCES tests(id),
  question_id INTEGER NOT NULL REFERENCES questions(id),
  position INTEGER NOT NULL,        -- order within the test
  selected_option TEXT CHECK (selected_option IN ('A','B','C','D') OR selected_option IS NULL),
  is_correct INTEGER                -- 1, 0, or NULL if unattempted
);

CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_tests_user ON tests(user_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_test ON test_questions(test_id);
