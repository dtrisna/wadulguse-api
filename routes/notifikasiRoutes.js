const express = require("express");

const {
  getNotifikasiByUser,
  readNotifikasi,
  deleteNotifikasi
} = require("../controllers/notifikasiController");

const router = express.Router();

router.get("/:user_id", getNotifikasiByUser);
router.put("/:id/read", readNotifikasi);
router.delete("/:id", deleteNotifikasi);

module.exports = router;