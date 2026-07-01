// physiques.js — Thể chất (180 loại). Cho lợi thế nhưng kéo theo nhân quả (quy tắc gốc).
// ~34 thể chất viết tay + generator thủ tục để đủ khung 180.
// Mỗi thể chất: grade (1-12 phẩm), buffs (hệ số), karma (nhân quả sinh ra), desc.

const NAMED = [
  // Phẩm thấp – phổ thông
  { name: 'Phàm Thể', grade: 1, buffs: {}, karma: 0, desc: 'Thân thể người thường, không có gì đặc biệt.' },
  { name: 'Trọc Thể', grade: 1, buffs: { cultivate: 0.8 }, karma: 0, desc: 'Thân thể ô trọc, tu luyện chậm hơn.' },
  { name: 'Linh Mẫn Thể', grade: 2, buffs: { comprehend: 1.2 }, karma: 0, desc: 'Ngộ tính nhỉnh hơn người thường.' },
  { name: 'Cường Kiện Thể', grade: 2, buffs: { hp: 1.3, atk: 1.1 }, karma: 0, desc: 'Khí huyết dồi dào, thể tu cơ bản.' },
  // Phẩm 3 – bắt đầu quý
  { name: 'Băng Linh Thể', grade: 3, buffs: { atk: 1.2, control: 1.3 }, karma: 1, desc: 'Thân mang hàn khí, khống chế mạnh.' },
  { name: 'Kim Cương Bất Hoại Thể', grade: 3, buffs: { hp: 1.6, def: 1.8 }, karma: 1, desc: 'Da thịt cứng như kim cương.' },
  { name: 'Lôi Linh Thể', grade: 3, buffs: { atk: 1.5, cultivate: 1.1 }, karma: 2, desc: 'Thân sinh lôi, sát phạt cực mạnh, dễ chiêu lôi kiếp.' },
  { name: 'Huyết Đồng Thể', grade: 3, buffs: { hp: 1.4, recover: 1.5 }, karma: 2, desc: 'Máu nóng như đồng, hồi phục nhanh — tà tu thèm khát.' },
  // Phẩm 4 – thiên tài
  { name: 'Thái Âm Huyền Thể', grade: 4, buffs: { cultivate: 1.6, soul: 1.4 }, karma: 3, desc: 'Âm nhu chí cực, tu luyện nhanh về đêm.' },
  { name: 'Thái Dương Chân Thể', grade: 4, buffs: { atk: 1.8, cultivate: 1.4 }, karma: 3, desc: 'Dương cương chí cực, khắc tà ma.' },
  { name: 'Tiên Thiên Đạo Thể', grade: 4, buffs: { comprehend: 1.8, cultivate: 1.5 }, karma: 3, desc: 'Sinh ra đã gần với Đạo.' },
  { name: 'Vạn Độc Bất Xâm Thể', grade: 4, buffs: { def: 1.5, poisonImmune: 1 }, karma: 2, desc: 'Miễn nhiễm mọi độc, hợp đan tu mạo hiểm.' },
  { name: 'Hư Không Thể', grade: 4, buffs: { speed: 1.9, dodge: 1.6 }, karma: 3, desc: 'Thân hợp hư không, thân pháp phiêu hốt.' },
  // Phẩm 5 – truyền thuyết (hiếm ở thế giới thấp)
  { name: 'Cửu Chuyển Hoàng Kim Thể', grade: 5, buffs: { hp: 2.5, def: 2.5, atk: 1.6 }, karma: 4, desc: 'Thể tu tối thượng, nhục thân địch pháp bảo.' },
  { name: 'Thái Cổ Long Thể', grade: 5, buffs: { hp: 2.2, atk: 2.2, cultivate: 1.6 }, karma: 4, desc: 'Huyết mạch chân long viễn cổ.' },
  { name: 'Hỗn Nguyên Nhất Khí Thể', grade: 5, buffs: { cultivate: 2.0, soul: 1.8 }, karma: 4, desc: 'Dung hợp nhất khí, mọi công pháp tương thích.' },
  { name: 'Bất Diệt Kim Thân', grade: 5, buffs: { recover: 2.5, hp: 2.0 }, karma: 4, desc: 'Chỉ cần một giọt máu là tái sinh.' },
  { name: 'Thôn Thiên Ma Thể', grade: 5, buffs: { atk: 2.0, devour: 1 }, karma: 6, desc: 'Nuốt vạn vật để mạnh lên — nhân quả cực nặng.' },
  // Phẩm 6+ – gần như không tồn tại ở vũ trụ khởi đầu
  { name: 'Tiên Linh Chi Thể', grade: 6, buffs: { cultivate: 3.0, comprehend: 2.0 }, karma: 5, desc: 'Thể chất của tiên nhân bẩm sinh.' },
  { name: 'Đế Long Thánh Thể', grade: 7, buffs: { hp: 4, atk: 4, def: 3 }, karma: 6, desc: 'Thánh thể mang uy nghiêm đế vương.' },
  { name: 'Hồng Hoang Cổ Thể', grade: 8, buffs: { hp: 6, atk: 5, cultivate: 3 }, karma: 7, desc: 'Thân thể của cổ tộc thời hồng hoang.' },
  { name: 'Hỗn Độn Thánh Thể', grade: 9, buffs: { hp: 10, atk: 8, cultivate: 5, soul: 4 }, karma: 8, desc: 'Sinh từ hỗn độn, gần như bất khả chiến bại cùng cấp.' },
  { name: 'Đạo Thể', grade: 10, buffs: { comprehend: 6, cultivate: 6 }, karma: 8, desc: 'Bản thân chính là một phần của Đạo.' },
  { name: 'Hồng Mông Chí Thể', grade: 12, buffs: { hp: 50, atk: 50, cultivate: 20, soul: 20 }, karma: 12, desc: 'Truyền thuyết trong truyền thuyết — có thể chưa từng xuất hiện.' },
];

