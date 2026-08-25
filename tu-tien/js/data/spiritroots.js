// spiritroots.js — Linh căn: quyết định TỐC ĐỘ tu luyện ban đầu (không quyết định tương lai).
// Gồm ngũ hành, biến dị, thiên linh căn, và các loại đặc biệt hiếm.
// speed = hệ số nhân tốc độ hấp thu linh khí. rarity = độ hiếm khi "xem linh căn".

export const SPIRIT_ROOTS = [
  // Ngũ linh căn (tạp) — chậm nhất, phổ biến nhất
  { id: 'nguhanh_tap', name: 'Ngũ Hành Tạp Linh Căn', speed: 0.35, rarity: 0.42, tags: ['tạp'],
    desc: 'Đủ ngũ hành nhưng tạp loạn, linh khí phân tán. Tu cực chậm.' },
  { id: 'tuhanh', name: 'Tứ Linh Căn', speed: 0.45, rarity: 0.22, tags: ['tạp'],
    desc: 'Bốn thuộc tính, vẫn tạp.' },
  { id: 'tamhanh', name: 'Tam Linh Căn', speed: 0.6, rarity: 0.15, tags: ['tạp'],
    desc: 'Ba thuộc tính. Tạm ổn cho tán tu.' },
  // Song linh căn theo ngũ hành
  { id: 'song', name: 'Song Linh Căn', speed: 0.9, rarity: 0.09, tags: ['song'],
    desc: 'Hai thuộc tính. Có tư cách vào tông môn nhỏ.' },
  // Đơn linh căn ngũ hành — thiên linh căn
  { id: 'kim', name: 'Kim Linh Căn (đơn)', speed: 1.6, rarity: 0.02, tags: ['đơn', 'kim'],
    desc: 'Đơn hệ Kim, sắc bén, hợp kiếm/đao tu.' },
  { id: 'moc', name: 'Mộc Linh Căn (đơn)', speed: 1.6, rarity: 0.02, tags: ['đơn', 'mộc'],
    desc: 'Đơn hệ Mộc, sinh cơ mạnh, hợp đan tu/hồi phục.' },
  { id: 'thuy', name: 'Thủy Linh Căn (đơn)', speed: 1.6, rarity: 0.02, tags: ['đơn', 'thủy'],
    desc: 'Đơn hệ Thủy, mềm dẻo biến hóa.' },
  { id: 'hoa', name: 'Hỏa Linh Căn (đơn)', speed: 1.7, rarity: 0.018, tags: ['đơn', 'hỏa'],
    desc: 'Đơn hệ Hỏa, sát phạt, hợp luyện đan.' },
  { id: 'tho', name: 'Thổ Linh Căn (đơn)', speed: 1.5, rarity: 0.02, tags: ['đơn', 'thổ'],
    desc: 'Đơn hệ Thổ, phòng ngự bền bỉ.' },
  // Biến dị linh căn — hiếm, mạnh
  { id: 'loi', name: 'Lôi Linh Căn (biến dị)', speed: 2.4, rarity: 0.004, tags: ['biến dị', 'lôi'],
    desc: 'Biến dị Lôi, uy lực công kích kinh người, độ nguy hiểm cao.' },
  { id: 'phong', name: 'Phong Linh Căn (biến dị)', speed: 2.2, rarity: 0.004, tags: ['biến dị', 'phong'],
    desc: 'Biến dị Phong, thân pháp tốc độ tuyệt đỉnh.' },
  { id: 'bang', name: 'Băng Linh Căn (biến dị)', speed: 2.3, rarity: 0.0035, tags: ['biến dị', 'băng'],
    desc: 'Biến dị Băng, khống chế mạnh.' },
  { id: 'am', name: 'Ám Linh Căn (biến dị)', speed: 2.5, rarity: 0.003, tags: ['biến dị', 'ám'],
    desc: 'Biến dị Ám, hợp tà tu/ám sát, dễ chiêu nhân quả.' },
  // Thiên linh căn / thánh thể linh căn — cực hiếm
  { id: 'thien', name: 'Thiên Linh Căn (đơn nhất)', speed: 3.2, rarity: 0.0005, tags: ['thiên', 'đơn'],
    desc: 'Thuần khiết tuyệt đối một hệ. Thiên tài trăm năm khó gặp.' },
  { id: 'hondon', name: 'Hỗn Độn Linh Căn', speed: 4.5, rarity: 0.00002, tags: ['hỗn độn', 'ẩn'],
    desc: 'Truyền thuyết. Dung hợp vạn hệ, tương thích mọi công pháp. Thu hút tai họa cực lớn.' },
  { id: 'vo', name: 'Vô Linh Căn (phế / ẩn)', speed: 0.12, rarity: 0.06, tags: ['phế', 'ẩn'],
    desc: 'Gần như không hấp thu được linh khí — bị coi là phế nhân. Nhưng đôi khi ẩn giấu bí mật...' },
];

export function getRoot(id) {
  return SPIRIT_ROOTS.find((r) => r.id === id) || SPIRIT_ROOTS[0];
}

// "Xem linh căn" — roll ra loại linh căn theo độ hiếm.
export function rollRoot(rng) {
  const total = SPIRIT_ROOTS.reduce((s, r) => s + r.rarity, 0);
  let x = rng.next() * total;
  for (const r of SPIRIT_ROOTS) {
    x -= r.rarity;
    if (x <= 0) return r;
  }
  return SPIRIT_ROOTS[0];
}
