const supabaseModule = require('../config/db');
const supabase = supabaseModule.supabase || supabaseModule;

const TABLE_REACTION = 'laporan_reactions';

const getUserId = (req) => {
  return req.user?.id || req.user?.user_id || req.user?.sub || req.userId;
};

const setReaction = async (req, res, type) => {
  try {
    const { laporan_id } = req.params;
    const user_id = getUserId(req);

    if (!laporan_id) {
      return res.status(400).json({
        success: false,
        message: 'laporan_id wajib diisi'
      });
    }

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'User belum terautentikasi'
      });
    }

    const { data: existingReaction, error: findError } = await supabase
      .from(TABLE_REACTION)
      .select('*')
      .eq('laporan_id', String(laporan_id))
      .eq('user_id', String(user_id))
      .maybeSingle();

    if (findError) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengecek data reaction',
        error: findError.message
      });
    }

    if (existingReaction && existingReaction.type === type) {
      const { error: deleteError } = await supabase
        .from(TABLE_REACTION)
        .delete()
        .eq('id', existingReaction.id);

      if (deleteError) {
        return res.status(500).json({
          success: false,
          message: 'Gagal membatalkan reaction',
          error: deleteError.message
        });
      }

      return res.status(200).json({
        success: true,
        message: `${type} berhasil dibatalkan`
      });
    }

    if (existingReaction && existingReaction.type !== type) {
      const { data, error: updateError } = await supabase
        .from(TABLE_REACTION)
        .update({ type })
        .eq('id', existingReaction.id)
        .select()
        .single();

      if (updateError) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengubah reaction',
          error: updateError.message
        });
      }

      return res.status(200).json({
        success: true,
        message: `Reaction berhasil diubah menjadi ${type}`,
        data
      });
    }

    const { data, error: insertError } = await supabase
      .from(TABLE_REACTION)
      .insert([
        {
          laporan_id: String(laporan_id),
          user_id: String(user_id),
          type
        }
      ])
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menambahkan reaction',
        error: insertError.message
      });
    }

    return res.status(201).json({
      success: true,
      message: `${type} berhasil ditambahkan`,
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

const likeLaporan = async (req, res) => {
  return setReaction(req, res, 'like');
};

const dislikeLaporan = async (req, res) => {
  return setReaction(req, res, 'dislike');
};

const getReactionByLaporan = async (req, res) => {
  try {
    const { laporan_id } = req.params;

    const { data, error } = await supabase
      .from(TABLE_REACTION)
      .select('*')
      .eq('laporan_id', String(laporan_id));

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data reaction',
        error: error.message
      });
    }

    const total_like = data.filter((item) => item.type === 'like').length;
    const total_dislike = data.filter((item) => item.type === 'dislike').length;

    return res.status(200).json({
      success: true,
      message: 'Data reaction berhasil diambil',
      data: {
        laporan_id: String(laporan_id),
        total_like,
        total_dislike,
        reactions: data
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};

const hapusReaction = async (req, res) => {
  try {
    const { laporan_id } = req.params;
    const user_id = getUserId(req);

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: 'User belum terautentikasi'
      });
    }

    const { error } = await supabase
      .from(TABLE_REACTION)
      .delete()
      .eq('laporan_id', String(laporan_id))
      .eq('user_id', String(user_id));

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus reaction',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reaction berhasil dihapus'
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
  likeLaporan,
  dislikeLaporan,
  getReactionByLaporan,
  hapusReaction
};