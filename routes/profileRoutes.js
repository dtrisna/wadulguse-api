const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {
  getProfile,
  updateProfile,
  deleteProfile,
} = require('../controllers/profileController');

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: API untuk mengelola profile user
 */

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Melihat profile user yang sedang login
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile berhasil diambil
 *       401:
 *         description: Token tidak valid
 */
router.get('/', authMiddleware, getProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update profile user
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *                 example: Bintang Royyan
 *               no_hp:
 *                 type: string
 *                 example: 08123456789
 *               foto_profile:
 *                 type: string
 *                 example: uploads/profile.jpg
 *     responses:
 *       200:
 *         description: Profile berhasil diperbarui
 *       401:
 *         description: Token tidak valid
 */
router.put('/', authMiddleware, updateProfile);

/**
 * @swagger
 * /api/profile:
 *   delete:
 *     summary: Hapus akun user
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Akun berhasil dihapus
 *       401:
 *         description: Token tidak valid
 */
router.delete('/', authMiddleware, deleteProfile);

module.exports = router;