// breakthrough.js — Đột phá cảnh giới. Vượt cấp khó dần; fail có hậu quả thật.
//  - Tiểu cảnh: KHÔNG tăng thọ nguyên (chỉ đổi chất linh lực).
//  - Đại cảnh: tăng thọ nguyên + roll dị biến + "kiểm tra tư cách".

import { log } from '../state.js';
import { getRealm } from '../data/realms.js';
import { luck } from '../state.js';
import { grantLifespan, deductLifespan } from './time.js';
import { rollMutation } from './worldrules.js';

// Xác định mục tiêu đột phá kế tiếp từ trạng thái hiện tại.
export function nextTarget(G) {
  const s = G.s;
  if (s.realmId <= 0) {
    return { realmId: 1, subIndex: 0, isMajor: true, name: 'Luyện Khí Nhất tầng' };
  }
  const r = getRealm(s.realmId);
  if (s.subIndex < r.subStages.length - 1) {
    return { realmId: s.realmId, subIndex: s.subIndex + 1, isMajor: false,
      name: `${r.name} ${r.subStages[s.subIndex + 1]}` };
  }
  if (s.realmId >= 100) return null; // đỉnh cao
  const nr = getRealm(s.realmId + 1);
  return { realmId: s.realmId + 1, subIndex: 0, isMajor: true,
    name: `${nr.name} ${nr.subStages[0]}` };
}

// Tính tỉ lệ thành công (0..1) dựa trên nền cảnh, nguyên thần, thể chất, chướng tính, khí vận, hỗ trợ.
export function successChance(G, opts = {}) {
  const target = nextTarget(G);
  if (!target) return 0;
  const tr = getRealm(target.realmId);
  let p = tr.breakBase;
  if (!target.isMajor) p = Math.min(0.95, p + 0.25); // tiểu cảnh dễ hơn đại cảnh

  // Hỗ trợ
  p += (G.s.physique?.buffs?.comprehend ?? 1) > 1 ? 0.05 : 0;
  p += Math.min(0.2, G.s.nguyenThan * 0.01);
  p += (opts.pillBonus ?? 0);        // Phá Cảnh Đan...
  p += (opts.enlightenBonus ?? 0);   // ngộ đạo / cơ duyên
  p += (luck().fortune - 1) * 0.03;

  // Cản trở
  p -= Math.min(0.4, G.s.taint * 0.01);           // chướng tính
  if (G.s.mutations.includes('tam_ma')) p -= 0.1; // tâm ma
  if (G.s.karma < 0) p -= Math.min(0.15, -G.s.karma * 0.003);

  return Math.max(0.01, Math.min(0.98, p));
}

// Thử đột phá. Trả về { ok, target, dead? }.
export function attemptBreakthrough(G, opts = {}) {
  if (!G.s.alive) return { ok: false, dead: true };
  if (G.s.cultProgress < 1) {
    log('Tu vi chưa đủ, đột phá lúc này chỉ chuốc lấy tẩu hỏa.', 'warn');
    return { ok: false };
  }
  const target = nextTarget(G);
  if (!target) {
    log('Ngươi đã đứng ở tận cùng của Đại Đạo. Không còn gì để vượt qua.', 'lore');
    return { ok: false };
  }
  const p = successChance(G, opts);
  log(`Bắt đầu đột phá ${target.name}... (tỉ lệ ${Math.round(p * 100)}%)`, '');

  if (G.rng.chance(p)) {
    // THÀNH CÔNG
    G.s.realmId = target.realmId;
    G.s.subIndex = target.subIndex;
    G.s.cultProgress = 0;
    G.s.stats.breakthroughs++;
    log(`✦ Đột phá thành công! Cảnh giới: ${target.name}.`, 'good');
    if (target.isMajor) {
      const nr = getRealm(target.realmId);
      const gain = Math.max(0, nr.lifespan - G.s.thoNguyenMax);
      grantLifespan(G, gain > 0 ? gain : nr.lifespan * 0.1, 'đột phá đại cảnh');
      G.s.thoNguyenMax = Math.max(G.s.thoNguyenMax, nr.lifespan);
      rollMutation(G); // đại cảnh: chắc chắn có dị biến
    } else if (G.rng.chance(0.25)) {
      rollMutation(G); // tiểu cảnh: đôi khi
    }
    return { ok: true, target };
  }

  // THẤT BẠI — hậu quả tùy độ nặng
  G.s.cultProgress = Math.max(0, G.s.cultProgress - 0.3);
  G.s.taint += 3;
  const severity = G.rng.next();
  const tamMa = G.s.mutations.includes('tam_ma');
  const deathRisk = (target.isMajor ? 0.12 : 0.03) + (tamMa ? 0.08 : 0) + G.s.taint * 0.002;

  if (severity < deathRisk) {
    G.s.alive = false;
    G.s.causeOfDeath = `Tẩu hỏa nhập ma khi đột phá ${target.name}. Kinh mạch nổ tung, nguyên thần tan biến.`;
    log('☠ TẨU HỎA NHẬP MA! Kinh mạch đứt đoạn, ngươi gục xuống trong biển máu.', 'death');
    return { ok: false, dead: true, target };
  }
  // Trọng thương: mất thọ nguyên
  const y = (target.isMajor ? 20 : 5) + G.rng.int(0, 15);
  deductLifespan(G, y, 'phản phệ khi đột phá thất bại');
  log('Đột phá thất bại! Ngươi hộc máu, đạo cơ tổn thương.', 'bad');
  return { ok: false, target };
}
