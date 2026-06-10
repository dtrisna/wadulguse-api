const express = require("express");

const {
  getOrCreateChatRoom,
  sendMessage,
  getMessagesByRoom,
  markMessagesAsRead,
} = require("../controllers/chatController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: API untuk fitur chat user dan admin
 */

/**
 * @swagger
 * /api/chat/room:
 *   post:
 *     summary: Membuat atau mengambil room chat user dan admin
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - admin_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 4
 *               admin_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Room chat sudah ada
 *       201:
 *         description: Room chat berhasil dibuat
 *       400:
 *         description: user_id dan admin_id wajib diisi
 *       500:
 *         description: Terjadi kesalahan server
 */
router.post("/room", getOrCreateChatRoom);

/**
 * @swagger
 * /api/chat/message:
 *   post:
 *     summary: Mengirim pesan chat
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room_id
 *               - sender_id
 *               - message
 *             properties:
 *               room_id:
 *                 type: integer
 *                 example: 1
 *               sender_id:
 *                 type: integer
 *                 example: 4
 *               message:
 *                 type: string
 *                 example: Halo admin, saya mau tanya laporan ini
 *               reference_laporan_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 12
 *     responses:
 *       201:
 *         description: Pesan berhasil dikirim
 *       400:
 *         description: room_id, sender_id, dan message wajib diisi
 *       404:
 *         description: Room chat tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan server
 */
router.post("/message", sendMessage);

/**
 * @swagger
 * /api/chat/messages/{room_id}:
 *   get:
 *     summary: Mengambil semua pesan berdasarkan room chat
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: room_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: ID room chat
 *     responses:
 *       200:
 *         description: Pesan berhasil diambil
 *       404:
 *         description: Room chat tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan server
 */
router.get("/messages/:room_id", getMessagesByRoom);

/**
 * @swagger
 * /api/chat/messages/{room_id}/read:
 *   put:
 *     summary: Menandai pesan dalam room sebagai sudah dibaca
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: room_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: ID room chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 4
 *                 description: ID user yang sedang membuka room chat
 *     responses:
 *       200:
 *         description: Pesan berhasil ditandai dibaca
 *       400:
 *         description: room_id dan user_id wajib diisi
 *       500:
 *         description: Terjadi kesalahan server
 */
router.put("/messages/:room_id/read", markMessagesAsRead);

module.exports = router;