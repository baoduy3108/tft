// herbs.js — Linh dược (30000+ loại theo spec). Subset viết tay + generator thủ tục.
// Linh dược cao cấp có thể có ý thức: chạy trốn hoặc phản công người hái.

import { effectiveSpawn } from './grades.js';

const NAMED = [
  { key: 'thanh_linh_thao', name: 'Thanh Linh Thảo', grade: 1, age: 50, desc: 'Cỏ linh phổ thông, nguyên liệu Tụ Khí Đan.' },
  { key: 'huyet_linh_chi', name: 'Huyết Linh Chi', grade: 2, age: 100, desc: 'Nấm linh màu máu, bổ khí huyết.' },
  { key: 'thanh_tam_hoa', name: 'Thanh Tâm Hoa', grade: 2, age: 200, desc: 'Hoa trắng an thần, nguyên liệu Thanh Tâm Đan.' },
  { key: 'dia_tam_hoa_lien', name: 'Địa Tâm Hỏa Liên', grade: 4, age: 5000, desc: 'Sen lửa mọc nơi địa tâm, cực nóng.' },
  { key: 'hoa_hinh_thao', name: 'Hóa Hình Thảo', grade: 5, age: 100000, desc: 'Linh dược đã có ý thức, biết chạy trốn.', sentient: true },
  { key: 'thoi_gian_thao', name: 'Thời Gian Thảo', grade: 8, age: 1e9, desc: 'Cấm kỵ. Mang theo pháp tắc thời gian.', sentient: true, forbidden: true },
  { key: 'nhan_qua_qua', name: 'Nhân Quả Quả', grade: 9, age: 1e10, desc: 'Cấm kỵ. Ăn vào có thể gánh/xóa nhân quả.', sentient: true, forbidden: true },
];

const PRE = ['Thanh', 'Huyết', 'Tử', 'Bích', 'Kim', 'Hắc', 'Băng', 'Viêm', 'Cửu Diệp', 'Thiên Niên',
  'Vạn Niên', 'U Minh', 'Thái Cổ', 'Long', 'Phượng', 'Ngọc', 'Tuyết', 'Lôi', 'Phong', 'Địa Tâm'];
const KIND = ['Linh Thảo', 'Linh Chi', 'Hoa', 'Quả', 'Sâm', 'Liên', 'Trúc', 'Đằng', 'Đan Sa', 'Tủy'];

// Sinh một linh dược ngẫu nhiên phù hợp với thế giới (đã tính gating phẩm).
export function genHerb(rng, worldTier) {
  // Chọn phẩm theo tỉ lệ hiệu dụng
  const weights = [];
  for (let g = 1; g <= 12; g++) weights.push([Math.max(1e-30, effectiveSpawn(g, worldTier)) * 1e30, g]);
  const grade = rng.weighted(weights);
  const age = Math.round(Math.pow(10, grade) * (1 + rng.range(0, 5)));
  return {
    key: `herb_gen_${rng.int(0, 1e9)}`,
    name: `${rng.pick(PRE)} ${rng.pick(KIND)}`,
    grade,
    age,
    desc: 'Linh dược mọc hoang, gốc gác chưa rõ.',
    sentient: grade >= 5,
    forbidden: grade >= 8,
    generated: true,
  };
}

export function getNamedHerbs() {
  return NAMED;
}
export function getHerb(key) {
  return NAMED.find((h) => h.key === key);
}
