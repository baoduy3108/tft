// luck.js — Khí vận (vận khí). Ảnh hưởng: tỉ lệ nhặt đồ, sống sót, gặp cơ duyên.
// LƯU Ý (quy tắc gốc): khí vận cao cũng khiến bị chú ý → thu hút kẻ thù & nhân quả.

export const LUCK_TIERS = [
  { id: 0, name: 'Hắc Vận', find: 0.4, survive: 0.6, fortune: 0.3, attention: 0.5,
    desc: 'Toàn xui rủi. Đi đến đâu tai họa theo đến đó — mồi nhử cho kẻ khác.' },
  { id: 1, name: 'Bình Thường', find: 1.0, survive: 1.0, fortune: 1.0, attention: 1.0,
    desc: 'Vận khí người thường.' },
  { id: 2, name: 'Thiên Tài', find: 1.4, survive: 1.2, fortune: 1.5, attention: 1.4,
    desc: 'May mắn hơn người, dễ gặp cơ duyên nhỏ.' },
  { id: 3, name: 'Khí Vận Chi Tử', find: 2.0, survive: 1.5, fortune: 2.5, attention: 2.2,
    desc: 'Con cưng của khí vận — nhưng cũng là mục tiêu của mọi kẻ đoạt vận.' },
  { id: 4, name: 'Nghịch Thiên', find: 3.0, survive: 2.0, fortune: 4.0, attention: 3.5,
    desc: 'Cơ duyên tự tìm đến. Cả trời đất như phò trợ — và cả trời đất cũng ghen ghét.' },
  { id: 5, name: 'Vô Hạn Vận', find: 5.0, survive: 3.0, fortune: 8.0, attention: 6.0,
    desc: 'Đi bộ cũng nhặt được bảo vật. Cực kỳ nguy hiểm vì bị vô số ánh mắt dòm ngó.' },
];

export function getLuck(id) {
  return LUCK_TIERS[Math.max(0, Math.min(LUCK_TIERS.length - 1, id))];
}

// Roll khí vận khởi đầu: đa số Bình Thường, hiếm khi cực đoan.
export function rollStartLuck(rng) {
  return rng.weighted([
    [12, 0], [60, 1], [20, 2], [6, 3], [1.8, 4], [0.2, 5],
  ]);
}
