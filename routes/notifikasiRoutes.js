const express = require("express");
const pool = require("../config/db");
const admin = require("../config/firebaseAdmin");

const {
  getNotifikasiByUser,
  readNotifikasi,
  deleteNotifikasi,
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
 * /api/notifikasi/send:
 *   post:
 *     summary: Mengirim push notification ke user tertentu
 *     tags: [Notifikasi]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - target_user_id
 *               - pesan
 *             properties:
 *               target_user_id:
 *                 type: integer
 *                 example: 2
 *               judul:
 *                 type: string
 *                 example: Halo B
 *               pesan:
 *                 type: string
 *                 example: Ini notifikasi dari perangkat A
 *               laporan_id:
 *                 type: integer
 *                 nullable: true
 *                 example: null
 *     responses:
 *       200:
 *         description: Push notification berhasil dikirim
 *       400:
 *         description: Data tidak valid atau user belum punya FCM token
 *       404:
 *         description: User tujuan tidak ditemukan
 */
router.post("/send", async (req, res) => {
  try {
    const { target_user_id, judul, pesan, laporan_id } = req.body;

    if (!target_user_id || !pesan) {
      return res.status(400).json({
        success: false,
        message: "target_user_id dan pesan wajib diisi",
      });
    }

    const userResult = await pool.query(
      `
      SELECT id, nama, email, fcm_token
      FROM users
      WHERE id = $1
      `,
      [target_user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tujuan tidak ditemukan",
      });
    }

    const targetUser = userResult.rows[0];

    if (!targetUser.fcm_token) {
      return res.status(400).json({
        success: false,
        message: "User tujuan belum punya FCM token",
      });
    }

    const fcmMessage = {
      token: targetUser.fcm_token,
      notification: {
        title: judul || "Notifikasi Baru",
        body: pesan,
      },
      data: {
        user_id: String(target_user_id),
        laporan_id: laporan_id ? String(laporan_id) : "",
      },
    };

    const fcmResponse = await admin.messaging().send(fcmMessage);

    const notifResult = await pool.query(
      `
      INSERT INTO notifikasi (user_id, judul, pesan, laporan_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        target_user_id,
        judul || "Notifikasi Baru",
        pesan,
        laporan_id || null,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Push notification berhasil dikirim",
      fcm_response: fcmResponse,
      data: notifResult.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengirim push notification",
      error: error.message,
    });
  }
});

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