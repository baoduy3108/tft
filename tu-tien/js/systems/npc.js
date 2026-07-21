// npc.js — AI thế giới. Mọi sinh linh đều là "người chơi" (quy tắc gốc):
// có tính cách, ký ức dài hạn, mục tiêu riêng; biết giả yếu, dụ, phản bội, báo thù.

import { getRealm } from '../data/realms.js';

const SURNAMES = ['Lý', 'Vương', 'Trương', 'Triệu', 'Tần', 'Mộ Dung', 'Âu Dương', 'Diệp', 'Hàn', 'Cơ', 'Bạch', 'Huyền Viên'];
const GIVEN = ['Thanh Phong', 'Vô Tình', 'Kiếm Tâm', 'Nhược Thủy', 'Hạo Nhiên', 'Tử Yên', 'Mặc', 'Trần', 'Linh Nhi', 'Thất Sát', 'Dạ', 'Cửu U'];

const TRAITS = ['tham lam', 'thận trọng', 'tàn nhẫn', 'trọng nghĩa', 'kiêu ngạo', 'nhẫn nhịn', 'đa nghi', 'cuồng vọng', 'lãnh khốc', 'giảo hoạt'];
const GOALS = ['đoạt cơ duyên', 'báo thù cố nhân', 'tìm trường sinh', 'bảo vệ tông môn', 'thu thập linh dược', 'đột phá cảnh giới', 'ẩn nhẫn chờ thời', 'thống trị một vùng'];

// Tạo một NPC. relativeRealm: lệch cảnh giới so với người chơi.
export function makeNPC(G, opts = {}) {
  const rng = G.rng;
  const realmId = Math.max(0, Math.min(100, (opts.realmId ?? G.s.realmId) + (opts.relativeRealm ?? rng.int(-2, 3))));
  const name = `${rng.pick(SURNAMES)} ${rng.pick(GIVEN)}`;
  // Di truyền tính cách: nếu có parentTraits, thiên về đó
  const traits = [];
  const n = rng.int(1, 2);
  for (let i = 0; i < n; i++) {
    if (opts.parentTraits && rng.chance(0.5)) traits.push(rng.pick(opts.parentTraits));
    else traits.push(rng.pick(TRAITS));
  }
  const npc = {
    id: `npc_${rng.int(0, 1e9)}`,
    name,
    realmId,
    subIndex: rng.int(0, 3),
    traits: [...new Set(traits)],
    goal: rng.pick(GOALS),
    fear: rng.chance(0.7),      // sợ chết -> dễ đầu hàng/chạy
    memory: [],                 // {who, deed} : ai cứu/hại/phản bội/cướp cơ duyên
    relation: 0,                // -100..100 với người chơi
    alive: true,
    fakeWeak: traits.includes('giảo hoạt') && rng.chance(0.5), // giả yếu để dụ
  };
  G.s.npcs[npc.id] = npc;
  return npc;
}

// Ghi nhớ hành vi của người chơi đối với NPC.
export function remember(npc, deed, delta) {
  npc.memory.push({ deed, at: Date.now() });
  npc.relation = Math.max(-100, Math.min(100, npc.relation + delta));
  if (npc.memory.length > 20) npc.memory.shift();
}

// NPC quyết định thái độ với người chơi dựa trên tính cách + ký ức + tương quan lực lượng.
export function decideAttitude(G, npc) {
  const gap = getRealm(Math.max(1, npc.realmId)).topExp - (G.s.realmId <= 0 ? 0 : getRealm(G.s.realmId).topExp);
  const stronger = gap > 0.5;
  // Nền tảng theo quan hệ
  if (npc.relation <= -50) return stronger ? 'thù địch - tấn công' : 'thù địch - chờ thời';
  if (npc.relation >= 50) return 'thân thiện';

  if (npc.traits.includes('tham lam') && stronger && G.s.attention > 5) return 'toan tính cướp đoạt';
  if (npc.traits.includes('tàn nhẫn') && stronger) return 'muốn diệt trừ hậu họa';
  if (npc.traits.includes('trọng nghĩa')) return 'giữ lễ, quan sát';
  if (npc.fear && !stronger) return 'khép nép, giả yếu';
  if (npc.traits.includes('giảo hoạt')) return 'dò xét, có thể phản bội';
  return 'trung lập';
}

// NPC có thể phản bội nếu có lợi (tham lam/giảo hoạt + quan hệ không đủ sâu).
export function mayBetray(G, npc) {
  if (npc.relation >= 70) return false;
  const base = (npc.traits.includes('giảo hoạt') ? 0.4 : 0) + (npc.traits.includes('tham lam') ? 0.3 : 0);
  return G.rng.chance(Math.max(0, base - npc.relation * 0.004));
}
