// spiritveins.js — Linh mạch (12 bậc). Quyết định phẩm chất linh khí của VÙNG ĐẤT:
// tốc độ tu luyện, độ hiếm cơ duyên, độ ô nhiễm (chướng tính) của linh khí.

export const SPIRIT_VEINS = [
  { id: 1, name: 'Phàm mạch', qi: 0.15, purity: 0.5, desc: 'Gần như không có linh khí. Đất chết.' },
  { id: 2, name: 'Tàn mạch', qi: 0.3, purity: 0.55, desc: 'Linh mạch tàn phế, linh khí thưa thớt và bẩn.' },
  { id: 3, name: 'Hạ phẩm linh mạch', qi: 0.6, purity: 0.65, desc: 'Linh mạch cấp thấp, đủ cho Luyện Khí.' },
  { id: 4, name: 'Trung phẩm linh mạch', qi: 1.0, purity: 0.72, desc: 'Ổn định, tông môn nhỏ tranh giành.' },
  { id: 5, name: 'Thượng phẩm linh mạch', qi: 1.8, purity: 0.8, desc: 'Linh khí dồi dào, nuôi Kim Đan.' },
  { id: 6, name: 'Cực phẩm linh mạch', qi: 3.0, purity: 0.86, desc: 'Cực phẩm, thánh địa mới có.' },
  { id: 7, name: 'Địa mạch', qi: 5.0, purity: 0.9, desc: 'Long mạch của đại địa.' },
  { id: 8, name: 'Thiên mạch', qi: 9.0, purity: 0.93, desc: 'Linh khí gần như thành sương.' },
  { id: 9, name: 'Vương mạch', qi: 16.0, purity: 0.95, desc: 'Vương giả chi khí, nuôi Tiên nhân.' },
  { id: 10, name: 'Thánh mạch', qi: 30.0, purity: 0.97, desc: 'Thánh khí trường tồn.' },
  { id: 11, name: 'Tiên mạch', qi: 60.0, purity: 0.985, desc: 'Tiên khí, hít một hơi bằng phàm nhân tu vạn năm.' },
  { id: 12, name: 'Hỗn Độn mạch', qi: 150.0, purity: 1.0, desc: 'Linh khí thuần khiết tuyệt đối, không tạp chất.' },
];

export function getVein(id) {
  return SPIRIT_VEINS[Math.max(1, Math.min(12, id)) - 1];
}

// Độ ô nhiễm (chướng tính) cộng thêm mỗi đơn vị tu luyện tại linh mạch này.
// Linh khí càng bẩn (purity thấp) → nạp càng nhiều "độc".
export function taintRate(veinId) {
  const v = getVein(veinId);
  return (1 - v.purity) * 0.5;
}
