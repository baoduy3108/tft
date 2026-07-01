# Tu Tiên — Vô Hạn Đạo (Hardcore Text Game)

Một **text game tu tiên hardcore siêu dài**: visual novel + sim, lựa chọn A/B/C/D
phân nhánh, cốt truyện có chiều sâu như tiểu thuyết, xen kẽ mô phỏng tu luyện /
luyện đan / chiến đấu. **Chết là thật (permadeath). Không có cơ duyên miễn phí.**

Chạy hoàn toàn bằng trình duyệt, vanilla JS (ES modules), **không cần build**.

## Cách chạy

Vì dùng ES modules, cần một web server tĩnh (mở trực tiếp `file://` sẽ bị chặn CORS):

```bash
cd tu-tien
python3 -m http.server 8099
# mở http://localhost:8099/
```

Hoặc bất kỳ static server nào (`npx serve`, Live Server của VS Code…).

## 5 Quy tắc gốc của thế giới (baked vào cơ chế)

1. **Không có cơ duyên miễn phí** — mọi phần thưởng gắn một cái giá: mất thọ
   nguyên, gánh nhân quả, hoặc lộ diện thu hút kẻ thù (`systems/worldrules.js`).
2. **Tu tiên là tiến hóa & dị biến** — mỗi lần đột phá roll biến dị thân thể /
   linh hồn / đạo tâm; càng mạnh càng "ít giống người".
3. **Mọi sinh linh đều là người chơi** — NPC có tính cách, ký ức, mục tiêu;
   biết giả yếu, dụ, phản bội, báo thù (`systems/npc.js`).
4. **Thời gian là kẻ thù** — tu luyện tốn thời gian; thọ nguyên trôi; thiên tài
   vượt cấp nhanh, phàm nhân kẹt vạn năm (`systems/time.js`).
5. **Thế giới không xoay quanh nhân vật chính** — có thiên mệnh chi tử khác;
   world event xảy ra bất kể người chơi; chết như vô số kẻ khác.

Hương vị hardcore: linh khí **ô nhiễm** (tu = "nạp độc", cần tẩy chướng tính),
**khấu trừ thọ nguyên** khi hao tổn, kinh tế **linh thạch** khắc nghiệt, **khí
vận độc hại**. Khởi đầu tại vùng đất bị ruồng bỏ **[Khô Kiệt Tinh Lộ]**.

## Xuất thân & lựa chọn vô hạn

- **83 xuất thân khởi đầu** theo 6 bậc hiếm (Phàm Thường / Hiếm / Quý / Sử Thi /
  Truyền Thuyết / Thần Thoại) — `data/origins.js`. Mỗi lần chơi bốc một "tay bài"
  5 xuất thân theo trọng số hiếm, cộng nút **"Để số phận định đoạt"** (random toàn
  bộ, kể cả Thần Thoại như *Tàn Niệm Đại Đạo*, *Hồng Mông Chí Thể*). Ví dụ:
  *Thiên Đạo kiếp trước ruồng bỏ* (Hắc Vận, nhân quả −10, nhưng ẩn giấu bí mật),
  *Thánh Tử đầu thai* (khí vận lớn + gia sản kếch xù). Mọi xuất thân đều được đóng
  khung là "quá khứ/huyết mạch/tàn hồn/gia sản giấu kín" nên tương thích một mở màn.
