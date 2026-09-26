const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { startTest, saveAnswer, submitTest, reviewTest, history } = require('../controllers/testController');

router.use(requireAuth); // every route below requires a logged-in user

router.post('/start', startTest);
router.patch('/:testId/answer', saveAnswer);
router.post('/:testId/submit', submitTest);
router.get('/:testId/review', reviewTest);
router.get('/history', history);

module.exports = router;
