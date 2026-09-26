const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  listQuestions, createQuestion, updateQuestion, deleteQuestion
} = require('../controllers/questionController');

router.get('/', requireAuth, requireAdmin, listQuestions);
router.post('/', requireAuth, requireAdmin, createQuestion);
router.put('/:id', requireAuth, requireAdmin, updateQuestion);
router.delete('/:id', requireAuth, requireAdmin, deleteQuestion);

module.exports = router;
