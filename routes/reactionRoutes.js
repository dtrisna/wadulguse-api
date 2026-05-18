const express = require('express');
const router = express.Router();

const reactionController = require('../controllers/reactionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/laporan/:laporan_id/like', authMiddleware, reactionController.likeLaporan);
router.post('/laporan/:laporan_id/dislike', authMiddleware, reactionController.dislikeLaporan);
router.get('/laporan/:laporan_id', reactionController.getReactionByLaporan);
router.delete('/laporan/:laporan_id', authMiddleware, reactionController.hapusReaction);

module.exports = router;