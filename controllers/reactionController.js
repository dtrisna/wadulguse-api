const db = require('../config/db');
const pool = db.pool || db;

const TABLE_REACTION = 'reactions';

const getUserId = (req) => {
  return req.user?.id || req.user?.user_id || req.user?.id_user || req.user?.sub || req.userId;
};

const setReaction = async (req, res, type) => {
  try {
    const { laporan_id } = req.params;
    const user_id = getUserId(req);

    const laporanId = Number(laporan_id);
    const userId = Number(user_id);

    if (!Number.isInteger(laporanId)) {
      return res.status(400).json({
        success: false,
        message: 'laporan_id harus berupa angka'
      });
    }

    if (!Number.isInteger(userId)) {
      return res.status(401).json({
        success: false,
        message: 'User belum terautentikasi atau user_id tidak valid'
      });
    }

    const existingResult = await pool.query(
      `SELECT * FROM ${TABLE_REACTION}
       WHERE laporan_id = $1 AND user_id = $2
       LIMIT 1`,
      [laporanId, userId]
    );

    const existingReaction = existingResult.rows[0];

    if (existingReaction && existingReaction.type === type) {
      await pool.query(
        `DELETE FROM ${TABLE_REACTION}
         WHERE id = $1`,
        [existingReaction.id]
      );

      return res.status(200).json({
        success: true,
        message: `${type} berhasil dibatalkan`
      });
    }

    if (existingReaction && existingReaction.type !== type) {
      const updateResult = await pool.query(
        `UPDATE ${TABLE_REACTION}
         SET type = $1
         WHERE id = $2
         RETURNING *`,
        [type, existingReaction.id]
      );

      return res.status(200).json({
        success: true,
        message: `Reaction berhasil diubah menjadi ${type}`,
        data: updateResult.rows[0]
      });
    }

    const insertResult = await pool.query(
      `INSERT INTO ${TABLE_REACTION}
       (laporan_id, user_id, type)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [laporanId, userId, type]
    );

    return res.status(201).json({
      success: true,
      message: `${type} berhasil ditambahkan`,
      data: insertResult.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};

const likeLaporan = async (req, res) => {
  return setReaction(req, res, 'like');
};

const dislikeLaporan = async (req, res) => {
  return setReaction(req, res, 'dislike');
};

const getReactionByLaporan = async (req, res) => {
  try {
    const { laporan_id } = req.params;
    const laporanId = Number(laporan_id);

    if (!Number.isInteger(laporanId)) {
      return res.status(400).json({
        success: false,
        message: 'laporan_id harus berupa angka'
      });
    }

    const result = await pool.query(
      `SELECT * FROM ${TABLE_REACTION}
       WHERE laporan_id = $1
       ORDER BY created_at DESC`,
      [laporanId]
    );

    const reactions = result.rows;

    const total_like = reactions.filter((item) => item.type === 'like').length;
    const total_dislike = reactions.filter((item) => item.type === 'dislike').length;

    return res.status(200).json({
      success: true,
      message: 'Data reaction berhasil diambil',
      data: {
        laporan_id: laporanId,
        total_like,
        total_dislike,
        reactions
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};

const hapusReaction = async (req, res) => {
  try {
    const { laporan_id } = req.params;
    const user_id = getUserId(req);

    const laporanId = Number(laporan_id);
    const userId = Number(user_id);

    if (!Number.isInteger(laporanId)) {
      return res.status(400).json({
        success: false,
        message: 'laporan_id harus berupa angka'
      });
    }

    if (!Number.isInteger(userId)) {
      return res.status(401).json({
        success: false,
        message: 'User belum terautentikasi atau user_id tidak valid'
      });
    }

    const deleteResult = await pool.query(
      `DELETE FROM ${TABLE_REACTION}
       WHERE laporan_id = $1 AND user_id = $2
       RETURNING *`,
      [laporanId, userId]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reaction tidak ditemukan'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reaction berhasil dihapus'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};

module.exports = {
  likeLaporan,
  dislikeLaporan,
  getReactionByLaporan,
  hapusReaction
};