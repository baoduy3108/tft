// origins.js — 80+ XUẤT THÂN khởi đầu, 6 bậc hiếm (Common → Mythic).
// Mỗi xuất thân = một khởi đầu khác nhau (tài nguyên, bẩm chất, nhân quả, cơ duyên ẩn,
// và các CỜ ảnh hưởng tới lựa chọn ẩn + thái độ NPC về sau). Đây là nền của "vô hạn".
//
// Khung nhất quán với prologue: dù xuất thân thế nào, HIỆN TẠI ngươi vẫn là một
// thiếu niên phàm thai nơi [Khô Kiệt Tinh Lộ] — điểm đặc biệt nằm ở QUÁ KHỨ / huyết
// mạch / tàn hồn / gia sản giấu kín, nên mọi origin đều tương thích một mở màn.

import { Big } from '../util/bignum.js';
import { getRoot } from './spiritroots.js';
import { genTreasure } from './treasures.js';

export const RARITY = {
  common:   { key: 'common',   name: 'Phàm Thường', color: '#9e9e9e', weight: 1000 },
  uncommon: { key: 'uncommon', name: 'Hiếm',        color: '#4caf50', weight: 300 },
  rare:     { key: 'rare',     name: 'Quý',         color: '#03a9f4', weight: 80 },
  epic:     { key: 'epic',     name: 'Sử Thi',      color: '#9c27b0', weight: 20 },
  legend:   { key: 'legend',   name: 'Truyền Thuyết', color: '#ff9800', weight: 4 },
  mythic:   { key: 'mythic',   name: 'Thần Thoại',  color: '#ff5252', weight: 0.5 },
};

// Helper tạo entry gọn
const O = (id, rarity, name, desc, fx = {}) => ({ id, rarity, name, desc, fx });

