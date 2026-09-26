const db = require('../db/connection');

// POST /api/tests/start
// body: { subject?: string, count?: number, durationSeconds?: number }
function startTest(req, res) {
  const userId = req.user.id;
  const { subject, count = 10, durationSeconds = 600 } = req.body || {};

  let pool;
  if (subject) {
    pool = db.prepare('SELECT id FROM questions WHERE subject = ?').all(subject);
  } else {
    pool = db.prepare('SELECT id FROM questions').all();
  }

  if (pool.length === 0) {
    return res.status(404).json({ error: 'No questions available for this filter.' });
  }

  // shuffle and pick `count`
  const shuffled = pool.map(r => r.id).sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  const insertTest = db.prepare(`
    INSERT INTO tests (user_id, subject_filter, total_questions, duration_seconds)
    VALUES (?, ?, ?, ?)
  `);
  const testInfo = insertTest.run(userId, subject || null, selected.length, durationSeconds);
  const testId = testInfo.lastInsertRowid;

  const insertTQ = db.prepare(`
    INSERT INTO test_questions (test_id, question_id, position)
    VALUES (?, ?, ?)
  `);
  const insertMany = db.transaction((ids) => {
    ids.forEach((qid, idx) => insertTQ.run(testId, qid, idx + 1));
  });
  insertMany(selected);

  // Return questions WITHOUT the correct answer
  const questions = db.prepare(`
    SELECT q.id AS question_id, q.subject, q.question_text,
           q.option_a, q.option_b, q.option_c, q.option_d,
           tq.position
    FROM test_questions tq
    JOIN questions q ON q.id = tq.question_id
    WHERE tq.test_id = ?
    ORDER BY tq.position
  `).all(testId);

  res.status(201).json({
    testId,
    durationSeconds,
    totalQuestions: questions.length,
    questions
  });
}

// PATCH /api/tests/:testId/answer
// body: { questionId: number, selectedOption: 'A'|'B'|'C'|'D'|null }
function saveAnswer(req, res) {
  const userId = req.user.id;
  const { testId } = req.params;
  const { questionId, selectedOption } = req.body;

  const test = db.prepare('SELECT * FROM tests WHERE id = ? AND user_id = ?').get(testId, userId);
  if (!test) return res.status(404).json({ error: 'Test not found.' });
  if (test.status !== 'in_progress') {
    return res.status(400).json({ error: 'This test is no longer in progress.' });
  }

  if (selectedOption !== null && !['A', 'B', 'C', 'D'].includes(selectedOption)) {
    return res.status(400).json({ error: 'selectedOption must be A, B, C, D or null.' });
  }

  const result = db.prepare(`
    UPDATE test_questions SET selected_option = ?
    WHERE test_id = ? AND question_id = ?
  `).run(selectedOption, testId, questionId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Question not part of this test.' });
  }

  res.json({ ok: true });
}

// POST /api/tests/:testId/submit
function submitTest(req, res) {
  const userId = req.user.id;
  const { testId } = req.params;

  const test = db.prepare('SELECT * FROM tests WHERE id = ? AND user_id = ?').get(testId, userId);
  if (!test) return res.status(404).json({ error: 'Test not found.' });
  if (test.status !== 'in_progress') {
    return res.status(400).json({ error: 'This test has already been submitted.' });
  }

  const rows = db.prepare(`
    SELECT tq.id, tq.selected_option, q.correct_option
    FROM test_questions tq
    JOIN questions q ON q.id = tq.question_id
    WHERE tq.test_id = ?
  `).all(testId);

  let correct = 0, wrong = 0, skipped = 0;
  const updateRow = db.prepare('UPDATE test_questions SET is_correct = ? WHERE id = ?');

  const grading = db.transaction(() => {
    for (const row of rows) {
      if (row.selected_option === null || row.selected_option === undefined) {
        skipped++;
        updateRow.run(null, row.id);
      } else if (row.selected_option === row.correct_option) {
        correct++;
        updateRow.run(1, row.id);
      } else {
        wrong++;
        updateRow.run(0, row.id);
      }
    }
  });
  grading();

  const score = Number((correct * test.marks_per_correct - wrong * test.negative_marks).toFixed(2));

  db.prepare(`
    UPDATE tests SET status = 'submitted', submitted_at = datetime('now'),
      score = ?, correct_count = ?, wrong_count = ?, skipped_count = ?
    WHERE id = ?
  `).run(score, correct, wrong, skipped, testId);

  res.json({
    testId: Number(testId),
    score,
    correctCount: correct,
    wrongCount: wrong,
    skippedCount: skipped,
    totalQuestions: test.total_questions
  });
}

// GET /api/tests/:testId/review
function reviewTest(req, res) {
  const userId = req.user.id;
  const { testId } = req.params;

  const test = db.prepare('SELECT * FROM tests WHERE id = ? AND user_id = ?').get(testId, userId);
  if (!test) return res.status(404).json({ error: 'Test not found.' });
  if (test.status === 'in_progress') {
    return res.status(400).json({ error: 'Submit the test before reviewing it.' });
  }

  const items = db.prepare(`
    SELECT q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
           q.correct_option, q.explanation, tq.selected_option, tq.is_correct, tq.position
    FROM test_questions tq
    JOIN questions q ON q.id = tq.question_id
    WHERE tq.test_id = ?
    ORDER BY tq.position
  `).all(testId);

  res.json({ test, items });
}

// GET /api/tests/history
function history(req, res) {
  const userId = req.user.id;
  const tests = db.prepare(`
    SELECT id, subject_filter, total_questions, score, correct_count, wrong_count,
           skipped_count, status, started_at, submitted_at
    FROM tests WHERE user_id = ? ORDER BY started_at DESC
  `).all(userId);
  res.json({ tests });
}

module.exports = { startTest, saveAnswer, submitTest, reviewTest, history };
