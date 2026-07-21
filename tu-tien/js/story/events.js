// events.js — Pool event thủ tục VÔ HẠN. 5 loại chính + biến thể:
// CƠ DUYÊN / CHIẾN TRANH / PHẢN BỘI / NGỘ ĐẠO / DIỆT THẾ.
// Mỗi event: { category, title, text, choices:[{label, hint, act(G)->{text}}] }.

import { G, log, addLinhThach } from '../state.js';
import { luck } from '../state.js';
import { disasterChance, fortuneChance, addKarma, addAttention } from '../systems/karma.js';
import { grantWithPrice, worldPulse } from '../systems/worldrules.js';
import { resolveCombat } from '../systems/combat.js';
import { makeNPC, remember, decideAttitude, mayBetray } from '../systems/npc.js';
import { genHerb } from '../data/herbs.js';
import { genTreasure } from '../data/treasures.js';
import { genTech, NAMED_TECHS } from '../data/techniques.js';
import { getPill, PILLS } from '../data/pills.js';
import { genBoss } from '../data/bosses.js';
import { Big } from '../util/bignum.js';

// ---- Áp dụng loot từ chiến đấu ----
export function applyLoot(G, loot) {
  const got = [];
  for (const it of loot || []) {
    if (it.type === 'linh_thach') {
      addLinhThach(Big.from(it.amount));
      got.push('linh thạch');
    } else if (it.type === 'pill') {
      const keys = Object.keys(PILLS).filter((k) => PILLS[k].grade >= (it.gradeMin - 1));
      const key = G.rng.pick(keys.length ? keys : Object.keys(PILLS));
      G.s.inventory[key] = (G.s.inventory[key] ?? 0) + 1;
      got.push(getPill(key).name);
    } else if (it.type === 'treasure') {
      const t = genTreasure(G.rng, Math.max(1, it.gradeMin));
      G.s.treasures.push(t);
      got.push(t.name + ` (${t.gradeName})`);
    } else if (it.type === 'technique') {
      const tech = genTech(G.rng, Math.max(1, it.gradeMin));
      G.s.inventory['_tech_' + tech.id] = 1;
      G.s._pendingTechs = G.s._pendingTechs || [];
      G.s._pendingTechs.push(tech);
      got.push(tech.name);
    }
  }
  return got;
}

// ---- Chọn loại event theo khí vận / nhân quả ----
export function rollEvent(G) {
  worldPulse(G);
  const dis = disasterChance(G);
  const fort = fortuneChance(G);
  const r = G.rng.next();
  let category;
  if (r < dis * 0.6) category = 'CHIẾN TRANH';
  else if (r < dis) category = 'DIỆT THẾ';
  else if (r < dis + fort) category = 'CƠ DUYÊN';
  else if (r < dis + fort + 0.15) category = 'NGỘ ĐẠO';
  else if (r < dis + fort + 0.22 && Object.keys(G.s.npcs).length > 0) category = 'PHẢN BỘI';
  else category = G.rng.pick(['CƠ DUYÊN', 'CHIẾN TRANH', 'NGỘ ĐẠO']);
  return buildEvent(G, category);
}

function buildEvent(G, category) {
  switch (category) {
    case 'CƠ DUYÊN': return evFortune(G);
    case 'CHIẾN TRANH': return evCombat(G);
    case 'PHẢN BỘI': return evBetrayal(G);
    case 'NGỘ ĐẠO': return evEnlighten(G);
    case 'DIỆT THẾ': return evApocalypse(G);
  }
}

