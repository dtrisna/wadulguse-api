const express = require("express");

const {
  getNotifikasiByUser,
  readNotifikasi,
  deleteNotifikasi
} = require("../controllers/notifikasiController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifikasi
 *   description: API untuk mengelola notifikasi user
 */

/**
 * @swagger
 * /api/notifikasi/{user_id}:
 *   get:
 *     summary: Menampilkan notifikasi berdasarkan user
 *     tags: [Notifikasi]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Data notifikasi berhasil diambil
 */
router.get("/:user_id", getNotifikasiByUser);

/**
 * @swagger
 * /api/notifikasi/{id}/read:
 *   put:
 *     summary: Menandai notifikasi sudah dibaca
 *     tags: [Notifikasi]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Notifikasi berhasil ditandai sudah dibaca
 *       404:
 *         description: Notifikasi tidak ditemukan
 */
router.put("/:id/read", readNotifikasi);

/**
 * @swagger
 * /api/notifikasi/{id}:
 *   delete:
 *     summary: Menghapus notifikasi
 *     tags: [Notifikasi]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Notifikasi berhasil dihapus
 *       404:
 *         description: Notifikasi tidak ditemukan
 */
router.delete("/:id", deleteNotifikasi);

module.exports = router;