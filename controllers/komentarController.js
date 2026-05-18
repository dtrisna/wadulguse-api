const supabaseModule = require('../config/db');
const supabase = supabaseModule.supabase || supabaseModule;

const TABLE_KOMENTAR = 'komentar';

const getUserId = (req) => {
  return req.user?.id || req.user?.user_id || req.user?.sub || req.userId;
};

// Tambah komentar
const tambahKomentar = async (req, res) => {
  try {
    const { laporan_id, komentar, isi_komentar } = req.body;
    const user_id = getUserId(req);

    const laporanId = Number(laporan_id);
    const userId = Number(user_id);
    const isiKomentar = komentar || isi_komentar;

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

    if (!isiKomentar) {
      return res.status(400).json({
        success: false,
        message: 'Komentar wajib diisi'
      });
    }

    const { data, error } = await supabase
      .from(TABLE_KOMENTAR)
      .insert([
        {
          laporan_id: laporanId,
          user_id: userId,
          komentar: isiKomentar
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menambahkan komentar',
        error: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Komentar berhasil ditambahkan',
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};

// Lihat semua komentar
const getSemuaKomentar = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_KOMENTAR)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data komentar',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Data komentar berhasil diambil',
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};

// Lihat komentar berdasarkan laporan
const getKomentarByLaporan = async (req, res) => {
  try {
    const { laporan_id } = req.params;
    const laporanId = Number(laporan_id);

    if (!Number.isInteger(laporanId)) {
      return res.status(400).json({
        success: false,
        message: 'laporan_id harus berupa angka'
      });
    }

    const { data, error } = await supabase
      .from(TABLE_KOMENTAR)
      .select('*')
      .eq('laporan_id', laporanId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil komentar berdasarkan laporan',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Komentar berdasarkan laporan berhasil diambil',
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};

// Edit komentar
const updateKomentar = async (req, res) => {
  try {
    const { id } = req.params;
    const { komentar, isi_komentar } = req.body;
    const user_id = getUserId(req);

    const komentarId = Number(id);
    const userId = Number(user_id);
    const isiKomentar = komentar || isi_komentar;

    if (!Number.isInteger(komentarId)) {
      return res.status(400).json({
        success: false,
        message: 'id komentar harus berupa angka'
      });
    }

    if (!isiKomentar) {
      return res.status(400).json({
        success: false,
        message: 'Komentar wajib diisi'
      });
    }

    const { data: dataKomentar, error: findError } = await supabase
      .from(TABLE_KOMENTAR)
      .select('*')
      .eq('id', komentarId)
      .single();

    if (findError || !dataKomentar) {
      return res.status(404).json({
        success: false,
        message: 'Komentar tidak ditemukan'
      });
    }

    if (Number(dataKomentar.user_id) !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Tidak memiliki izin untuk mengedit komentar ini'
      });
    }

    const { data, error } = await supabase
      .from(TABLE_KOMENTAR)
      .update({
        komentar: isiKomentar
      })
      .eq('id', komentarId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengedit komentar',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Komentar berhasil diedit',
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};

// Hapus komentar
const hapusKomentar = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = getUserId(req);

    const komentarId = Number(id);
    const userId = Number(user_id);

    if (!Number.isInteger(komentarId)) {
      return res.status(400).json({
        success: false,
        message: 'id komentar harus berupa angka'
      });
    }

    const { data: dataKomentar, error: findError } = await supabase
      .from(TABLE_KOMENTAR)
      .select('*')
      .eq('id', komentarId)
      .single();

    if (findError || !dataKomentar) {
      return res.status(404).json({
        success: false,
        message: 'Komentar tidak ditemukan'
      });
    }

    if (Number(dataKomentar.user_id) !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Tidak memiliki izin untuk menghapus komentar ini'
      });
    }

    const { error } = await supabase
      .from(TABLE_KOMENTAR)
      .delete()
      .eq('id', komentarId);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus komentar',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Komentar berhasil dihapus'
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
  tambahKomentar,
  getSemuaKomentar,
  getKomentarByLaporan,
  updateKomentar,
  hapusKomentar
};