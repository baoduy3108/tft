// intent.js — Diễn giải LỰA CHỌN TỰ DO (người chơi tự gõ). Đây là "vô hạn nhân quả":
// game phân tích ý định rồi (a) khớp vào một nhánh có sẵn để ra HỆ QUẢ THẬT, hoặc
// (b) tạo ra một kết cục ứng biến ảnh hưởng nhân quả / lộ diện / quan hệ NPC.
//
// Đây là bộ diễn giải theo TỪ KHÓA (không phải LLM) — chạy offline, tất định.
// (Muốn "AI thật" hiểu câu tự nhiên bất kỳ thì cần nối API mô hình ngôn ngữ — xem README.)

import { log } from '../state.js';
import { addKarma, addAttention } from './karma.js';

// Bản đồ ý định -> các mẫu từ khóa (tiếng Việt + vài từ Anh).
const INTENTS = [
  ['attack', ['giết', 'chém', 'đánh', 'tấn công', 'ra tay', 'diệt', 'kill', 'attack', 'động thủ', 'hạ sát']],
  ['flee', ['chạy', 'trốn', 'bỏ đi', 'rút lui', 'thoát', 'né', 'flee', 'run', 'lủi', 'chuồn']],
  ['deceive', ['lừa', 'gạt', 'dối', 'giả', 'lừa gạt', 'phỉnh', 'deceive', 'lie', 'bịp', 'diễn']],
  ['steal', ['trộm', 'cướp', 'đoạt', 'lấy cắp', 'móc', 'steal', 'rob', 'chôm']],
  ['help', ['cứu', 'giúp', 'bảo vệ', 'che chở', 'help', 'save', 'đỡ', 'ứng cứu']],
  ['talk', ['nói', 'thương lượng', 'đàm phán', 'hỏi', 'mua', 'trò chuyện', 'talk', 'thuyết phục', 'cầu xin', 'xin']],
  ['observe', ['quan sát', 'chờ', 'đợi', 'nghe ngóng', 'ẩn', 'nấp', 'theo dõi', 'dò', 'wait', 'observe', 'rình']],
  ['cultivate', ['tu luyện', 'thiền', 'ngộ', 'vận công', 'lĩnh ngộ', 'cultivate', 'meditate']],
  ['submit', ['quỳ', 'lạy', 'cúi', 'phục tùng', 'đầu hàng', 'nhẫn nhịn', 'cầu', 'bái', 'kneel']],
  ['take', ['nhặt', 'lấy', 'hái', 'thu', 'nhận', 'take', 'grab', 'chộp']],
  ['explore', ['tìm', 'khám phá', 'thăm dò', 'lục', 'đào', 'search', 'explore']],
  ['pray', ['cầu nguyện', 'khấn', 'van', 'pray', 'cầu trời', 'khẩn cầu']],
  ['refuse', ['từ chối', 'không', 'mặc kệ', 'phớt', 'bỏ qua', 'refuse', 'ignore', 'kệ']],
];

export function parseIntent(text) {
  const t = (text || '').toLowerCase();
  for (const [intent, kws] of INTENTS) {
    if (kws.some((k) => t.includes(k))) return intent;
  }
  return 'improvise';
}