export const ORIGINS = [
  // ---------------- COMMON (~30) ----------------
  O('con_tho_san', 'common', 'Con Thợ Săn', 'Cha chết vì thú dữ. Thân thể ngươi quen đói rét, khí huyết nhỉnh hơn bạn đồng lứa.', { hp: 1.1, flags: { origin_hunter: true } }),
  O('co_nhi', 'common', 'Cô Nhi Nhặt Rác', 'Sống sót nhờ cảnh giác và nhanh trí. Ngươi hiểu lòng tốt luôn có giá.', { flags: { wary: true } }),
  O('con_nha_buon', 'common', 'Con Nhà Buôn Sa Cơ', 'Biết chữ, biết tính toán, còn giữ vài đồng bạc vụn.', { items: { bac_vun: 30 }, flags: { literate: true } }),
  O('nong_dan', 'common', 'Con Nhà Nông', 'Cả đời bán mặt cho đất. Chịu khó, bền bỉ, nhưng chẳng có gì trong tay.', { hp: 1.05 }),
  O('an_may', 'common', 'Tiểu Ăn Mày', 'Lang thang đầu đường xó chợ, mặt dày mày dạn, giỏi luồn lách.', { flags: { streetwise: true } }),
  O('no_boc', 'common', 'Nô Bộc Bỏ Trốn', 'Từng là gia nô một phú hộ, bị đánh đập rồi trốn thoát. Trong lòng đầy oán hận.', { karma: -2, flags: { vengeful: true } }),
  O('hoc_do', 'common', 'Học Đồ Nghèo', 'Từng theo một thầy đồ già học chữ nghĩa. Đầu óc sáng sủa hơn người.', { comprehend: 1.1, flags: { literate: true } }),
  O('con_thuyen_chai', 'common', 'Con Nhà Chài Lưới', 'Lớn lên trên sông nước, thân pháp nhanh nhẹn, quen sinh tử.', { speed: 1.1 }),
  O('tho_ren', 'common', 'Học Việc Lò Rèn', 'Quen với lửa và sắt thép. Tay nghề thô nhưng thân thể cứng cáp.', { def: 1.1, hp: 1.05 }),
  O('con_thay_lang', 'common', 'Con Thầy Lang', 'Biết chút dược lý dân gian, phân biệt được cỏ lành cỏ độc.', { flags: { herblore: true } }),
  O('tieu_nhi_kich', 'common', 'Đào Kép Gánh Hát', 'Quen diễn trò, giỏi giả bộ và đọc vị người khác.', { flags: { deceiver: true } }),
  O('linh_tho', 'common', 'Phu Đào Mỏ', 'Quanh năm đào khoáng thạch, thân thể trâu bò, gan lì trong bóng tối.', { hp: 1.15, def: 1.05 }),
  O('con_liet_si', 'common', 'Con Của Kẻ Tử Trận', 'Cha ngã xuống trong một cuộc tranh đoạt của tu sĩ. Ngươi lớn lên với một cái tên và một mối thù.', { karma: -1, flags: { orphan_grudge: true } }),
  O('be_chan_trau', 'common', 'Trẻ Chăn Trâu', 'Ngày ngày thổi sáo trên lưng trâu. Tâm tính hồn nhiên, đạo tâm thuần khiết.', { flags: { pure_heart: true } }),
  O('con_gai_tho_det', 'common', 'Con Nhà Dệt Vải', 'Đôi tay khéo léo, tính tình nhẫn nại, tỉ mỉ từng chi tiết.', { comprehend: 1.05, flags: { patient: true } }),
  O('tieu_nhi_giang_ho', 'common', 'Lăn Lóc Giang Hồ', 'Từng theo một đoàn tiêu cục, biết chút quyền cước phàm tục.', { atk: 1.1, flags: { fighter: true } }),
  O('con_dao_si', 'common', 'Con Đạo Sĩ Rởm', 'Cha là thầy cúng lừa bịp. Ngươi thuộc lòng vô số câu chú vô nghĩa — nhưng biết đâu...', { flags: { fake_priest: true } }),
  O('tro_mo_coi_chua', 'common', 'Trẻ Mồ Côi Cửa Chùa', 'Được một ngôi miếu hoang nuôi lớn, đêm đêm nghe kinh, tâm cảnh an tĩnh.', { comprehend: 1.05, flags: { pure_heart: true } }),
  O('con_dai_phu', 'common', 'Con Nhà Đại Phu', 'Gia đình có chút của ăn của để, ngươi không phải lo miếng ăn.', { items: { bac_vun: 50, hoi_nguyen_dan: 1 } }),
  O('linh_dinh', 'common', 'Lính Thú Đào Ngũ', 'Từng cầm giáo giữ ải, biết chút bày binh, quen máu me.', { atk: 1.05, flags: { tactician: true } }),
  O('tieu_tac', 'common', 'Đạo Chích Vặt', 'Ngón tay nhanh, bước chân êm. Nghề trộm cắp giúp ngươi sống sót.', { speed: 1.1, flags: { thief: true } }),
  O('con_dan_ca', 'common', 'Con Dân Chài Cùng Khổ', 'Nhà nghèo rớt mồng tơi, nhưng ý chí sinh tồn mãnh liệt.', { flags: { survivor: true } }),
  O('be_cau_bo', 'common', 'Đứa Trẻ Bị Bỏ Rơi', 'Bị vứt trước cổng thôn từ sơ sinh. Không ai biết ngươi từ đâu tới...', { flags: { unknown_origin: true } }),
  O('con_tho_moc', 'common', 'Học Việc Thợ Mộc', 'Quen đục đẽo, con mắt ngươi nhạy với đường nét và kết cấu — mầm mống trận đạo.', { flags: { pattern_sense: true } }),
  O('tieu_ca', 'common', 'Ca Kỹ Hát Rong', 'Giọng hát mê hoặc, giỏi lay động lòng người.', { flags: { charmer: true } }),
  O('con_do_te', 'common', 'Con Nhà Đồ Tể', 'Quen tay dao thớt và mùi máu tanh. Chẳng mấy khi run tay.', { atk: 1.1, flags: { cold_blooded: true } }),
  O('tro_ban_thuoc', 'common', 'Tiểu Nhị Tiệm Thuốc', 'Chạy vặt cho một hiệu thuốc, nhớ được nhiều dược tính.', { flags: { herblore: true } }),
  O('con_tram_trach', 'common', 'Con Nhà Coi Nghĩa Địa', 'Lớn lên bên mồ mả, quen với âm khí và cái chết, gan to hơn người.', { flags: { fearless: true } }),
  O('tieu_khat_cai', 'common', 'Kẻ Hành Khất Mù Chữ', 'Không biết chữ, không nghề nghiệp, chỉ có một cái bụng đói và đôi chân.', {}),
  O('con_pho_hoi', 'common', 'Con Nhà Phố Hội', 'Lớn ở trấn nhỏ đông đúc, giỏi ăn nói và mặc cả.', { flags: { merchant_tongue: true } }),

  // ---------------- UNCOMMON (~20) ----------------
  O('con_the_gia_sa_sut', 'uncommon', 'Hậu Duệ Thế Gia Sa Sút', 'Gia tộc từng hiển hách, nay lụn bại. Ngươi thừa hưởng lễ nghi và một chút bản lĩnh.', { comprehend: 1.1, items: { bac_vun: 80 }, flags: { noble_manner: true } }),
  O('do_de_bo_roi', 'uncommon', 'Đệ Tử Bị Trục Xuất', 'Từng là ngoại môn của một tông môn nhỏ, bị đuổi vì "phế tài", nhưng đã học lỏm chút căn bản.', { cultivate: 1.1, flags: { ex_disciple: true } }),
  O('than_dong', 'uncommon', 'Thần Đồng Yểu Mệnh', 'Nổi tiếng thông minh từ bé, nhưng bị đồn là "mệnh yểu khó nuôi".', { comprehend: 1.25, thoNguyenMax: -10 }),
  O('con_lai_yeu', 'uncommon', 'Con Lai Yêu Tộc', 'Trong ngươi có chút huyết thống yêu tộc — thân thể mạnh mẽ nhưng bị người thường xa lánh.', { hp: 1.2, atk: 1.1, karma: -1, flags: { demon_blood: true } }),
  O('tu_tinh_giam', 'uncommon', 'Tù Nhân Vượt Ngục', 'Từng bị giam trong một mỏ khổ sai của tu sĩ. Ngươi biết vài bí mật ngươi lẽ ra không nên biết.', { flags: { knows_secret: true }, karma: -2 }),
  O('be_song_sot', 'uncommon', 'Kẻ Sống Sót Duy Nhất', 'Cả thôn ngươi bị đồ sát trong một đêm. Chỉ mình ngươi sống. Vì sao?', { flags: { lone_survivor: true, vengeful: true }, karma: 1 }),
  O('con_thay_boi', 'uncommon', 'Truyền Nhân Thầy Bói', 'Bà ngươi dạy ngươi xem thiên tượng, đoán cát hung. Ngươi mơ hồ cảm nhận được vận mệnh.', { flags: { fortune_sense: true }, comprehend: 1.1 }),
  O('linh_dong', 'uncommon', 'Linh Đồng Bẩm Sinh', 'Từ nhỏ ngươi thấy được thứ người khác không thấy — hồn phách, âm linh.', { nguyenThan: 1, flags: { spirit_sight: true } }),
  O('con_luyen_dan_su', 'uncommon', 'Con Của Luyện Đan Sư', 'Cha từng là đan sư lang thang. Ngươi thừa hưởng một quyển đan phương rách và một Đan Lô cũ.', { flags: { hasFurnace: true, herblore: true }, items: { thanh_linh_dan: 2 } }),
  O('vo_gia_lac_loi', 'uncommon', 'Võ Giả Lạc Đạo', 'Ngươi đã luyện võ phàm tục tới đỉnh, thân thể tôi luyện sẵn sàng bước lên tiên đạo.', { hp: 1.25, atk: 1.2, flags: { martial_base: true } }),
  O('tieu_yeu', 'uncommon', 'Yêu Thú Hóa Hình', 'Ngươi vốn là một tiểu yêu tu luyện thành người hình. Bản năng nhạy bén, nhưng luôn bị truy sát.', { speed: 1.2, karma: -2, attention: 3, flags: { beast_origin: true } }),
  O('con_tran_phap_su', 'uncommon', 'Hậu Nhân Trận Sư', 'Tổ tiên là trận pháp sư. Ngươi có trực giác kỳ lạ về bố cục không gian.', { flags: { pattern_sense: true, array_talent: true } }),
  O('cam_tu_khue_nu', 'uncommon', 'Tiểu Thư Trốn Hôn Sự', 'Bỏ trốn khỏi một cuộc hôn nhân chính trị, mang theo tư trang và lòng gan dạ.', { items: { bac_vun: 120 }, flags: { runaway: true } }),
  O('con_hiep_khach', 'uncommon', 'Con Của Hiệp Khách', 'Cha là kiếm khách chính nghĩa đã khuất. Ngươi thừa kế đạo tâm và một thanh sắt cũ.', { atk: 1.15, karma: 2, flags: { righteous: true } }),
  O('do_tac_dau_muc', 'uncommon', 'Đầu Lĩnh Sơn Tặc Nhí', 'Từng cầm đầu một băng trẻ trộm cắp. Giỏi thu phục lòng người và tính toán.', { flags: { leader: true, deceiver: true }, karma: -1 }),
  O('nguoi_bi_nguyen', 'uncommon', 'Kẻ Mang Lời Nguyền', 'Một pháp sư hấp hối đã trút lời nguyền lên ngươi — vừa là họa, vừa có thể là phúc.', { karma: -3, flags: { cursed: true } }),
  O('con_thuyen_buon_lon', 'uncommon', 'Con Nhà Hải Thương', 'Gia đình buôn bán khắp nơi, ngươi thấy nhiều biết rộng, lắm mưu nhiều kế.', { items: { bac_vun: 150 }, flags: { worldly: true } }),
  O('tho_san_yeu', 'uncommon', 'Thợ Săn Yêu Thú', 'Chuyên săn yêu thú cấp thấp bán vật liệu. Gan lì, thiện chiến, rành yêu tộc.', { atk: 1.15, flags: { beast_hunter: true } }),
  O('linh_can_muon', 'uncommon', 'Kẻ Ghép Linh Căn Hỏng', 'Từng bị một tà tu thí nghiệm ghép linh căn, thất bại nhưng để lại di chứng kỳ lạ.', { cultivate: 1.15, taint: 5, flags: { experiment: true } }),
  O('con_thanh_chu', 'uncommon', 'Con Rơi Thành Chủ', 'Là con ngoài giá thú của một thành chủ phàm tục, bị chối bỏ nhưng có dòng máu quyền quý.', { items: { bac_vun: 100 }, flags: { hidden_lineage: true } }),

  // ---------------- RARE (~14) ----------------
  O('huyet_mach_co', 'rare', 'Huyết Mạch Cổ Ngủ Say', 'Trong máu ngươi có một huyết mạch cổ đã tuyệt diệt đang ngủ. Đánh thức nó = tư cách vạn kẻ mơ ước.', { hp: 1.3, flags: { ancient_blood: true }, hiddenFortune: { id: 'huyet_mach', name: 'Huyết mạch cổ ngủ say', desc: 'Một dòng máu tuyệt diệt thời hồng hoang đang say ngủ trong ngươi.' } }),
  O('tan_hon_cuong_gia', 'rare', 'Tàn Hồn Cường Giả', 'Nguyên thần ngươi mang một mảnh ký ức của cường giả đã chết — tri thức, và cả kẻ thù của hắn.', { nguyenThan: 3, flags: { remnant_soul: true }, hiddenFortune: { id: 'tan_hon', name: 'Tàn hồn cường giả', desc: 'Một mảnh ký ức không thuộc về ngươi, đến từ một kẻ cực mạnh.' } }),
  O('gia_toc_tai_phu', 'rare', 'Hậu Duệ Gia Tộc Tài Phú', 'Gia tộc sa cơ nhưng còn một kho tàng giấu kín. Ngươi thừa kế cả tài phú lẫn một tia khí vận gia tộc.', { luckId: 3, linhThach: 5000, treasureGrade: 2, items: { bac_vun: 500 }, flags: { rich_heir: true } }),
  O('the_chat_dac_thu', 'rare', 'Thể Chất Đặc Thù', 'Ngươi sinh ra với một thể chất hiếm — cho lợi thế lớn, nhưng cũng kéo theo nhân quả.', { physiqueName: 'Tiên Thiên Đạo Thể', karma: -2, attention: 2 }),
  O('thien_linh_can', 'rare', 'Mang Thiên Linh Căn', 'Một linh căn đơn nhất thuần khiết — thiên tài trăm năm khó gặp ở vùng đất chết này.', { rootId: 'thien', attention: 3 }),
  O('con_cua_ma_ton', 'rare', 'Hậu Nhân Ma Tôn', 'Tổ tiên là một ma tôn khét tiếng. Ngươi thừa hưởng ma khí và vô số kẻ thù.', { atk: 1.3, karma: -5, attention: 4, flags: { demon_heir: true } }),
  O('song_tu_linh_can', 'rare', 'Song Tu Thể-Đạo', 'Bẩm sinh có thể song tu cả thể phách lẫn linh hồn — hiếm và cân bằng.', { hp: 1.2, nguyenThan: 2, cultivate: 1.1 }),
  O('khi_van_chi_tu', 'rare', 'Khí Vận Chi Tử', 'Con cưng của khí vận. Cơ duyên tự tìm đến — và mọi kẻ đoạt vận cũng tìm đến.', { luckId: 3, attention: 5, flags: { luck_child: true } }),
  O('di_hoa_the', 'rare', 'Thân Mang Dị Hỏa', 'Trong đan điền ngươi có một ngọn dị hỏa bẩm sinh — báu vật của luyện đan sư.', { flags: { hasDiHoa: true, hasFurnace: true }, atk: 1.15 }),
  O('con_tien_nhan_doa_lac', 'rare', 'Hậu Duệ Tiên Nhân Đọa Lạc', 'Tổ tiên từng là tiên nhân bị đày xuống phàm giới. Trong ngươi còn sót một tia tiên duyên.', { comprehend: 1.3, luckId: 2, flags: { fallen_immortal: true } }),
  O('vong_hon_bao_thu', 'rare', 'Kẻ Được Vong Hồn Phù Trợ', 'Một oán hồn cường đại bám theo ngươi — bảo vệ ngươi, đổi lại ngươi phải giúp nó báo thù.', { nguyenThan: 2, karma: -2, flags: { ghost_ally: true } }),
  O('the_chat_khang_doc', 'rare', 'Vạn Độc Bất Xâm', 'Thân thể miễn nhiễm mọi độc — kẻ luyện đan mạo hiểm và tà tu đều thèm khát.', { physiqueName: 'Vạn Độc Bất Xâm Thể', flags: { poison_immune: true } }),
  O('bien_di_linh_can', 'rare', 'Lôi Biến Dị Linh Căn', 'Một linh căn biến dị hệ Lôi — uy lực công kích kinh người, dễ chiêu lôi kiếp.', { rootId: 'loi', atk: 1.2, attention: 2 }),
  O('thieu_chu_lu_lac', 'rare', 'Thiếu Chủ Lưu Lạc', 'Vốn là thiếu chủ một tông môn bị diệt môn, may mắn thoát thân với một pháp bảo hộ thân.', { treasureGrade: 3, karma: 1, flags: { fallen_prince: true, vengeful: true } }),

  // ---------------- EPIC (~9) ----------------
  O('thien_dao_ruong_bo', 'epic', 'Thiên Đạo Kiếp Trước Ruồng Bỏ', 'Kiếp trước ngươi nghịch thiên nên bị Thiên Đạo ghi hận, khí vận cực thấp (Hắc Vận). Nhưng chính vì bị "bỏ rơi", một số quy luật của trời cũng khó dò được ngươi...', { luckId: 0, karma: -10, flags: { heaven_forsaken: true }, hiddenFortune: { id: 'heaven_forsaken', name: 'Bị Thiên Đạo ruồng bỏ', desc: 'Khí vận đen tối bao trùm, nhưng nhân quả của trời khó áp lên kẻ đã bị bỏ rơi.' } }),
  O('gioi_chi_lao_hon', 'epic', 'Chủ Nhân Giới Chỉ Cổ', 'Chiếc nhẫn cũ trên tay ngươi ẩn chứa một không gian và một lão hồn cường đại chờ ngươi vạn năm.', { nguyenThan: 2, flags: { has_ring: true, hidden_master: true }, hiddenFortune: { id: 'gioi_chi', name: 'Cổ giới chỉ có lão hồn', desc: 'Một Trữ Vật Giới Chỉ chứa không gian riêng và tàn niệm của một cường giả.' } }),
  O('thanh_the', 'epic', 'Mang Thánh Thể (Ngủ)', 'Ngươi mang mầm mống của một Thánh Thể — sức mạnh nghịch thiên, nhưng cần cơ duyên khủng khiếp để đánh thức.', { physiqueName: 'Cửu Chuyển Hoàng Kim Thể', karma: -3, attention: 4, flags: { holy_body: true } }),
  O('con_cung_thanh_dia', 'epic', 'Thánh Tử Đầu Thai', 'Kiếp trước ngươi là Thánh Tử một thánh địa, chết bất đắc kỳ tử rồi đầu thai. Khí vận lớn, ký ức mơ hồ, và một gia sản kếch xù được phong ấn.', { luckId: 4, nguyenThan: 2, linhThach: 20000, treasureGrade: 3, comprehend: 1.3, flags: { reborn_saint: true }, hiddenFortune: { id: 'saint_memory', name: 'Ký ức Thánh Tử', desc: 'Những mảnh ký ức về vinh quang và cái chết của kiếp trước.' } }),
  O('ma_chung_gieo_than', 'epic', 'Bị Gieo Ma Chủng', 'Ai đó đã gieo một Ma Chủng vào thân ngươi từ bé — sức mạnh tà đạo nhanh chóng, nhưng một ngày nó sẽ nuốt chửng ngươi.', { atk: 1.4, cultivate: 1.3, karma: -6, flags: { demon_seed: true }, hiddenFortune: { id: 'ma_chung', name: 'Ma chủng trong thân', desc: 'Một hạt giống hắc ám chực chờ nuốt chửng ngươi để tái sinh.' } }),
  O('hon_don_linh_can', 'epic', 'Hỗn Độn Linh Căn', 'Truyền thuyết trong truyền thuyết — dung hợp vạn hệ, tương thích mọi công pháp. Thu hút tai họa cực lớn.', { rootId: 'hondon', attention: 8, karma: -4, flags: { chaos_root: true } }),
  O('nghich_thien_van', 'epic', 'Vận Mệnh Nghịch Thiên', 'Cả trời đất như phò trợ ngươi — cơ duyên tràn ngập. Nhưng cả trời đất cũng ghen ghét ngươi.', { luckId: 4, attention: 6, karma: 2, flags: { defy_heaven: true } }),
  O('trung_sinh_gia', 'epic', 'Trùng Sinh Giả', 'Ngươi giữ trọn ký ức một kiếp tu hành đã thất bại. Ngươi biết trước nhiều bí mật, cơ duyên, và tai kiếp sắp tới.', { comprehend: 1.4, nguyenThan: 2, flags: { reborn: true, knows_future: true } }),
  O('the_chat_thoi_gian', 'epic', 'Thân Nhiễm Pháp Tắc Thời Gian', 'Một tai nạn không-thời-gian khiến ngươi cảm nhận được dòng chảy thời gian — tu luyện có lúc nhanh đến khó tin.', { cultivate: 1.5, taint: 8, flags: { time_touched: true } }),

  // ---------------- LEGEND (~6) ----------------
  O('de_hon_chuyen_the', 'legend', 'Tàn Hồn Cổ Đế', 'Ngươi là nơi trú ngụ của một mảnh chân hồn của một vị Cổ Đế đã tử chiến. Sức mạnh và kẻ thù đều ở tầm vũ trụ.', { nguyenThan: 6, comprehend: 1.5, karma: -5, attention: 6, treasureGrade: 4, flags: { emperor_soul: true } }),
  O('hong_hoang_the', 'legend', 'Hồng Hoang Cổ Thể', 'Thân thể của một cổ tộc thời hồng hoang chuyển thế — nhục thân địch cả pháp bảo.', { physiqueName: 'Hồng Hoang Cổ Thể', hp: 1.5, atk: 1.4, karma: -3, attention: 5, flags: { primordial_body: true } }),
  O('thien_menh_chi_tu', 'legend', 'Thiên Mệnh Chi Tử', 'Ngươi là đứa con được thiên mệnh chọn của thời đại này. Vô số cơ duyên chờ đợi — cùng vô số kẻ muốn cướp lấy vận mệnh của ngươi.', { luckId: 5, comprehend: 1.4, attention: 10, flags: { chosen_one: true } }),
  O('vo_thuong_kiem_hon', 'legend', 'Kiếm Hồn Vô Thượng', 'Một kiếm hồn tự cổ chí kim nhận ngươi làm chủ. Ngươi sinh ra là để cầm kiếm.', { atk: 1.6, nguyenThan: 3, treasureGrade: 4, flags: { sword_soul: true } }),
  O('bat_tu_the', 'legend', 'Bất Diệt Kim Thân (Mầm)', 'Chỉ một giọt máu cũng có thể tái sinh — nếu ngươi đánh thức được nó. Gần như bất tử, nếu sống nổi tới lúc đó.', { physiqueName: 'Bất Diệt Kim Thân', hp: 1.5, flags: { undying: true }, items: { ho_menh_dan: 1 } }),
  O('dao_the_thien_sinh', 'legend', 'Đạo Thể Thiên Sinh', 'Bản thân ngươi chính là một phần của Đạo. Ngộ tính cao đến mức nghe gió thổi cũng ngộ ra chân lý.', { physiqueName: 'Đạo Thể', comprehend: 2.0, cultivate: 1.4, luckId: 3, flags: { dao_body: true } }),

  // ---------------- MYTHIC (~4) ----------------
  O('hong_mong_chi_the', 'mythic', 'Hồng Mông Chí Thể', 'Truyền thuyết trong truyền thuyết — có lẽ chưa từng xuất hiện. Thân thể sinh từ khí Hồng Mông nguyên thủy.', { physiqueName: 'Hồng Mông Chí Thể', hp: 3, atk: 3, cultivate: 2, nguyenThan: 8, attention: 15, karma: -8, flags: { hongmeng_body: true } }),
  O('dai_dao_tan_niem', 'mythic', 'Tàn Niệm Đại Đạo', 'Ngươi là hóa thân của một tàn niệm từ tận cùng Đại Đạo — kẻ từng đứng ở đỉnh của vô hạn, nay bắt đầu lại từ hư vô.', { nguyenThan: 10, comprehend: 2.5, luckId: 4, karma: -10, attention: 20, flags: { great_dao_remnant: true }, hiddenFortune: { id: 'dai_dao', name: 'Tàn niệm Đại Đạo', desc: 'Ký ức mơ hồ về việc từng viết lại luật lệ của cả một thế giới.' } }),
  O('van_co_de_nhat', 'mythic', 'Vạn Cổ Đệ Nhất Chuyển Thế', 'Kẻ mạnh nhất vạn cổ, tự phong ấn bản thân để trốn một kiếp nạn, nay tỉnh lại trong thân phàm nhân — và đã quên gần hết.', { nguyenThan: 12, comprehend: 2.0, hp: 2, atk: 2, luckId: 5, attention: 25, karma: -12, flags: { strongest_reborn: true } }),
  O('vo_cuc_khi_van', 'mythic', 'Vô Cực Khí Vận Chi Thể', 'Khí vận vô hạn hội tụ nơi ngươi. Đi bộ cũng nhặt được chí bảo — và cả vũ trụ đều dán mắt vào ngươi.', { luckId: 5, comprehend: 1.5, treasureGrade: 5, linhThach: 100000, attention: 30, flags: { infinite_luck: true } }),
];

