// karma.js — Nhân quả & khí vận. Khí vận là thứ CÓ THẬT và độc hại (quy tắc gốc).

import { log, luck } from '../state.js';

// Cộng/trừ nhân quả. Âm = nợ nghiệp (dễ gặp tai họa), dương = phúc duyên.
export function addKarma(G, amount, reason) {
  G.s.karma += amount;
  if (reason) {
    const dir = amount >= 0 ? 'tích' : 'gánh';
    log(`Ngươi ${dir} ${Math.abs(amount)} điểm nhân quả (${reason}).`,
      amount >= 0 ? 'good' : 'bad');
  }
}

// Cộng độ lộ diện (bị chú ý). Càng lộ càng dễ bị dòm ngó, cướp đoạt.
export function addAttention(G, amount, reason) {
  G.s.attention = Math.max(0, G.s.attention + amount);
  if (reason && amount > 0) log(`Ngươi càng thêm lộ diện (${reason}).`, 'warn');
}

// Xác suất gặp TAI HỌA trong một khoảng, tổng hợp từ nhân quả xấu + độ lộ diện + hắc vận.
export function disasterChance(G) {
  const l = luck();
  let p = 0.02;
  if (G.s.karma < 0) p += Math.min(0.4, -G.s.karma * 0.01);
  p += Math.min(0.4, G.s.attention * 0.005);
  // Khí vận cao giảm nguy khi bị động nhưng làm tăng bị chú ý (đã tính ở attention).
  p /= Math.max(0.5, l.survive);
  // Khí vận cao (attention factor) khiến bị nhắm nhiều hơn:
  p *= l.attention;
  return Math.min(0.9, Math.max(0.005, p));
}

// Xác suất gặp CƠ DUYÊN trong một khoảng, tổng hợp từ khí vận + nhân quả tốt.
export function fortuneChance(G) {
  const l = luck();
  let p = 0.03 * l.fortune;
  if (G.s.karma > 0) p += Math.min(0.2, G.s.karma * 0.005);
  return Math.min(0.6, p);
}
