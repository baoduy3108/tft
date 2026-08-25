// realms.js — 100 đại cảnh giới + mô hình sức mạnh (BigNumber) & thọ nguyên.
//
// Quy tắc sức mạnh (theo spec):
//  - Đầu game (cảnh 1–7): mỗi cảnh ≈ ×2–3 cảnh trước; tiểu cảnh tăng nhẹ.
//  - Từ cảnh thứ 8 trở đi: mỗi TIỂU CẢNH ×10, mỗi ĐẠI CẢNH ×100 → ×1000
//    (hệ số tăng dần → càng về sau càng khó vượt cấp).
// Sức mạnh lưu bằng số mũ log10 (dễ tính, đổi sang Big khi cần).

import { Big } from '../util/bignum.js';

// Tên 100 đại cảnh giới, gom theo nhóm lớn.
const GROUPS = [
  {
    name: 'Tiên Phàm Giới', range: [1, 10],
    names: ['Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần',
      'Luyện Hư', 'Hợp Thể', 'Đại Thừa', 'Bán Tiên', 'Chân Tiên'],
  },
  {
    name: 'Tiên Nhân', range: [11, 20],
    names: ['Huyền Tiên', 'Kim Tiên', 'Thái Ất Tiên', 'Đại La Tiên', 'Chuẩn Thánh',
      'Thánh Nhân', 'Thánh Vương', 'Thánh Hoàng', 'Thánh Đế', 'Thiên Đế'],
  },
  {
    name: 'Đế Cấp', range: [21, 40],
    names: ['Hư Không Đế', 'Luân Hồi Đế', 'Thiên Đạo Đế', 'Vũ Trụ Đế', 'Đa Vũ Trụ Đế',
      'Thời Gian Đế', 'Nhân Quả Đế', 'Khởi Nguyên Đế', 'Hư Vô Đế', 'Hỗn Độn Đế',
      'Hỗn Độn Thánh', 'Hỗn Độn Vương', 'Hỗn Độn Hoàng', 'Hỗn Độn Chúa', 'Hỗn Độn Chủ',
      'Hỗn Độn Tổ', 'Hỗn Độn Thủy Tổ', 'Hỗn Độn Đạo Chủ', 'Hỗn Độn Đạo Tổ', 'Hỗn Độn Đạo Đế'],
  },
  {
    name: 'Đạo Cấp', range: [41, 60],
    names: ['Đạo Chủ', 'Đạo Vương', 'Đạo Hoàng', 'Đạo Đế', 'Đạo Tổ',
      'Đại Đạo Chủ', 'Đại Đạo Vương', 'Đại Đạo Hoàng', 'Đại Đạo Đế', 'Đại Đạo Tổ',
      'Vô Thượng Đạo Chủ', 'Vô Thượng Đạo Vương', 'Vô Thượng Đạo Hoàng', 'Vô Thượng Đạo Đế', 'Vô Thượng Đạo Tổ',
      'Tối Thượng Đạo Chủ', 'Tối Thượng Đạo Vương', 'Tối Thượng Đạo Hoàng', 'Tối Thượng Đạo Đế', 'Tối Thượng Đạo Tổ'],
  },
  {
    name: 'Hỗn Nguyên Cấp', range: [61, 80],
    names: ['Hỗn Nguyên', 'Hỗn Nguyên Chủ', 'Hỗn Nguyên Vương', 'Hỗn Nguyên Hoàng', 'Hỗn Nguyên Đế',
      'Hỗn Nguyên Thánh', 'Hỗn Nguyên Đại Thánh', 'Hỗn Nguyên Chúa', 'Hỗn Nguyên Tổ', 'Hỗn Nguyên Cực Tổ',
      'Hỗn Nguyên Khởi Nguyên', 'Hỗn Nguyên Thực Tại', 'Hỗn Nguyên Vũ Trụ', 'Hỗn Nguyên Đa Vũ Trụ', 'Hỗn Nguyên Hư Vô',
      'Hỗn Nguyên Vô Hạn', 'Hỗn Nguyên Vĩnh Hằng', 'Hỗn Nguyên Tối Thượng', 'Hỗn Nguyên Đại Đạo', 'Hỗn Nguyên Chúa Tể'],
  },
  {
    name: 'Đại Đạo Cấp', range: [81, 100],
    names: ['Siêu Hỗn Nguyên', 'Tối Thượng Khởi Nguyên', 'Tối Thượng Hư Vô', 'Tối Thượng Hỗn Độn', 'Tối Thượng Thực Tại',
      'Tối Thượng Vũ Trụ', 'Tối Thượng Đa Vũ Trụ', 'Tối Thượng Vô Hạn', 'Tối Thượng Vĩnh Hằng', 'Tối Thượng Đại Đạo',
      'Khởi Nguyên Chủ', 'Hư Vô Chủ', 'Hỗn Độn Chủ', 'Thực Tại Chủ', 'Vũ Trụ Chủ',
      'Đa Vũ Trụ Chủ', 'Vô Hạn Chủ', 'Vĩnh Hằng Chủ', 'Đại Đạo Chủ', 'ĐẠI ĐẠO'],
  },
];

