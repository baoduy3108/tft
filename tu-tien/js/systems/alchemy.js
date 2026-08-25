// alchemy.js — Luyện đan (real hardcore). Cần đan lô + dị hỏa + linh dược + thần thức.
// Fail = nổ lò / phản phệ / cháy hồn. Phẩm cao nổ "bay map".

import { log } from '../state.js';
import { deductLifespan } from './time.js';
import { PILLS } from '../data/pills.js';

// Tỉ lệ thành công theo phẩm đan (spec).
export const SUCCESS_BY_GRADE = { 1: 0.9, 2: 0.85, 3: 0.4, 4: 0.1, 5: 0.001 };

export function baseSuccess(grade) {
  if (grade <= 2) return SUCCESS_BY_GRADE[grade];
  if (grade === 3) return 0.4;
  if (grade === 4) return 0.1;
  if (grade === 5) return 0.001;
  return Math.pow(0.001, grade - 4); // 6+ gần 0
}

// Điều kiện luyện: cần đan lô, dị hỏa, linh dược, thần thức đủ mạnh.
export function canRefine(G, pillKey) {
  const pill = PILLS[pillKey];
  if (!pill) return { ok: false, reason: 'Không rõ đan phương.' };
  if (!G.s.flags.hasFurnace) return { ok: false, reason: 'Thiếu Đan Lô.' };
  // Thần thức tối thiểu theo phẩm
  const need = pill.grade * 0.5;
  if (G.s.nguyenThan < need) return { ok: false, reason: `Thần thức quá yếu (cần ${need}, hiện ${Math.floor(G.s.nguyenThan)}). Hãy luyện nguyên thần.` };
  return { ok: true, pill };
}

// Luyện đan. success += hỗ trợ dị hỏa/thần thức. Trả về { ok, dead? }.
export function refine(G, pillKey, opts = {}) {
  const chk = canRefine(G, pillKey);
  if (!chk.ok) { log('Không thể luyện đan: ' + chk.reason, 'warn'); return { ok: false, reason: chk.reason }; }
  const pill = chk.pill;

  let p = baseSuccess(pill.grade);
  p += Math.min(0.3, G.s.nguyenThan * 0.01);      // thần thức mạnh
  p += (G.s.flags.hasDiHoa ? 0.1 : 0);            // dị hỏa
  p += (opts.extraMaterials ? 0.05 : 0);
  p = Math.min(0.98, p);

  log(`Khai lò luyện ${pill.name} (Phẩm ${pill.grade})... tỉ lệ ${Math.round(p * 1000) / 10}%.`, '');

  if (G.rng.chance(p)) {
    G.s.inventory[pillKey] = (G.s.inventory[pillKey] ?? 0) + (1 + G.rng.int(0, 2));
    G.s.stats.pillsMade++;
    log(`✦ Luyện đan thành công! Thu được ${pill.name}.`, 'good');
    return { ok: true };
  }

  // THẤT BẠI — hậu quả tùy phẩm
  const roll = G.rng.next();
  if (pill.grade >= 4 && roll < 0.25) {
    // Nổ lò lớn (phẩm cao): trọng thương nặng, có thể chết
    log('💥 NỔ LÒ! Đan hỏa thất khống, một tiếng nổ long trời — cả gian phòng tan tành!', 'bad');
    deductLifespan(G, 20 + G.rng.int(0, 30), 'nổ lò luyện đan');
    if (G.rng.chance(0.3)) { return kill(G, 'Chết trong vụ nổ lò khi luyện đan phẩm cao.'); }
    return { ok: false };
  }
  if (roll < 0.4) {
    log('Đan dược nổ tung trong lò, ngươi bị phản phệ, hộc máu.', 'bad');
    deductLifespan(G, 3 + G.rng.int(0, 5), 'phản phệ luyện đan');
    return { ok: false };
  }
  if (roll < 0.55 && pill.grade >= 3) {
    log('Dược lực xộc thẳng vào thần hồn — nguyên thần bị cháy sém!', 'bad');
    G.s.nguyenThan = Math.max(0, G.s.nguyenThan - 1);
    if (G.rng.chance(0.1)) return kill(G, 'Linh hồn cháy rụi khi luyện đan — thần hình câu diệt.');
    return { ok: false };
  }
  log('Luyện đan thất bại, nguyên liệu hóa thành tro. Mất trắng.', 'warn');
  return { ok: false };
}

function kill(G, cause) {
  G.s.alive = false;
  G.s.causeOfDeath = cause;
  log('☠ ' + cause, 'death');
  return { ok: false, dead: true };
}
