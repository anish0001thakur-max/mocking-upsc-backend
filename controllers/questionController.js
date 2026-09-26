const db = require('../db/connection');

// GET /api/questions?subject=Polity  (admin: full list with answers)
function listQuestions(req, res) {
  const { subject } = req.query;
  const rows = subject
    ? db.prepare('SELECT * FROM questions WHERE subject = ? ORDER BY id DESC').all(subject)
    : db.prepare('SELECT * FROM questions ORDER BY id DESC').all();
  res.json({ questions: rows });
}

// POST /api/questions  (admin only)
function createQuestion(req, res) {
  const {
    subject, topic, difficulty = 'medium', question_text,
    option_a, option_b, option_c, option_d, correct_option, explanation
  } = req.body;

  if (!subject || !question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
    return res.status(400).json({ error: 'subject, question_text, all four options and correct_option are required.' });
  }
  if (!['A', 'B', 'C', 'D'].includes(correct_option)) {
    return res.status(400).json({ error: 'correct_option must be A, B, C or D.' });
  }

  const info = db.prepare(`
    INSERT INTO questions
      (subject, topic, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(subject, topic || null, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation || null);

  res.status(201).json({ id: info.lastInsertRowid });
}

// PUT /api/questions/:id  (admin only)
function updateQuestion(req, res) {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM questions WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Question not found.' });

  const merged = { ...existing, ...req.body };
  db.prepare(`
    UPDATE questions SET subject=?, topic=?, difficulty=?, question_text=?,
      option_a=?, option_b=?, option_c=?, option_d=?, correct_option=?, explanation=?
    WHERE id = ?
  `).run(
    merged.subject, merged.topic, merged.difficulty, merged.question_text,
    merged.option_a, merged.option_b, merged.option_c, merged.option_d,
    merged.correct_option, merged.explanation, id
  );

  res.json({ ok: true });
}

// DELETE /api/questions/:id  (admin only)
function deleteQuestion(req, res) {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM questions WHERE id = ?').run(id);
  if (result.changes === 0) return res.status(404).json({ error: 'Question not found.' });
  res.json({ ok: true });
}

module.exports = { listQuestions, createQuestion, updateQuestion, deleteQuestion };
