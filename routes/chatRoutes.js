const express = require("express");

const {
  getOrCreateChatRoom,
  sendMessage,
  getMessagesByRoom,
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
 *                 example: Halo admin
 *               reference_laporan_id:
 *                 type: integer
 *                 example: 12
 *     responses:
 *       201:
 *         description: Pesan berhasil dikirim
 */
router.post("/message", sendMessage);

/**
 * @swagger
 * /api/chat/messages/{room_id}:
 *   get:
 *     summary: Mengambil pesan berdasarkan room chat
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: room_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Pesan berhasil diambil
 */
router.get("/messages/:room_id", getMessagesByRoom);
module.exports = router;