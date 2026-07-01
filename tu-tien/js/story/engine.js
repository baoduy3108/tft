// engine.js — Narrative engine dạng node. Lựa chọn A/B/C/D dẫn tới hệ quả thật.
//
// Node = {
//   id,
//   text: string | (G) => string,
//   onEnter?: (G) => void,          // chạy 1 lần khi vào node
//   choices?: [ Choice ],           // nếu không có -> node kết thúc nhánh
//   auto?: (G) => nodeId,           // tự nhảy node khác (không cần bấm)
// }
// Choice = {
//   label: string,                  // nội dung lựa chọn (A/B/C/D gắn tự động)
//   hint?: string | (G)=>string,    // gợi ý phụ (điều kiện/hệ quả) hiển thị mờ
//   show?: (G) => bool,             // ẩn/hiện lựa chọn
//   enabled?: (G) => bool,          // cho phép chọn hay không (khóa mờ)
//   effect?: (G) => void,           // hệ quả khi chọn
//   goto: nodeId | (G) => nodeId,   // node kế tiếp
//   screen?: string,                // mở màn hình hệ thống thay vì node (vd 'cultivate')
// }

const NODES = new Map();

export function registerNodes(nodeArray) {
  for (const n of nodeArray) {
    if (NODES.has(n.id)) console.warn('Node trùng id:', n.id);
    NODES.set(n.id, n);
  }
}

export function getNode(id) {
  return NODES.get(id);
}

export function hasNode(id) {
  return NODES.has(id);
}

function resolve(val, G) {
  return typeof val === 'function' ? val(G) : val;
}

// Vào một node: chạy onEnter (1 lần), xử lý auto-jump. Trả về node hiển thị được.
export function enterNode(G, id, _guard = 0) {
  if (_guard > 50) {
    console.error('Auto-jump quá sâu, dừng tại', id);
    return getNode(id);
  }
  const node = getNode(id);
  if (!node) {
    console.error('Không tìm thấy node:', id);
    return getNode('_missing') || { id: '_missing', text: `(Thiếu node: ${id})`, choices: [] };
  }
  G.s.node = id;
  if (node.onEnter) node.onEnter(G);
  if (node.auto) {
    const next = node.auto(G);
    if (next && next !== id) return enterNode(G, next, _guard + 1);
  }
  return node;
}

// Danh sách lựa chọn hiển thị được (đã lọc show, resolve text/hint), kèm chỉ số gốc.
export function visibleChoices(G, node) {
  if (!node.choices) return [];
  const out = [];
  node.choices.forEach((c, i) => {
    if (c.show && !c.show(G)) return;
    out.push({
      idx: i,
      label: resolve(c.label, G),
      hint: c.hint ? resolve(c.hint, G) : '',
      enabled: c.enabled ? !!c.enabled(G) : true,
      screen: c.screen || null,
    });
  });
  return out;
}

// Áp dụng lựa chọn -> trả về node kế tiếp (đã enterNode), hoặc {screen} nếu mở hệ thống.
export function applyChoice(G, node, idx) {
  const c = node.choices?.[idx];
  if (!c) return { node };
  if (c.enabled && !c.enabled(G)) return { node }; // bị khóa
  if (c.effect) c.effect(G);
  if (c.screen) return { screen: c.screen };
  const nextId = resolve(c.goto, G);
  if (!nextId) return { node }; // ở lại
  return { node: enterNode(G, nextId) };
}

export function resolveText(G, node) {
  return resolve(node.text, G);
}
