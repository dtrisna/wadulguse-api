const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const {
  createLaporan,
  getAllLaporan,
  getLaporanPublic,
  getLaporanByUser,
  getRiwayatLaporanSelesaiByUser,
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
 *   post:
 *     summary: Membuat laporan baru
 *     tags: [Laporan]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
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
 *                 format: binary
 *                 description: Foto laporan
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
router.post("/", upload.single("media"), createLaporan);

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
 * /api/laporan/public:
 *   get:
 *     summary: Menampilkan laporan publik
 *     description: Endpoint ini hanya menampilkan laporan dengan jenis_laporan public.
 *     tags: [Laporan]
 *     responses:
 *       200:
 *         description: Data laporan publik berhasil diambil
 */
router.get("/public", getLaporanPublic);

/**
 * @swagger
 * /api/laporan/user/{user_id}:
 *   get:
 *     summary: Menampilkan laporan berdasarkan user
 *     description: Endpoint ini menampilkan semua laporan milik user tertentu.
 *     tags: [Laporan]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Data laporan user berhasil diambil
 */
router.get("/user/:user_id", getLaporanByUser);

/**
 * @swagger
 * /api/laporan/user/{user_id}/selesai:
 *   get:
 *     summary: Menampilkan riwayat laporan selesai berdasarkan user
 *     description: Endpoint ini menampilkan laporan milik user tertentu dengan status laporan_selesai_ditindaklanjuti.
 *     tags: [Laporan]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Riwayat laporan selesai berhasil diambil
 */
router.get("/user/:user_id/selesai", getRiwayatLaporanSelesaiByUser);

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

module.exports = router;