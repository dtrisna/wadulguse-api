const express = require('express');
const router = express.Router();

const komentarController = require('../controllers/komentarController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, komentarController.tambahKomentar);
router.get('/', komentarController.getSemuaKomentar);
router.get('/laporan/:laporan_id', komentarController.getKomentarByLaporan);
router.put('/:id', authMiddleware, komentarController.updateKomentar);
router.delete('/:id', authMiddleware, komentarController.hapusKomentar);

module.exports = router;