// cultivation.js — Tu luyện theo thời gian. Nạp linh khí = nạp cả "chướng tính" (ô nhiễm).

import { log } from '../state.js';
import { getRealm } from '../data/realms.js';
import { getVein, taintRate } from '../data/spiritveins.js';
import { advanceYears } from './time.js';

// Bối cảnh tu luyện hiện tại: các hệ số nhân tốc độ.
export function cultivateContext(G) {
  const s = G.s;
  const rootSpeed = s.root?.speed ?? 0.35;
  const physCult = s.physique?.buffs?.cultivate ?? 1;
  const vein = getVein(veinIdOfRegion(G));
  const tech = s.technique;
  const techMult = tech ? (0.6 + tech.grade * 0.25) : 0.3; // không công pháp: rất chậm
  // Chướng tính cao làm chậm & nguy hiểm
  const taintPenalty = Math.max(0.2, 1 - s.taint * 0.02);
  return { rootSpeed, physCult, veinQi: vein.qi, veinPurity: vein.purity, techMult, taintPenalty, vein };
}

// Linh mạch của vùng đang ở (khởi đầu Khô Kiệt Tinh Lộ = tàn mạch).
export function veinIdOfRegion(G) {
  return G.s.regionVein ?? 2; // mặc định tàn mạch
}

// Độ khó tăng theo cảnh giới — DỐC DẦN (tuyến tính × lũy thừa nhẹ) để hậu kỳ
// trở nên trường kỳ khủng khiếp (phàm nhân có thể kẹt "vạn năm"), trong khi đầu
// game vẫn mượt. Cách duy nhất đi tiếp: linh căn/linh mạch/công pháp/đan tốt hơn.
//   r=1 ≈ 1.3 · r=10 ≈ 6 · r=30 ≈ 49 · r=60 ≈ 540 · r=100 ≈ 9100
function difficulty(realmId) {
  if (realmId <= 0) return 0.8;
  return (1 + realmId * 0.25) * Math.pow(1.06, realmId);
}

// Tiến độ tu luyện thu được trên MỖI NĂM tại bối cảnh hiện tại.
export function progressPerYear(G) {
  const c = cultivateContext(G);
  const base = 6.0; // hệ số cân bằng (phàm -> Luyện Khí ~ vài tháng)
  const raw = base * c.rootSpeed * c.physCult * c.veinQi * c.techMult * c.taintPenalty;
  return raw / difficulty(G.s.realmId);
}

// Tu luyện trong `years` năm. Cộng tiến độ + chướng tính, trôi thời gian.
// Trả về { gained, ready } — ready = đã đủ để thử đột phá.
export function cultivate(G, years) {
  if (!G.s.alive) return { gained: 0, ready: false, dead: true };
  const c = cultivateContext(G);
  const gain = progressPerYear(G) * years;
  G.s.cultProgress = Math.min(1, G.s.cultProgress + gain);

  // Nạp chướng tính theo độ bẩn của linh mạch
  const taint = taintRate(veinIdOfRegion(G)) * years * (0.5 + G.s.realmId * 0.02);
  G.s.taint += taint;

  advanceYears(G, years);

  // Chướng tính quá cao mà không tẩy → thối rữa (thiệt hại thọ nguyên)
  if (G.s.taint > 40) {
    const dmg = (G.s.taint - 40) * 0.1 * years;
    G.s.thoNguyen -= dmg;
    log('Chướng tính tích tụ quá nặng, kinh mạch bắt đầu hoại tử. Cần Thanh Linh Đan để tẩy!', 'bad');
  }

  const ready = G.s.cultProgress >= 1;
  if (ready) log('Tu vi đã tích đủ. Có thể thử ĐỘT PHÁ.', 'good');
  return { gained: gain, ready, taint };
}

// Tẩy chướng tính (dùng đan hoặc thiền định tốn thời gian ít hiệu quả)
export function purgeTaint(G, amount) {
  const before = G.s.taint;
  G.s.taint = Math.max(0, G.s.taint - amount);
  log(`Tẩy trừ ${Math.round(before - G.s.taint)} điểm chướng tính.`, 'good');
}

// Luyện nguyên thần (thần thức) — cần thiết để chống công kích linh hồn về sau.
export function refineSoul(G, years) {
  advanceYears(G, years);
  const gain = years * (0.2 + (G.s.physique?.buffs?.soul ?? 1) * 0.1);
  const before = Math.floor(G.s.nguyenThan);
  G.s.nguyenThan += gain;
  if (Math.floor(G.s.nguyenThan) > before) {
    log(`Nguyên thần ngưng luyện, cường độ đạt mức ${Math.floor(G.s.nguyenThan)}.`, 'good');
  }
  return gain;
}

export function realmLabel(G) {
  if (G.s.realmId <= 0) return 'Phàm Nhân';
  const r = getRealm(G.s.realmId);
  return `${r.name} ${r.subStages[G.s.subIndex]}`;
}
