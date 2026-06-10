const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { nama, email, password, no_hp, fcm_token } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({
        message: 'Nama, email, dan password wajib diisi',
      });
    }

    const cekEmail = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (cekEmail.rows.length > 0) {
      return res.status(400).json({
        message: 'Email sudah digunakan',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (nama, email, password, no_hp, role, fcm_token)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nama, email, no_hp, role, fcm_token
      `,
      [
        nama,
        email,
        hashedPassword,
        no_hp || null,
        'user',
        fcm_token || null,
      ]
    );

    return res.status(201).json({
      message: 'Register berhasil',
      user: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, fcm_token } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email dan password wajib diisi',
      });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Email atau password salah',
      });
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Email atau password salah',
      });
    }

    if (fcm_token) {
      await pool.query(
        `
        UPDATE users
        SET fcm_token = $1
        WHERE id = $2
        `,
        [fcm_token, user.id]
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d',
      }
    );

    return res.json({
      message: 'Login berhasil',
      token,
      id: user.id,
      role: user.role,
      nama: user.nama,
      email: user.email,
      fcm_token: fcm_token || user.fcm_token,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Terjadi kesalahan server',
      error: error.message,
    });
  }
};

const logout = async (req, res) => {
  return res.json({
    message: 'Logout berhasil',
  });
};

module.exports = {
  register,
  login,
  logout,
};