export function getOrigin(id) {
  return ORIGINS.find((o) => o.id === id);
}

// Bốc một "tay bài" gồm n xuất thân riêng biệt, theo trọng số độ hiếm.
export function rollOriginHand(rng, n = 5) {
  const pool = ORIGINS.slice();
  const hand = [];
  for (let i = 0; i < n && pool.length; i++) {
    const total = pool.reduce((s, o) => s + RARITY[o.rarity].weight, 0);
    let r = rng.next() * total;
    let idx = 0;
    for (let j = 0; j < pool.length; j++) {
      r -= RARITY[pool[j].rarity].weight;
      if (r <= 0) { idx = j; break; }
    }
    hand.push(pool[idx].id);
    pool.splice(idx, 1);
  }
  return hand;
}

// Bốc HOÀN TOÀN ngẫu nhiên 1 xuất thân ("để số phận định đoạt").
export function rollRandomOrigin(rng) {
  const total = ORIGINS.reduce((s, o) => s + RARITY[o.rarity].weight, 0);
  let r = rng.next() * total;
  for (const o of ORIGINS) { r -= RARITY[o.rarity].weight; if (r <= 0) return o.id; }
  return ORIGINS[0].id;
}

// Áp dụng hiệu ứng xuất thân lên trạng thái người chơi.
export function applyOrigin(G, origin) {
  const fx = origin.fx || {};
  const s = G.s;
  s.flags.originId = origin.id;
  s.flags.originName = origin.name;
  s.flags.originRarity = origin.rarity;

  // Bẩm chất
  if (fx.rootId) s.root = { ...getRoot(fx.rootId) };
  if (fx.physiqueName) {
    const p = (G.physiques || []).find((x) => x.name === fx.physiqueName);
    if (p) s.physique = JSON.parse(JSON.stringify(p));
  }
  // Nhân buff thể chất
  const buffKeys = ['hp', 'atk', 'def', 'cultivate', 'comprehend', 'soul', 'speed', 'recover', 'control'];
  s.physique.buffs = s.physique.buffs || {};
  for (const k of buffKeys) {
    if (fx[k]) s.physique.buffs[k] = (s.physique.buffs[k] ?? 1) * fx[k];
  }
  // Khí vận
  if (fx.luckId != null) s.luckId = fx.luckId;

  // Chỉ số
  if (fx.karma) s.karma += fx.karma;
  if (fx.attention) s.attention += fx.attention;
  if (fx.nguyenThan) s.nguyenThan += fx.nguyenThan;
  if (fx.taint) s.taint += fx.taint;
  if (fx.thoNguyenMax) { s.thoNguyenMax += fx.thoNguyenMax; s.thoNguyen += fx.thoNguyenMax; }

  // Tài nguyên
  if (fx.linhThach) s.linhThach = Big.fromJSON(s.linhThach).add(Big.from(fx.linhThach)).toJSON();
  if (fx.items) for (const [k, v] of Object.entries(fx.items)) s.inventory[k] = (s.inventory[k] ?? 0) + v;
  if (fx.treasureGrade) s.treasures.push(genTreasure(G.rng, fx.treasureGrade));

  // Cờ & cơ duyên ẩn
  if (fx.flags) Object.assign(s.flags, fx.flags);
  if (fx.flags && fx.flags.hasFurnace) s.flags.hasFurnace = true;
  if (fx.hiddenFortune) s.hiddenFortune = { ...fx.hiddenFortune, revealed: false };

  return origin;
}
