const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.post("/register-token", async (req, res) => {
  try {
    const { firebase_uid, email, name, fcm_token } = req.body;

    if (!email || !fcm_token) {
      return res.status(400).json({
        success: false,
        message: "email dan fcm_token wajib diisi",
      });
    }

    const userCheck = await pool.query(
      "select id from users where email = $1",
      [email]
    );

    if (userCheck.rows.length === 0) {
      await pool.query(
        `
        insert into users (email, username, firebase_uid, fcm_token)
        values ($1, $2, $3, $4)
        `,
        [email, name || "Pengguna", firebase_uid, fcm_token]
      );
    } else {
      await pool.query(
        `
        update users
        set firebase_uid = $1,
            fcm_token = $2
        where email = $3
        `,
        [firebase_uid, fcm_token, email]
      );
    }

    return res.status(200).json({
      success: true,
      message: "FCM token berhasil disimpan",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan FCM token",
      error: error.message,
    });
  }
});

module.exports = router;