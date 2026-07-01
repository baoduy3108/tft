// worlds.js — Cấu trúc vũ trụ chồng chéo (vô hạn thế giới / vô hạn tầng).
//  1 Thế giới = 1 map ; 1 Tầng = vô hạn thế giới ; 1 Đại tầng = vô hạn tầng.
// Cấp thế giới (worldTier 1..9) quyết định trần phẩm & uy áp (xem grades.js).

export const WORLD_TIERS = [
  { tier: 1, name: 'Phàm Giới', realmRange: [1, 10], selfAware: false,
    desc: 'Thế giới cấp thấp nhất. Linh khí loãng, phẩm ≥5 gần như không tồn tại.' },
  { tier: 2, name: 'Linh Giới', realmRange: [8, 15], selfAware: false,
    desc: 'Linh khí đậm hơn, tông môn tranh đấu khốc liệt.' },
  { tier: 3, name: 'Tiên Giới', realmRange: [11, 20], selfAware: false,
    desc: 'Nơi tiên nhân trú ngụ.' },
  { tier: 4, name: 'Thánh Giới', realmRange: [16, 25], selfAware: false,
    desc: 'Thánh nhân lập giáo, đại đạo hiển hiện.' },
  { tier: 5, name: 'Đế Vực', realmRange: [21, 40], selfAware: false,
    desc: 'Cổ Đế trấn thủ, một bước lầm là tro bụi.' },
  { tier: 6, name: 'Hồng Hoang', realmRange: [30, 50], selfAware: true,
    desc: 'Vùng đất viễn cổ hoang vu. Map bắt đầu có ý thức.' },
  { tier: 7, name: 'Hỗn Độn Hải', realmRange: [41, 70], selfAware: true,
    desc: 'Biển hỗn độn vô biên, sinh vật không thể lý giải.' },
  { tier: 8, name: 'Hồng Mông Hải', realmRange: [61, 90], selfAware: true,
    desc: 'Nơi khởi nguyên vạn Đạo.' },
  { tier: 9, name: 'Vô Hạn Ngoại Vực', realmRange: [81, 100], selfAware: true,
    desc: 'Bên ngoài mọi thứ. Luật lệ là do kẻ mạnh nhất viết ra.' },
];

export function getWorldTier(tier) {
  return WORLD_TIERS[Math.max(1, Math.min(9, tier)) - 1];
}

// Sinh một "thế giới" cụ thể (1 map) trong một tầng, có tên riêng.
const WORLD_NAME_A = ['Khô Kiệt', 'Hoang Vu', 'Tàn Phá', 'U Minh', 'Thái Cổ', 'Lưu Ly',
  'Huyền Băng', 'Viêm Hoang', 'Thanh Khâu', 'Bích Lạc', 'Tử Vong', 'Vạn Yêu'];
const WORLD_NAME_B = ['Tinh Lộ', 'Đại Lục', 'Tinh Vực', 'Chi Địa', 'Giới', 'Vực',
  'Tinh Hà', 'Bí Cảnh', 'Cấm Địa', 'Thế Giới'];

export function genWorld(rng, tier, layer = 1) {
  const wt = getWorldTier(tier);
  const name = `[${rng.pick(WORLD_NAME_A)} ${rng.pick(WORLD_NAME_B)}]`;
  return {
    tier,
    layer,
    name,
    tierName: wt.name,
    selfAware: wt.selfAware,
    // Uy áp: sinh linh cảnh giới cao đè chết cảnh thấp qua uy áp (dùng ở combat/di chuyển)
    oppressionExp: wt.realmRange[0], // ngưỡng cảnh giới "an toàn" tối thiểu
    desc: wt.desc,
  };
}

// Thế giới khởi đầu cố định của người chơi: một góc bị ruồng bỏ của Phàm Giới.
export function startingWorld() {
  return {
    tier: 1,
    layer: 1,
    name: '[Khô Kiệt Tinh Lộ]',
    tierName: 'Phàm Giới',
    selfAware: false,
    oppressionExp: 1,
    desc: 'Một góc hoang vu bị ruồng bỏ của Phàm Giới. Tài nguyên cạn kiệt, ' +
      'các tông môn thượng tầng lũng đoạn con đường thăng tiến. Phàm nhân chỉ là ' +
      '"huyết thực" hoặc "vật thí nghiệm" để luyện đan, tế luyện.',
  };
}
