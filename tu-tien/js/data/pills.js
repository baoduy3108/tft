// pills.js — Đan dược theo phẩm + hiệu ứng. Ăn quá nhiều → tích độc → nổ thân.

import { log } from '../state.js';
import { grantLifespan } from '../systems/time.js';
import { purgeTaint } from '../systems/cultivation.js';

// key trùng với inventory. effect(G) áp dụng khi DÙNG.
export const PILLS = {
  tu_khi_dan: {
    key: 'tu_khi_dan', name: 'Tụ Khí Đan', grade: 1, toxin: 0.4,
    desc: 'Hồi linh lực, đẩy nhanh tiến độ tu luyện một chút.',
    effect: (G) => { G.s.cultProgress = Math.min(1, G.s.cultProgress + 0.06); log('Dùng Tụ Khí Đan: tiến độ tu luyện +6%.', 'good'); },
  },
  hoi_nguyen_dan: {
    key: 'hoi_nguyen_dan', name: 'Hồi Nguyên Đan', grade: 1, toxin: 0.3,
    desc: 'Hồi phục thương thế, ổn định khí huyết.',
    effect: (G) => { G.s.thoNguyen += 0.5; log('Dùng Hồi Nguyên Đan: thương thế hồi phục.', 'good'); },
  },
  thanh_tam_dan: {
    key: 'thanh_tam_dan', name: 'Thanh Tâm Đan', grade: 2, toxin: 0.5,
    desc: 'Ổn định đạo tâm, chống tẩu hỏa nhập ma (giảm rủi ro đột phá kế).',
    effect: (G) => { G.s.flags.thanhTamBuff = true; log('Dùng Thanh Tâm Đan: đạo tâm an định, lần đột phá tới an toàn hơn.', 'good'); },
  },
  thanh_linh_dan: {
    key: 'thanh_linh_dan', name: 'Thanh Linh Đan', grade: 2, toxin: 0.6,
    desc: 'Tẩy trừ chướng tính (linh khí ô nhiễm) tích trong người.',
    effect: (G) => purgeTaint(G, 12),
  },
  luyen_the_dan: {
    key: 'luyen_the_dan', name: 'Luyện Thể Đan', grade: 2, toxin: 0.7,
    desc: 'Tôi luyện nhục thân, tăng nhẹ thể phách vĩnh viễn.',
    effect: (G) => { if (G.s.physique?.buffs) G.s.physique.buffs.hp = (G.s.physique.buffs.hp ?? 1) * 1.03; log('Dùng Luyện Thể Đan: nhục thân cường hóa.', 'good'); },
  },
  pha_canh_dan: {
    key: 'pha_canh_dan', name: 'Phá Cảnh Đan', grade: 3, toxin: 1.5,
    desc: 'Tăng mạnh tỉ lệ đột phá lần kế (+25%). Ăn khi sắp đột phá.',
    effect: (G) => { G.s.flags.phaCanhBuff = 0.25; log('Dùng Phá Cảnh Đan: lần đột phá tới +25% tỉ lệ.', 'good'); },
  },
  ngo_dao_dan: {
    key: 'ngo_dao_dan', name: 'Ngộ Đạo Đan', grade: 3, toxin: 1.2,
    desc: 'Tăng ngộ tính tạm thời, hỗ trợ đột phá & lĩnh ngộ (+15%).',
    effect: (G) => { G.s.flags.ngoDaoBuff = 0.15; log('Dùng Ngộ Đạo Đan: thần trí thông suốt, cảm ngộ đạo lý.', 'good'); },
  },
  huyet_bao_dan: {
    key: 'huyet_bao_dan', name: 'Huyết Bạo Đan', grade: 3, toxin: 3.0,
    desc: 'Tăng sức mạnh ×3 trong chiến đấu kế — nhưng tự hại thân.',
    effect: (G) => { G.s.flags.huyetBao = 3; G.s.thoNguyen -= 3; log('Dùng Huyết Bạo Đan: sức mạnh bùng nổ, nhưng thọ nguyên hao tổn!', 'warn'); },
  },
  tho_dan: {
    key: 'tho_dan', name: 'Thọ Nguyên Đan', grade: 4, toxin: 1.0,
    desc: 'Kéo dài tuổi thọ 100–500 năm.',
    effect: (G) => { const y = 100 + G.rng.int(0, 400); grantLifespan(G, y, 'Thọ Nguyên Đan'); },
  },
  ho_menh_dan: {
    key: 'ho_menh_dan', name: 'Hộ Mệnh Đan', grade: 4, toxin: 1.0,
    desc: 'Có xác suất chết thay ngươi một lần khi trọng thương chí mạng.',
    effect: (G) => { G.s.flags.hoMenh = true; log('Dùng Hộ Mệnh Đan: một tia sinh cơ được cất giấu trong người.', 'good'); },
  },
};

export function getPill(key) {
  return PILLS[key];
}

// Dùng đan. Kiểm tra tích độc: ăn quá nhiều đan phẩm cao dồn dập → nguy hiểm.
export function usePill(G, key) {
  const p = PILLS[key];
  if (!p) return false;
  if ((G.s.inventory[key] ?? 0) <= 0) { log('Ngươi không có viên đan này.', 'warn'); return false; }
  G.s.inventory[key] -= 1;
  // Tích độc đan
  G.s.pillToxin = (G.s.pillToxin ?? 0) + p.toxin;
  p.effect(G);
  if (G.s.pillToxin > 20 && G.rng.chance((G.s.pillToxin - 20) * 0.03)) {
    const dmg = G.s.pillToxin;
    G.s.thoNguyen -= dmg;
    log(`Dược lực tích tụ quá nhiều, ngươi hộc máu vì "độc đan"! (-${Math.round(dmg)} năm thọ)`, 'bad');
    G.s.pillToxin *= 0.5;
    if (G.s.thoNguyen <= 0) { G.s.alive = false; G.s.causeOfDeath = 'Nổ thân vì lạm dụng đan dược (tích độc).'; }
  }
  return true;
}
