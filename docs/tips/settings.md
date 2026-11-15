# 設定項目

> この内容は、OTRP の PR とリリースノートの記述から拾ったものです（2026-11-14 時点）。ゲームの動作やソースコードでは確かめていません。仕様は [OTRP wiki](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home) が正です。

simuconf.tab と「高度な設定」に OTRP が足した項目のうち、wiki の OTRP-Home の「設定項目」に載っていないものをまとめる。キー名が PR・リリースノートの原文に無い項目は「キー名は原文に無い」と書く。

## simuconf.tab で指定する描画オフセット・画像の向き

### 車両反転時の描画オフセット（`reverse_base_offset_*`）

編成反転時の車両の画像位置のずれを、simuconf.tab で直す。方角ごとに 3 つの値を書く。

- 書式は `{x_offset, y_offset, length_offset}`。
- キーは 8 方向分: `reverse_base_offset_` に `east`・`west`・`southeast`・`southwest`・`south`・`north`・`northeast`・`northwest` を付ける。
- リリースノート（v44）の記述例は、`reverse_base_offset_east = 0, 0, 18`、`reverse_base_offset_west = 0, 2, 14` のように書く。
- 実装時、本体側の値は同じ 3 要素を車両の描画位置と連結位置の計算に使う。#599 の説明では、連結位置（`coupling_index` 等）の計算にも使うのでサーバーとの同期が必要になった。
- #599 後の扱い: セーブデータにも値を記録するが、ロード時は原則ローカルの simuconf.tab の値を使う。ネットワークモードのときだけサーバーの値と同期する。

