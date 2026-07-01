// rng.js — RNG có seed (mulberry32) + roll độ hiếm theo phần trăm cực nhỏ.

export class RNG {
  constructor(seed) {
    // seed: số nguyên 32-bit
    this.state = (seed >>> 0) || (Date.now() >>> 0);
  }

  // [0, 1)
  next() {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Số thực [min, max)
  range(min, max) {
    return min + this.next() * (max - min);
  }

  // Số nguyên [min, max] (bao gồm 2 đầu)
  int(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  // Trả true với xác suất prob (0..1). Hỗ trợ prob cực nhỏ (vd 1e-12).
  chance(prob) {
    if (prob <= 0) return false;
    if (prob >= 1) return true;
    return this.next() < prob;
  }

  // Roll theo phần trăm (vd 0.00005 nghĩa là 0.00005%)
  chancePercent(percent) {
    return this.chance(percent / 100);
  }

  // Chọn ngẫu nhiên 1 phần tử
  pick(arr) {
    if (!arr || arr.length === 0) return undefined;
    return arr[this.int(0, arr.length - 1)];
  }

  // Chọn theo trọng số: items = [{weight, ...}] hoặc [[weight, value]]
  weighted(items, weightFn) {
    const getW = weightFn || ((x) => x.weight ?? x[0] ?? 1);
    const getV = weightFn ? (x) => x : (x) => (x.weight != null ? x : x[1] ?? x);
    let total = 0;
    for (const it of items) total += getW(it);
    let r = this.next() * total;
    for (const it of items) {
      r -= getW(it);
      if (r <= 0) return getV(it);
    }
    return getV(items[items.length - 1]);
  }

  // Trộn mảng (Fisher-Yates)
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Phân phối gần chuẩn (tổng 3 uniform) trong [min,max], đỉnh ở giữa
  gaussish(min, max) {
    const r = (this.next() + this.next() + this.next()) / 3;
    return min + r * (max - min);
  }
}

// RNG dùng chung, seed theo thời gian; game có thể thay bằng seed lưu trong save.
export const rng = new RNG(Date.now() & 0xffffffff);

export function reseed(seed) {
  rng.state = (seed >>> 0) || (Date.now() >>> 0);
}
