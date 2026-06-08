const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const {
  getProfile,
  updateProfile,
  deleteProfile,
  updateFotoProfile,
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

/**
 * @swagger
 * /api/profile/photo:
 *   put:
 *     summary: Upload foto profile user
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - foto_profile
 *             properties:
 *               foto_profile:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Foto profile berhasil diperbarui
 *       400:
 *         description: File foto profile wajib diupload
 *       401:
 *         description: Token tidak valid
 */
router.put(
  '/photo',
  authMiddleware,
  upload.single('foto_profile'),
  updateFotoProfile
);

module.exports = router;