- 出典: [#59](https://github.com/teamhimeh/simutrans/pull/59)（2025-01-13 マージ）、[#599](https://github.com/teamhimeh/simutrans/pull/599)（2026-07-08 マージ）、リリース v44、v56
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（simuconf.tab のオフセットは「全車両一括」の概要のみ。反転用オフセットは記載なし）

### 左側通行・追い越しの基準オフセット（`driveleft_base_offset`、`overtaking_base_offset`）

この 2 つを `env_t` に移し、simuconf.tab で設定できる。値の形式は PR に書かれていない。

- 出典: [#307](https://github.com/teamhimeh/simutrans/pull/307)（2026-01-24 マージ）、リリース v50_4
- 関連する wiki: 記載なし

### 全車両の画像オフセット

各 waytype について、画像のオフセット量を simuconf.tab で設定できる。画像上の過走を防ぐ目的。キー名は原文に無い。

- 出典: [#325](https://github.com/teamhimeh/simutrans/pull/325)（2026-01-31 マージ）、リリース v51
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（概要のみ）

### 信号・道路標識の Front/Back を反転

信号・道路標識の画像の Front と Back を、高度な設定または simuconf.tab で入れ替えられる。信号が左側に描かれている pak128.japan などで、描画順が通常どおりになる。

- 全信号の Front/Back を入れ替えるので、右側通行用と左側通行用の信号の共存はできない。
- キー名は原文に無い。PR のレビューには `signal_reverse_front_back` という変数名が出る（設定名と同じかは未確認）。

- 出典: [#490](https://github.com/teamhimeh/simutrans/pull/490)（2026-05-10 マージ）、リリース v55_0_3
- 関連する wiki: 記載なし

## 経済・成長・環境

### 旅客発生度（passenger factor）の小数対応

旅客発生度に小数部を持てる。ゲームへの小数の保存と、simuconf.tab からの読み込みが確認されている。キー名は原文に無い。

- 出典: [#189](https://github.com/teamhimeh/simutrans/pull/189)（2025-11-22 マージ）、リリース v47
- 関連する wiki: 記載なし

### 電気の単価・積雪高度・維持費の倍率

| 項目 | キー名 | 設定場所 | 出典 |
|---|---|---|---|
| 電気の単価（送電線の電力単価、MW あたり） | キー名は原文に無い | 高度な設定・simuconf.tab | [#299](https://github.com/teamhimeh/simutrans/pull/299)（2026-01-31 マージ）、v51 |
| 冬季の積雪高度 | `winter_snowline` | 高度な設定 | [#300](https://github.com/teamhimeh/simutrans/pull/300)（2026-01-24 マージ）、v50_4 |
| 維持費の倍率 | キー名は原文に無い | 高度な設定 | [#724](https://github.com/teamhimeh/simutrans/pull/724)（2026-09-09 マージ）、v61_0_2 |

- 維持費の倍率は、1 か月の長さを変えたときなどに経営の難易度を調整する用途。
- 車両・編成の運行費は、加算・減額を高度な設定で行っている場合に、表示額も変わるようになった（[#746](https://github.com/teamhimeh/simutrans/pull/746)、2026-09-22 マージ、v62_0_3）。

- 関連する wiki: 記載なし

### 航送の運賃の設定

- 航送される編成の積載物の運賃の一部（比率）を、航送する側が受け取る。比率は高度な設定で決める。
- 航送中の「通行料」相当も高度な設定で設定できる。
- 航送の運送費比率（航送する側の編成の運行費に対する収入の比率）は新しい変数に変わった。
- v63_0_1 で、航送単価を waytype ごとに設定できるようになった（[#774](https://github.com/teamhimeh/simutrans/pull/774)）。
- いずれもキー名は原文に無い。

- 出典: [#740](https://github.com/teamhimeh/simutrans/pull/740)（2026-09-19 マージ）、リリース v62_0_3、v63_0_1
- 関連する wiki: [航送機能](https://github.com/teamhimeh/simutrans/wiki/%E8%88%AA%E9%80%81%E6%A9%9F%E8%83%BD)（この設定の記述は未確認）

### 送金欄とセント単位（`show_yen`）

会社間送金で、セント単位の入力欄が増えた。`env_t::show_yen` が有効なときは非表示で、入力額をそのまま処理する。`show_yen` は高度な設定と simuconf.tab から編集できる（作者はデバッグ用と書く）。

- 出典: [#709](https://github.com/teamhimeh/simutrans/pull/709)（2026-09-03 マージ）、リリース v60_1_1
- 関連する wiki: 記載なし

### `electricity_multiplier`（未マージ・現状は未使用）

高度な設定ウィンドウに `electricity_multiplier` が無く、ソース上はコメントアウトされていた。有効化して最大値を 10000 にする PR が出た。作者によると、この値は現時点で未使用で、使い方が決まってからマージする。

- 出典: [#763](https://github.com/teamhimeh/simutrans/pull/763)（未マージ、2026-11-14 時点で OPEN）
- 関連する wiki: 記載なし

## 走行・加速・飛行

### 飛行高度の切り替え（`allow_higher_flight`）

飛行機の飛行高度を、本家準拠の固定高度 3 と、KUTA 準拠の速度依存の高高度飛行で切り替える。レビューによると、`allow_higher_flight` が true のとき `landing_distance = altitude_level - 2`、false のとき `landing_distance = altitude_level`（= 3）。セーブデータは OTRP バージョン 51 以上で保存される。

- 出典: [#319](https://github.com/teamhimeh/simutrans/pull/319)（2026-01-31 マージ）、リリース v51
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（切り替えができる、とだけ。設定名と着陸距離は記載なし）

### 過積載時の応荷重制御（`overloaded_acceleration`）

高度な設定に追加された。simuconf.tab に `overloaded_acceleration=1` でも指定できる。セーブデータに保持され、既定は OFF。

| 値 | 応荷重制御の重量 |
|---|---|
| OFF（既定） | 従来どおり、100% 満載相当 |
| ON | スケジュールの最大乗車率（例: 200%）を反映する。発車加速は OFF より低くなる |

- スケジュールの「応荷重制御」が無効なら、この設定は加速に影響しない。

- 出典: [#593](https://github.com/teamhimeh/simutrans/pull/593)（2026-07-11 マージ）、リリース v57_0_1
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（応荷重制御の概要のみ。過積載との組み合わせは記載なし）

### 1 タイル当たりの距離と走行距離の記録

編成と路線の走行距離を、1 タイル当たりの距離の設定で記録し、グラフに表示する。斜めタイルでの加算は、1 タイル分から `pak_diagonal_multiplier` 分に修正された。古いセーブデータで記録された走行データは補正されない。1 タイル当たりの距離のキー名は原文に無い（simuconf.tab 等で定義するとある）。

- 出典: [#699](https://github.com/teamhimeh/simutrans/pull/699)（2026-08-20 マージ）、リリース v60_0_1
- 関連する wiki: [編成反転機能](https://github.com/teamhimeh/simutrans/wiki/%E7%B7%A8%E6%88%90%E5%8F%8D%E8%BB%A2%E6%A9%9F%E8%83%BD-%E9%80%A3%E7%B5%90%E8%A6%AA%E5%AD%90%E9%96%A2%E4%BF%82%E5%8F%8D%E8%BB%A2%E6%A9%9F%E8%83%BD-reverse-convoy---reverse-convoy-coupling)（`diagonal_multiplier=724` の記載のみ）

### `speed_magnification`・`acceleration_magnification` の溢れ

この 2 つは `uint8` で、256 以上の値を指定すると溢れていた。修正済み。修正後の上限は原文に無い。

- 出典: [#237](https://github.com/teamhimeh/simutrans/pull/237)（2025-12-28 マージ）、リリース v49
- 関連する wiki: 記載なし

## 駅・経路・積載

### 駅の有効範囲（`station_coverage`）

- v41_1: 高度な設定の `station_coverage` の上限を 127 にした。
- v63_0_1: 駅の有効範囲を waytype ごとに設定できる（[#791](https://github.com/teamhimeh/simutrans/pull/791)）。
- v63_1_2: 設定値を全 waytype 分デフォルト値に戻すボタンを追加（[#800](https://github.com/teamhimeh/simutrans/pull/800)、2026-11-04 マージ）。

- 関連する wiki: 記載なし

### `first_come_first_serve` の意味

OFF でも、所要時間法を使う貨物カテゴリは FIFO で積載する。ON なら全カテゴリが FIFO。OFF のときルートコスト法のカテゴリは近い停留所順。

**wiki との違い:** OTRP-Home は「既定は無効、先に来た乗客から乗る」とだけ書く。v55_10 以降は OFF でも所要時間法のカテゴリは FIFO になる。

- 出典: [#621](https://github.com/teamhimeh/simutrans/pull/621)（2026-06-29 マージ）、リリース v55_10
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（記述が古い）

### 所要時間法の待機時間の設定（`base_waiting_ticks_for_*_convoi`）

所要時間ベース経路探索で、乗り換えに逆インセンティブを付ける設定。1 乗車ごとにこの値が所要時間に加算される。

- キー: `base_waiting_ticks_for_rail_convoi`、`base_waiting_ticks_for_road_convoi`、`base_waiting_ticks_for_ship_convoi`、`base_waiting_ticks_for_air_convoi`。
- 後のリリースで、スケジュールごとの追加の待機時間（OTRP 時間単位）が足され、この値に加算される。

- 出典: リリース v38 と、その後のリリース（スケジュール単位の追加待機時間。版は原文の見出しで未特定）
- 関連する wiki: [所要時間ベース旅客経路探索について](https://github.com/teamhimeh/simutrans/wiki/%E6%89%80%E8%A6%81%E6%99%82%E9%96%93%E3%83%99%E3%83%BC%E3%82%B9%E6%97%85%E5%AE%A2%E7%B5%8C%E8%B7%AF%E6%8E%A2%E7%B4%A2%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6)（未確認）

### 徒歩連絡の設定（`transit_by_foot` ほか）

高度な設定で、徒歩連絡の ON/OFF と、徒歩連絡のルートコスト・所要時間を編集できる。PR のレビューに出る変数は `transit_by_foot`、`foot_path_weight`、`foot_path_time_ticks`。距離は最も近いタイル間で測り、1 タイル当たりの加算値を足して乗り換えの時間・コストにする。対象は旅客のみ。

- 出典: [#547](https://github.com/teamhimeh/simutrans/pull/547)（2026-07-17 マージ）、リリース v58_0_2
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（概要あり）

### 経路探索の最大ホップ数（`max_hops`）とルートキャッシュ

- `max_hops` は `0x7fffffff` まで設定できる（[#598](https://github.com/teamhimeh/simutrans/pull/598)、2026-06-27 マージ、v55_9）。再探索側の型が 16 ビットのままだと上限が食い違う、というレビュー指摘があるが、対応は PR 内で確認できない。
- ルートキャッシュは設定で ON/OFF できる（v54_0_1、#457）。レビューコメントでは既定は OFF とされる（[#587](https://github.com/teamhimeh/simutrans/pull/587)）。設定項目名は原文に無い。

- 関連する wiki: 記載なし（`max_hops` 自体が wiki に無い）

## 産業・会社・ネットワーク

### `crossconnect_factories` が ON のときは産業チェーンを切断できない

ON のときはゲームをリロードすると全産業がつながるので、産業網の切断（解除）を禁止した。

- 出典: [#536](https://github.com/teamhimeh/simutrans/pull/536)（2026-05-25 マージ）、リリース v55_3
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（産業網接続ツールの記述のみ。設定名は記載なし）

### 公共事業によるパスワード解除（`allow_unlock_by_public`）

高度な設定で有効にすると、公共事業が全会社のパスワードを強制的に解除できる。simuconf.tab に `allow_unlock_by_public=0` と書くと無効で開始できる。v56 より前のセーブは互換のため「有効」として扱う。無効のとき、公共事業からのパスワード削除はできない。

- 開錠後にパスワードを削除する「Clear Password」ボタンが追加された。
- 公共事業が開錠済みでも、パスワード付きの他会社を操作するときは認証を求める。サーバー管理者が他社を操作するときは、原則 `nettool` でパスワードを解除する。

- 出典: [#615](https://github.com/teamhimeh/simutrans/pull/615)（2026-07-11 マージ）、[#605](https://github.com/teamhimeh/simutrans/pull/605)（2026-07-08 マージ）、リリース v57_0_1
- 関連する wiki: 記載なし

### 他社駅の上に高架線を引く（`allow_elevated_way_over_others_halt`）

他社の駅の上に高架線を引けるモードで、高度な設定から切り替える。セーブデータに保存される。PR のレビューでは simuconf.tab からも設定できるようにする要望が出ているが、最終的に入ったかは原文で確認できない。

- 出典: [#606](https://github.com/teamhimeh/simutrans/pull/606)（2026-07-11 マージ）、リリース v57_0_1
- 関連する wiki: 記載なし

### `servers.tab`（サーバー一覧）

pakset の `config` フォルダに `servers.tab` を置くと、その pakset からアクセスするサーバーを記録できる。書式は `display_name = address[:port]`。`#` で始まる行はコメント。

```
# Lines starting with # are comments
# Format: display_name = address[:port]
My Japan Server = myserver.example.com:13353
Local Test     = 192.168.1.1
```

- 接続画面のアドレス入力欄の内容は、閉じるときに `servers.tab` の末尾の `# last_server = 接続先` に保存され、開くと復元される。保存済みの接続先やコメントは保持される。復元だけでは接続・問い合わせはしない。
- `-load net:` で接続したときに pakset のチェックを行い、異なる pakset でのアクセスを禁止できる。

- 出典: [#442](https://github.com/teamhimeh/simutrans/pull/442)（2026-04-11 マージ）、[#758](https://github.com/teamhimeh/simutrans/pull/758)（2026-10-22 マージ）、[#755](https://github.com/teamhimeh/simutrans/pull/755)（2026-10-09 マージ）、リリース v54_0_1、v62_4_1
- 関連する wiki: 記載なし

## 表示・画面

### 「夜間は暗くする」を simuconf.tab に書く

「夜間は暗くする」フラグを simuconf.tab に記述できる。キー名は原文に無い。

- 出典: [#458](https://github.com/teamhimeh/simutrans/pull/458)（2026-04-11 マージ）、リリース v54_0_1
- 関連する wiki: 記載なし

### 高度な設定の `show_names`・`show_month` の最大値

高度な設定ウィンドウで、`show_names` の最大値が 3（本来は 31）、`show_month` の最大値が 7（本来は 8）になっていて、これより大きい値を使っていると、ウィンドウを開いただけで値が下がる不具合があった。修正済み。

- `show_names=3` は駅名表示に貨物量を重ねたもの、`show_month=8` は KUTA 版の日本式（季節あり）の時間表記からデフォルト表記を除いたもの（PR の説明）。

- 出典: [#664](https://github.com/teamhimeh/simutrans/pull/664)（2026-07-13 マージ）、リリース v58_0_2
- 関連する wiki: 記載なし

### `menuconf.tab` の `icon_height` と Keybindings タブ

- `icon_height` でツールバーのアイコン描画サイズを指定する。既定は 32、0 でアイコン非表示モード。64 を超えると正しく描画されない場合がある。アイコン数が表示範囲を超えるとスクロールバーが付く（[#700](https://github.com/teamhimeh/simutrans/pull/700)、2026-08-20 マージ、v60_0_1）。
- 表示設定に「Keybindings」タブが付き、キー割り当てをゲーム内で変えると、該当のキー欄だけが pakset の `config/menuconf.tab` に保存される。初めて開いた時点の menuconf.tab が同じフォルダの `menuconf.default.tab` に退避され、「初期設定に戻す」はこのファイルを使う（つまり初期値は pakset 出荷時ではなく初回表示時の値）。pakset の config フォルダへの書き込み権限が必要（[#766](https://github.com/teamhimeh/simutrans/pull/766)、2026-10-22 マージ、v62_4_1）。
- 保存表記は `]`、`^A`、`+A`、`F15`、`SPACE`、`COMMA` など。解除は空欄。

- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)、[ツール定義](https://github.com/teamhimeh/simutrans/wiki/%E3%83%84%E3%83%BC%E3%83%AB%E5%AE%9A%E7%BE%A9)（menuconf.tab で割り当てる前提の記述のみ）
