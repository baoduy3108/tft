// time.js — Đồng hồ in-game. Thời gian là kẻ thù (quy tắc gốc):
// tu luyện tốn thời gian, thọ nguyên trôi, thế giới tự diễn tiến bất kể người chơi.

import { log } from '../state.js';

const DAYS_PER_MONTH = 30;
const MONTHS_PER_YEAR = 12;

// Tiến thời gian theo số ngày. Trừ thọ nguyên tương ứng. Trả về số năm đã trôi.
export function advanceDays(G, days) {
  const t = G.s.time;
  t.ngay += days;
  while (t.ngay > DAYS_PER_MONTH) {
    t.ngay -= DAYS_PER_MONTH;
    t.thang += 1;
    if (t.thang > MONTHS_PER_YEAR) {
      t.thang -= MONTHS_PER_YEAR;
      t.nam += 1;
    }
  }
  const years = days / (DAYS_PER_MONTH * MONTHS_PER_YEAR);
  G.s.age += years;
  G.s.thoNguyen -= years;
  checkLifespan(G);
  return years;
}

export function advanceYears(G, years) {
  return advanceDays(G, years * DAYS_PER_MONTH * MONTHS_PER_YEAR);
}

// Khấu trừ thọ nguyên trực tiếp (bí thuật, trúng độc, chiến đấu hao tổn) — vĩnh viễn.
export function deductLifespan(G, years, reason) {
  G.s.thoNguyen -= years;
  if (reason) log(`Thọ nguyên hao tổn ${Math.round(years)} năm (${reason}).`, 'bad');
  checkLifespan(G);
}

// Tăng thọ nguyên (đột phá đại cảnh / thọ đan)
export function grantLifespan(G, years, reason) {
  G.s.thoNguyen += years;
  G.s.thoNguyenMax = Math.max(G.s.thoNguyenMax, G.s.age + G.s.thoNguyen);
  if (reason) log(`Thọ nguyên tăng ${Math.round(years)} năm (${reason}).`, 'good');
}

function checkLifespan(G) {
  if (G.s.alive && G.s.thoNguyen <= 0) {
    G.s.alive = false;
    G.s.causeOfDeath = 'Thọ nguyên đã cạn. Ngươi hóa thành cát bụi theo lẽ tự nhiên của trời đất.';
    log('☠ Thọ nguyên cạn kiệt. Ngươi ngồi kiết già, hóa thành tro tàn.', 'death');
  }
}
