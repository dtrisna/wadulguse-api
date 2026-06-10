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
router.post("/message", sendMessage);
router.get("/messages/:room_id", getMessagesByRoom);

module.exports = router;