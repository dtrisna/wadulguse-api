const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API untuk autentikasi user dan admin
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register akun user
 *     tags: [Auth]
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
 *                 example: Bintang Royyan
 *               email:
 *                 type: string
 *                 example: bintang@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               no_hp:
 *                 type: string
 *                 example: 08123456789
 *     responses:
 *       201:
 *         description: Register berhasil
 *       400:
 *         description: Data tidak lengkap atau email sudah digunakan
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user atau admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: bintang@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login berhasil
 *       401:
 *         description: Email atau password salah
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout berhasil
 */
router.post('/logout', logout);

module.exports = router;