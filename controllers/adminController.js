const pool = require("../config/db");

async function getStatistikAdmin(req, res) {
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*)::int AS total_laporan,
        COUNT(*) FILTER (WHERE status = 'laporan_terkirim')::int AS laporan_terkirim,
        COUNT(*) FILTER (WHERE status = 'laporan_telah_dibaca')::int AS laporan_telah_dibaca,
        COUNT(*) FILTER (WHERE status = 'dalam_proses_tindak_lanjut')::int AS dalam_proses_tindak_lanjut,
        COUNT(*) FILTER (WHERE status = 'laporan_selesai_ditindaklanjuti')::int AS laporan_selesai_ditindaklanjuti
      FROM laporan`
    );

    res.json({
      message: "Statistik dashboard admin berhasil diambil",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil statistik dashboard",
      error: error.message
    });
  }
}

module.exports = {
  getStatistikAdmin
};