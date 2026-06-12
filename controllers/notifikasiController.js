const pool = require("../config/db");
const admin = require("../config/firebaseAdmin");

async function sendNotifikasi(req, res) {
  try {
    const {
      target_user_id,
      judul,
      pesan,
      laporan_id,
      type,
      room_id,
      sender_id,
    } = req.body;

    if (!target_user_id || !pesan) {
      return res.status(400).json({
        success: false,
        message: "target_user_id dan pesan wajib diisi",
      });
    }

    const userResult = await pool.query(
      `
      SELECT id, nama, email, fcm_token
      FROM users
      WHERE id = $1
      `,
      [target_user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tujuan tidak ditemukan",
      });
    }

    const targetUser = userResult.rows[0];

    if (!targetUser.fcm_token) {
      return res.status(400).json({
        success: false,
        message: "User tujuan belum punya FCM token",
      });
    }

    const notifType = type || (laporan_id ? "laporan" : "general");

    const finalJudul =
      judul ||
      (notifType === "chat"
        ? "Pesan Baru"
        : notifType === "laporan"
        ? "Status Laporan Diperbarui"
        : "Notifikasi Baru");

    const fcmData = {
      type: String(notifType),
      user_id: String(target_user_id),
      laporan_id: laporan_id ? String(laporan_id) : "",
      room_id: room_id ? String(room_id) : "",
      sender_id: sender_id ? String(sender_id) : "",
    };

    const fcmMessage = {
      token: targetUser.fcm_token,

      notification: {
        title: finalJudul,
        body: pesan,
      },

      android: {
        priority: "high",
        notification: {
          channelId:
            notifType === "chat"
              ? "chat_channel"
              : "high_importance_channel",
          sound: "default",
          priority: "high",
        },
      },

      data: fcmData,
    };

    const fcmResponse = await admin.messaging().send(fcmMessage);

    const notifResult = await pool.query(
      `
      INSERT INTO notifikasi (user_id, judul, pesan, laporan_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        target_user_id,
        finalJudul,
        pesan,
        laporan_id || null,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Push notification berhasil dikirim",
      fcm_response: fcmResponse,
      data: notifResult.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengirim push notification",
      error: error.message,
    });
  }
}

// async function readNotifikasi(req, res) {
//   try {
//     const { id } = req.params;

//     const result = await pool.query(
//       `
//       UPDATE notifikasi
//       SET is_read = true
//       WHERE id = $1
//       RETURNING *
//       `,
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         message: "Notifikasi tidak ditemukan",
//       });
//     }

//     return res.json({
//       message: "Notifikasi berhasil ditandai sudah dibaca",
//       data: result.rows[0],
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Gagal mengubah status notifikasi",
//       error: error.message,
//     });
//   }
// }

// async function deleteNotifikasi(req, res) {
//   try {
//     const { id } = req.params;

//     const result = await pool.query(
//       `
//       DELETE FROM notifikasi
//       WHERE id = $1
//       RETURNING *
//       `,
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({
//         message: "Notifikasi tidak ditemukan",
//       });
//     }

//     return res.json({
//       message: "Notifikasi berhasil dihapus",
//       data: result.rows[0],
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Gagal menghapus notifikasi",
//       error: error.message,
//     });
//   }
// }

module.exports = {
  // getNotifikasiByUser,
  sendNotifikasi,
  // readNotifikasi,
  // deleteNotifikasi,
};