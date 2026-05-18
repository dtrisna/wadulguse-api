const express = require("express");

const {
  createLaporan,
  getAllLaporan,
  getDetailLaporan,
  updateStatusLaporan
} = require("../controllers/laporanController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Laporan
 *   description: API untuk mengelola laporan masyarakat
 */

/**
 * @swagger
 * /api/laporan:
 *   get:
 *     summary: Menampilkan semua laporan
 *     tags: [Laporan]
 *     responses:
 *       200:
 *         description: Data laporan berhasil diambil
 */
router.get("/", getAllLaporan);

/**
 * @swagger
 * /api/laporan:
 *   post:
 *     summary: Membuat laporan baru
 *     tags: [Laporan]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - judul
 *               - deskripsi
 *               - jenis_laporan
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               judul:
 *                 type: string
 *                 example: Jalan Rusak
 *               deskripsi:
 *                 type: string
 *                 example: Terdapat jalan berlubang cukup besar dan membahayakan pengendara.
 *               media:
 *                 type: string
 *                 example: https://example.com/jalan-rusak.jpg
 *               latitude:
 *                 type: number
 *                 example: -8.172357
 *               longitude:
 *                 type: number
 *                 example: 113.700302
 *               alamat:
 *                 type: string
 *                 example: Jl. Kalimantan, Sumbersari, Jember
 *               jenis_laporan:
 *                 type: string
 *                 example: public
 *     responses:
 *       201:
 *         description: Laporan berhasil dibuat
 */
router.post("/", createLaporan);

/**
 * @swagger
 * /api/laporan/{id}:
 *   get:
 *     summary: Menampilkan detail laporan
 *     tags: [Laporan]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Detail laporan berhasil diambil
 *       404:
 *         description: Laporan tidak ditemukan
 */
router.get("/:id", getDetailLaporan);

/**
 * @swagger
 * /api/laporan/{id}/status:
 *   put:
 *     summary: Mengubah status laporan dan membuat notifikasi
 *     tags: [Laporan]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: dalam_proses_tindak_lanjut
 *               catatan_admin:
 *                 type: string
 *                 example: Laporan sudah diteruskan ke dinas terkait.
 *     responses:
 *       200:
 *         description: Status laporan berhasil diperbarui dan notifikasi dibuat
 *       404:
 *         description: Laporan tidak ditemukan
 */
router.put("/:id/status", updateStatusLaporan);

module.exports = router;