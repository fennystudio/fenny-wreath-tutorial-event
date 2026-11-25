免膠繽紛聖誕花環 DIY 教學｜活動版（台中市政府活動用）｜芬妮手作

2026-11-25 從 `~/Documents/fenny-wreath-tutorial`（ManyChat 私訊用的公開頁）複製出來，差別：
- 拿掉所有材料包購買連結（置頂商品列、主視覺／材料區／步驟間購買按鈕、聖誕系列格、頁尾線上商店）。頁尾只留 IG、LINE。
- 步驟照詳細版影片完整 9 步（公開頁省略的第 2 長線、第 6 鈴鐺、第 7 皮繩掛環補回，第 8 裝飾／第 9 蝴蝶結分開）。
  片中燒入字卡就是原本的「步驟1～9」，不用改號；底片用公開頁的 `_work/base720_fixed.mp4`（吸管字卡已改鉛筆），調色與公開頁相同。
- 主視覺換成完成品照片（公開頁用的是材料包封面圖）。
- GA4 事件前綴 `wreath_event_`，跟公開頁的 `wreath_` 分開，數據不會混在一起。

重建：`python3 _work/cut.py`（切 9 段影片）→ `python3 _work/gen.py`（產 index.html＋tracking.json）→ `node --test tests/tracking.test.js`。
⚠️ 尚未上線：Sally 本機預覽審過、說可以才建 repo `fennystudio/fenny-wreath-tutorial-event` 並開 Pages。
