// arc_prologue.js — ARC MỞ MÀN (viết tay): Phàm nhân tại [Khô Kiệt Tinh Lộ].
// Giới thiệu thế giới tàn khốc, lộ linh căn/thể chất/khí vận, kích hoạt cơ duyên ẩn,
// dẫn vào vòng lặp tu luyện (màn hình 'hub').

import { registerNodes } from './engine.js';
import { G, log } from '../state.js';
import { addKarma, addAttention } from '../systems/karma.js';
import { grantWithPrice } from '../systems/worldrules.js';
import { luck } from '../state.js';

const nodes = [
  {
    id: 'prologue_start',
    text: () =>
`Năm ngươi mười lăm tuổi.

[Khô Kiệt Tinh Lộ] — một góc hoang vu bị trời đất ruồng bỏ. Linh khí ở đây loãng đến mức cây cỏ còi cọc, đất đai nứt nẻ như da người chết khát. Người ta bảo đây từng là một tinh vực trù phú, nhưng các đại tông môn đã hút cạn long mạch rồi bỏ đi, để lại một mảnh đất chết cho lũ phàm nhân bọ kiến bám víu sinh tồn.

Ngươi lớn lên trong Thôn Khô Thạch, nơi một bát cháo loãng cũng là xa xỉ. Ngươi chưa từng thấy tiên nhân bay trên mây như trong truyện kể của bà lão mù đầu thôn. Ngươi chỉ thấy đói, thấy rét, và thỉnh thoảng — thấy người ta biến mất.

Ngươi là ai, trước khi câu chuyện này bắt đầu?`,
    choices: [
      {
        label: 'Con của một thợ săn nghèo đã chết vì thú dữ — thân thể ngươi rắn rỏi hơn bạn đồng lứa.',
        hint: 'Khí huyết tốt hơn một chút.',
        effect: (G) => {
          G.s.flags.origin = 'thosan';
          if (G.s.physique?.buffs) G.s.physique.buffs.hp = (G.s.physique.buffs.hp ?? 1) * 1.1;
          log('Xuất thân: con thợ săn. Thân thể ngươi quen với đói khát và gian khổ.', 'lore');
        },
        goto: 'prologue_village',
      },
      {
        label: 'Một đứa trẻ mồ côi nhặt ve chai — ngươi sống sót nhờ luôn cảnh giác và nhanh trí.',
        hint: 'Cảnh giác cao, dễ nhận ra hiểm nguy.',
        effect: (G) => {
          G.s.flags.origin = 'conhi';
          G.s.flags.wary = true;
          log('Xuất thân: cô nhi. Ngươi học được rằng lòng tốt luôn có giá.', 'lore');
        },
        goto: 'prologue_village',
      },
      {
        label: 'Con của một nhà buôn sa cơ — ngươi biết chữ, biết tính toán, và còn giữ vài đồng bạc vụn.',
        hint: 'Có chút bạc & tri thức.',
        effect: (G) => {
          G.s.flags.origin = 'nhabuon';
          G.s.flags.literate = true;
          G.s.inventory['bac_vun'] = (G.s.inventory['bac_vun'] ?? 0) + 30;
          log('Xuất thân: con nhà buôn. Ngươi hiểu rằng mọi thứ trên đời đều có thể mua bán — kể cả mạng người.', 'lore');
        },
        goto: 'prologue_village',
      },
    ],
  },

  {
    id: 'prologue_village',
    text:
`Hôm nay, tiếng chuông đồng khàn đặc vang lên giữa thôn — hồi chuông báo hiệu "Thu Cống".

Mỗi ba năm một lần, người của Hắc Phong Trại — một thế lực tu tiên cấp thấp cai quản vùng này — cưỡi kiếm quang giáng xuống. Chúng đến để lấy "cống phẩm": lương thực, thiếu nữ, và... trẻ con có "căn cốt".

Dân làng quỳ rạp hai bên đường đất. Một tu sĩ áo đen lơ lửng cách mặt đất ba tấc, ánh mắt lướt qua đám đông như nhìn một bầy gia súc. Bên cạnh hắn, một cái lồng sắt nhốt ba đứa trẻ đang khóc.

Hắn dừng lại. Ánh mắt hắn... dừng trên người ngươi.`,
    choices: [
      {
        label: 'Cúi đầu thật thấp, thu hết khí tức, giả làm một kẻ ngu đần vô dụng.',
        hint: 'An toàn. Nhẫn nhịn là bản năng sinh tồn.',
        effect: (G) => {
          G.s.flags.humble = true;
          log('Ngươi cúi rạp đầu, run rẩy như một con giun. Tu sĩ khịt mũi khinh bỉ rồi quay đi.', '');
        },
        goto: 'prologue_after_tribute',
      },
      {
        label: 'Lặng lẽ quan sát tu sĩ — cách hắn điều khiển kiếm quang, hơi thở linh khí quanh hắn.',
        hint: 'Tò mò. Có thể học được gì đó, nhưng ánh mắt sắc bén dễ bị chú ý.',
        effect: (G) => {
          G.s.flags.observed = true;
          addAttention(G, 2, 'ánh mắt ngươi quá sắc bén');
          log('Ngươi ghi nhớ từng chi tiết. Trong lòng, một hạt giống mang tên "khát vọng" nứt vỏ.', 'lore');
        },
        goto: 'prologue_after_tribute',
      },
      {
        label: 'Khi tu sĩ tóm lấy một bé gái, ngươi bước lên chắn đường. (Cực kỳ nguy hiểm)',
        hint: 'Nhân quả +, nhưng ngươi chỉ là phàm nhân trước một tu sĩ.',
        show: (G) => true,
        effect: (G) => {
          G.s.flags.defiant = true;
          addKarma(G, 3, 'liều mình che chở kẻ yếu');
          addAttention(G, 5, 'dám chống lại tu sĩ');
        },
        goto: 'prologue_defiance',
      },
    ],
  },

  {
    id: 'prologue_defiance',
    text:
`"Con sâu cái kiến cũng biết cắn người?"

Tu sĩ áo đen bật cười. Hắn khẽ phất tay áo. Một luồng khí vô hình đập vào ngực ngươi như búa tạ — ngươi bay ngược, đập vào tường đất, miệng trào máu tươi. Xương sườn nứt. Mắt mờ đi.

Trong cơn hấp hối, ngươi nghe thấy tiếng bé gái được thả ra chạy đi, tiếng dân làng hoảng loạn. Và ngươi nghe một giọng nói khác — già nua, khàn khàn, vang lên NGAY TRONG ĐẦU ngươi, nơi không ai khác nghe được:

"...Đứa nhỏ ngốc nghếch. Nhưng một trái tim chưa chết cũng là một loại tư chất. Sống sót đi. Ta chờ ngươi đã lâu lắm rồi."`,
    onEnter: (G) => {
      G.s.thoNguyen -= 2; // trọng thương hao tổn
      log('Ngươi bị trọng thương, suýt mất mạng. Nhưng một giọng nói lạ vang lên trong đầu...', 'warn');
      G.s.flags.heard_voice = true;
    },
    choices: [
      { label: 'Bám lấy giọng nói ấy mà gắng gượng sống sót.', goto: 'prologue_wanderer' },
    ],
  },

  {
    id: 'prologue_after_tribute',
    text: (G) =>
`Đoàn người Hắc Phong Trại rời đi, mang theo ba đứa trẻ trong lồng và một xe cống phẩm. Thôn Khô Thạch chìm trong im lặng ngột ngạt — thứ im lặng của những kẻ đã quen bị coi là gia súc.

${G.s.flags.observed ? 'Nhưng trong ngươi, thứ gì đó đã thay đổi. Ngươi không muốn quỳ nữa. Ngươi muốn bay — như kẻ áo đen kia.' : 'Ngươi thở phào. Sống thêm được ba năm nữa, nếu may mắn.'}

Đêm đó, một lão ăn mày rách rưới lạ mặt gõ cửa nhà ngươi, xin một bát nước. Không ai trong thôn cho lão gì cả. Chỉ có ngươi...`,
    choices: [
      {
        label: 'Chia cho lão nửa bát cháo loãng cuối cùng của mình.',
        hint: 'Ngươi cũng đang đói. Nhưng...',
        effect: (G) => {
          addKarma(G, 2, 'chia miếng ăn cho kẻ khốn cùng');
          G.s.flags.kind_to_beggar = true;
        },
        goto: 'prologue_wanderer',
      },
      {
        label: 'Cho lão bát nước, nhưng cảnh giác quan sát — thời buổi này người tốt thường chết trước.',
        effect: (G) => {
          G.s.flags.cautious_to_beggar = true;
          log('Ngươi cho nước nhưng thủ thế. Lão ăn mày nhìn ngươi, khóe miệng khẽ nhếch.', '');
        },
        goto: 'prologue_wanderer',
      },
      {
        label: 'Đuổi lão đi. Bản thân còn không đủ ăn, lấy đâu bố thí.',
        effect: (G) => {
          G.s.flags.rejected_beggar = true;
          log('Ngươi đóng cửa. Đó là lựa chọn của kẻ sinh tồn. Không ai trách ngươi được.', '');
        },
        goto: 'prologue_wanderer',
      },
    ],
  },

  {
    id: 'prologue_wanderer',
    text: (G) => {
      const kind = G.s.flags.kind_to_beggar;
      const voice = G.s.flags.heard_voice;
      if (voice) {
        return `Ba ngày sau, ngươi tỉnh lại trên chiếc giường rơm. Vết thương đã được ai đó băng bó bằng một loại cỏ lạ có mùi thanh mát.

Lão ăn mày hôm nọ ngồi bên bếp lửa, nhấp một ngụm rượu từ bầu rượu sứt mẻ. Nhưng ánh mắt lão — không hề là ánh mắt của một kẻ ăn xin. Sâu thẳm, tĩnh lặng như vực thẳm vạn năm.

"Cái giọng nói trong đầu ngươi," lão chậm rãi nói, "không phải ảo giác. Ngươi mang trên người một thứ. Nhưng trước khi nói về nó — để ta xem căn cốt của ngươi đã. Đưa tay đây."`;
      }
      return `${kind ? 'Cảm động vì bát cháo,' : 'Vì lý do nào đó,'} lão ăn mày không rời đi ngay. Lão ngồi lại bên bếp lửa tàn của nhà ngươi, nhấp một ngụm rượu từ bầu rượu sứt mẻ.

Rồi lão ngẩng lên. Ánh mắt lão — không hề là ánh mắt của một kẻ ăn xin. Sâu thẳm, tĩnh lặng như vực thẳm vạn năm.

"Nhóc con," lão nói, "ngươi có muốn biết vì sao có kẻ cưỡi kiếm bay trên trời, còn ngươi thì bò dưới đất không? Đưa tay đây. Để lão phu xem căn cốt của ngươi."`;
    },
    choices: [
      {
        label: 'Chìa tay ra. Dù lão là ai, đây là cơ hội duy nhất ngươi từng có.',
        goto: 'prologue_reveal',
      },
      {
        label: 'Do dự. "Ông... muốn gì ở tôi?"',
        hint: 'Cảnh giác không bao giờ thừa.',
        effect: (G) => log('"Muốn gì ư?" Lão cười khàn. "Có lẽ chỉ là không muốn một hạt giống tốt mục nát trong bùn."', ''),
        goto: 'prologue_reveal',
      },
    ],
  },

  {
    id: 'prologue_reveal',
    onEnter: (G) => {
      // Lộ linh căn, thể chất, khí vận
      G.s.rootRevealed = true;
      G.s.physiqueRevealed = true;
      G.s.luckRevealed = true;
    },
    text: (G) => {
      const root = G.s.root;
      const phys = G.s.physique;
      const lk = luck();
      let assess;
      if (root.tags.includes('phế')) {
        assess = 'Lão nhíu mày rất lâu. "Linh căn của ngươi... gần như bằng không. Kẻ khác gọi đó là phế nhân. Con đường tu tiên bình thường đã đóng lại với ngươi ngay khi ngươi sinh ra."';
      } else if (root.speed >= 2) {
        assess = 'Lão giật mình, bàn tay khẽ run. "Linh căn thượng đẳng... Ở cái nơi chó ăn đá gà ăn sỏi này mà lại có? Trời cao đôi khi cũng biết đùa."';
      } else if (root.speed >= 1) {
        assess = 'Lão gật gù. "Một linh căn không tệ. Đủ để ngươi bước lên con đường ấy — nếu ngươi sống đủ lâu."';
      } else {
        assess = 'Lão thở dài. "Linh căn tạp loạn, tu luyện sẽ chậm như rùa bò. Nhưng... còn hơn không có gì."';
      }
      return `Lão đặt một ngón tay khô gầy lên cổ tay ngươi. Một luồng hơi ấm len vào kinh mạch, dò xét.

【 XEM CĂN CỐT 】

◆ Linh căn: ${root.name}
   ${root.desc}

◆ Thể chất: ${phys.name} (Phẩm ${phys.grade})
   ${phys.desc}

◆ Khí vận: ${lk.name}
   ${lk.desc}

${assess}

${lk.id === 0 ? 'Lão bỗng trầm giọng: "Nhưng thứ khiến lão phu lo nhất... là khí vận của ngươi. Hắc vận. Tai họa sẽ bám theo ngươi như bóng với hình. Đi đến đâu, xui rủi đến đó. Ngươi sẽ là mồi nhử hoàn hảo cho lũ săn mồi."' : ''}
${lk.id >= 4 ? 'Lão nhìn ngươi bằng ánh mắt vừa mừng vừa thương: "Khí vận nghịch thiên... Cơ duyên sẽ tự tìm đến ngươi. Nhưng hãy nhớ — thứ gì tỏa sáng quá rực, kẻ trong bóng tối đều nhìn thấy."' : ''}`;
    },
    choices: [
      {
        label: '"Vậy... tôi có thể tu tiên không?"',
        goto: (G) => (G.s.flags.heard_voice ? 'prologue_fortune' : 'prologue_offer'),
      },
    ],
  },

  {
    id: 'prologue_offer',
    text:
`Lão im lặng thật lâu, nhìn ngọn lửa tàn.

"Tu tiên," cuối cùng lão nói, "không phải con đường thoát khổ. Nó là con đường đổi một loại khổ này lấy một loại khổ khác — lớn hơn, tàn khốc hơn. Mỗi lần đột phá, thân thể ngươi sẽ biến đổi, linh hồn ngươi sẽ biến đổi. Có kẻ leo lên đỉnh cao rồi phát hiện mình đã chẳng còn là người nữa.

Linh khí ở thế gian này không hề tinh khiết. Hít nó vào, cũng là nạp độc vào người. Ngươi sẽ phải liên tục tẩy trừ 'chướng tính', nếu không sẽ thối rữa mà chết.

Và quan trọng nhất — trên con đường này, KHÔNG có gì miễn phí. Có được một phần cơ duyên, ngươi sẽ mất một thứ khác: tuổi thọ, nhân quả, hoặc chính mạng sống.

Ngươi vẫn muốn bước lên chứ?"`,
    choices: [
      {
        label: '"Tôi muốn. Thà chết trên đường lên cao còn hơn sống cả đời làm gia súc."',
        effect: (G) => { G.s.flags.resolve = 'fierce'; addKarma(G, 1, 'đạo tâm kiên định'); },
        goto: 'prologue_gift',
      },
      {
        label: '"Tôi muốn... nhưng tôi sợ. Tôi chỉ muốn đủ mạnh để không ai bắt nạt được nữa."',
        effect: (G) => { G.s.flags.resolve = 'humble'; },
        goto: 'prologue_gift',
      },
      {
        label: '"Nếu cái giá là mất đi bản thân... tôi vẫn phải cân nhắc đã."',
        hint: 'Một đạo tâm tỉnh táo hiếm có.',
        effect: (G) => { G.s.flags.resolve = 'calm'; G.s.nguyenThan += 1; log('Sự tỉnh táo của ngươi khiến nguyên thần vững hơn một phần.', 'good'); },
        goto: 'prologue_gift',
      },
    ],
  },

  {
    id: 'prologue_fortune',
    text: (G) => {
      const f = G.s.hiddenFortune;
      G.s.hiddenFortune.revealed = true;
      G.s.flags.fortune_revealed = true;
      let reveal;
      switch (f.id) {
        case 'gioi_chi':
          reveal = 'Lão nắm lấy chiếc nhẫn cũ ngươi vẫn đeo — vật duy nhất cha mẹ để lại. "Ngươi có biết đây là gì không? Một Trữ Vật Giới Chỉ. Bên trong là cả một không gian nhỏ... và một ngọn đèn hồn của lão phu. Cái giọng nói trong đầu ngươi, chính là ta — hay đúng hơn, một mảnh tàn niệm của ta được phong ấn trong đó vạn năm, chờ một người đủ tư cách."';
          break;
        case 'huyet_mach':
          reveal = 'Lão áp tay lên tim ngươi và biến sắc. "Trong huyết mạch ngươi có một dấu vết cổ xưa đang ngủ say... Một dòng máu đã tuyệt diệt từ thời hồng hoang. Nếu đánh thức được nó, ngươi sẽ có tư cách mà vạn kẻ mơ ước. Nhưng đánh thức nó cũng đồng nghĩa với việc trở thành mục tiêu của những kẻ đã tận diệt dòng máu này."';
          break;
        case 'tan_hon':
          reveal = 'Lão dò xét nguyên thần ngươi và rùng mình. "Trong hồn ngươi có một mảnh ký ức không thuộc về ngươi. Một tàn hồn của kẻ nào đó cực kỳ mạnh mẽ đã gửi gắm. Nó sẽ cho ngươi tri thức... và cả những kẻ thù của kiếp trước nó."';
          break;
        default:
          reveal = 'Lão đột nhiên nghiêm mặt, chỉ tay vào ngực ngươi. "Có kẻ đã gieo một Ma Chủng vào thân ngươi từ khi ngươi còn bé. Nó cho ngươi sức mạnh tà đạo nhanh chóng... rồi một ngày sẽ nuốt chửng ngươi để tái sinh. Lão phu có thể áp chế nó, nhưng không thể trừ tận gốc."';
      }
      return `Lão ăn mày sững người khi ngón tay lão chạm vào cổ tay ngươi. Ánh mắt lão bùng lên một tia sáng mà một kẻ ăn xin không bao giờ nên có.

"Thì ra là vậy... Hèn chi."

${reveal}

"Đây là 'cơ duyên' của ngươi. Nhưng nhớ lấy lời lão phu: cơ duyên và tai họa là hai mặt của một đồng tiền. Kể từ giây phút này, con đường của ngươi sẽ không bao giờ bình yên nữa."`;
    },
    choices: [
      {
        label: 'Quỳ xuống. "Xin tiền bối thu nhận, dạy con tu hành!"',
        effect: (G) => { G.s.flags.master = true; addKarma(G, 2, 'bái sư'); },
        goto: 'prologue_gift',
      },
      {
        label: '"Tại sao là tôi? Ông thật sự muốn gì?" — ngươi lùi lại một bước.',
        hint: 'Không ai cho không cái gì.',
        effect: (G) => { G.s.flags.suspicious_master = true; log('"Muốn gì?" Lão cười buồn. "Đến lúc ngươi đủ mạnh, ngươi sẽ tự hiểu. Hoặc tự hối hận."', ''); },
        goto: 'prologue_gift',
      },
    ],
  },

  {
    id: 'prologue_gift',
    onEnter: (G) => {
      // Trao công pháp nhập môn + chút linh thạch (có cái giá)
      G.s.technique = {
        id: 'thanh_khi_quyet',
        name: 'Thanh Khí Quyết',
        grade: 1,
        type: 'đạo tu',
        desc: 'Công pháp nhập môn phẩm Phàm, chậm nhưng vững, phù hợp mọi linh căn.',
      };
      G.s.inventory['tu_khi_dan'] = (G.s.inventory['tu_khi_dan'] ?? 0) + 5;
      log('Nhận được công pháp: Thanh Khí Quyết (Phẩm 1). Nhận được 5 viên Tụ Khí Đan.', 'good');
      // Cái giá của khởi đầu
      grantWithPrice(G, {
        name: 'chỉ dẫn nhập đạo của lão nhân',
        magnitude: 1,
        apply: () => {},
      });
      G.s.flags.can_cultivate = true;
    },
    text: (G) =>
`Lão truyền cho ngươi một quyển công pháp mỏng — 《Thanh Khí Quyết》 — và một túi nhỏ đựng năm viên Tụ Khí Đan.

"Đây là công pháp phẩm thấp nhất, nhưng vững chãi. Với linh căn của ngươi, chớ mơ những thứ cao siêu. Nền móng vững, sau này mới mong đi xa.

Muốn nhập môn Luyện Khí, ngươi cần vận công theo khẩu quyết, dẫn linh khí trời đất vào cơ thể, ngày đêm không nghỉ. Ở vùng linh khí loãng như nơi này, có lẽ phải mất cả tháng ngươi mới cảm nhận được luồng linh khí đầu tiên.

Nhớ lấy: tu tiên là một cuộc chạy đua với THỜI GIAN. Thiên tài đột phá trong trăm năm. Kẻ như ngươi, có khi vạn năm vẫn giậm chân tại chỗ. Đừng phí một khắc nào."

Lão đứng dậy, phủi bụi. "Giờ thì, bắt đầu đi. Con đường phía trước, ngươi phải tự bước."`,
    choices: [
      {
        label: '【 Ngồi xuống, vận công theo Thanh Khí Quyết — bắt đầu con đường tu tiên. 】',
        screen: 'hub',
      },
    ],
  },

  // Node dự phòng
  { id: '_missing', text: '(Đoạn truyện này đang được viết tiếp...)', choices: [
    { label: 'Trở về tu luyện.', screen: 'hub' },
  ] },
];

export function loadPrologue() {
  registerNodes(nodes);
}
