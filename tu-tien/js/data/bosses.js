// bosses.js — 100+ boss chia theo cấp. Boss cấp cao có công kích linh hồn.
// Drop: đan dược phẩm 4+, pháp bảo phẩm 5+, công pháp hiếm (xử lý ở combat/loot).

const BOSS_NAMES = {
  low: ['Hắc Phong Lang Yêu', 'Thi Độc Chu (nhện độc)', 'Huyết Bức Vương (dơi máu)',
    'Tà Tu Hắc Sát', 'Thủ Hộ Thạch Nhân', 'Yêu Xà Ngàn Năm', 'Cương Thi Cổ Mộ'],
  mid: ['Cổ Đế phân thân', 'Thiên Đạo Khôi Lỗi', 'Nghịch Tu Ma Quân', 'Vạn Yêu Chi Vương',
    'Kiếm Trủng Kiếm Linh', 'Huyết Hải Ma Thần'],
  high: ['Sinh vật không thể lý giải', 'Thực thể không hình dạng', 'Hỗn Độn Cổ Thú',
    'Tàn niệm của một vị Đế đã chết'],
  peak: ['Ý chí của Thế Giới', 'Luật lệ hóa hình', 'Hồng Mông tàn ảnh'],
};

// Sinh boss phù hợp với cảnh giới người chơi (realmId) — thường cao hơn 1-3 cấp.
export function genBoss(rng, realmId) {
  const target = Math.min(100, realmId + rng.int(0, 3));
  let tier, names;
  if (target <= 20) { tier = 'low'; names = BOSS_NAMES.low; }
  else if (target <= 40) { tier = 'mid'; names = BOSS_NAMES.mid; }
  else if (target <= 80) { tier = 'high'; names = BOSS_NAMES.high; }
  else { tier = 'peak'; names = BOSS_NAMES.peak; }

  return {
    name: rng.pick(names),
    realmId: Math.max(1, target),
    subIndex: rng.int(0, 3),
    tier,
    soulAttack: target >= 15,        // từ Nguyên Anh trở lên hay đánh nguyên thần
    dropGradeMin: target >= 30 ? 5 : target >= 10 ? 3 : 1,
    isBoss: true,
  };
}
