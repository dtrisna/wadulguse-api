const pool = require("../config/db");

async function getNotifikasiByUser(req, res) {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT 
        notifikasi.*,
        laporan.judul AS judul_laporan
      FROM notifikasi
      LEFT JOIN laporan ON notifikasi.laporan_id = laporan.id
      WHERE notifikasi.user_id = $1
      ORDER BY notifikasi.created_at DESC`,
      [user_id]
    );

    res.json({
      message: "Data notifikasi berhasil diambil",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil notifikasi",
      error: error.message
    });
  }
}

async function readNotifikasi(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE notifikasi
      SET is_read = true
      WHERE id = $1
      RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Notifikasi tidak ditemukan"
      });
    }

    res.json({
      message: "Notifikasi berhasil ditandai sudah dibaca",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengubah status notifikasi",
      error: error.message
    });
  }
}

async function deleteNotifikasi(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM notifikasi
      WHERE id = $1
      RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Notifikasi tidak ditemukan"
      });
    }

    res.json({
      message: "Notifikasi berhasil dihapus"
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menghapus notifikasi",
      error: error.message
    });
  }
}

module.exports = {
  getNotifikasiByUser,
  readNotifikasi,
  deleteNotifikasi
};