const pool = require("../config/db");
const admin = require("../config/firebaseAdmin");

// Query reusable untuk ambil pesan lengkap (dengan JOIN)
// Dipakai di sendMessage dan getMessagesByRoom
const MESSAGE_SELECT = `
  SELECT
    cm.*,
    u.nama  AS sender_nama,
    u.role  AS sender_role,
    l.id    AS laporan_id,
    l.judul AS laporan_judul,
    l.deskripsi AS laporan_deskripsi,
    l.media     AS laporan_media,
    l.status    AS laporan_status
  FROM chat_messages cm
  LEFT JOIN users   u ON cm.sender_id = u.id
  LEFT JOIN laporan l ON cm.reference_laporan_id = l.id
`;

// ─── Helper Kirim Notifikasi Chat ─────────────────────────────────────────────

async function sendChatNotification({
  targetUserId,
  senderId,
  roomId,
  message,
}) {
  try {
    if (!targetUserId || !senderId || !roomId || !message) return;

    const targetResult = await pool.query(
      `
      SELECT id, nama, email, fcm_token
      FROM users
      WHERE id = $1
      `,
      [targetUserId]
    );

    if (targetResult.rows.length === 0) {
      console.log("Target notifikasi chat tidak ditemukan:", targetUserId);
      return;
    }

    const targetUser = targetResult.rows[0];

    if (!targetUser.fcm_token) {
      console.log("Target user belum punya FCM token:", targetUserId);
      return;
    }

    const senderResult = await pool.query(
      `
      SELECT id, nama, role
      FROM users
      WHERE id = $1
      `,
      [senderId]
    );

    const sender = senderResult.rows[0];
    const senderName = sender?.nama || "Pengguna";

    const bodyMessage =
      message.length > 120 ? `${message.substring(0, 120)}...` : message;

    const fcmMessage = {
      token: targetUser.fcm_token,

      notification: {
        title: `Pesan Baru dari ${senderName}`,
        body: bodyMessage,
      },

      android: {
        priority: "high",
        notification: {
          channelId: "chat_channel",
          sound: "default",
          priority: "high",
        },
      },

      data: {
        type: "chat",
        room_id: String(roomId),
        sender_id: String(senderId),
        target_user_id: String(targetUserId),
      },
    };

    const fcmResponse = await admin.messaging().send(fcmMessage);

    await pool.query(
      `
      INSERT INTO notifikasi (user_id, judul, pesan, laporan_id)
      VALUES ($1, $2, $3, $4)
      `,
      [
        targetUserId,
        `Pesan Baru dari ${senderName}`,
        bodyMessage,
        null,
      ]
    );

    console.log("Notifikasi chat berhasil dikirim:", fcmResponse);
  } catch (error) {
    console.error("Gagal mengirim notifikasi chat:", error.message);
  }
}

// ─── Get or Create Room ───────────────────────────────────────────────────────

const getOrCreateChatRoom = async (req, res) => {
  try {
    const { user_id, admin_id } = req.body;

    if (!user_id || !admin_id) {
      return res.status(400).json({
        message: "user_id dan admin_id wajib diisi",
      });
    }

    // Atomic upsert — hindari race condition vs SELECT lalu INSERT terpisah
    const result = await pool.query(
      `
      INSERT INTO chat_rooms (user_id, admin_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, admin_id) DO UPDATE
        SET user_id = EXCLUDED.user_id
      RETURNING *, (xmax = 0) AS is_new
      `,
      [user_id, admin_id]
    );

    const room = result.rows[0];
    const isNew = room.is_new;
    delete room.is_new;

    return res.status(isNew ? 201 : 200).json({
      message: isNew ? "Room chat berhasil dibuat" : "Room chat sudah ada",
      data: room,
    });
  } catch (error) {
    console.error("Error get or create chat room:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan server saat membuat room chat",
      error: error.message,
    });
  }
};

// ─── Send Message ─────────────────────────────────────────────────────────────