// ---------- CƠ DUYÊN ----------
function evFortune(G) {
  const kind = G.rng.pick(['herb', 'cave', 'relic']);
  if (kind === 'herb') {
    const herb = genHerb(G.rng, G.s.world.tier);
    return {
      category: 'CƠ DUYÊN', title: 'Linh Dược Hoang Dã',
      text: `Giữa khe núi khuất, ngươi bắt gặp một cây ${herb.name} — linh dược phẩm ${herb.grade}, ước chừng ${herb.age.toLocaleString('vi-VN')} năm tuổi. ${herb.sentient ? 'Nó khẽ rung động — dường như đã có linh trí và đang cảnh giác!' : 'Linh khí tỏa ra thanh mát.'}`,
      choices: [
        { label: 'Lập tức hái lấy.', hint: herb.sentient ? 'Nó có thể chạy trốn hoặc phản công.' : 'An toàn.',
          act: (G) => {
            if (herb.sentient && G.rng.chance(0.5)) {
              return { text: `${herb.name} bất ngờ nhổ rễ bỏ chạy, thậm chí phun ra một làn độc vụ! Ngươi chỉ chộp được hư không, còn suýt trúng độc.` };
            }
            G.s.inventory['herb_' + herb.key] = (G.s.inventory['herb_' + herb.key] ?? 0) + 1;
            grantWithPrice(G, { name: herb.name, magnitude: Math.min(5, herb.grade) });
            return { text: `Ngươi hái được ${herb.name}! Nhưng nhớ lấy — trời đạo luôn đòi lại cái giá của nó.` };
          } },
        { label: 'Quan sát xung quanh xem có cạm bẫy/kẻ rình mò không rồi mới quyết định.', hint: 'Thận trọng.',
          act: (G) => {
            if (G.rng.chance(0.4)) {
              return { text: 'Quả nhiên! Có một tu sĩ khác cũng đang rình cây linh dược này. Ngươi lặng lẽ rút lui, giữ được cái mạng. Đôi khi bỏ đi là khôn ngoan.' };
            }
            G.s.inventory['herb_' + herb.key] = (G.s.inventory['herb_' + herb.key] ?? 0) + 1;
            grantWithPrice(G, { name: herb.name, magnitude: Math.min(4, herb.grade) });
            return { text: `Xác nhận an toàn, ngươi ung dung thu hoạch ${herb.name}.` };
          } },
        { label: 'Bỏ qua. Cơ duyên nào cũng có giá, ngươi chưa muốn trả.', act: () => ({ text: 'Ngươi rời đi. Một quyết định tỉnh táo hiếm có ở tu tiên giới.' }) },
      ],
    };
  }
  if (kind === 'cave') {
    return {
      category: 'CƠ DUYÊN', title: 'Động Phủ Cổ Nhân',
      text: 'Một hang động ẩn sau thác nước cạn. Bên trong có dấu vết bố trí của một tu sĩ đã viên tịch từ lâu — có thể còn di vật.',
      choices: [
        { label: 'Xông thẳng vào lấy đồ.', hint: 'Có thể dính cấm chế.',
          act: (G) => {
            if (G.rng.chance(0.35)) { const y = 10 + G.rng.int(0, 20); G.s.thoNguyen -= y; return { text: `Một cấm chế còn sót lại kích hoạt! Ngươi trúng đòn, hộc máu (-${y} năm thọ). May chưa mất mạng.` }; }
            const t = genTreasure(G.rng, Math.min(4, 1 + G.rng.int(0, 3)));
            G.s.treasures.push(t);
            grantWithPrice(G, { name: t.name, magnitude: t.grade });
            return { text: `Ngươi tìm được di bảo: ${t.name} (${t.gradeName})!` };
          } },
        { label: 'Thận trọng giải trận trước (cần chút hiểu biết trận pháp).', hint: 'An toàn hơn nếu có ngộ tính.',
          act: (G) => {
            const ok = G.rng.chance(0.5 + (G.s.physique?.buffs?.comprehend ? 0.2 : 0));
            if (!ok) return { text: 'Ngươi loay hoay mãi không phá nổi cấm chế, đành rút lui tay không.' };
            addLinhThach(Big.from(Math.pow(10, 2 + G.s.realmId * 0.3)));
            return { text: 'Ngươi khéo léo hóa giải cấm chế, thu được một ít linh thạch và tránh được tai họa.' };
          } },
        { label: 'Không mạo hiểm, rời đi.', act: () => ({ text: 'Ngươi quay lưng với hang động. Sống lâu mới là thắng.' }) },
      ],
    };
  }
  // relic / truyền thừa
  return {
    category: 'CƠ DUYÊN', title: 'Truyền Thừa Cổ Xưa',
    text: 'Một mảnh ngọc giản phát sáng mờ trong đống đổ nát. Bên trong dường như phong ấn một môn công pháp cổ.',
    choices: [
      { label: 'Dùng thần thức dò vào ngọc giản.', hint: 'Nếu nguyên thần yếu, có thể bị phản phệ.',
        act: (G) => {
          if (G.s.nguyenThan < 2 && G.rng.chance(0.4)) { G.s.thoNguyen -= 5; return { text: 'Thần thức quá yếu, ngươi bị luồng thông tin phản chấn, đầu đau như búa bổ.' }; }
          const grade = Math.min(4, 2 + G.rng.int(0, 2));
          const tech = genTech(G.rng, grade);
          G.s._pendingTechs = G.s._pendingTechs || [];
          G.s._pendingTechs.push(tech);
          grantWithPrice(G, { name: `công pháp ${tech.name}`, magnitude: grade });
          return { text: `Ngươi lĩnh hội được ${tech.name} (Phẩm ${grade}, ${tech.type})! Có thể trang bị ở Túi đồ.` };
        } },
      { label: 'Bỏ đi — truyền thừa vô chủ thường là mồi nhử.', act: () => ({ text: 'Ngươi cảnh giác rời đi.' }) },
    ],
  };
}

