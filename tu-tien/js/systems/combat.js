// combat.js — Chiến đấu theo lượt (rút gọn). Uy áp cảnh giới đè chết cấp thấp.
// Nếu KHÔNG luyện nguyên thần → dễ chết vì công kích linh hồn (đoạt xá/thần thức nghiền).

import { log } from '../state.js';
import { powerAt, getRealm } from '../data/realms.js';
import { luck } from '../state.js';
import { deductLifespan } from './time.js';

// "Sức mạnh" người chơi (theo bậc log10).
export function playerMight(G) {
  let might = G.s.realmId <= 0 ? 0 : powerAt(G.s.realmId, G.s.subIndex).log10();
  const atk = G.s.physique?.buffs?.atk ?? 1;
  might += Math.log10(atk);
  if (G.s.technique) might += (G.s.technique.grade) * 0.15;
  for (const t of G.s.treasures || []) might += Math.log10(t.combatMult || 1);
  if (G.s.flags.huyetBao) might += Math.log10(G.s.flags.huyetBao);
  return might;
}

export function enemyMight(enemy) {
  let m = powerAt(enemy.realmId, enemy.subIndex ?? 0).log10();
  if (enemy.isBoss) m += 0.3;
  if (enemy.mightBonus) m += enemy.mightBonus;
  return m;
}

// Giải quyết một trận. Trả về { outcome: 'win'|'flee'|'injured'|'dead', loot, gap }.
export function resolveCombat(G, enemy, opts = {}) {
  if (!G.s.alive) return { outcome: 'dead' };
  const gap = playerMight(G) - enemyMight(enemy);        // + = ta mạnh hơn
  const l = luck();

  // Uy áp: chênh lệch quá lớn (đối thủ mạnh hơn nhiều bậc) → gần như chết chắc
  if (gap < -4) {
    log(`${enemy.name} chỉ phóng ra một tia uy áp. Ngươi như con kiến dưới chân voi.`, 'bad');
    return finalizeLoss(G, enemy, gap, l, /*crush=*/true);
  }

  // Công kích linh hồn khi ta chưa luyện nguyên thần
  const soulThreshold = (enemy.realmId) * 0.4;
  if (enemy.soulAttack && G.s.nguyenThan < soulThreshold) {
    log(`${enemy.name} tung ra một đòn thần thức công kích thẳng vào nguyên thần ngươi!`, 'bad');
    const soulDeath = 0.5 - G.s.nguyenThan * 0.05;
    if (G.rng.chance(Math.max(0.1, soulDeath))) {
      return kill(G, `Nguyên thần bị ${enemy.name} nghiền nát (chưa luyện nguyên thần). Thức hải sụp đổ.`);
    }
    log('Ngươi gắng gượng chống đỡ, đầu như muốn nổ tung. Nguyên thần trọng thương.', 'warn');
    deductLifespan(G, 3, 'nguyên thần bị công kích');
  }

  // Xác suất thắng theo logistic của gap
  const winP = 1 / (1 + Math.pow(10, -gap * 1.1));
  if (G.rng.chance(winP)) {
    return finalizeWin(G, enemy, gap);
  }

  // Thua: thử bỏ chạy (dựa tốc độ/khí vận)
  const fleeP = Math.min(0.7, 0.25 + (G.s.physique?.buffs?.speed ? 0.2 : 0) + (l.survive - 1) * 0.1);
  if (opts.canFlee !== false && G.rng.chance(fleeP)) {
    log('Ngươi liều mạng bỏ chạy, thoát được trong gang tấc — nhưng bị thương và mất mặt.', 'warn');
    deductLifespan(G, 2, 'trọng thương khi tháo chạy');
    return { outcome: 'flee', gap };
  }
  return finalizeLoss(G, enemy, gap, l, false);
}

function finalizeWin(G, enemy, gap) {
  G.s.flags.huyetBao = 0;
  G.s.stats.kills++;
  log(`Ngươi hạ gục ${enemy.name}!`, 'good');
  const loot = rollLoot(G, enemy);
  return { outcome: 'win', gap, loot };
}

function finalizeLoss(G, enemy, gap, l, crush) {
  G.s.flags.huyetBao = 0;
  // Hộ Mệnh Đan / Hộ mệnh pháp bảo cứu mạng
  if (G.s.flags.hoMenh && G.rng.chance(0.6)) {
    G.s.flags.hoMenh = false;
    log('Hộ Mệnh Đan phát huy tác dụng! Một tia sinh cơ kéo ngươi khỏi lưỡi hái tử thần.', 'good');
    deductLifespan(G, 10, 'kích hoạt hộ mệnh');
    return { outcome: 'injured', gap };
  }
  const deathP = crush ? 0.95 : Math.min(0.9, 0.55 - gap * 0.15);
  if (G.rng.chance(deathP)) {
    return kill(G, `Bị ${enemy.name} đánh chết. Trong thế giới này, kẻ yếu không có quyền sống.`);
  }
  log(`Ngươi bại trận trước ${enemy.name}, thân thể bê bết máu, may mà giữ được cái mạng.`, 'bad');
  deductLifespan(G, 5, 'trọng thương sau bại trận');
  return { outcome: 'injured', gap };
}

function kill(G, cause) {
  G.s.alive = false;
  G.s.causeOfDeath = cause;
  log('☠ ' + cause, 'death');
  return { outcome: 'dead' };
}

// Rơi đồ theo cấp boss/kẻ địch (dùng generator để trao thưởng + cái giá ở nơi gọi).
function rollLoot(G, enemy) {
  const loot = [];
  const minG = enemy.dropGradeMin ?? 1;
  // linh thạch
  loot.push({ type: 'linh_thach', amount: Math.pow(10, (enemy.realmId ?? 1) * 0.5) });
  if (G.rng.chance(0.5)) loot.push({ type: 'pill', gradeMin: minG });
  if (enemy.isBoss && G.rng.chance(0.4)) loot.push({ type: 'treasure', gradeMin: Math.max(1, minG) });
  if (enemy.isBoss && G.rng.chance(0.2)) loot.push({ type: 'technique', gradeMin: Math.max(1, minG) });
  return loot;
}
