const pool = require('../config/db');
const bcrypt = require('bcrypt');

// GET semua user
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nama, email, no_hp, role, foto_profile, created_at
       FROM users
       ORDER BY id ASC`
    );

    res.status(200).json({
      success: true,
      message: 'Data user berhasil diambil',
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// GET user berdasarkan ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, nama, email, no_hp, role, foto_profile, created_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Detail user berhasil diambil',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// POST tambah user
const createUser = async (req, res) => {
  try {
    const { nama, email, password, no_hp, role, foto_profile } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi',
      });
    }

    const cekEmail = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (cekEmail.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah digunakan',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (nama, email, password, no_hp, role, foto_profile)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nama, email, no_hp, role, foto_profile, created_at`,
      [
        nama,
        email,
        hashedPassword,
        no_hp || null,
        role || 'user',
        foto_profile || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'User berhasil ditambahkan',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// PUT update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, password, no_hp, role, foto_profile } = req.body;

    const cekUser = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );

    if (cekUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
      });
    }

    let hashedPassword = cekUser.rows[0].password;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    if (email) {
      const cekEmail = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );

      if (cekEmail.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah digunakan oleh user lain',
        });
      }
    }

    const result = await pool.query(
      `UPDATE users
       SET
        nama = COALESCE($1, nama),
        email = COALESCE($2, email),
        password = COALESCE($3, password),
        no_hp = COALESCE($4, no_hp),
        role = COALESCE($5, role),
        foto_profile = COALESCE($6, foto_profile)
       WHERE id = $7
       RETURNING id, nama, email, no_hp, role, foto_profile, created_at`,
      [
        nama || null,
        email || null,
        hashedPassword || null,
        no_hp || null,
        role || null,
        foto_profile || null,
        id,
      ]
    );

    res.status(200).json({
      success: true,
      message: 'User berhasil diperbarui',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

// DELETE user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM users
       WHERE id = $1
       RETURNING id, nama, email`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User berhasil dihapus',
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};