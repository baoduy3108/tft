// arc_sect.js — ARC tông môn (viết tay): từ tán tu bước vào chốn tranh đoạt.
// Kích hoạt khi người chơi đã vào Luyện Khí và chọn "tìm tông môn" ở hub.

import { registerNodes } from './engine.js';
import { log } from '../state.js';
import { addKarma, addAttention } from '../systems/karma.js';
import { genSect } from '../data/sects.js';
import { makeNPC } from '../systems/npc.js';

const nodes = [
  {
    id: 'sect_start',
    onEnter: (G) => {
      if (!G.s.flags._sect) {
        G.s.flags._sect = genSect(G.rng, 1); // một Phàm cấp tông môn đang tuyển
      }
    },
    text: (G) => {
      const s = G.s.flags._sect;
      return `Sau nhiều ngày lang bạt, ngươi nghe tin ${s.name} (${s.tierName}, ${s.typeName}) đang mở kỳ tuyển đệ tử ngoại môn ba năm một lần tại trấn Thanh Thạch.

Với một tán tu như ngươi, tông môn vừa là cơ hội — có công pháp, có linh thạch, có đồng môn — vừa là hiểm địa: nơi đệ tử có thể giết nhau vì tài nguyên, kẻ yếu bị đẩy đi làm bia đỡ đạn, thiên tài bị trưởng lão nhắm nhe đoạt xá.

Ngươi có đến dự tuyển không?`;
    },
    choices: [
      { label: 'Đến dự tuyển.', goto: 'sect_trial' },
      { label: 'Không. Tán tu tuy khổ nhưng tự do, ít nhất không ai đâm sau lưng.',
        effect: (G) => { G.s.flags.chose_rogue = true; log('Ngươi chọn con đường tán tu cô độc.', 'lore'); },
        screen: 'hub' },
    ],
  },

  {
    id: 'sect_trial',
    text:
`Sân tuyển chật kín thiếu niên gầy gò, ánh mắt vừa khát khao vừa sợ hãi. Một trưởng lão áo xám lười biếng ngồi trên đài, phất tay: "Trắc Linh Thạch. Ai có linh căn thì bước lên, đặt tay vào bia đá. Bia sáng bao nhiêu, tư cách bấy nhiêu."

Đến lượt ngươi.`,
    choices: [
      { label: 'Đặt tay lên bia, thể hiện đúng thực lực.',
        effect: (G) => { G.s.flags.trial_honest = true; },
        goto: 'sect_trial_result' },
      { label: 'Cố ý giấu bớt tư chất, không muốn quá nổi bật.',
        hint: 'Ẩn nhẫn — sống lâu mới là thắng.',
        effect: (G) => { G.s.flags.trial_hidden = true; log('Ngươi thu liễm khí tức, chỉ để bia sáng vừa đủ.', ''); },
        goto: 'sect_trial_result' },
    ],
  },

  {
    id: 'sect_trial_result',
    onEnter: (G) => {
      const speed = G.s.root?.speed ?? 0.35;
      const shown = G.s.flags.trial_hidden ? speed * 0.6 : speed;
      G.s.flags._trialShown = shown;
      if (shown >= 1.5) G.s.flags._trialRank = 'thiên tài';
      else if (shown >= 0.8) G.s.flags._trialRank = 'khá';
      else G.s.flags._trialRank = 'tầm thường';
    },
    text: (G) => {
      const rank = G.s.flags._trialRank;
      if (rank === 'thiên tài') {
        return 'Bia đá bùng sáng rực rỡ! Cả sân xôn xao. Trưởng lão áo xám ngồi thẳng dậy, ánh mắt lóe lên — nửa tán thưởng, nửa... tính toán. Ngươi vừa lọt vào tầm ngắm của những kẻ chuyên "nuôi rồi vặt lông thiên tài".';
      }
      if (rank === 'khá') {
        return 'Bia đá sáng ổn định — không quá chói, đủ để được nhận làm nội môn đệ tử. Một khởi đầu vững, không quá lộ liễu. Có lẽ là điều tốt.';
      }
      return 'Bia đá chỉ sáng lờ mờ. Trưởng lão phất tay chán nản: "Ngoại môn." Ngươi bị xếp vào tầng đáy tông môn — nơi phần lớn tài nguyên chỉ là cặn bã, và tính mạng rẻ như cỏ rác.';
    },
    choices: [
      { label: 'Nhận thân phận, bước vào tông môn.',
        effect: (G) => {
          const s = G.s.flags._sect;
          const pos = G.s.flags._trialRank === 'thiên tài' ? 'Chân truyền'
            : G.s.flags._trialRank === 'khá' ? 'Nội môn đệ tử' : 'Ngoại môn đệ tử';
          G.s.sect = { name: s.name, tier: s.tier, tierName: s.tierName, type: s.type, typeName: s.typeName, position: pos };
          log(`Ngươi gia nhập ${s.name} với thân phận ${pos}.`, 'good');
          if (G.s.flags._trialRank === 'thiên tài') {
            addAttention(G, 8, 'lộ diện là thiên tài');
            log('Nhưng nổi bật giữa bầy sói cũng có nghĩa là trở thành miếng mồi ngon...', 'warn');
          }
          // Cấp phát tài nguyên nhập môn
          G.s.inventory['tu_khi_dan'] = (G.s.inventory['tu_khi_dan'] ?? 0) + 5;
        },
        goto: 'sect_life' },
    ],
  },

  {
    id: 'sect_life',
    onEnter: (G) => {
      // Sinh một đồng môn (có thể là bạn hoặc kẻ thù về sau)
      if (!G.s.flags._peerId) {
        const peer = makeNPC(G, { relativeRealm: 0 });
        G.s.flags._peerId = peer.id;
      }
    },
    text: (G) => {
      const peer = G.s.npcs[G.s.flags._peerId];
      return `Cuộc sống tông môn bắt đầu. Ngươi được giao một gian phòng ẩm thấp và một nhiệm vụ: mỗi tháng nộp đủ linh thạch, nếu không sẽ bị trục xuất (hoặc tệ hơn).

Một đồng môn tên ${peer?.name || 'nào đó'} chủ động bắt chuyện với ngươi. Trong tông môn, một đồng minh có thể cứu mạng ngươi — hoặc bán đứng ngươi.`;
    },
    choices: [
      { label: 'Kết giao chân thành.', hint: 'Đồng minh quý, nhưng lòng người khó dò.',
        effect: (G) => { const peer = G.s.npcs[G.s.flags._peerId]; if (peer) peer.relation += 15; addKarma(G, 1, 'chân thành kết giao'); },
        goto: 'sect_hub_exit' },
      { label: 'Giữ khoảng cách, chỉ hợp tác khi cần.', hint: 'An toàn nhưng cô độc.',
        effect: (G) => { const peer = G.s.npcs[G.s.flags._peerId]; if (peer) peer.relation -= 5; },
        goto: 'sect_hub_exit' },
      { label: 'Lợi dụng hắn để thăng tiến.', hint: 'Nhân quả +xấu.',
        effect: (G) => { addKarma(G, -2, 'toan tính lợi dụng đồng môn'); const peer = G.s.npcs[G.s.flags._peerId]; if (peer) peer.relation -= 10; },
        goto: 'sect_hub_exit' },
    ],
  },

  {
    id: 'sect_hub_exit',
    text: 'Từ đây, con đường tu hành trong tông môn (và ngoài tông môn) là do chính ngươi định đoạt. Hãy tu luyện, tích lũy, và cẩn thận từng bước.',
    choices: [
      { label: '【 Trở về tu luyện. 】', screen: 'hub' },
    ],
  },
];

export function loadSectArc() {
  registerNodes(nodes);
}
