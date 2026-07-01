// main.js — Bootstrap, vòng lặp game, điều hướng màn hình, render UI.

import { G, createNewGame, save, hasSave, load, deleteSave, log, linhThach, luck } from './state.js';
import { enterNode, visibleChoices, applyChoice, resolveText } from './story/engine.js';
import { loadPrologue } from './story/arc_prologue.js';
import { loadSectArc } from './story/arc_sect.js';
import { rollEvent } from './story/events.js';
import { cultivate, refineSoul, realmLabel, veinIdOfRegion, progressPerYear } from './systems/cultivation.js';
import { attemptBreakthrough, nextTarget, successChance } from './systems/breakthrough.js';
import { PILLS, usePill } from './data/pills.js';
import { refine, canRefine, baseSuccess } from './systems/alchemy.js';
import { fmtNam, fmtLinhThach, fmtThoiGian, fmtPercent } from './util/format.js';
import { getRealm } from './data/realms.js';
import { getVein } from './data/spiritveins.js';
import { parseIntent, matchByIntent, genericOutcome, detectChoiceLetters } from './systems/intent.js';
import { addKarma, disasterChance, fortuneChance } from './systems/karma.js';
import { tick as rtTick, applyOffline, startMode, stopMode, MODES, estSecondsToBreak } from './systems/realtime.js';

// Đăng ký nội dung cốt truyện
loadPrologue();
loadSectArc();

let screen = 'menu';      // menu | story | hub | event | inventory | char | death
let currentNode = null;
let currentEvent = null;
let eventResult = null;
let freeMsg = null;       // kết quả tạm của lựa chọn tự do (hiển thị trên story node)

// Khối HTML ô nhập "lựa chọn tự do" (bảng điền theo ý người chơi)
function freeFormHTML() {
  return `
    <div class="freeform">
      <div class="ff-label">✍ Hoặc tự quyết định (gõ hành động của riêng ngươi — kể cả "chọn cả A và B"):</div>
      <div class="ff-row">
        <input id="freetext" class="ff-input" type="text" placeholder="vd: lặng lẽ theo dõi rồi ra tay khi hắn sơ hở..." autocomplete="off">
        <button class="btn small primary" data-act="freeact">Làm</button>
      </div>
    </div>`;
}

const view = () => document.getElementById('main-view');
const statusEl = () => document.getElementById('status-panel');

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }
function letterToVisibleIndex(letter, count) { const i = letter.charCodeAt(0) - 65; return i >= 0 && i < count ? i : -1; }
function addKarmaSafe(n, reason) { try { addKarma(G, n, reason); } catch (e) {} }

// ---------- MASTER RENDER ----------
function render() {
  if (G.s && !G.s.alive && screen !== 'menu' && screen !== 'death') screen = 'death';
  renderStatus();
  switch (screen) {
    case 'menu': renderMenu(); break;
    case 'story': renderStory(); break;
    case 'hub': renderHub(); break;
    case 'event': renderEvent(); break;
    case 'inventory': renderInventory(); break;
    case 'char': renderChar(); break;
    case 'death': renderDeath(); break;
  }
}
function commit() { if (G.s) save(); render(); }
G.onChange = render;