// ---------- CHIẾN TRANH / CHẠM TRÁN ----------
function evCombat(G) {
  const enemy = G.rng.chance(0.3) ? genBoss(G.rng, G.s.realmId) : makeNPC(G, { relativeRealm: G.rng.int(-1, 3) });
  const enemyName = enemy.name;
  const att = enemy.isBoss ? 'muốn diệt trừ hậu họa' : decideAttitude(G, enemy);
  return {
    category: 'CHIẾN TRANH', title: enemy.isBoss ? 'Cường Địch Xuất Hiện' : 'Chạm Trán',
    text: `${enemyName}${enemy.isBoss ? '' : ` (${enemy.traits.join(', ')}; mục tiêu: ${enemy.goal})`} chặn đường ngươi. Thái độ: ${att}.${enemy.soulAttack ? ' Ngươi cảm nhận một áp lực thần hồn kinh người tỏa ra từ hắn.' : ''}`,
    choices: [
      { label: 'Nghênh chiến!', hint: 'Sinh tử tùy thực lực.',
        act: (G) => {
          const res = resolveCombat(G, enemy);
          if (res.outcome === 'win') {
            const got = applyLoot(G, res.loot);
            if (!enemy.isBoss) enemy.alive = false;
            return { text: `Ngươi chiến thắng!${got.length ? ' Thu được: ' + got.join(', ') + '.' : ''}` };
          }
          if (res.outcome === 'flee') return { text: 'Ngươi đuối thế nhưng kịp đào thoát.' };
          if (res.outcome === 'injured') return { text: 'Ngươi bại trận, trọng thương nhưng giữ được mạng.' };
          return { text: G.s.causeOfDeath || 'Ngươi đã tử trận.' };
        } },
      { label: 'Thử thương lượng / mua đường.', hint: 'Tốn linh thạch, tùy tính cách đối phương.',
        show: () => !enemy.isBoss,
        act: (G) => {
          if (enemy.traits.includes('tham lam')) { addLinhThach(Big.from(-100)); remember(enemy, 'hối lộ', 10); return { text: `${enemyName} nhận linh thạch rồi cho ngươi qua — lần này thôi.` }; }
          if (enemy.traits.includes('tàn nhẫn')) { const res = resolveCombat(G, enemy); return { text: res.outcome === 'dead' ? (G.s.causeOfDeath) : `${enemyName} khinh miệt lời cầu xin, ra tay ngay. ${res.outcome}.` }; }
          return { text: `${enemyName} do dự, rồi phất tay bỏ đi. Ngươi thoát nạn.` };
        } },
      { label: 'Bỏ chạy ngay.', hint: 'Dựa vào tốc độ & khí vận.',
        act: (G) => {
          const p = 0.4 + (G.s.physique?.buffs?.speed ? 0.25 : 0) + (luck().survive - 1) * 0.1;
          if (G.rng.chance(p)) return { text: 'Ngươi chạy thoát trong gang tấc.' };
          const res = resolveCombat(G, enemy, { canFlee: false });
          return { text: res.outcome === 'dead' ? G.s.causeOfDeath : `Bị đuổi kịp! Kết quả: ${res.outcome}.` };
        } },
    ],
  };
}

