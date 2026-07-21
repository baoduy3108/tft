// sects.js — Hệ tông môn / thánh địa. KHÔNG phải nơi bảo vệ mà là nơi tranh đoạt tài nguyên.

// 8 cấp tông môn
export const SECT_TIERS = [
  { tier: 1, name: 'Phàm cấp', realm: 'Luyện Khí – Trúc Cơ', note: 'Tài nguyên nghèo, bị tông môn khác đè.' },
  { tier: 2, name: 'Linh cấp', realm: 'Kim Đan', note: 'Có linh mạch nhỏ, bắt đầu tranh đấu.' },
  { tier: 3, name: 'Huyền cấp', realm: 'Nguyên Anh', note: 'Có bí cảnh riêng, bắt đầu săn thiên tài.' },
  { tier: 4, name: 'Địa cấp', realm: 'Hóa Thần', note: 'Có pháp bảo phẩm 3, trưởng lão giết người.' },
  { tier: 5, name: 'Thiên cấp', realm: 'Luyện Hư', note: 'Linh mạch lớn, tông môn chiến tranh.' },
  { tier: 6, name: 'Vương cấp', realm: 'Đại Thừa', note: 'Bí cảnh cổ đại, bắt đầu nuôi thiên tài.' },
  { tier: 7, name: 'Thánh địa', realm: 'Tiên nhân', note: 'Pháp bảo phẩm 4, truyền thừa cổ.' },
  { tier: 8, name: 'Đế tông', realm: 'Thiên Đế', note: 'Thao túng vũ trụ nhỏ, nuôi đạo tử.' },
];

// 7 loại tông môn
export const SECT_TYPES = [
  { id: 'kiem', name: 'Kiếm tông', note: 'Damage cao, tử vong cao.' },
  { id: 'the', name: 'Thể tông', note: 'Tank mạnh, tu luyện chậm.' },
  { id: 'dan', name: 'Đan tông', note: 'Giàu nhất game, bị săn nhiều nhất.' },
  { id: 'tran', name: 'Trận tông', note: 'Đánh vượt cấp, cần não.' },
  { id: 'hon', name: 'Hồn tông', note: 'Đánh nguyên thần, cực nguy hiểm.' },
  { id: 'ma', name: 'Ma tông', note: 'Ăn người, tu nhanh.' },
  { id: 'dao', name: 'Đạo tông', note: 'Ngộ đạo, late game mạnh.' },
];

// 7 vị trí trong tông môn (thấp -> cao)
export const SECT_POSITIONS = [
  'Ngoại môn đệ tử', 'Nội môn đệ tử', 'Chân truyền', 'Thánh tử',
  'Đạo tử', 'Thiếu tông chủ', 'Tông chủ',
];

const SECT_NAMES = ['Thanh Vân', 'Huyết Sát', 'Vạn Kiếm', 'Thái Hư', 'Cửu U', 'Lưu Quang',
  'Bích Lạc', 'Hắc Phong', 'Ngũ Hành', 'Thiên Đan', 'Vô Cực', 'U Minh'];
const SECT_SUFFIX = ['Tông', 'Môn', 'Các', 'Cung', 'Thánh Địa', 'Trại'];

export function genSect(rng, tier) {
  const type = rng.pick(SECT_TYPES);
  return {
    name: `${rng.pick(SECT_NAMES)} ${rng.pick(SECT_SUFFIX)}`,
    tier,
    tierName: SECT_TIERS[tier - 1].name,
    type: type.id,
    typeName: type.name,
    position: 'Ngoại môn đệ tử',
  };
}