// ---------- STATUS PANEL (luôn hiển thị) ----------
function renderStatus() {
  const el = statusEl();
  if (!G.s || screen === 'menu') { el.style.display = 'none'; return; }
  el.style.display = 'block';
  const s = G.s;
  const vein = getVein(veinIdOfRegion(G));
  const lk = luck();
  const prog = Math.round(s.cultProgress * 100);
  const taintCls = s.taint > 30 ? 'bad' : s.taint > 15 ? 'warn' : '';
  el.innerHTML = `
    <div class="st-head">
      <span class="st-name">${esc(s.name)}</span>
      <span class="st-realm">${esc(realmLabel(G))}</span>
    </div>
    <div class="st-bar"><div class="st-bar-fill" style="width:${prog}%"></div><span>Tu vi ${prog}%</span></div>
    <div class="st-grid">
      <div><b>Thọ nguyên</b>${fmtNam(Math.max(0, Math.floor(s.thoNguyen)))} / ${fmtNam(Math.floor(s.thoNguyenMax))}</div>
      <div><b>Tuổi</b>${Math.floor(s.age)}</div>
      <div><b>Linh thạch</b>${fmtLinhThach(linhThach())}</div>
      <div><b>Nguyên thần</b>${Math.floor(s.nguyenThan)}</div>
      <div><b>Linh căn</b>${s.rootRevealed ? esc(s.root.name) : '<i>chưa rõ</i>'}</div>
      <div><b>Thể chất</b>${s.physiqueRevealed ? esc(s.physique.name) : '<i>chưa rõ</i>'}</div>
      <div><b>Khí vận</b>${s.luckRevealed ? esc(lk.name) : '<i>chưa rõ</i>'}</div>
      <div><b>Linh mạch vùng</b>${esc(vein.name)}</div>
      <div class="${taintCls}"><b>Chướng tính</b>${Math.round(s.taint)}</div>
      <div class="${s.karma < 0 ? 'bad' : s.karma > 0 ? 'good' : ''}"><b>Nhân quả</b>${s.karma}</div>
      <div class="${s.attention > 10 ? 'warn' : ''}"><b>Lộ diện</b>${Math.round(s.attention)}</div>
      <div><b>Công pháp</b>${s.technique ? esc(s.technique.name) : '<i>không</i>'}</div>
    </div>
    <div class="st-loc">📍 ${esc(s.world.name)} · ${esc(s.region)}${s.sect ? ' · ' + esc(s.sect.name) + ' (' + esc(s.sect.position) + ')' : ''} · ${esc(fmtThoiGian(s.time))}</div>
  `;
}

// ---------- MENU ----------
function renderMenu() {
  const cont = hasSave();
  view().innerHTML = `
    <div class="title-wrap">
      <h1>TU TIÊN — VÔ HẠN ĐẠO</h1>
      <p class="subtitle">Một text game tu tiên <b>hardcore</b>. Chết là thật. Không có cơ duyên miễn phí.</p>
      <div class="menu-btns">
        ${cont ? '<button class="btn primary" data-act="continue">▶ Tiếp tục hành trình</button>' : ''}
        <button class="btn" data-act="newgame">✦ Bắt đầu mới</button>
        ${cont ? '<button class="btn danger" data-act="delete">🗑 Xóa dữ liệu</button>' : ''}
      </div>
      <p class="warn-note">⚠ Thế giới này không xoay quanh ngươi. Nếu không đủ mạnh — ngươi sẽ chết như vô số kẻ khác.</p>
    </div>`;
}

// ---------- STORY ----------
function renderStory() {
  if (!currentNode) currentNode = enterNode(G, G.s.node);
  const choices = visibleChoices(G, currentNode);
  view().innerHTML = `
    <div class="story-text">${nl2br(resolveText(G, currentNode))}</div>
    ${freeMsg ? `<div class="free-result ${freeMsg.cls || ''}">${nl2br(freeMsg.text)}</div>` : ''}
    <div class="choices">
      ${choices.map((c, i) => `
        <button class="btn choice ${c.enabled ? '' : 'disabled'}" data-act="choice" data-arg="${c.idx}" ${c.enabled ? '' : 'disabled'}>
          <span class="ch-key">${String.fromCharCode(65 + i)}</span>
          <span class="ch-label">${esc(c.label)}${c.hint ? `<span class="ch-hint">${esc(c.hint)}</span>` : ''}</span>
        </button>`).join('')}
    </div>
    ${choices.length ? freeFormHTML() : ''}`;
}