// Phát hiện người chơi nhắc tới các phương án A/B/C/D (vd "chọn cả A và B").
// Tách theo token để không bắt nhầm chữ cái nằm trong từ tiếng Việt (vd "cả", "và").
export function detectChoiceLetters(text) {
  const toks = (text || '').toUpperCase().split(/[\s,.;:!?"'()\/+&-]+/);
  const found = [];
  for (const tok of toks) {
    if (tok.length === 1 && 'ABCDEF'.includes(tok) && !found.includes(tok)) found.push(tok);
  }
  return found;
}

// Khớp ý định vào danh sách lựa chọn có sẵn (theo nhãn). Trả về chỉ số hoặc -1.
export function matchByIntent(intent, labels) {
  const has = (s, arr) => arr.some((k) => s.toLowerCase().includes(k));
  const rules = {
    attack: ['nghênh chiến', 'chiến', 'ra tay', 'giết', 'tấn công', 'lao vào', 'liều'],
    flee: ['chạy', 'bỏ chạy', 'rút', 'trốn', 'rời đi', 'bỏ đi', 'bỏ qua'],
    talk: ['thương lượng', 'mua', 'nói', 'hỏi', 'cầu', 'xin'],
    help: ['che chở', 'cứu', 'giúp', 'bảo vệ', 'chắn'],
    observe: ['quan sát', 'nghe ngóng', 'chờ', 'ẩn', 'nấp', 'thận trọng', 'đề phòng'],
    take: ['hái', 'lấy', 'nhặt', 'thu', 'xông thẳng'],
    submit: ['cúi', 'quỳ', 'nhẫn', 'thu hết khí'],
    refuse: ['từ chối', 'bỏ qua', 'rời đi', 'không', 'đuổi'],
    cultivate: ['tu luyện', 'vận công', 'đắm mình', 'lĩnh ngộ'],
    deceive: ['giả', 'lừa', 'giấu'],
    steal: ['cướp', 'trộm', 'đoạt'],
    explore: ['giải trận', 'dò', 'khám phá', 'quan sát'],
  };
  const keys = rules[intent];
  if (!keys) return -1;
  for (let i = 0; i < labels.length; i++) if (has(labels[i], keys)) return i;
  return -1;
}

// Kết cục ỨNG BIẾN khi không khớp nhánh nào — vẫn tạo hệ quả nhân quả thật.
export function genericOutcome(G, intent, text) {
  switch (intent) {
    case 'attack':
      addAttention(G, 3, 'ra tay giữa chốn đông người');
      addKarma(G, -1, 'manh động bạo lực');
      return { text: 'Ngươi manh động ra tay. Máu tanh khiến những ánh mắt xung quanh chú ý tới ngươi hơn. Bạo lực luôn để lại dấu vết trong nhân quả.', cls: 'warn' };
    case 'deceive':
      addKarma(G, -1, 'gian trá');
      return { text: 'Ngươi giở trò gian trá. Lần này có thể trót lọt, nhưng lời dối trá là một món nợ sẽ có ngày phải trả.', cls: '' };
    case 'steal':
      addAttention(G, 2, 'hành vi trộm cướp bị để ý');
      addKarma(G, -2, 'trộm cướp');
      return { text: 'Ngươi thó lấy thứ không thuộc về mình. Trong tu tiên giới, kẻ trộm của cơ duyên thường chết dưới tay khổ chủ.', cls: 'warn' };
    case 'help':
      addKarma(G, 2, 'ra tay nghĩa hiệp');
      return { text: 'Ngươi chọn giúp đỡ dù chẳng được lợi gì. Một tia thiện niệm hiếm hoi giữa thế gian tàn khốc — nhân quả ghi nhận điều đó.', cls: 'good' };
    case 'talk':
      return { text: 'Ngươi cố dùng lời lẽ hóa giải. Đôi khi cái lưỡi cứu được nhiều mạng hơn thanh kiếm — đôi khi lại chuốc thêm họa.', cls: '' };
    case 'observe':
      G.s.flags._patient = true;
      return { text: 'Ngươi lùi vào bóng tối, kiên nhẫn quan sát. Kẻ sống lâu nhất thường là kẻ ra tay sau cùng.', cls: '' };
    case 'cultivate':
      G.s.cultProgress = Math.min(1, G.s.cultProgress + 0.02);
      return { text: 'Ngươi lặng lẽ vận công giữa hoàn cảnh ngặt nghèo. Tiến độ tu luyện nhích lên đôi chút.', cls: 'good' };
    case 'submit':
      addAttention(G, -1, '');
      return { text: 'Ngươi cúi đầu nhẫn nhịn. Có thể mất mặt, nhưng cái mạng vẫn còn — và kẻ khác bớt để ý tới ngươi.', cls: '' };
    case 'pray':
      return { text: 'Ngươi thầm khấn nguyện. Thiên đạo vô tình, nhưng đôi khi thành tâm cũng lay động được một tia khí vận mong manh.', cls: 'lore' };
    case 'take':
      return { text: 'Ngươi với tay lấy thứ trước mắt. Nhưng ở đời này, thứ dễ lấy nhất thường là cạm bẫy khéo giăng.', cls: '' };
    case 'flee':
      return { text: 'Ngươi chọn rời đi. Bỏ lỡ có thể là bỏ lỡ cơ duyên, cũng có thể là né được một kiếp nạn. Không ai biết trước.', cls: '' };
    case 'refuse':
      return { text: 'Ngươi khước từ, giữ mình ngoài cuộc.', cls: '' };
    default:
      // improvise — thưởng cho sự sáng tạo bằng một tia lĩnh ngộ nhỏ
      if (G.rng.chance(0.15)) {
        G.s.cultProgress = Math.min(1, G.s.cultProgress + 0.01);
        addKarma(G, 1, 'một quyết định khôn ngoan bất ngờ');
        return { text: `Ngươi hành động theo cách riêng: "${text.trim().slice(0, 80)}". Một hướng đi không ai ngờ tới — và đôi khi, chính những nước cờ lạ lại mở ra sinh cơ.`, cls: 'good' };
      }
      return { text: `Ngươi hành động theo cách riêng: "${text.trim().slice(0, 80)}". Thế gian lặng lẽ ghi nhận, dòng nhân quả lại rẽ thêm một nhánh nhỏ...`, cls: 'lore' };
  }
}
