// format.js — Định dạng hiển thị tiếng Việt: thọ nguyên, linh thạch, số lớn.

import { Big } from './bignum.js';

// Thọ nguyên: đơn vị năm; hiển thị gọn khi cực lớn.
export function fmtNam(nam) {
  if (nam == null) return '?';
  if (nam instanceof Big) return nam.format() + ' năm';
  if (!isFinite(nam)) return '∞ năm';
  if (nam < 10000) return Math.floor(nam).toLocaleString('vi-VN') + ' năm';
  return Big.from(nam).format() + ' năm';
}

// Linh thạch: hạ phẩm / trung phẩm / thượng phẩm / cực phẩm (1 cấp = 100 lần)
const LT_CAP = ['hạ phẩm', 'trung phẩm', 'thượng phẩm', 'cực phẩm', 'tiên tinh'];
export function fmtLinhThach(n) {
  const b = n instanceof Big ? n : Big.from(n);
  if (b.isZero()) return '0 linh thạch (hạ phẩm)';
  // Quy đổi ra bậc cao nhất
  const log = b.log10();
  const tier = Math.min(LT_CAP.length - 1, Math.floor(log / 2));
  const val = b.div(Big.pow10(tier * 2));
  return `${val.format()} linh thạch (${LT_CAP[tier]})`;
}

// Số lượng gọn (đồ vật, đan dược...)
export function fmtSo(n) {
  const b = n instanceof Big ? n : Big.from(n);
  return b.format();
}

// Phần trăm với nhiều chữ số thập phân cho tỉ lệ cực nhỏ
export function fmtPercent(p) {
  if (p >= 1) return (p * 100).toFixed(1) + '%';
  if (p >= 0.001) return (p * 100).toFixed(3) + '%';
  if (p <= 0) return '0%';
  // Rất nhỏ: ký hiệu khoa học
  return (p * 100).toExponential(2).replace('e', '×10^') + '%';
}

// Thời gian in-game: {nam, thang, ngay}
export function fmtThoiGian(t) {
  if (!t) return 'Năm 0';
  const parts = [];
  if (t.nam) parts.push(`Năm ${t.nam.toLocaleString('vi-VN')}`);
  parts.push(`tháng ${t.thang || 1}`);
  parts.push(`ngày ${t.ngay || 1}`);
  return parts.join(', ');
}

// Rút gọn văn bản dài (cho log)
export function truncate(s, n = 120) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
