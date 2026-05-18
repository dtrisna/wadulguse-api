const express = require('express');
const router = express.Router();

const reactionController = require('../controllers/reactionController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reactions
 *   description: API untuk like dan dislike laporan
 */

/**
 * @swagger
 * /api/reactions/laporan/{laporan_id}/like:
 *   post:
 *     summary: Memberikan like pada laporan
 *     tags: [Reactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: laporan_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       201:
 *         description: Like berhasil ditambahkan
 *       200:
 *         description: Like berhasil dibatalkan atau reaction berhasil diubah
 *       401:
 *         description: User belum terautentikasi
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.post('/laporan/:laporan_id/like', authMiddleware, reactionController.likeLaporan);

/**
 * @swagger
 * /api/reactions/laporan/{laporan_id}/dislike:
 *   post:
 *     summary: Memberikan dislike pada laporan
 *     tags: [Reactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: laporan_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       201:
 *         description: Dislike berhasil ditambahkan
 *       200:
 *         description: Dislike berhasil dibatalkan atau reaction berhasil diubah
 *       401:
 *         description: User belum terautentikasi
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.post('/laporan/:laporan_id/dislike', authMiddleware, reactionController.dislikeLaporan);

/**
 * @swagger
 * /api/reactions/laporan/{laporan_id}:
 *   get:
 *     summary: Melihat total like dan dislike pada laporan
 *     tags: [Reactions]
 *     parameters:
 *       - in: path
 *         name: laporan_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Data reaction berhasil diambil
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.get('/laporan/:laporan_id', reactionController.getReactionByLaporan);

/**
 * @swagger
 * /api/reactions/laporan/{laporan_id}:
 *   delete:
 *     summary: Menghapus reaction user pada laporan
 *     tags: [Reactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: laporan_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Reaction berhasil dihapus
 *       401:
 *         description: User belum terautentikasi
 *       500:
 *         description: Terjadi kesalahan pada server
 */
router.delete('/laporan/:laporan_id', authMiddleware, reactionController.hapusReaction);
module.exports = router;