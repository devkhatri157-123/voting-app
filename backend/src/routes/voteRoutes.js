const express = require('express');
const router = express.Router();
const { getCandidates, castVote } = require('../controllers/voteController');
const auth = require('../middleware/authMiddleware');

router.get('/candidates', getCandidates);
router.post('/vote', auth, castVote);

module.exports = router;