// ---------- HUB ----------
function renderHub() {
  const s = G.s;
  const canBreak = s.cultProgress >= 1;
  const target = nextTarget(G);
  const p = canBreak && target ? Math.round(successChance(G, breakOpts()) * 100) : 0;
  const perYear = progressPerYear(G);
  const hasThanhLinh = (s.inventory['thanh_linh_dan'] ?? 0) > 0;
  const canSect = s.realmId >= 1 && !s.sect && !s.flags.chose_rogue;
  view().innerHTML = `
    <div class="hub">
      <h2>Bế Quan Tu Luyện</h2>
      ${cultStatusHTML()}

      <div class="hub-group"><div class="hub-title">🧘 Tu Luyện (thời gian thực)</div>
        ${s.mode === 'idle' ? `
          <button class="btn" data-act="startcult" data-arg="tinh">Bắt đầu Tĩnh Tu — ước ${fmtDur(estSecondsToBreak(G, 'tinh'))} tới khi đủ đột phá</button>
          <button class="btn" data-act="startcult" data-arg="kho">Khổ Tu (×${MODES.kho.speed} nhanh, hao thọ + chướng tính, dễ gặp họa)</button>
        ` : `
          <button class="btn primary" data-act="stopcult">⏹ Dừng ${MODES[s.mode] ? MODES[s.mode].name : 'bế quan'}</button>
          <p class="hub-hint">Đang ${MODES[s.mode] ? MODES[s.mode].name : ''}... thời gian đang trôi. ${s.mode !== 'soul' ? `Còn ~${fmtDur(estSecondsToBreak(G, s.mode))} tới khi đủ đột phá.` : ''}</p>
        `}
        ${s.technique ? '' : '<p class="hub-hint warn">(Chưa có công pháp → cực chậm)</p>'}
      </div>

      <div class="hub-group"><div class="hub-title">⚡ Đột Phá</div>
        ${canBreak && target
          ? `<button class="btn primary" data-act="breakthrough">Đột phá → ${esc(target.name)} (${p}%)</button>`
          : `<button class="btn disabled" disabled>Cần tích đủ tu vi (${Math.round(s.cultProgress * 100)}%)</button>`}
      </div>

      <div class="hub-group"><div class="hub-title">🧠 Nguyên Thần & Thanh Tẩy</div>
        ${s.mode === 'soul'
          ? '<button class="btn primary" data-act="stopcult">⏹ Dừng luyện nguyên thần</button>'
          : `<button class="btn ${s.mode === 'idle' ? '' : 'disabled'}" data-act="startcult" data-arg="soul" ${s.mode === 'idle' ? '' : 'disabled'}>Luyện nguyên thần (theo thời gian thực)</button>`}
        <button class="btn ${hasThanhLinh ? '' : 'disabled'}" data-act="purge" ${hasThanhLinh ? '' : 'disabled'}>Tẩy chướng tính (Thanh Linh Đan)</button>
      </div>

      <div class="hub-group"><div class="hub-title">🗺️ Hành Động</div>
        <button class="btn" data-act="explore">Xuất quan thám hiểm (nguy hiểm)</button>
        <button class="btn" data-act="alchemy">Luyện đan</button>
        ${canSect ? '<button class="btn" data-act="gotosect">Tìm tông môn gia nhập</button>' : ''}
        <button class="btn" data-act="inventory">Túi đồ</button>
        <button class="btn" data-act="char">Thông tin nhân vật</button>
      </div>

      <div class="hub-group"><div class="hub-title">📜 Nhật ký</div>
        <div class="log">${renderLog()}</div>
      </div>

      <div class="hub-group">
        <button class="btn" data-act="savemenu">💾 Lưu & về menu</button>
      </div>
    </div>`;
}

function breakOpts() {
  const s = G.s;
  return {
    pillBonus: (s.flags.phaCanhBuff || 0) + (s.flags.thanhTamBuff ? 0.1 : 0),
    enlightenBonus: s.flags.ngoDaoBuff || 0,
  };
}
function clearBreakBuffs() {
  delete G.s.flags.phaCanhBuff;
  delete G.s.flags.ngoDaoBuff;
  delete G.s.flags.thanhTamBuff;
}

function renderLog() {
  const items = G.s.log.slice(-12).reverse();
  if (!items.length) return '<i>Chưa có gì.</i>';
  return items.map((l) => `<div class="log-line ${l.cls}">${esc(l.t)}</div>`).join('');
}

function cultStatusHTML() {
  const s = G.s;
  const modeName = s.mode === 'idle' ? 'Nhàn rỗi' : (MODES[s.mode] ? MODES[s.mode].name : s.mode);
  const cls = s.mode === 'kho' ? 'warn' : '';
  return `<p class="hub-hint ${cls}">Trạng thái: <b>${modeName}</b> · Tu vi <b>${Math.round(s.cultProgress * 100)}%</b>${s.mode !== 'idle' ? ' · ⏳ thời gian đang trôi từng giây' : ''}</p>`;
}

// Định dạng thời lượng thực (giây) → người đọc.
function fmtDur(sec) {
  if (!isFinite(sec)) return '∞';
  if (sec < 60) return `${Math.max(1, Math.ceil(sec))} giây`;
  if (sec < 3600) return `${Math.round(sec / 60)} phút`;
  if (sec < 86400) return `${(sec / 3600).toFixed(1)} giờ`;
  if (sec < 86400 * 365) return `${(sec / 86400).toFixed(1)} ngày`;
  return `${(sec / (86400 * 365)).toFixed(1)} năm thực`;
}

