const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

/**
 * @swagger
 * tags:
 *   name: User
 *   description: API untuk mengelola data user
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Melihat semua user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data user berhasil diambil
 *       401:
 *         description: Token tidak valid
 */
router.get('/', authMiddleware, getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Melihat detail user berdasarkan ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user
 *     responses:
 *       200:
 *         description: Detail user berhasil diambil
 *       404:
 *         description: User tidak ditemukan
 */
router.get('/:id', authMiddleware, getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Menambahkan user baru
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama
 *               - email
 *               - password
 *             properties:
 *               nama:
 *                 type: string
 *                 example: Dina Trisnawati
 *               email:
 *                 type: string
 *                 example: dina@gmail.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               no_hp:
 *                 type: string
 *                 example: "08123456789"
 *               role:
 *                 type: string
 *                 example: user
 *               foto_profile:
 *                 type: string
 *                 example: uploads/profile.jpg
 *     responses:
 *       201:
 *         description: User berhasil ditambahkan
 *       400:
 *         description: Data tidak valid
 */
router.post('/', authMiddleware, createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Mengubah data user berdasarkan ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *                 example: Dina Update
 *               email:
 *                 type: string
 *                 example: dinaupdate@gmail.com
 *               password:
 *                 type: string
 *                 example: "654321"
 *               no_hp:
 *                 type: string
 *                 example: "08987654321"
 *               role:
 *                 type: string
 *                 example: admin
 *               foto_profile:
 *                 type: string
 *                 example: uploads/profile-update.jpg
 *     responses:
 *       200:
 *         description: User berhasil diperbarui
 *       404:
 *         description: User tidak ditemukan
 */
router.put('/:id', authMiddleware, updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Menghapus user berdasarkan ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user
 *     responses:
 *       200:
 *         description: User berhasil dihapus
 *       404:
 *         description: User tidak ditemukan
 */
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;