// Kho từ để sinh thủ tục các thể chất còn lại
const PREFIX = ['Huyền', 'Thái Cổ', 'Cửu U', 'Vạn Cổ', 'Chí Tôn', 'Hư Vô', 'Thái Sơ', 'Nguyên Thủy',
  'Bích Lạc', 'Cửu Thiên', 'Đại La', 'Tử Kim', 'Huyết', 'Băng Hàn', 'Viêm Dương', 'Thanh Liên',
  'Bạch Cốt', 'Hắc Ám', 'Quang Minh', 'Lôi Đình', 'Cuồng Phong', 'Địa Sát', 'Thiên Cương'];
const CORE = ['Long', 'Phượng', 'Kỳ Lân', 'Thần', 'Ma', 'Yêu', 'Quỷ', 'Đạo', 'Tiên', 'Thánh',
  'Kiếm', 'Đan', 'Hồn', 'Linh', 'Cương', 'Nhu', 'Huyễn', 'Chân'];
const SUFFIX = ['Thể', 'Chân Thể', 'Thánh Thể', 'Đạo Thể', 'Ma Thể', 'Thần Thể', 'Huyền Thể'];

function genPhysique(rng, idx) {
  const grade = rng.weighted([
    [40, 2], [30, 3], [18, 4], [8, 5], [3, 6], [1, 7],
  ]);
  const name = `${rng.pick(PREFIX)} ${rng.pick(CORE)} ${rng.pick(SUFFIX)}`;
  const g = grade;
  const buffs = {};
  const keys = ['hp', 'atk', 'def', 'cultivate', 'comprehend', 'soul', 'speed', 'recover', 'control'];
  const n = 1 + (g >= 4 ? 2 : g >= 3 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const k = rng.pick(keys);
    buffs[k] = Math.round((1 + g * 0.25 + rng.range(0, 0.5)) * 10) / 10;
  }
  return {
    name,
    grade: g,
    buffs,
    karma: Math.max(0, g - 2),
    desc: 'Thể chất hiếm gặp, gốc gác đã thất truyền.',
    generated: true,
  };
}

// Xây danh sách 180 thể chất (deterministic theo seed truyền vào lần đầu)
export function buildPhysiques(rng) {
  const list = NAMED.map((p, i) => ({ id: `phys_${i}`, ...p }));
  let i = NAMED.length;
  while (list.length < 180) {
    const p = genPhysique(rng, i);
    list.push({ id: `phys_${i}`, ...p });
    i++;
  }
  return list;
}

// Roll thể chất khởi đầu: đa số Phàm Thể, hiếm khi ra thể chất quý.
export function rollStartPhysique(rng, physiques) {
  // 78% Phàm/Trọc thể, phần còn lại theo độ hiếm giảm dần theo phẩm.
  if (rng.chance(0.78)) {
    return physiques.find((p) => p.name === 'Phàm Thể');
  }
  const pool = physiques.filter((p) => p.grade >= 2);
  return rng.weighted(pool, (p) => 1 / Math.pow(6, p.grade - 1));
}
