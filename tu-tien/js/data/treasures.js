// treasures.js — Pháp bảo (12 phẩm, có tiến hóa). Càng quý càng dễ bị cướp.

import { TREASURE_POWER_BY_GRADE, getGrade } from './grades.js';

const PRE = ['Huyền Thiết', 'Tử Kim', 'Bích Ngọc', 'Cửu Long', 'Phá Quân', 'Trảm Tiên',
  'Đồ Thần', 'Hỗn Nguyên', 'Thái Cổ', 'Vạn Yêu', 'U Minh', 'Bích Lạc', 'Lôi Đình'];
const KIND = ['Kiếm', 'Đao', 'Thương', 'Chung (chuông)', 'Tháp', 'Đỉnh (vạc)', 'Kính (gương)',
  'Phiến (quạt)', 'Châu (ngọc)', 'Ấn', 'Phướn', 'Giáp', 'Thuẫn'];

// Loại đặc biệt (hiếm)
const SPECIAL = [
  { tag: 'sinh_menh', label: 'Sinh Mệnh pháp bảo', note: 'có linh hồn, có thể giao tiếp & phản kháng.' },
  { tag: 'nguyen_rua', label: 'Nguyền rủa pháp bảo', note: 'mạnh nhưng có thể phản chủ.' },
  { tag: 'hong_mong', label: 'Hồng Mông chí bảo', note: 'một món = đủ hủy diệt cả đa vũ trụ.' },
];

export function genTreasure(rng, grade) {
  const g = getGrade(grade);
  let special = null;
  if (grade >= 5 && rng.chance(0.15)) special = rng.pick(SPECIAL);
  if (grade >= 11) special = SPECIAL[2]; // Hồng Mông chí bảo
  return {
    id: `art_${rng.int(0, 1e9)}`,
    name: `${rng.pick(PRE)} ${rng.pick(KIND)}`,
    grade,
    gradeName: g.name,
    power: TREASURE_POWER_BY_GRADE[grade],
    // Hệ số tăng sức mạnh chiến đấu khi trang bị
    combatMult: 1 + grade * 0.25 + (special?.tag === 'nguyen_rua' ? 0.5 : 0),
    special: special ? special.tag : null,
    specialNote: special ? special.note : null,
    evolveLevel: 0,
    desc: `Pháp bảo phẩm ${grade} - ${g.name}: ${TREASURE_POWER_BY_GRADE[grade]}.`,
    generated: true,
  };
}

// Tiến hóa pháp bảo (dùng tài nguyên/tế luyện) — tăng combatMult, có thể lên phẩm.
export function evolveTreasure(rng, t) {
  t.evolveLevel += 1;
  t.combatMult *= 1.15;
  if (t.evolveLevel % 5 === 0 && t.grade < 12) {
    t.grade += 1;
    t.gradeName = getGrade(t.grade).name;
    t.power = TREASURE_POWER_BY_GRADE[t.grade];
  }
  return t;
}