// ---------- EVENT ----------
function renderEvent() {
  if (eventResult) {
    view().innerHTML = `
      <div class="event">
        <div class="ev-cat">${esc(currentEvent.category)}</div>
        <h2>${esc(currentEvent.title)}</h2>
        <div class="story-text">${nl2br(eventResult.text)}</div>
        <div class="choices">
          <button class="btn primary" data-act="event_done">Tiếp tục</button>
        </div>
      </div>`;
    return;
  }
  const choices = (currentEvent.choices || []).filter((c) => !c.show || c.show(G));
  view().innerHTML = `
    <div class="event">
      <div class="ev-cat">${esc(currentEvent.category)}</div>
      <h2>${esc(currentEvent.title)}</h2>
      <div class="story-text">${nl2br(currentEvent.text)}</div>
      <div class="choices">
        ${choices.map((c, i) => `
          <button class="btn choice" data-act="evchoice" data-arg="${currentEvent.choices.indexOf(c)}">
            <span class="ch-key">${String.fromCharCode(65 + i)}</span>
            <span class="ch-label">${esc(c.label)}${c.hint ? `<span class="ch-hint">${esc(c.hint)}</span>` : ''}</span>
          </button>`).join('')}
      </div>
      ${freeFormHTML()}
    </div>`;
}

// ---------- INVENTORY ----------
function renderInventory() {
  const s = G.s;
  const pills = Object.keys(s.inventory).filter((k) => PILLS[k] && s.inventory[k] > 0);
  const herbs = Object.keys(s.inventory).filter((k) => k.startsWith('herb_') && s.inventory[k] > 0);
  const pending = s._pendingTechs || [];
  view().innerHTML = `
    <div class="inv">
      <h2>Túi Đồ</h2>
      <div class="hub-title">💊 Đan dược</div>
      ${pills.length ? pills.map((k) => `
        <div class="inv-item">
          <span>${esc(PILLS[k].name)} <small>(Phẩm ${PILLS[k].grade}) ×${s.inventory[k]}</small><br><small class="muted">${esc(PILLS[k].desc)}</small></span>
          <button class="btn small" data-act="usepill" data-arg="${k}">Dùng</button>
        </div>`).join('') : '<p class="muted">Trống.</p>'}

      <div class="hub-title">🌿 Linh dược</div>
      ${herbs.length ? herbs.map((k) => `<div class="inv-item"><span>${esc(k.replace('herb_', ''))} ×${s.inventory[k]}</span></div>`).join('') : '<p class="muted">Trống.</p>'}

      <div class="hub-title">🗡️ Pháp bảo</div>
      ${s.treasures.length ? s.treasures.map((t, i) => `
        <div class="inv-item">
          <span>${esc(t.name)} <small>(${esc(t.gradeName)}, phẩm ${t.grade})</small><br><small class="muted">${esc(t.desc)}${t.specialNote ? ' — ' + esc(t.specialNote) : ''}</small></span>
        </div>`).join('') : '<p class="muted">Trống.</p>'}

      <div class="hub-title">📜 Công pháp mới lĩnh hội</div>
      ${pending.length ? pending.map((t, i) => `
        <div class="inv-item">
          <span>${esc(t.name)} <small>(Phẩm ${t.grade}, ${esc(t.type)})</small></span>
          <button class="btn small" data-act="equiptech" data-arg="${i}">Tu luyện</button>
        </div>`).join('') : '<p class="muted">Không có.</p>'}

      <button class="btn" data-act="hub">◀ Quay lại</button>
    </div>`;
}