- **Lựa chọn ẩn 5/6**: một số nhánh chỉ hiện dựa trên xuất thân & lựa chọn trước
  (vd huyết mạch/ma tính → "sát khí trỗi dậy"; giàu có/khí vận → "dùng gia sản cứu
  người"). Engine hỗ trợ điều kiện `show(G)` cho mọi choice.
- **Ô nhập lựa chọn tự do** ("bảng điền"): người chơi tự gõ hành động (kể cả "chọn
  cả A và B"). Bộ diễn giải ý định `systems/intent.js` sẽ **khớp vào nhánh có sẵn**
  để ra hệ quả thật, hoặc tạo **kết cục ứng biến** ảnh hưởng nhân quả / lộ diện /
  quan hệ NPC → nhân quả cốt truyện gần như vô tận.
  > Lưu ý: đây là diễn giải theo TỪ KHÓA (tất định, chạy offline). Muốn NPC/kịch
  > bản hiểu câu tự nhiên bất kỳ như "AI thật" thì cần nối một API mô hình ngôn ngữ
  > (điểm mở rộng đã chừa sẵn trong `systems/intent.js`).

## Hệ thống

- **100 đại cảnh giới** (Luyện Khí → ĐẠI ĐẠO), mỗi đại cảnh có tiểu cảnh. Sức
  mạnh tăng theo cấp số nhân (tiểu cảnh ×10, đại cảnh ×100→×1000), dùng số siêu
  lớn **BigNumber** (`util/bignum.js`) — tới cảnh 100 đạt ~10^515.
- **12 phẩm** dùng chung cho pháp bảo / công pháp / đan dược / linh dược / thể
  chất (`data/grades.js`). Gating theo cấp thế giới: phẩm cao gần như không tồn
  tại ở vũ trụ khởi đầu.
- **Linh căn** (`data/spiritroots.js`), **180 thể chất** (`data/physiques.js`),
  **khí vận** (`data/luck.js`), **linh mạch 12 bậc** (`data/spiritveins.js`).
- **Tu luyện / đột phá** có rủi ro, dị biến, thọ nguyên (`systems/cultivation.js`,
  `systems/breakthrough.js`).
- **Luyện đan** với tỉ lệ thất bại → nổ lò / phản phệ / cháy hồn (`systems/alchemy.js`).
- **Chiến đấu** theo lượt + uy áp + công kích nguyên thần (`systems/combat.js`).
- **Tông môn** 8 cấp / 7 loại / 7 vị trí (`data/sects.js`).
- **Event thủ tục vô hạn**: CHIẾN TRANH / DIỆT THẾ / PHẢN BỘI / CƠ DUYÊN /
  NGỘ ĐẠO (`story/events.js`).
- **Cốt truyện viết tay**: arc mở màn (`story/arc_prologue.js`) + arc tông môn
  (`story/arc_sect.js`), chạy trên narrative engine node-based (`story/engine.js`).
- Lưu game tự động vào `localStorage` (`state.js`).

## Cấu trúc thư mục

```
tu-tien/
  index.html            css/style.css
  js/
    main.js  state.js
    util/     bignum.js  rng.js  format.js
    data/     realms grades spiritroots physiques spiritveins luck
              worlds pills herbs treasures techniques sects bosses
    systems/  time cultivation breakthrough alchemy combat npc karma worldrules
    story/    engine events arc_prologue arc_sect
```

## Đóng gói lên Google Play (định hướng)

Đây là web app tĩnh nên có thể đóng gói mà không cần viết lại:

- **TWA (Trusted Web Activity)** qua [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap):
  deploy thư mục `tu-tien/` lên HTTPS, thêm `manifest.json` + service worker
  (PWA), rồi `bubblewrap init/build` để ra file `.aab` nộp Play.
- Hoặc **Capacitor**: `npx cap init`, copy `tu-tien/` vào `www/`, `cap add android`,
  build APK/AAB trong Android Studio.

Cần bổ sung khi phát hành: `manifest.json`, service worker (chơi offline),
icon bộ đầy đủ trong `assets/`, và chính sách quyền riêng tư.

## Trạng thái

Bản hybrid v1: đầy đủ hệ thống lõi + khung dữ liệu cho cả 100 cảnh giới, cốt
truyện viết tay cho giai đoạn đầu, và event thủ tục vô hạn cho phần còn lại.
Đã kiểm thử tự động (Playwright + node) qua toàn bộ luồng chơi và 5 loại event,
không có lỗi runtime.