// ---------- PHẢN BỘI ----------
function evBetrayal(G) {
  const ids = Object.keys(G.s.npcs).filter((id) => G.s.npcs[id].alive);
  const npc = ids.length ? G.s.npcs[G.rng.pick(ids)] : makeNPC(G, { relativeRealm: 0 });
  return {
    category: 'PHẢN BỘI', title: 'Lòng Người Khó Dò',
    text: `${npc.name}, kẻ ngươi từng xem là bạn đồng hành, rủ ngươi cùng khám phá một bí cảnh nhỏ. Nhưng có gì đó trong ánh mắt hắn khiến ngươi bất an...`,
    choices: [
      { label: 'Tin tưởng và đi cùng.', hint: 'Rủi ro nếu hắn có ý đồ.',
        act: (G) => {
          if (mayBetray(G, npc)) {
            G.s.stats.betrayals++;
            addLinhThach(Big.from(-Math.pow(10, 1 + G.s.realmId * 0.2)));
            remember(npc, 'phản bội ngươi', -80);
            const res = resolveCombat(G, { name: npc.name, realmId: npc.realmId, subIndex: npc.subIndex, mightBonus: 0.3 });
            return { text: res.outcome === 'dead' ? `${npc.name} bất ngờ ra tay sau lưng! ` + G.s.causeOfDeath : `${npc.name} trở mặt phục kích ngươi giữa bí cảnh! Ngươi chống trả (${res.outcome}) và ghi hận kẻ này.` };
          }
          remember(npc, 'cùng vào sinh ra tử', 20);
          return { text: `Chuyến đi suôn sẻ. ${npc.name} quả thực là bạn tốt — quan hệ khăng khít hơn. (Ở đời này, hiếm.)` };
        } },
      { label: 'Giả vờ đồng ý nhưng âm thầm đề phòng.', hint: 'Cảnh giác.',
        act: (G) => {
          remember(npc, 'ngươi đề phòng hắn', -5);
          if (mayBetray(G, npc)) return { text: `Đúng như dự đoán, ${npc.name} định ra tay — nhưng ngươi đã thủ sẵn nên phản đòn, khiến hắn bỏ chạy. Từ nay hai bên thành thù.` };
          return { text: `${npc.name} không có động thái xấu. Sự đề phòng của ngươi khiến quan hệ hơi lạnh nhạt, nhưng an toàn.` };
        } },
      { label: 'Từ chối thẳng thừng.', act: (G) => { remember(npc, 'ngươi cự tuyệt', -10); return { text: 'Ngươi từ chối. Có thể mất một cơ hội, cũng có thể tránh một cái bẫy. Không ai biết được.' }; } },
    ],
  };
}

