// worldrules.js — Ép 5 QUY TẮC GỐC của thế giới vào cơ chế.
// Trọng tâm: KHÔNG CÓ CƠ DUYÊN MIỄN PHÍ — mọi phần thưởng gắn một cái giá.

import { log } from '../state.js';
import { addKarma, addAttention } from './karma.js';
import { deductLifespan } from './time.js';

// Trao một phần thưởng nhưng LUÔN gắn một cái giá liên kết theo độ lớn (magnitude 1..5).
// reward: { kind, magnitude, apply(G), name }
export function grantWithPrice(G, reward) {
  if (reward.apply) reward.apply(G);
  if (reward.name) log(`✦ Ngươi có được: ${reward.name}.`, 'good');

  const mag = reward.magnitude ?? 1;
  // Trời đạo cân bằng: chọn 1-2 cái giá theo độ lớn phần thưởng.
  const costs = [];
  const roll = G.rng.next();
  if (roll < 0.4) {
    const y = mag * (2 + G.rng.int(0, 3));
    deductLifespan(G, y, 'cái giá của cơ duyên');
    costs.push('thọ nguyên');
  } else if (roll < 0.75) {
    addKarma(G, -mag, 'nợ nhân quả từ cơ duyên');
    costs.push('nhân quả');
  } else {
    addAttention(G, mag * 2, 'cơ duyên lộ ra ngoài');
    costs.push('lộ diện');
  }
  // Phần thưởng lớn: thêm cái giá thứ hai
  if (mag >= 3 && G.rng.chance(0.6)) {
    addAttention(G, mag, 'bảo vật khiến kẻ khác thèm muốn');
    costs.push('lộ diện');
  }
  return costs;
}

// Quy tắc 5: thế giới không xoay quanh nhân vật chính.
// Sinh một "tin đồn" về thiên mệnh chi tử / đại năng khác đang hoạt động.
const OTHER_LEGENDS = [
  'Nghe nói Thiên Kiêu của Thanh Vân Tông vừa đột phá Trúc Cơ khi mới mười sáu tuổi.',
  'Có kẻ nói một vị cổ lão chuyển sinh đã tô ẩn trong Khô Kiệt Tinh Lộ hàng vạn năm.',
  'Đồn rằng một khí vận chi tử vừa bước ra từ bí cảnh, mang theo cả một truyền thừa.',
  'Xa xôi nơi Đế Vực, hai vị Cổ Đế giao thủ, chấn nứt cả một tầng trời.',
  'Một yêu nghiệt vô danh vừa đồ sát cả một tông môn chỉ vì một cây linh dược.',
];
export function worldPulse(G) {
  if (G.rng.chance(0.35)) {
    log('· ' + G.rng.pick(OTHER_LEGENDS), 'lore');
  }
}

// Quy tắc 2: tu tiên là tiến hóa & dị biến — roll biến dị khi đột phá.
const MUTATIONS = [
  { id: 'ho_han', name: 'Đồng tử co lại như rắn', good: false, effect: 'Ánh mắt khiến người thường khiếp sợ (-thiện cảm).' },
  { id: 'gac', name: 'Da mọc vảy mỏng', good: false, effect: 'Phòng ngự +, nhưng ngày càng ít giống người.' },
  { id: 'than_thuc', name: 'Thần thức nhạy bén dị thường', good: true, effect: 'Nguyên thần +1.' },
  { id: 'huyet', name: 'Huyết mạch cổ thức tỉnh một phần', good: true, effect: 'Khí huyết mạnh lên rõ rệt.' },
  { id: 'tam_ma', name: 'Tâm ma nhen nhóm', good: false, effect: 'Đạo tâm bất ổn, dễ tẩu hỏa khi luyện đan/đột phá.' },
  { id: 'hoa_hinh', name: 'Một phần linh hồn hóa dị vật', good: false, effect: 'Mạnh hơn nhưng nhân tính hao mòn.' },
];
export function rollMutation(G) {
  const m = G.rng.pick(MUTATIONS);
  G.s.mutations.push(m.id);
  if (m.id === 'than_thuc') G.s.nguyenThan += 1;
  log(`⚝ Dị biến khi đột phá: ${m.name}. ${m.effect}`, m.good ? 'good' : 'warn');
  if (!m.good && G.s.mutations.filter((x) => !MUTATIONS.find((z) => z.id === x)?.good).length >= 5) {
    log('Ngươi soi mặt xuống mặt nước và không còn nhận ra chính mình... Càng mạnh, càng ít giống con người.', 'lore');
  }
  return m;
}
