const pool = require("../config/db");

const getOrCreateChatRoom = async (req, res) => {
  try {
    const { user_id, admin_id } = req.body;

    if (!user_id || !admin_id) {
      return res.status(400).json({
        message: "user_id dan admin_id wajib diisi",
      });
    }

    const existingRoom = await pool.query(
      `SELECT *
       FROM chat_rooms
       WHERE user_id = $1 AND admin_id = $2`,
      [user_id, admin_id]
    );

    if (existingRoom.rows.length > 0) {
      return res.status(200).json({
        message: "Room chat sudah ada",
        data: existingRoom.rows[0],
      });
    }

    const newRoom = await pool.query(
      `INSERT INTO chat_rooms (user_id, admin_id)
       VALUES ($1, $2)
       RETURNING *`,
      [user_id, admin_id]
    );

    return res.status(201).json({
      message: "Room chat berhasil dibuat",
      data: newRoom.rows[0],
    });
  } catch (error) {
    console.error("Error get or create chat room:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan server saat membuat room chat",
      error: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const {
      room_id,
      sender_id,
      message,
      reference_laporan_id,
    } = req.body;

    if (!room_id || !sender_id || !message) {
      return res.status(400).json({
        message: "room_id, sender_id, dan message wajib diisi",
      });
    }

    const roomCheck = await pool.query(
      "SELECT * FROM chat_rooms WHERE id = $1",
      [room_id]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Room chat tidak ditemukan",
      });
    }

    const result = await pool.query(
      `INSERT INTO chat_messages 
       (room_id, sender_id, message, reference_laporan_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        room_id,
        sender_id,
        message,
        reference_laporan_id || null,
      ]
    );

    await pool.query(
      `UPDATE chat_rooms
       SET updated_at = NOW()
       WHERE id = $1`,
      [room_id]
    );

    return res.status(201).json({
      message: "Pesan berhasil dikirim",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error send message:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan server saat mengirim pesan",
      error: error.message,
    });
  }
};

const getMessagesByRoom = async (req, res) => {
  try {
    const { room_id } = req.params;

    const roomCheck = await pool.query(
      "SELECT * FROM chat_rooms WHERE id = $1",
      [room_id]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Room chat tidak ditemukan",
      });
    }

    const result = await pool.query(
      `SELECT 
          cm.*,
          u.nama AS sender_nama,
          u.role AS sender_role,
          l.id AS laporan_id,
          l.judul AS laporan_judul,
          l.deskripsi AS laporan_deskripsi,
          l.media AS laporan_media,
          l.status AS laporan_status
       FROM chat_messages cm
       LEFT JOIN users u ON cm.sender_id = u.id
       LEFT JOIN laporan l ON cm.reference_laporan_id = l.id
       WHERE cm.room_id = $1
       ORDER BY cm.created_at ASC`,
      [room_id]
    );

    return res.status(200).json({
      message: "Pesan berhasil diambil",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error get messages:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan server saat mengambil pesan",
      error: error.message,
    });
  }
};

module.exports = {
  getOrCreateChatRoom,
  sendMessage,
  getMessagesByRoom,
};