const SUB_DEFAULT = ['Sơ kỳ', 'Trung kỳ', 'Hậu kỳ', 'Đỉnh phong'];
// Luyện Khí có cửu tầng
const SUB_LUYENKHI = ['Nhất tầng', 'Nhị tầng', 'Tam tầng', 'Tứ tầng', 'Ngũ tầng',
  'Lục tầng', 'Thất tầng', 'Bát tầng', 'Cửu tầng'];

function subStagesFor(id) {
  if (id === 1) return SUB_LUYENKHI;
  return SUB_DEFAULT;
}

// Hệ số nhân (log10) khi vượt từ đại cảnh (id) sang đại cảnh (id+1).
function realmJumpExp(id) {
  if (id < 8) return Math.log10(2.5); // ×2.5 giai đoạn đầu
  // Từ cảnh 8: ramp từ ×100 (10^2) tới ×1000 (10^3) theo tiến trình
  const t = (id - 8) / (100 - 8);
  return 2 + t; // exp 2 → 3
}

// Hệ số nhân (log10) mỗi tiểu cảnh trong đại cảnh (id).
function subStepExp(id) {
  if (id < 8) return Math.log10(1.35); // tăng nhẹ đầu game
  return 1; // ×10 mỗi tiểu cảnh
}

// Thọ nguyên tối đa (năm) khi ĐẠT đại cảnh id. Tăng vọt ở đại cảnh.
function lifespanFor(id) {
  // Phàm nhân ~ 80. Mô hình tăng theo lũy thừa nhẹ rồi vượt bậc.
  if (id <= 0) return 80;
  const table = [150, 320, 800, 2000, 5000, 12000, 30000, 80000, 200000, 500000];
  if (id <= 10) return table[id - 1];
  // Sau Chân Tiên: nhân dần, tới cảnh cao ~ "vô lượng"
  const base = 500000;
  const exp = (id - 10) * 0.7; // mỗi cảnh ~ ×5
  return base * Math.pow(10, exp);
}

// Xây danh sách 100 cảnh giới với power tích lũy (log10 exponent).
function buildRealms() {
  const realms = [];
  let entryExp = 0.3; // log10 sức mạnh sơ kỳ Luyện Khí (~ ×2 phàm nhân)
  let groupIdx = 0;

  for (let id = 1; id <= 100; id++) {
    // Xác định nhóm
    while (GROUPS[groupIdx].range[1] < id) groupIdx++;
    const group = GROUPS[groupIdx];
    const name = group.names[id - group.range[0]];
    const subs = subStagesFor(id);
    const stepExp = subStepExp(id);

    // Sức mạnh từng tiểu cảnh (log10 exponent)
    const subExps = [];
    for (let k = 0; k < subs.length; k++) {
      subExps.push(entryExp + k * stepExp);
    }
    const topExp = subExps[subExps.length - 1];

    realms.push({
      id,
      name,
      group: group.name,
      subStages: subs,
      subExps,             // log10 power của từng tiểu cảnh
      entryExp,            // log10 power sơ kỳ
      topExp,              // log10 power đỉnh phong
      lifespan: Math.round(lifespanFor(id)),
      // Độ khó đột phá cơ bản (0..1 tỉ lệ thành công nền, chưa tính hỗ trợ)
      breakBase: id < 8 ? 0.6 : Math.max(0.02, 0.6 - (id - 8) * 0.006),
    });

    // Sức mạnh sơ kỳ cảnh kế = đỉnh cảnh này + jump
    entryExp = topExp + realmJumpExp(id);
  }
  return realms;
}

export const REALMS = buildRealms();

// Lấy thông tin đại cảnh theo id (1-100)
export function getRealm(id) {
  return REALMS[Math.max(1, Math.min(100, id)) - 1];
}

// Sức mạnh (Big) tại cảnh id + tiểu cảnh subIndex (0-based)
export function powerAt(id, subIndex = 0) {
  const r = getRealm(id);
  const idx = Math.max(0, Math.min(r.subExps.length - 1, subIndex));
  return Big.pow10(r.subExps[idx]);
}

// Tên đầy đủ: "Kim Đan Trung kỳ"
export function realmFullName(id, subIndex = 0) {
  const r = getRealm(id);
  if (!r) return 'Phàm Nhân';
  const idx = Math.max(0, Math.min(r.subStages.length - 1, subIndex));
  return `${r.name} ${r.subStages[idx]}`;
}

// Chênh lệch cấp bậc (số bậc log10) giữa 2 (cảnh, tiểu cảnh) — dùng cho uy áp/chiến đấu
export function powerGapExp(a, b) {
  const ea = getRealm(a.id).subExps[a.sub ?? 0];
  const eb = getRealm(b.id).subExps[b.sub ?? 0];
  return ea - eb;
}