// ---------- CHARACTER ----------
function renderChar() {
  const s = G.s;
  const r = s.realmId > 0 ? getRealm(s.realmId) : null;
  const lk = luck();
  const buffs = Object.entries(s.physique?.buffs || {}).map(([k, v]) => `${k}: ×${v}`).join(', ') || 'không';
  view().innerHTML = `
    <div class="char">
      <h2>${esc(s.name)}</h2>
      <p><b>Cảnh giới:</b> ${esc(realmLabel(G))}${r ? ` <small class="muted">(${esc(r.group)})</small>` : ''}</p>
      <p><b>Linh căn:</b> ${s.rootRevealed ? esc(s.root.name) + ' — ' + esc(s.root.desc) : 'chưa được xem'}</p>
      <p><b>Thể chất:</b> ${s.physiqueRevealed ? `${esc(s.physique.name)} (Phẩm ${s.physique.grade}) — ${esc(s.physique.desc)} <br><small class="muted">Buff: ${esc(buffs)}</small>` : 'chưa được xem'}</p>
      <p><b>Khí vận:</b> ${s.luckRevealed ? esc(lk.name) + ' — ' + esc(lk.desc) : 'chưa được xem'}</p>
      <p><b>Nguyên thần:</b> ${Math.floor(s.nguyenThan)} ${s.nguyenThan < 1 ? '<span class="warn">(chưa luyện — dễ chết vì công kích linh hồn!)</span>' : ''}</p>
      <p><b>Nhân quả:</b> ${s.karma} · <b>Lộ diện:</b> ${Math.round(s.attention)} · <b>Chướng tính:</b> ${Math.round(s.taint)}</p>
      <p><b>Cơ duyên ẩn:</b> ${s.hiddenFortune.revealed ? esc(s.hiddenFortune.name) + ' — ' + esc(s.hiddenFortune.desc) : '<i>vẫn còn là bí ẩn...</i>'}</p>
      <p><b>Dị biến:</b> ${s.mutations.length ? s.mutations.length + ' lần' : 'chưa có'}</p>
      <p><b>Thống kê:</b> Giết ${s.stats.kills} · Đột phá ${s.stats.breakthroughs} · Luyện đan ${s.stats.pillsMade} · Bị phản bội ${s.stats.betrayals}</p>
      <button class="btn" data-act="hub">◀ Quay lại</button>
    </div>`;
}

// ---------- DEATH ----------
function renderDeath() {
  const s = G.s;
  view().innerHTML = `
    <div class="death">
      <h1>☠ ĐẠO TIÊU HỒN TÁN</h1>
      <p class="death-cause">${esc(s.causeOfDeath || 'Ngươi đã chết.')}</p>
      <div class="death-stats">
        <p>Ngươi ngã xuống ở cảnh giới <b>${esc(realmLabel(G))}</b>, hưởng "thọ" ${Math.floor(s.age)} tuổi.</p>
        <p>Giết ${s.stats.kills} · Đột phá ${s.stats.breakthroughs} · Luyện đan ${s.stats.pillsMade} lần.</p>
        <p class="muted">Trong [Khô Kiệt Tinh Lộ], ngươi chỉ là một trong vô số sinh linh đã tan biến. Thế giới không hề dừng lại.</p>
      </div>
      <button class="btn primary" data-act="restart">Chuyển thế — bắt đầu lại</button>
    </div>`;
}

