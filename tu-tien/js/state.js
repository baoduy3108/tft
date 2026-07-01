// state.js — Trạng thái game (GameState) + lưu/tải localStorage (versioned).

import { Big } from './util/bignum.js';
import { RNG } from './util/rng.js';
import { rollRoot } from './data/spiritroots.js';
import { buildPhysiques, rollStartPhysique } from './data/physiques.js';
import { rollStartLuck, getLuck } from './data/luck.js';
import { startingWorld } from './data/worlds.js';

const SAVE_KEY = 'tu_tien_save_v1';
const SAVE_VERSION = 1;

// Trạng thái toàn cục (được main.js gán)
export const G = {
  s: null,       // player state (serializable)
  rng: null,     // RNG runtime
  physiques: [], // danh sách 180 thể chất (dựng từ seed)
  onChange: null // callback render lại UI
};

export function createNewGame(opts = {}) {
  const seed = (opts.seed ?? (Date.now() & 0xffffffff)) >>> 0;
  const rng = new RNG(seed);
  const physiques = buildPhysiques(new RNG(seed ^ 0x9e3779b9)); // list ổn định theo seed

  // Roll ẩn: người chơi CHƯA biết linh căn/thể chất/khí vận (chưa ai xem)
  const root = rollRoot(rng);
  const physique = rollStartPhysique(rng, physiques);
  const luckId = rollStartLuck(rng);

  const world = startingWorld();

  const s = {
    version: SAVE_VERSION,
    seed,
    name: opts.name || 'Vô Danh',
    gender: opts.gender || 'nam',
    age: 15,               // bắt đầu là thiếu niên phàm nhân
    alive: true,
    causeOfDeath: null,

    // Cảnh giới: 0 = Phàm nhân (chưa tu). 1-100 = đại cảnh.
    realmId: 0,
    subIndex: 0,
    cultProgress: 0,       // 0..1 tiến độ tới tiểu cảnh kế
    nguyenThan: 0,         // cường độ nguyên thần (0 = chưa luyện)

    // Thọ nguyên (năm)
    thoNguyen: 80 - 15,    // còn lại
    thoNguyenMax: 80,

    // Tài nguyên
    linhThach: Big.from(0).toJSON(),

    // Bẩm chất (ẩn cho tới khi được "xem")
    root, rootRevealed: false,
    physique, physiqueRevealed: false,
    luckId, luckRevealed: false,

    // Trạng thái tu luyện
    taint: 0,              // chướng tính (độ ô nhiễm linh khí trong người)
    karma: 0,             // nhân quả (âm = nợ, dương = phúc)
    attention: 0,         // độ lộ diện (bị chú ý)
    mutations: [],        // dị biến tích lũy khi đột phá

    // Trang bị & kho
    technique: null,      // công pháp đang tu
    treasures: [],        // pháp bảo
    inventory: {          // đan dược & linh dược & vật phẩm: {itemKey: qty}
    },

    // Vị trí
    world,
    region: 'Thôn Khô Thạch',

    // Xã hội
    sect: null,           // {name, tier, type, position}
    npcs: {},             // id -> npc (do systems/npc.js quản lý)

    // Câu chuyện
    node: 'prologue_start', // node hiện tại của story engine
    flags: {},             // cờ cốt truyện
    hiddenFortune: pickHiddenFortune(rng), // cơ duyên ẩn

    // Thời gian in-game
    time: { nam: 0, thang: 1, ngay: 1 },

    // Nhật ký sự kiện (mới nhất ở cuối)
    log: [],

    // Thống kê
    stats: { kills: 0, betrayals: 0, fortunes: 0, breakthroughs: 0, pillsMade: 0 },
  };

  G.s = s;
  G.rng = rng;
  G.physiques = physiques;
  return s;
}

// Chọn cơ duyên ẩn khởi đầu (1 cái, người chơi chưa biết)
function pickHiddenFortune(rng) {
  const pool = [
    { id: 'gioi_chi', name: 'Chiếc nhẫn cũ trên tay', desc: 'Một giới chỉ tổ truyền tưởng chừng vô dụng — bên trong ẩn chứa một không gian & lão hồn.' },
    { id: 'huyet_mach', name: 'Huyết mạch ngủ say', desc: 'Trong máu ngươi có một dấu vết huyết mạch cổ xưa đang say ngủ.' },
    { id: 'tan_hon', name: 'Mảnh hồn lạ', desc: 'Nguyên thần ngươi có một mảnh ký ức không thuộc về mình.' },
    { id: 'ma_chung', name: 'Ma chủng', desc: 'Một hạt giống hắc ám bị ai đó gieo vào thể ngươi từ nhỏ.' },
  ];
  return { ...rng.pick(pool), revealed: false };
}

// ------- Getters tiện dụng -------
export function linhThach() {
  return Big.fromJSON(G.s.linhThach);
}
export function setLinhThach(big) {
  G.s.linhThach = (big instanceof Big ? big : Big.from(big)).toJSON();
}
export function addLinhThach(big) {
  setLinhThach(linhThach().add(big));
}

export function luck() {
  return getLuck(G.s.luckId);
}

// ------- Nhật ký -------
export function log(text, cls = '') {
  G.s.log.push({ t: text, cls, time: { ...G.s.time } });
  if (G.s.log.length > 400) G.s.log.shift();
}

// ------- Save / Load -------
export function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(G.s));
    return true;
  } catch (e) {
    console.error('Lưu thất bại', e);
    return false;
  }
}

export function hasSave() {
  return !!localStorage.getItem(SAVE_KEY);
}

export function load() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    const s = JSON.parse(raw);
    if (!s.version) return false;
    // Dựng lại runtime
    G.s = s;
    G.rng = new RNG((s.seed ^ (Date.now() & 0xffff)) >>> 0); // RNG runtime tươi mỗi phiên
    G.physiques = buildPhysiques(new RNG(s.seed ^ 0x9e3779b9));
    return true;
  } catch (e) {
    console.error('Tải thất bại', e);
    return false;
  }
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

// Gọi khi trạng thái đổi để render lại + autosave
export function commit() {
  save();
  if (G.onChange) G.onChange();
}
