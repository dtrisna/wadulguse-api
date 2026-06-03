const pool = require("../config/db");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

async function createLaporan(req, res) {
  try {
    const {
      user_id,
      judul,
      deskripsi,
      latitude,
      longitude,
      alamat,
      jenis_laporan
    } = req.body;

    if (!user_id || !judul || !deskripsi || !jenis_laporan) {
      return res.status(400).json({
        message: "user_id, judul, deskripsi, dan jenis_laporan wajib diisi"
      });
    }

    if (!["public", "private"].includes(jenis_laporan)) {
      return res.status(400).json({
        message: "jenis_laporan harus public atau private"
      });
    }

    let mediaUrl = null;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "wadulguse/laporan"
      );

      mediaUrl = uploadResult.secure_url;
    }

    const result = await pool.query(
      `INSERT INTO laporan 
      (
        user_id,
        judul,
        deskripsi,
        media,
        latitude,
        longitude,
        alamat,
        jenis_laporan,
        status,
        catatan_admin
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        'laporan_terkirim',
        NULL
      )
      RETURNING *`,
      [
        user_id,
        judul,
        deskripsi,
        mediaUrl,
        latitude || null,
        longitude || null,
        alamat || null,
        jenis_laporan
      ]
    );

    res.status(201).json({
      message: "Laporan berhasil dibuat",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal membuat laporan",
      error: error.message
    });
  }
}

async function getAllLaporan(req, res) {
  try {
    const result = await pool.query(
      `SELECT 
        laporan.*,
        users.nama AS nama_pelapor,
        users.email AS email_pelapor
      FROM laporan
      JOIN users ON laporan.user_id = users.id
      ORDER BY laporan.created_at DESC`
    );

    res.json({
      message: "Data laporan berhasil diambil",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data laporan",
      error: error.message
    });
  }
}

async function getDetailLaporan(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        laporan.*,
        users.nama AS nama_pelapor,
        users.email AS email_pelapor
      FROM laporan
      JOIN users ON laporan.user_id = users.id
      WHERE laporan.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Laporan tidak ditemukan"
      });
    }

    res.json({
      message: "Detail laporan berhasil diambil",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil detail laporan",
      error: error.message
    });
  }
}

async function updateStatusLaporan(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { status, catatan_admin } = req.body;

    const allowedStatus = [
      "laporan_terkirim",
      "laporan_telah_dibaca",
      "dalam_proses_tindak_lanjut",
      "laporan_selesai_ditindaklanjuti"
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Status laporan tidak valid"
      });
    }

    await client.query("BEGIN");

    const updateResult = await client.query(
      `UPDATE laporan
      SET 
        status = $1,
        catatan_admin = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *`,
      [status, catatan_admin || null, id]
    );

    if (updateResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Laporan tidak ditemukan"
      });
    }

    const laporan = updateResult.rows[0];

    const notifResult = await client.query(
      `INSERT INTO notifikasi 
      (
        user_id,
        laporan_id,
        judul,
        pesan
      )
      VALUES (
        $1,
        $2,
        $3,
        $4
      )
      RETURNING *`,
      [
        laporan.user_id,
        laporan.id,
        "Status laporan diperbarui",
        `Status laporan "${laporan.judul}" telah diperbarui menjadi ${status}.`
      ]
    );

    await client.query("COMMIT");

    res.json({
      message: "Status laporan berhasil diperbarui dan notifikasi dibuat",
      data: {
        laporan,
        notifikasi: notifResult.rows[0]
      }
    });
  } catch (error) {
    await client.query("ROLLBACK");

    res.status(500).json({
      message: "Gagal update status laporan",
      error: error.message
    });
  } finally {
    client.release();
  }
}

async function getLaporanPublic(req, res) {
  try {
    const result = await pool.query(
      `SELECT 
        laporan.*,
        users.nama AS nama_pelapor,
        users.email AS email_pelapor
      FROM laporan
      JOIN users ON laporan.user_id = users.id
      WHERE laporan.jenis_laporan = 'public'
      ORDER BY laporan.created_at DESC`
    );

    res.json({
      message: "Data laporan publik berhasil diambil",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil laporan publik",
      error: error.message
    });
  }
}

async function getLaporanByUser(req, res) {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT 
        laporan.*,
        users.nama AS nama_pelapor,
        users.email AS email_pelapor
      FROM laporan
      JOIN users ON laporan.user_id = users.id
      WHERE laporan.user_id = $1
      ORDER BY laporan.created_at DESC`,
      [user_id]
    );

    res.json({
      message: "Data laporan user berhasil diambil",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil laporan user",
      error: error.message
    });
  }
}

async function getRiwayatLaporanSelesaiByUser(req, res) {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      `SELECT 
        laporan.*,
        users.nama AS nama_pelapor,
        users.email AS email_pelapor
      FROM laporan
      JOIN users ON laporan.user_id = users.id
      WHERE laporan.user_id = $1
      AND laporan.status = 'laporan_selesai_ditindaklanjuti'
      ORDER BY laporan.updated_at DESC`,
      [user_id]
    );

    res.json({
      message: "Riwayat laporan selesai berhasil diambil",
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil riwayat laporan selesai",
      error: error.message
    });
  }
}

module.exports = {
  createLaporan,
  getAllLaporan,
  getLaporanPublic,
  getLaporanByUser,
  getRiwayatLaporanSelesaiByUser,
  getDetailLaporan,
  updateStatusLaporan
};