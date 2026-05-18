const pool = require('../config/db');

const getUserId = (req) => {
  return req.user?.id || req.user?.user_id || req.user?.sub || req.userId;
};

// Tambah komentar
const tambahKomentar = async (req, res) => {
  try {
    const { laporan_id, komentar, isi_komentar } = req.body;
    const user_id = getUserId(req);

    const laporanId = Number(laporan_id);
    const userId = Number(user_id);
    const isiKomentar = komentar || isi_komentar;

    if (!Number.isInteger(laporanId)) {
      return res.status(400).json({
        success: false,
        message: 'laporan_id harus berupa angka',
      });
    }

    if (!Number.isInteger(userId)) {
      return res.status(401).json({
        success: false,
        message: 'User belum terautentikasi atau user_id tidak valid',
      });
    }

    if (!isiKomentar) {
      return res.status(400).json({
        success: false,
        message: 'Komentar wajib diisi',
      });
    }

    const result = await pool.query(
      `INSERT INTO komentar (laporan_id, user_id, komentar)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [laporanId, userId, isiKomentar]
    );

    return res.status(201).json({
      success: true,
      message: 'Komentar berhasil ditambahkan',
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message,
    });
  }
};

// Lihat semua komentar
const getSemuaKomentar = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM komentar
       ORDER BY created_at DESC`
    );

    return res.status(200).json({
      success: true,
      message: 'Data komentar berhasil diambil',
      data: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message,
    });
  }
};

// Lihat komentar berdasarkan laporan
const getKomentarByLaporan = async (req, res) => {
  try {
    const { laporan_id } = req.params;
    const laporanId = Number(laporan_id);

    if (!Number.isInteger(laporanId)) {
      return res.status(400).json({
        success: false,
        message: 'laporan_id harus berupa angka',
      });
    }

    const result = await pool.query(
      `SELECT * FROM komentar
       WHERE laporan_id = $1
       ORDER BY created_at DESC`,
      [laporanId]
    );

    return res.status(200).json({
      success: true,
      message: 'Komentar berdasarkan laporan berhasil diambil',
      data: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message,
    });
  }
};

// Edit komentar
const updateKomentar = async (req, res) => {
  try {
    const { id } = req.params;
    const { komentar, isi_komentar } = req.body;
    const user_id = getUserId(req);

    const komentarId = Number(id);
    const userId = Number(user_id);
    const isiKomentar = komentar || isi_komentar;

    if (!Number.isInteger(komentarId)) {
      return res.status(400).json({
        success: false,
        message: 'id komentar harus berupa angka',
      });
    }

    if (!Number.isInteger(userId)) {
      return res.status(401).json({
        success: false,
        message: 'User belum terautentikasi atau user_id tidak valid',
      });
    }

    if (!isiKomentar) {
      return res.status(400).json({
        success: false,
        message: 'Komentar wajib diisi',
      });
    }

    const cekKomentar = await pool.query(
      `SELECT * FROM komentar WHERE id = $1`,
      [komentarId]
    );

    if (cekKomentar.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Komentar tidak ditemukan',
      });
    }

    if (Number(cekKomentar.rows[0].user_id) !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Tidak memiliki izin untuk mengedit komentar ini',
      });
    }

    const result = await pool.query(
      `UPDATE komentar
       SET komentar = $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [isiKomentar, komentarId]
    );

    return res.status(200).json({
      success: true,
      message: 'Komentar berhasil diedit',
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message,
    });
  }
};

// Hapus komentar
const hapusKomentar = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = getUserId(req);

    const komentarId = Number(id);
    const userId = Number(user_id);

    if (!Number.isInteger(komentarId)) {
      return res.status(400).json({
        success: false,
        message: 'id komentar harus berupa angka',
      });
    }

    const cekKomentar = await pool.query(
      `SELECT * FROM komentar WHERE id = $1`,
      [komentarId]
    );

    if (cekKomentar.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Komentar tidak ditemukan',
      });
    }

    if (Number(cekKomentar.rows[0].user_id) !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Tidak memiliki izin untuk menghapus komentar ini',
      });
    }

    await pool.query(
      `DELETE FROM komentar WHERE id = $1`,
      [komentarId]
    );

    return res.status(200).json({
      success: true,
      message: 'Komentar berhasil dihapus',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message,
    });
  }
};

module.exports = {
  tambahKomentar,
  getSemuaKomentar,
  getKomentarByLaporan,
  updateKomentar,
  hapusKomentar,
};