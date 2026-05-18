const express = require("express");

const {
  getStatistikAdmin
} = require("../controllers/adminController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard Admin
 *   description: API untuk dashboard admin
 */

/**
 * @swagger
 * /api/admin/statistik:
 *   get:
 *     summary: Menampilkan statistik dashboard admin
 *     tags: [Dashboard Admin]
 *     responses:
 *       200:
 *         description: Statistik dashboard admin berhasil diambil
 */
router.get("/statistik", getStatistikAdmin);

module.exports = router;