// ---------- ACTION DISPATCH ----------
const actions = {
  newgame() { doNewGame(); },
  continue() {
    if (load()) {
      const y = applyOffline(G, Date.now()); // tiến độ khi vắng mặt (có trần)
      if (y > 0) log(`Ngươi đã bế quan liên tục, ${Math.round(y)} năm trôi qua khi ngươi vắng mặt.`, 'lore');
      screen = G.s.alive ? 'hub' : 'death';
      if (G.s.alive && G.s.node && !G.s.flags.can_cultivate) { screen = 'story'; currentNode = enterNode(G, G.s.node); }
      render();
    }
  },
  delete() { deleteSave(); render(); },
  restart() { doNewGame(); },

  choice(arg) {
    freeMsg = null;
    const res = applyChoice(G, currentNode, Number(arg));
    if (res.screen) { switchTo(res.screen); }
    else { currentNode = res.node; }
    afterAction();
  },

  // Lựa chọn TỰ DO (bảng điền). Diễn giải ý định -> khớp nhánh có sẵn hoặc ứng biến.
  freeact() {
    const input = document.getElementById('freetext');
    const text = input ? input.value.trim() : '';
    if (!text) return;
    const intent = parseIntent(text);
    const letters = detectChoiceLetters(text);

    if (screen === 'event' && currentEvent && !eventResult) {
      const labels = currentEvent.choices.map((c) => (typeof c.label === 'function' ? '' : c.label));
      // "chọn cả A và B" -> ưu tiên chữ cái; nếu 2 chữ, khen mưu trí rồi chạy nhánh đầu
      let idx = -1;
      const vis = currentEvent.choices.map((c, i) => ({ c, i })).filter(({ c }) => !c.show || c.show(G));
      if (letters.length >= 1) {
        const vi = letterToVisibleIndex(letters[0], vis.length);
        if (vi >= 0) idx = vis[vi].i;
        if (letters.length >= 2) { addKarmaSafe(1, 'lối chơi mưu trí phá cách'); }
      }
      if (idx < 0) idx = matchByIntent(intent, labels);
      if (idx >= 0 && currentEvent.choices[idx]) {
        eventResult = currentEvent.choices[idx].act(G) || { text: '...' };
      } else {
        eventResult = genericOutcome(G, intent, text);
      }
      afterAction(true);
      return;
    }

    if (screen === 'story' && currentNode) {
      const vis = visibleChoices(G, currentNode); // [{idx,label,...}]
      let target = -1;
      if (letters.length >= 1) {
        const vi = letterToVisibleIndex(letters[0], vis.length);
        if (vi >= 0) target = vis[vi].idx;
        if (letters.length >= 2) addKarmaSafe(1, 'lối chơi mưu trí phá cách');
      }
      if (target < 0) {
        const m = matchByIntent(intent, vis.map((c) => c.label));
        if (m >= 0) target = vis[m].idx;
      }
      if (target >= 0) {
        freeMsg = null;
        const res = applyChoice(G, currentNode, target);
        if (res.screen) switchTo(res.screen); else currentNode = res.node;
      } else {
        freeMsg = genericOutcome(G, intent, text); // ứng biến, ở lại node
      }
      afterAction();
    }
  },

  startcult(arg) { startMode(G, arg); afterAction(); },
  stopcult() { stopMode(G); afterAction(); },
  breakthrough() {
    if (G.s.mode !== 'idle') stopMode(G); // dừng bế quan trước khi đột phá
    attemptBreakthrough(G, breakOpts());
    clearBreakBuffs();
    afterAction();
  },
  purge() { usePill(G, 'thanh_linh_dan'); afterAction(); },

  explore() {
    if (G.s.mode !== 'idle') stopMode(G); // xuất quan thì ngừng bế quan
    currentEvent = rollEvent(G);
    eventResult = null;
    switchTo('event');
    afterAction(true);
  },
  evchoice(arg) {
    const c = currentEvent.choices[Number(arg)];
    if (c) eventResult = c.act(G) || { text: '...' };
    afterAction(true);
  },
  event_done() {
    currentEvent = null; eventResult = null;
    // Nếu có công pháp mới, gợi ý; nếu chết -> death tự xử lý
    switchTo(G.s.alive ? 'hub' : 'death');
    afterAction();
  },

  alchemy() { openAlchemy(); },
  refine(arg) { refine(G, arg); afterAction(); },
  usepill(arg) { usePill(G, arg); afterAction(true); },
  equiptech(arg) {
    const i = Number(arg);
    const t = (G.s._pendingTechs || [])[i];
    if (t) {
      if (G.s.technique && G.s.technique.grade > t.grade && !confirm(`Thay ${G.s.technique.name} (phẩm ${G.s.technique.grade}) bằng ${t.name} (phẩm ${t.grade})?`)) return;
      G.s.technique = t;
      G.s._pendingTechs.splice(i, 1);
      log(`Chuyển sang tu luyện công pháp: ${t.name} (Phẩm ${t.grade}).`, 'good');
    }
    afterAction(true);
  },

  gotosect() { G.s.node = 'sect_start'; currentNode = enterNode(G, 'sect_start'); switchTo('story'); afterAction(); },

  hub() { switchTo('hub'); afterAction(); },
  inventory() { switchTo('inventory'); afterAction(true); },
  char() { switchTo('char'); afterAction(true); },
  savemenu() { save(); screen = 'menu'; render(); },
};

