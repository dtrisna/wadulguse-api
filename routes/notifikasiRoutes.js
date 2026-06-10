const express = require("express");

const {
  getNotifikasiByUser,
  sendNotifikasi,
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
 */
router.post("/send", sendNotifikasi);

/**
 * @swagger
 * /api/notifikasi/{user_id}:
 *   get:
 *     summary: Menampilkan notifikasi berdasarkan user
 *     tags: [Notifikasi]
 */
router.get("/:user_id", getNotifikasiByUser);

/**
 * @swagger
 * /api/notifikasi/{id}/read:
 *   put:
 *     summary: Menandai notifikasi sudah dibaca
 *     tags: [Notifikasi]
 */
router.put("/:id/read", readNotifikasi);

/**
 * @swagger
 * /api/notifikasi/{id}:
 *   delete:
 *     summary: Menghapus notifikasi
 *     tags: [Notifikasi]
 */
router.delete("/:id", deleteNotifikasi);

module.exports = router;