const sendMessage = async (req, res) => {
  let transactionStarted = false;

  try {
    const { room_id, sender_id, message, reference_laporan_id } = req.body;

    if (!room_id || !sender_id || !message) {
      return res.status(400).json({
        message: "room_id, sender_id, dan message wajib diisi",
      });
    }

    // Ambil hanya kolom yang dibutuhkan untuk validasi room + target notif
    const roomResult = await pool.query(
      `
      SELECT id, user_id, admin_id
      FROM chat_rooms
      WHERE id = $1
      `,
      [room_id]
    );

    if (roomResult.rows.length === 0) {
      return res.status(404).json({
        message: "Room chat tidak ditemukan",
      });
    }

    const room = roomResult.rows[0];

    // Insert pesan + update room dalam satu transaction
    await pool.query("BEGIN");
    transactionStarted = true;

    const inserted = await pool.query(
      `
      INSERT INTO chat_messages (room_id, sender_id, message, reference_laporan_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [room_id, sender_id, message, reference_laporan_id || null]
    );

    await pool.query(
      `
      UPDATE chat_rooms
      SET updated_at = NOW()
      WHERE id = $1
      `,
      [room_id]
    );

    await pool.query("COMMIT");
    transactionStarted = false;

    const newId = inserted.rows[0].id;

    // Ambil pesan lengkap (dengan JOIN) agar Flutter tidak perlu fetch ulang
    const full = await pool.query(
      `
      ${MESSAGE_SELECT}
      WHERE cm.id = $1
      `,
      [newId]
    );

    const targetUserId =
      Number(sender_id) === Number(room.user_id)
        ? room.admin_id
        : room.user_id;

    // Notifikasi tidak boleh bikin send chat gagal.
    // Jadi kalau notif gagal, pesan tetap berhasil terkirim.
    await sendChatNotification({
      targetUserId,
      senderId: sender_id,
      roomId: room_id,
      message,
    });

    return res.status(201).json({
      message: "Pesan berhasil dikirim",
      data: full.rows[0],
    });
  } catch (error) {
    if (transactionStarted) {
      await pool.query("ROLLBACK");
    }

    console.error("Error send message:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan server saat mengirim pesan",
      error: error.message,
    });
  }
};

// ─── Get Messages by Room ─────────────────────────────────────────────────────

const getMessagesByRoom = async (req, res) => {
  try {
    const { room_id } = req.params;
    const { after_id } = req.query; // Opsional — untuk incremental fetch dari Flutter

    const { rows: [{ exists }] } = await pool.query(
      "SELECT EXISTS(SELECT 1 FROM chat_rooms WHERE id = $1) AS exists",
      [room_id]
    );

    if (!exists) {
      return res.status(404).json({
        message: "Room chat tidak ditemukan",
      });
    }

    // Kalau after_id ada, hanya ambil pesan setelah id tersebut
    const result = after_id
      ? await pool.query(
          `
          ${MESSAGE_SELECT}
          WHERE cm.room_id = $1 AND cm.id > $2
          ORDER BY cm.created_at ASC
          `,
          [room_id, after_id]
        )
      : await pool.query(
          `
          ${MESSAGE_SELECT}
          WHERE cm.room_id = $1
          ORDER BY cm.created_at ASC
          `,
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

// ─── Mark Messages as Read ────────────────────────────────────────────────────

const markMessagesAsRead = async (req, res) => {
  try {
    const { room_id } = req.params;
    const { user_id } = req.body;

    if (!room_id || !user_id) {
      return res.status(400).json({
        message: "room_id dan user_id wajib diisi",
      });
    }

    // Tidak perlu RETURNING * — Flutter tidak pakai datanya
    await pool.query(
      `
      UPDATE chat_messages
      SET is_read = true
      WHERE room_id = $1
        AND sender_id != $2
        AND is_read = false
      `,
      [room_id, user_id]
    );

    return res.status(200).json({
      message: "Pesan berhasil ditandai dibaca",
    });
  } catch (error) {
    console.error("Error mark messages as read:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan server saat menandai pesan dibaca",
      error: error.message,
    });
  }
};

// ─── Get Chat Rooms by User ───────────────────────────────────────────────────

const getChatRoomsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        message: "user_id wajib diisi",
      });
    }

    const result = await pool.query(
      `
      SELECT
          cr.id,
          cr.user_id,
          cr.admin_id,
          cr.created_at,
          cr.updated_at,

          u.nama           AS user_nama,
          u.email          AS user_email,
          u.foto_profile   AS user_foto_profile,

          a.nama           AS admin_nama,
          a.email          AS admin_email,

          last_msg.message    AS last_message,
          last_msg.created_at AS last_message_at,

          COALESCE(unread.unread_count, 0) AS unread_count

       FROM chat_rooms cr
       LEFT JOIN users u ON cr.user_id  = u.id
       LEFT JOIN users a ON cr.admin_id = a.id

       LEFT JOIN LATERAL (
         SELECT message, created_at
         FROM chat_messages
         WHERE room_id = cr.id
         ORDER BY created_at DESC
         LIMIT 1
       ) last_msg ON true

       LEFT JOIN LATERAL (
         SELECT COUNT(*)::int AS unread_count
         FROM chat_messages
         WHERE room_id = cr.id
           AND sender_id != $1
           AND is_read = false
       ) unread ON true

       WHERE cr.user_id = $1 OR cr.admin_id = $1
       ORDER BY COALESCE(last_msg.created_at, cr.updated_at) DESC
      `,
      [user_id]
    );

    return res.status(200).json({
      message: "Daftar room chat berhasil diambil",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error get chat rooms:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan server saat mengambil daftar room chat",
      error: error.message,
    });
  }
};

module.exports = {
  getOrCreateChatRoom,
  sendMessage,
  getMessagesByRoom,
  markMessagesAsRead,
  getChatRoomsByUser,
};