const express = require("express");

const {
  createLaporan,
  getAllLaporan,
  getDetailLaporan,
  updateStatusLaporan
} = require("../controllers/laporanController");

const router = express.Router();

router.post("/", createLaporan);
router.get("/", getAllLaporan);
router.get("/:id", getDetailLaporan);
router.put("/:id/status", updateStatusLaporan);

module.exports = router;