const express = require('express');
const router = express.Router();

const komentarController = require('../controllers/komentarController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Komentar
 *   description: API untuk mengelola komentar laporan
 */

/**
 * @swagger
 * /api/komentar:
 *   post:
 *     summary: Menambahkan komentar pada laporan
 *     tags: [Komentar]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - laporan_id
 *               - komentar
 *             properties:
 *               laporan_id:
 *                 type: integer
 *                 example: 1
 *               komentar:
 *                 type: string
 *                 example: Jalan ini memang perlu segera diperbaiki
 *     responses:
 *       201:
 *         description: Komentar berhasil ditambahkan
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Token tidak valid
 */
router.post('/', authMiddleware, komentarController.tambahKomentar);

/**
 * @swagger
 * /api/komentar:
 *   get:
 *     summary: Melihat semua komentar
 *     tags: [Komentar]
 *     responses:
 *       200:
 *         description: Data komentar berhasil diambil
 */
router.get('/', komentarController.getSemuaKomentar);

/**
 * @swagger
 * /api/komentar/laporan/{laporan_id}:
 *   get:
 *     summary: Melihat komentar berdasarkan laporan
 *     tags: [Komentar]
 *     parameters:
 *       - in: path
 *         name: laporan_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID laporan
 *     responses:
 *       200:
 *         description: Komentar berdasarkan laporan berhasil diambil
 *       400:
 *         description: laporan_id tidak valid
 */
router.get('/laporan/:laporan_id', komentarController.getKomentarByLaporan);

/**
 * @swagger
 * /api/komentar/{id}:
 *   put:
 *     summary: Mengedit komentar
 *     tags: [Komentar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID komentar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - komentar
 *             properties:
 *               komentar:
 *                 type: string
 *                 example: Komentar saya diperbarui
 *     responses:
 *       200:
 *         description: Komentar berhasil diedit
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Komentar tidak ditemukan
 */
router.put('/:id', authMiddleware, komentarController.updateKomentar);

/**
 * @swagger
 * /api/komentar/{id}:
 *   delete:
 *     summary: Menghapus komentar
 *     tags: [Komentar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID komentar
 *     responses:
 *       200:
 *         description: Komentar berhasil dihapus
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Komentar tidak ditemukan
 */
router.delete('/:id', authMiddleware, komentarController.hapusKomentar);

module.exports = router;