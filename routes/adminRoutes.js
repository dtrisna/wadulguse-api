const express = require("express");
const { getStatistikAdmin } = require("../controllers/adminController");

const router = express.Router();

router.get("/statistik", getStatistikAdmin);

module.exports = router;