// ---------- NGỘ ĐẠO ----------
function evEnlighten(G) {
  return {
    category: 'NGỘ ĐẠO', title: 'Khoảnh Khắc Lĩnh Ngộ',
    text: G.rng.pick([
      'Ngồi bên dòng suối, nhìn nước chảy đá mòn, tâm ngươi bỗng tĩnh lặng lạ thường...',
      'Một chiếc lá khô xoay tròn rơi xuống. Trong khoảnh khắc, ngươi như chạm được một tia đạo vận.',
      'Ngươi mơ thấy một bàn cờ trải khắp thiên địa, còn mình chỉ là một quân tốt nhỏ bé.',
    ]),
    choices: [
      { label: 'Đắm mình vào cảm ngộ (tốn thời gian).', hint: 'Có thể +tiến độ tu luyện / +ngộ đạo.',
        act: (G) => {
          const gain = 0.08 + G.rng.range(0, 0.12);
          G.s.cultProgress = Math.min(1, G.s.cultProgress + gain);
          if (G.rng.chance(0.3)) { G.s.flags.ngoDaoBuff = 0.1; return { text: `Tâm cảnh thăng hoa! Tiến độ tu luyện +${Math.round(gain * 100)}%, và ngươi giữ được một tia linh cảm cho lần đột phá tới.` }; }
          return { text: `Ngươi lĩnh hội được đôi phần, tiến độ tu luyện +${Math.round(gain * 100)}%.` };
        } },
      { label: 'Ghi nhớ nhưng không sa đà — còn nhiều việc phải làm.', act: () => ({ text: 'Ngươi mỉm cười, cất giữ cảm ngộ trong lòng rồi tiếp tục lên đường.' }) },
    ],
  };
}

// ---------- DIỆT THẾ ----------
function evApocalypse(G) {
  return {
    category: 'DIỆT THẾ', title: 'Tai Kiếp Giáng Thế',
    text: G.rng.pick([
      'Bầu trời [Khô Kiệt Tinh Lộ] bỗng nứt ra một vết đen. Không gian rung chuyển — một tai kiếp đang lan tới!',
      'Đại địa gầm rú, linh khí cuồng loạn. Nghe nói có hai đại năng giao thủ nơi xa, dư ba quét tới cả vùng này.',
      'Một cơn "linh triều" (thủy triều linh khí) hỗn loạn tràn qua, cuốn theo vô số yêu thú phát cuồng.',
    ]),
    choices: [
      { label: 'Tìm chỗ ẩn nấp, cố sống sót qua tai kiếp.', hint: 'Dựa vào khí vận sinh tồn.',
        act: (G) => {
          const p = 0.5 + (luck().survive - 1) * 0.15;
          if (G.rng.chance(p)) return { text: 'Ngươi nép mình trong một khe đá, nín thở chờ tai kiếp qua đi. Sống sót — lần này.' };
          const y = 5 + G.rng.int(0, 20); G.s.thoNguyen -= y;
          if (G.s.thoNguyen <= 0) { G.s.alive = false; G.s.causeOfDeath = 'Bị cuốn vào tai kiếp diệt thế, thân tan trong dư ba của hai đại năng.'; return { text: G.s.causeOfDeath }; }
          return { text: `Dư ba tai kiếp vẫn quét trúng ngươi, trọng thương (-${y} năm thọ). Ngươi bò ra khỏi đống đổ nát.` };
        } },
      { label: 'Liều mình lao vào tâm tai kiếp — trong nguy có cơ.', hint: 'Cực kỳ mạo hiểm, nhưng có thể có kỳ ngộ.',
        act: (G) => {
          if (G.rng.chance(0.3 * luck().fortune)) {
            const t = genTreasure(G.rng, Math.min(5, 3 + G.rng.int(0, 2)));
            G.s.treasures.push(t);
            grantWithPrice(G, { name: t.name, magnitude: t.grade });
            addAttention(G, 5, 'liều mạng giữa tai kiếp bị nhiều kẻ chú ý');
            return { text: `Giữa tâm bão hủy diệt, ngươi chộp được một cơ duyên: ${t.name} (${t.gradeName})! Nhưng ánh mắt của những kẻ mạnh cũng đã dán vào ngươi.` };
          }
          G.s.alive = false; G.s.causeOfDeath = 'Tham lam lao vào tâm tai kiếp, thân xác hóa thành hư vô.';
          return { text: G.s.causeOfDeath };
        } },
    ],
  };
}