function openAlchemy() {
  // Cho phép luyện các đan phẩm mà người chơi "biết" (ở đây: tất cả phẩm ≤ 4 để demo)
  const list = Object.keys(PILLS).filter((k) => PILLS[k].grade <= 4);
  view().innerHTML = `
    <div class="inv">
      <h2>Luyện Đan</h2>
      <p class="muted">Cần Đan Lô${G.s.flags.hasFurnace ? ' ✔' : ' (chưa có — hãy tìm mua/nhặt)'}, thần thức đủ mạnh, dị hỏa (tùy chọn). Thất bại có thể nổ lò, phản phệ, cháy hồn.</p>
      ${!G.s.flags.hasFurnace ? '<button class="btn" data-act="getfurnace">Tạm mượn Đan Lô cũ của lão nhân (demo)</button>' : ''}
      ${list.map((k) => {
        const p = PILLS[k];
        const chk = canRefine(G, k);
        return `<div class="inv-item">
          <span>${esc(p.name)} <small>(Phẩm ${p.grade}, tỉ lệ nền ${fmtPercent(baseSuccess(p.grade))})</small><br><small class="muted">${esc(p.desc)}</small></span>
          <button class="btn small ${chk.ok ? '' : 'disabled'}" data-act="refine" data-arg="${k}" ${chk.ok ? '' : 'disabled title="' + esc(chk.reason) + '"'}>Luyện</button>
        </div>`;
      }).join('')}
      <button class="btn" data-act="hub">◀ Quay lại</button>
    </div>`;
}
actions.getfurnace = function () { G.s.flags.hasFurnace = true; log('Ngươi có được một Đan Lô cũ (demo).', 'good'); afterAction(); openAlchemy(); };

function switchTo(sc) { screen = sc; }

function afterAction(skipStoryRefresh) {
  if (G.s && !G.s.alive) screen = (screen === 'event') ? 'event' : 'death';
  commit();
}

function doNewGame() {
  createNewGame({});
  freeMsg = null; currentEvent = null; eventResult = null;
  currentNode = enterNode(G, 'prologue_start');
  screen = 'story';
  log('— Một sinh mệnh mới chào đời tại [Khô Kiệt Tinh Lộ] —', 'lore');
  commit();
}

// ---------- WIRING ----------
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn || btn.disabled) return;
  const act = btn.getAttribute('data-act');
  const arg = btn.getAttribute('data-arg');
  const fn = actions[act];
  if (fn) fn(arg);
});
// Enter trong ô lựa chọn tự do = bấm "Làm"
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target && e.target.id === 'freetext') { e.preventDefault(); actions.freeact(); }
});

// ---------- VÒNG LẶP THỜI GIAN THỰC ----------
let eventAccrual = 0;      // số năm in-game tích lũy để roll sự kiện định kỳ
let lastSaveMs = Date.now();
const EVENT_EVERY_YEARS = 30;

function gameLoop() {
  if (!G.s) return;
  if (!G.s.alive) {
    if (screen !== 'death' && screen !== 'menu') { screen = 'death'; render(); }
    return;
  }
  if (!G.s.mode || G.s.mode === 'idle') { renderStatus(); return; }

  const res = rtTick(G, Math.min(5000, Date.now() - (G.s.lastTick || Date.now())));
  G.s.lastTick = Date.now();

  // Tu vi viên mãn → tự dừng để người chơi tự quyết định đột phá
  if (G.s.mode !== 'idle' && G.s.mode !== 'soul' && G.s.cultProgress >= 1) {
    stopMode(G);
    log('Tu vi đã viên mãn — có thể ĐỘT PHÁ (nhớ: đột phá luôn có rủi ro).', 'good');
  }

  // Sự kiện định kỳ khi đang bế quan (chỉ ngắt khi đang ở hub để không giật màn khác)
  if (G.s.mode !== 'idle') {
    eventAccrual += res.years || 0;
    if (eventAccrual >= EVENT_EVERY_YEARS) {
      eventAccrual = 0;
      const p = Math.min(0.6, disasterChance(G) + fortuneChance(G));
      if (screen === 'hub' && G.rng.chance(p)) {
        stopMode(G);
        currentEvent = rollEvent(G);
        eventResult = null;
        screen = 'event';
        log('Đang bế quan thì có biến — ngươi buộc phải xuất quan!', 'warn');
      }
    }
  }

  // Tự lưu định kỳ
  if (Date.now() - lastSaveMs > 8000) { save(); lastSaveMs = Date.now(); }

  if (!G.s.alive) { screen = 'death'; render(); return; }
  if (screen === 'hub') render(); else renderStatus();
}
setInterval(gameLoop, 500);

// Khởi động
render();
