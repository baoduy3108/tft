// ai.js — Tích hợp LLM (Claude) TÙY CHỌN cho lựa chọn tự do + phản ứng NPC.
// Khi người chơi bật và nhập API key của họ, ô "lựa chọn tự do" sẽ được diễn giải
// bằng mô hình ngôn ngữ thật (hiểu câu bất kỳ) thay vì bộ parser từ khóa offline.
//
// Gọi trực tiếp Messages API từ trình duyệt (raw HTTP). Vì key nằm ở client nên
// chỉ hợp cho bản cá nhân/thử nghiệm — bản phát hành Google Play NÊN proxy qua
// server riêng để giấu key (xem README).

const LS_KEY = 'tt_ai_config';
export const DEFAULT_MODEL = 'claude-opus-4-8';
export const MODEL_OPTIONS = [
  { id: 'claude-opus-4-8', name: 'Opus 4.8 (thông minh nhất, đắt hơn)' },
  { id: 'claude-sonnet-5', name: 'Sonnet 5 (cân bằng)' },
  { id: 'claude-haiku-4-5', name: 'Haiku 4.5 (nhanh, rẻ nhất)' },
];

export function getAIConfig() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
}
export function setAIConfig(c) {
  localStorage.setItem(LS_KEY, JSON.stringify(c));
}
export function aiAvailable() {
  const c = getAIConfig();
  return !!(c.enabled && c.apiKey);
}

function systemPrompt() {
  return `Ngươi là "THIÊN ĐẠO" — bộ máy tường thuật của một game tu tiên HARDCORE tiếng Việt (permadeath).
Người chơi vừa tự gõ một hành động tự do trong một bối cảnh. Nhiệm vụ của ngươi: diễn giải hành động đó theo tinh thần thế giới, viết một đoạn tường thuật ngắn (2-5 câu, văn phong tiểu thuyết tu tiên, xưng "ngươi"), và quyết định hệ quả cơ chế.

5 QUY TẮC GỐC (bắt buộc tuân theo):
1. Không có cơ duyên miễn phí — mọi lợi ích đều kèm một cái giá (mất thọ nguyên, gánh nhân quả, hoặc lộ diện).
2. Tu tiên là tiến hóa & dị biến — sức mạnh đi kèm biến đổi/nguy hiểm.
3. Mọi NPC đều thông minh, có mục tiêu, ký ức, có thể phản bội/báo thù.
4. Thời gian là kẻ thù, tài nguyên cực hiếm.
5. Thế giới không xoay quanh người chơi; hành động ngu ngốc có thể dẫn tới cái chết.

QUY TẮC HỆ QUẢ:
- Giữ hệ quả HỢP LÝ và VỪA PHẢI, đúng chất hardcore (không ban thưởng vô cớ).
- karma: -10..10 (âm = nghiệp xấu). attention: 0..20 (độ lộ diện tăng). chuong_tinh: 0..10 (ô nhiễm tăng). tho_nguyen: -30..30 (đổi thọ nguyên, năm). tu_vi: -0.1..0.2 (đổi tiến độ tu luyện, tỉ lệ).
- combat=true CHỈ khi hành động rõ ràng khơi mào chiến đấu.
- chet=true CHỈ khi hành động mang tính tự sát/chắc chắn chết (rất hiếm).
Trả về DUY NHẤT một JSON đúng schema, không kèm giải thích ngoài JSON.`;
}

const SCHEMA = {
  type: 'object',
  properties: {
    narrative: { type: 'string' },
    karma: { type: 'integer' },
    attention: { type: 'integer' },
    chuong_tinh: { type: 'number' },
    tho_nguyen: { type: 'number' },
    tu_vi: { type: 'number' },
    combat: { type: 'boolean' },
    chet: { type: 'boolean' },
  },
  required: ['narrative', 'karma', 'attention', 'chuong_tinh', 'tho_nguyen', 'tu_vi', 'combat', 'chet'],
  additionalProperties: false,
};

function snapshot(G) {
  const s = G.s;
  return {
    canh_gioi: s.realmId <= 0 ? 'Phàm Nhân' : `cảnh ${s.realmId} tiểu cảnh ${s.subIndex}`,
    linh_can: s.rootRevealed ? s.root?.name : 'chưa rõ',
    the_chat: s.physiqueRevealed ? s.physique?.name : 'chưa rõ',
    khi_van: s.luckRevealed ? s.luckId : 'chưa rõ',
    nhan_qua: s.karma, lo_dien: Math.round(s.attention), chuong_tinh: Math.round(s.taint),
    nguyen_than: Math.floor(s.nguyenThan), tho_nguyen_con: Math.floor(s.thoNguyen),
    cong_phap: s.technique?.name || 'không', xuat_than: s.flags.originName || '?',
    vi_tri: `${s.world?.name} · ${s.region}`,
  };
}

// Gọi mô hình. scene = { loai, tieu_de, mo_ta, lua_chon:[...] }. Trả về object hệ quả.
export async function aiResolveFreeAction(G, text, scene) {
  const c = getAIConfig();
  const userMsg = JSON.stringify({
    trang_thai_nhan_vat: snapshot(G),
    boi_canh: scene,
    hanh_dong_nguoi_choi: text,
  });
  const body = {
    model: c.model || DEFAULT_MODEL,
    max_tokens: 700,
    output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
    system: systemPrompt(),
    messages: [{ role: 'user', content: userMsg }],
  };
  const base = c.baseUrl || 'https://api.anthropic.com';
  const res = await fetch(base + '/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': c.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const out = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  return JSON.parse(out);
}

// Kiểm tra key nhanh bằng một request tối thiểu.
export async function aiTest() {
  const c = getAIConfig();
  const base = c.baseUrl || 'https://api.anthropic.com';
  const res = await fetch(base + '/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json', 'x-api-key': c.apiKey,
      'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: c.model || DEFAULT_MODEL, max_tokens: 16, messages: [{ role: 'user', content: 'Trả lời đúng một chữ: OK' }] }),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`);
  return true;
}
