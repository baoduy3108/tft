// grades.js — 12 phẩm dùng chung cho pháp bảo, công pháp, đan dược, linh dược,
// thể chất, thiên phú, trận pháp, linh thú...
//
// Quy tắc gating (theo spec):
//  - Phẩm ≥ 5 gần như không tồn tại ở thế giới cấp thấp (worldTier nhỏ).
//  - Phẩm ≥ 7/8 không tồn tại ở "cấp vũ trụ khởi đầu".
//  Tỉ lệ xuất hiện cực nhỏ (vd phẩm 3: 0.00005%, phẩm 5: ~1e-12).

export const GRADES = [
  { id: 1, name: 'Phàm', color: '#9e9e9e', spawn: 0.60 },
  { id: 2, name: 'Linh', color: '#8bc34a', spawn: 0.28 },
  { id: 3, name: 'Huyền', color: '#03a9f4', spawn: 0.0000005 },      // 0.00005%
  { id: 4, name: 'Địa', color: '#673ab7', spawn: 0.0000000005 },
  { id: 5, name: 'Thiên', color: '#ff9800', spawn: 1e-14 },          // ~0.000000000001%
  { id: 6, name: 'Vương', color: '#f44336', spawn: 1e-18 },
  { id: 7, name: 'Thánh', color: '#e91e63', spawn: 1e-24 },
  { id: 8, name: 'Tiên', color: '#00e5ff', spawn: 1e-30 },
  { id: 9, name: 'Đế', color: '#ffd700', spawn: 1e-40 },
  { id: 10, name: 'Hồng Hoang', color: '#ff5252', spawn: 1e-60 },
  { id: 11, name: 'Hỗn Độn', color: '#b388ff', spawn: 1e-90 },
  { id: 12, name: 'Hồng Mông', color: '#ffffff', spawn: 1e-120 },
];

export function getGrade(id) {
  return GRADES[Math.max(1, Math.min(12, id)) - 1];
}

export function gradeName(id) {
  const g = getGrade(id);
  return g ? `Phẩm ${g.id} - ${g.name}` : 'Phẩm ?';
}

// Phẩm tối đa có thể xuất hiện ở một thế giới có worldTier (1..9).
// worldTier: 1 = Phàm Giới ... 9 = Vô Hạn Ngoại Vực (xem worlds.js).
export function maxGradeForWorld(worldTier) {
  // Thế giới khởi đầu (tier 1-2): trần phẩm ~4 (phẩm 5 gần như 0).
  // Mỗi cấp thế giới mở thêm ~1-1.5 phẩm.
  const cap = Math.floor(3 + worldTier * 1.1);
  return Math.max(2, Math.min(12, cap));
}

// Tỉ lệ xuất hiện thực tế của 1 phẩm trong 1 thế giới (đã tính gating).
export function effectiveSpawn(gradeId, worldTier) {
  const cap = maxGradeForWorld(worldTier);
  if (gradeId > cap) {
    // Vượt trần: gần như không tồn tại (nhân thêm hệ số triệt tiêu)
    const over = gradeId - cap;
    return getGrade(gradeId).spawn * Math.pow(1e-6, over);
  }
  return getGrade(gradeId).spawn;
}

// Mô tả quyền năng theo phẩm cho PHÁP BẢO (dùng ở treasures.js & UI)
export const TREASURE_POWER_BY_GRADE = {
  1: 'vũ khí thường', 2: 'vũ khí thường (tốt)', 3: 'có linh tính nhẹ',
  4: 'nhận chủ', 5: 'có ý thức', 6: 'tự tu luyện', 7: 'tạo pháp tắc',
  8: 'thao túng không gian', 9: 'thao túng thời gian', 10: 'tạo vũ trụ nhỏ',
  11: 'điều khiển nhân quả', 12: 'viết lại thực tại',
};
