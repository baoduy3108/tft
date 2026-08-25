// bignum.js — Số siêu lớn (mantissa + exponent, cơ số 10)
// Dùng cho sức mạnh cảnh giới: tới cảnh 100 vượt xa 1e308 nên Number thường tràn.
// Biểu diễn: value = mantissa * 10^exp, với 1 <= |mantissa| < 10 (đã chuẩn hoá), hoặc mantissa = 0.

const HAN_UNITS = [
  // [exp, tên] — đơn vị đếm số kiểu Hán-Việt (mỗi bậc x10^4)
  [0, ''], [4, 'vạn'], [8, 'ức'], [12, 'triệu ức'],
  [16, 'kinh'], [20, 'cai'], [24, 'tỉ'], [28, 'nhương'],
  [32, 'câu'], [36, 'giản'], [40, 'chính'], [44, 'tái'],
  [48, 'cực'], [52, 'hằng hà sa'], [56, 'a tăng kỳ'],
  [60, 'na do tha'], [64, 'bất khả tư nghị'], [68, 'vô lượng'], [72, 'đại số'],
];

export class Big {
  constructor(mantissa = 0, exp = 0) {
    this.m = mantissa;
    this.e = exp;
    this.normalize();
  }

  normalize() {
    if (this.m === 0 || !isFinite(this.m)) {
      this.m = 0;
      this.e = 0;
      return this;
    }
    while (Math.abs(this.m) >= 10) {
      this.m /= 10;
      this.e += 1;
    }
    while (Math.abs(this.m) < 1) {
      this.m *= 10;
      this.e -= 1;
    }
    // Làm tròn mantissa để tránh lỗi trôi số dấu phẩy động
    this.m = Math.round(this.m * 1e12) / 1e12;
    return this;
  }

  clone() {
    return new Big(this.m, this.e);
  }

  // Tạo từ number thường (an toàn tới ~1e308)
  static from(x) {
    if (x instanceof Big) return x.clone();
    if (typeof x === 'string') return Big.parse(x);
    if (x === 0 || !isFinite(x)) return new Big(0, 0);
    const neg = x < 0;
    const ax = Math.abs(x);
    const e = Math.floor(Math.log10(ax));
    const m = ax / Math.pow(10, e);
    return new Big(neg ? -m : m, e);
  }

  // Tạo trực tiếp từ số mũ 10^exp (hỗ trợ exp thập phân: tách phần nguyên + mantissa)
  static pow10(exp) {
    const e = Math.floor(exp);
    const frac = exp - e;
    return new Big(Math.pow(10, frac), e);
  }

  static parse(str) {
    // Hỗ trợ "1.23e45" hoặc số thường
    const n = Number(str);
    if (isFinite(n)) return Big.from(n);
    const mtch = /^(-?[\d.]+)e(-?\d+)$/i.exec(str.trim());
    if (mtch) return new Big(Number(mtch[1]), Number(mtch[2]));
    return new Big(0, 0);
  }

  isZero() {
    return this.m === 0;
  }

  mul(other) {
    const o = Big.from(other);
    if (this.isZero() || o.isZero()) return new Big(0, 0);
    return new Big(this.m * o.m, this.e + o.e);
  }

  // Nhân với 10^exp (rất hay dùng cho hệ số cảnh giới)
  mulPow10(exp) {
    if (this.isZero()) return new Big(0, 0);
    return new Big(this.m, this.e + exp);
  }

  div(other) {
    const o = Big.from(other);
    if (o.isZero()) return new Big(0, 0);
    if (this.isZero()) return new Big(0, 0);
    return new Big(this.m / o.m, this.e - o.e);
  }

  add(other) {
    const o = Big.from(other);
    if (this.isZero()) return o.clone();
    if (o.isZero()) return this.clone();
    // Đưa về cùng số mũ của số lớn hơn
    const hi = this.e >= o.e ? this : o;
    const lo = this.e >= o.e ? o : this;
    const diff = hi.e - lo.e;
    if (diff > 15) return hi.clone(); // số nhỏ không đáng kể
    const m = hi.m + lo.m / Math.pow(10, diff);
    return new Big(m, hi.e);
  }

  sub(other) {
    const o = Big.from(other);
    return this.add(new Big(-o.m, o.e));
  }

  // So sánh: -1, 0, 1
  cmp(other) {
    const o = Big.from(other);
    if (this.isZero() && o.isZero()) return 0;
    const sa = Math.sign(this.m);
    const sb = Math.sign(o.m);
    if (sa !== sb) return sa < sb ? -1 : 1;
    // cùng dấu
    if (this.e !== o.e) {
      const bigger = this.e > o.e ? 1 : -1;
      return sa > 0 ? bigger : -bigger;
    }
    if (this.m === o.m) return 0;
    return this.m > o.m ? 1 : -1;
  }

  gt(o) { return this.cmp(o) > 0; }
  gte(o) { return this.cmp(o) >= 0; }
  lt(o) { return this.cmp(o) < 0; }
  lte(o) { return this.cmp(o) <= 0; }
  eq(o) { return this.cmp(o) === 0; }

  // Chuyển sang Number (mất chính xác nếu quá lớn -> Infinity)
  toNumber() {
    if (this.e > 308) return this.m > 0 ? Infinity : -Infinity;
    return this.m * Math.pow(10, this.e);
  }

  // Số mũ thập phân xấp xỉ (dùng để so sánh chênh lệch cấp bậc)
  log10() {
    if (this.isZero()) return -Infinity;
    return this.e + Math.log10(Math.abs(this.m));
  }

  // Định dạng hiển thị tiếng Việt
  format() {
    if (this.isZero()) return '0';
    const neg = this.m < 0 ? '-' : '';
    // Số nhỏ: in bình thường
    if (this.e < 4) {
      const v = Math.abs(this.toNumber());
      if (v < 1000) return neg + (Math.round(v * 100) / 100).toLocaleString('vi-VN');
      return neg + Math.round(v).toLocaleString('vi-VN');
    }
    // Tìm đơn vị Hán-Việt phù hợp (mỗi đơn vị cách nhau 4 bậc → rem < 4).
    // Vượt đơn vị lớn nhất (e ≥ 76) thì dùng ký hiệu khoa học để tránh tràn số.
    for (let i = HAN_UNITS.length - 1; i >= 0; i--) {
      const [ue, uname] = HAN_UNITS[i];
      if (this.e >= ue && this.e - ue < 4) {
        const rem = this.e - ue;
        const val = Math.abs(this.m) * Math.pow(10, rem);
        const shown = val >= 1000 ? Math.round(val) : Math.round(val * 100) / 100;
        return `${neg}${shown.toLocaleString('vi-VN')} ${uname}`.trim();
      }
    }
    return neg + this.sci();
  }

  // Ký hiệu khoa học: 1.23×10^45
  sci() {
    if (this.isZero()) return '0';
    const m = Math.round(this.m * 100) / 100;
    return `${m}×10^${this.e}`;
  }

  // Chuỗi lưu trữ (serialize)
  toJSON() {
    return { m: this.m, e: this.e };
  }

  static fromJSON(o) {
    if (o == null) return new Big(0, 0);
    if (typeof o === 'number') return Big.from(o);
    return new Big(o.m ?? 0, o.e ?? 0);
  }
}

export function big(x) {
  return Big.from(x);
}
