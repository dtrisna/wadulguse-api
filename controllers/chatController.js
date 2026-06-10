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

module.exports = {
  getOrCreateChatRoom,
};