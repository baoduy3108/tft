// realtime.js — NHỊP THỜI GIAN THẬT (idle-style). Bế quan là một TRẠNG THÁI chạy
// theo thời gian thực: tu vi dâng dần theo giây, KHÔNG phải "bấm là lên cảnh".
// Đột phá vẫn thủ công + rủi ro. Càng cảnh cao càng lâu (phàm nhân có thể kẹt vạn năm).

import { cultivate, refineSoul, veinIdOfRegion, progressPerYear } from './cultivation.js';

// Bao nhiêu GIÂY thực = 1 NĂM trong game (ở chế độ Tĩnh Tu, tốc độ ×1).
// Chỉnh số này để tăng/giảm nhịp toàn cục. 18s/năm: đầu game vài phút/tầng,
// hậu kỳ (độ khó cao) tốn hàng giờ → hàng trăm giờ, đúng chất hardcore trường kỳ.
export const SEC_PER_YEAR = 18;

// Trần tiến độ khi vắng mặt (offline) áp dụng một lần khi mở lại — tối đa 12 giờ thực.
export const OFFLINE_CAP_MS = 12 * 3600 * 1000;

export const MODES = {
  tinh: { id: 'tinh', name: 'Tĩnh Tu', speed: 1.0, taintExtra: 0.0, thoExtra: 0.0, riskMul: 0.7,
    desc: 'An toàn, ổn định. Tốc độ tiêu chuẩn.' },
  kho: { id: 'kho', name: 'Khổ Tu', speed: 2.6, taintExtra: 0.5, thoExtra: 0.6, riskMul: 2.2,
    desc: 'Nhanh gấp bội nhưng hao thọ nguyên, tích chướng tính nhanh, dễ gặp tai họa.' },
  soul: { id: 'soul', name: 'Luyện Nguyên Thần', speed: 1.0, riskMul: 0.5,
    desc: 'Ngưng luyện thần thức để chống công kích linh hồn về sau.' },
};

export function inGameYears(dtMs) {
  return (dtMs / 1000) / SEC_PER_YEAR;
}

// Ước tính số GIÂY thực để lấp đầy một tiểu cảnh hiện tại (ở tốc độ mode).
export function estSecondsToBreak(G, mode = 'tinh') {
  const per = progressPerYear(G) * (MODES[mode]?.speed || 1); // tiến độ/năm
  if (per <= 0) return Infinity;
  const remain = Math.max(0, 1 - G.s.cultProgress);
  return (remain / per) * SEC_PER_YEAR;
}

// Một nhịp: áp dụng dtMs thời gian thực vào trạng thái hiện tại.
// Trả về { years } — số năm in-game đã trôi (đã tính tốc độ mode).
export function tick(G, dtMs) {
  if (!G.s.alive || !G.s.mode || G.s.mode === 'idle') return { years: 0 };
  const baseYears = inGameYears(dtMs);
  if (baseYears <= 0) return { years: 0 };

  if (G.s.mode === 'soul') {
    refineSoul(G, baseYears);
    return { years: baseYears, mode: MODES.soul };
  }

  const m = MODES[G.s.mode] || MODES.tinh;
  const years = baseYears * m.speed;
  cultivate(G, years);                 // đã tự cộng chướng tính + trôi thời gian + hao thọ theo tuổi
  if (m.taintExtra) G.s.taint += baseYears * m.taintExtra;
  if (m.thoExtra) G.s.thoNguyen -= baseYears * m.thoExtra;
  return { years, mode: m };
}

// Áp dụng thời gian offline khi mở lại game (một lần), có trần.
export function applyOffline(G, nowMs) {
  if (!G.s.mode || G.s.mode === 'idle' || !G.s.lastTick) { G.s.lastTick = nowMs; return 0; }
  const dt = Math.min(OFFLINE_CAP_MS, Math.max(0, nowMs - G.s.lastTick));
  if (dt < 1000) { G.s.lastTick = nowMs; return 0; }
  const res = tick(G, dt);
  G.s.lastTick = nowMs;
  return res.years || 0;
}

export function startMode(G, mode) {
  G.s.mode = mode;
  G.s.lastTick = Date.now();
}
export function stopMode(G) {
  G.s.mode = 'idle';
  G.s.lastTick = Date.now();
}
