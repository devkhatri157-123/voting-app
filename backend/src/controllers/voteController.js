const db = require('../config/db');
const crypto = require('crypto');

// 1. Get All Candidates
exports.getCandidates = async (req, res) => {
  try {
    const candidates = await db.query('SELECT * FROM candidates ORDER BY id ASC');
    res.json(candidates.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// 2. Cast a Vote
exports.castVote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { candidate_id } = req.body;

    // Check if user has already voted
    const userCheck = await db.query('SELECT has_voted FROM users WHERE id = $1', [userId]);
    if (userCheck.rows[0].has_voted) {
      return res.status(400).json({ error: 'You have already cast your vote!' });
    }

    // Check if candidate exists
    const candidateCheck = await db.query('SELECT * FROM candidates WHERE id = $1', [candidate_id]);
    if (candidateCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate not found!' });
    }

    // Generate Unique Anonymized Receipt Hash
    const receiptHash = crypto.createHash('sha256').update(userId + String(candidate_id) + Date.now()).digest('hex');

    // Begin Transaction
    await db.query('BEGIN');

    // 1. Record the vote
    await db.query(
      'INSERT INTO votes (candidate_id, receipt_hash) VALUES ($1, $2)',
      [candidate_id, receiptHash]
    );

    // 2. Increment vote count for candidate
    await db.query(
      'UPDATE candidates SET vote_count = vote_count + 1 WHERE id = $1',
      [candidate_id]
    );

    // 3. Mark user as voted
    await db.query(
      'UPDATE users SET has_voted = TRUE WHERE id = $1',
      [userId]
    );

    await db.query('COMMIT');

    res.status(201).json({
      message: 'Vote cast successfully!',
      receipt: receiptHash,
    });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Voting Error Details:', err.message);
    res.status(500).json({ error: 'Server Error during voting' });
  }
};