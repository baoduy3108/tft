// techniques.js — Công pháp (12 phẩm). Phân loại: chiến đấu / đạo tu / tà đạo / phụ trợ.
// Càng mạnh càng nguy hiểm (dễ chiêu nhân quả, dễ tẩu hỏa).

export const TECH_CATEGORIES = [
  'kiếm đạo', 'đao đạo', 'thể tu', 'ngộ đạo', 'pháp tắc', 'nhân quả',
  'hấp thu (tà)', 'tế luyện linh hồn (tà)', 'huyễn thuật', 'độc công',
  'đan tu', 'bộ pháp', 'thân pháp', 'hồn tu', 'trận pháp',
];

// Một vài công pháp có tên (kể cả "bug công pháp" cực hiếm).
export const NAMED_TECHS = [
  { id: 'thanh_khi_quyet', name: 'Thanh Khí Quyết', grade: 1, type: 'ngộ đạo', danger: 0,
    desc: 'Công pháp nhập môn phẩm Phàm, chậm nhưng vững, hợp mọi linh căn.' },
  { id: 'huyen_thien_kiem', name: 'Huyền Thiên Kiếm Quyết', grade: 3, type: 'kiếm đạo', danger: 1,
    desc: 'Kiếm quyết sát phạt, damage cao.' },
  { id: 'bat_hoai_the', name: 'Bất Hoại Thể Quyết', grade: 3, type: 'thể tu', danger: 1,
    desc: 'Thể tu, tank cực trâu nhưng tu chậm.' },
  { id: 'thon_thien_cong', name: 'Thôn Thiên Công', grade: 6, type: 'hấp thu (tà)', danger: 5,
    desc: 'BUG công pháp: nuốt tu vi kẻ khác để tăng tiến. Nhân quả cực nặng, dễ bị cả thế giới truy sát.' },
  { id: 'vo_han_dien_hoa', name: 'Vô Hạn Diễn Hóa', grade: 7, type: 'pháp tắc', danger: 4,
    desc: 'BUG công pháp: sao chép chiêu thức đối thủ.' },
  { id: 'nhan_qua_dao_nguoc', name: 'Nhân Quả Đảo Ngược', grade: 9, type: 'nhân quả', danger: 6,
    desc: 'BUG công pháp: ra tay TRƯỚC khi đối thủ kịp động thủ. Đại đạo cấm kỵ.' },
];

// Sinh một công pháp ngẫu nhiên theo phẩm cho phần thưởng/mua bán.
const PRE = ['Huyền', 'Cửu', 'Thái', 'Thiên', 'Vô Cực', 'Hỗn Nguyên', 'Tử Hà', 'Bích Hải',
  'Lôi Đình', 'Viêm Long', 'Băng Tâm', 'U Minh', 'Đại La', 'Vạn Cổ'];
const SUF = ['Quyết', 'Công', 'Kinh', 'Pháp', 'Chân Giải', 'Đạo', 'Bí Lục'];

export function genTech(rng, grade) {
  const type = rng.pick(TECH_CATEGORIES);
  return {
    id: `tech_${rng.int(0, 1e9)}`,
    name: `${rng.pick(PRE)} ${rng.pick(SUF)}`,
    grade,
    type,
    danger: type.includes('tà') ? Math.min(6, grade) : Math.max(0, grade - 3),
    desc: `Công pháp ${type} phẩm ${grade}.`,
    generated: true,
  };
}
