const pool = require('../config/db');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, nama, email, no_hp, role, foto_profile, created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User tidak ditemukan',
      });
    }

    res.json({
      message: 'Profile berhasil diambil',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama, no_hp, foto_profile } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET 
        nama = COALESCE($1, nama),
        no_hp = COALESCE($2, no_hp),
        foto_profile = COALESCE($3, foto_profile)
       WHERE id = $4
       RETURNING id, nama, email, no_hp, role, foto_profile`,
      [nama, no_hp, foto_profile, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User tidak ditemukan',
      });
    }

    res.json({
      message: 'Profile berhasil diperbarui',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, nama, email',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User tidak ditemukan',
      });
    }

    res.json({
      message: 'Akun berhasil dihapus',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
};