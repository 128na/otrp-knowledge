# Squirrel API と MCP サーバー

> この内容は、OTRP の PR とリリースノートの記述から拾ったものです（2026-11-14 時点）。ゲームの動作やソースコードでは確かめていません。仕様は [OTRP wiki](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home) が正です。

OTRP で追加された Squirrel API（スクリプトから使える関数・クラス）と、MCP サーバーのツールをまとめる。API の名前・引数は PR・リリースノートの記述のとおりで、wiki の OTRP-Home に載っている分（file クラス、gui の 4 関数、`get_connections` の基本形、`base_waiting_time`、`schedule_entry_x` の座標）は省く。

## MCP サーバー

### 内部の動き

MCP サーバーは `-mcp-port` で起動し、ポートの既定は 13354。プロトコルは JSON-RPC 2.0 over NDJSON。ゲームのメインスレッドの `karte_t::interactive()` から処理を呼ぶ。

- `run_squirrel` は、渡されたコードを `function __mcp_fn__()` に包み、`ai_base.nut` で作った新規 VM で実行する。呼び出しごとに VM を作って捨てるので、状態は残らない。
- ファイルは作らず、メモリ上でコンパイルする。
- 暴走対策として、実行できる命令数に上限（10000）があり、超えるとスクリプトは強制中断される。ゲームはフリーズしない。
- 最初の実装では、ツールは `run_squirrel` だけ。`get_time` のような個別のツールは作らず、Squirrel API をそのまま使わせる設計。
- 動作は、ローカルゲームの進行中・一時停止中、ネットワークゲームのサーバー側・クライアント側で、情報取得と建設コマンドが実行されることを確かめてある。

- 出典: [#466](https://github.com/teamhimeh/simutrans/pull/466)（2026-04-15 マージ）、リリース v54_0_1
- 関連する wiki: [MCP-Server](https://github.com/teamhimeh/simutrans/wiki/MCP-Server)（概要・起動方法・制限事項は記載あり。命令数の上限と通信形式は記載なし）

### capture_screen ツール

`tools/list` は `run_squirrel` と `capture_screen` の 2 つを返す。

| ツール | 引数 | 返すもの |
|---|---|---|
| `run_squirrel` | （wiki のとおり） | content 配列の `text` |
| `capture_screen` | なし（`{}`） | content 配列の `image`（mimeType `image/png`、データは base64）。現在のゲーム画面 |

`capture_screen` の PNG 書き出しは、通常のスクリーンショット保存（`simscrNN.png`）と処理を共通にしてある。

**wiki との違い:** wiki の MCP-Server は利用可能なツールを `run_squirrel` のみと書いている。`capture_screen` はリリース v55_9（2026-06-27）で追加された。

- 出典: [#622](https://github.com/teamhimeh/simutrans/pull/622)（2026-06-27 マージ）、リリース v55_9
- 関連する wiki: [MCP-Server](https://github.com/teamhimeh/simutrans/wiki/MCP-Server)（記述が古い）

### ツールの追加（v60_1_1）

リリース v60_1_1 で「mcp サーバーモードにおいて、使用可能なツールを増やしました」とある。PR の本文にも増えたツールの名前は書かれていないので、ここでは名前を示せない。

- 出典: [#711](https://github.com/teamhimeh/simutrans/pull/711)（2026-09-03 マージ）、リリース v60_1_1
- 関連する wiki: [MCP-Server](https://github.com/teamhimeh/simutrans/wiki/MCP-Server)（記載なし）

### MCP 経由のゲーム画面の確認

`-load <セーブ名> -mcp-port <ポート>` でテスト用のセーブを直接起動し、`run_squirrel` で操作して `capture_screen` で画面を確かめる手順が、リポジトリのスキル `simutrans-mcp-gui-debug` にまとめられている。JSON-RPC を直接書かずに呼べる Python のヘルパーが付属する。ウィンドウの部品ツリーを使う手順は #625 で追記された。

例として `gui.close_all_windows(); return gui.open_dialog_tool(2);` を実行すると地図ダイアログが開く（#624 の時点では `world.open_dialog_tool`。#625 で `gui` に移った）。

- 出典: [#624](https://github.com/teamhimeh/simutrans/pull/624)（2026-06-28 マージ）、[#625](https://github.com/teamhimeh/simutrans/pull/625)（2026-06-28 マージ）
- 関連する wiki: [MCP-Server](https://github.com/teamhimeh/simutrans/wiki/MCP-Server)（記載なし）

## 停留所・スケジュール・編成の API

### halt_x.get_connections() の追加項目

`halt_x.get_connections()` が返す接続情報に次が足された。

| 名前 | 内容 | 出典 |
|---|---|---|
| `raw_weight` | 経路探索の内部で使う、変換前の重み | #671 |
| `is_foot_path` | 徒歩連絡の接続か | #671 |

- `connection.weight` が意味を持つのは所要時間ベース経路探索のときだけ。ルートコスト法では `raw_weight` を使う（API のコメントに明記）。
- 生成されるドキュメント上の戻り値の型は `array<halt_x>` から `array<connection>` に直された。
- 一部の停留所で `line` に文字列 `"line"` が入る不具合があった。路線も編成も無効なときは `null` が入る形に直った（v55_3）。
- 戻り値が `{halt, weight, line}` のテーブルになったのは #310（v51）。破壊的変更なので、既存のスクリプトは `conn` を `conn.halt` に直す必要がある（PR のレビューでの指摘）。

**wiki との違い:** wiki の OTRP-Home は戻り値を `halt`・`weight`・`line` の 3 つとして書いている。`raw_weight`・`is_foot_path`・無効時の `null` は記載がない（#671 は 2026-07-20、#521 は 2026-05-20 のマージ）。

- 出典: [#671](https://github.com/teamhimeh/simutrans/pull/671)（2026-07-20 マージ）、[#521](https://github.com/teamhimeh/simutrans/pull/521)（2026-05-20 マージ）、[#310](https://github.com/teamhimeh/simutrans/pull/310)（2026-01-31 マージ）、リリース v51・v55_3・v58_0_2
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（Squirrel API の節。記述が古い）

### schedule_entry_x の追加項目

`schedule_entry_x` に次が足された。路線・編成のスケジュールを `append_entry` や `change_schedule` で設定し、`get_schedule` で読み戻せる。

| 名前 | 内容 | 出典 |
|---|---|---|
| 4 番目の引数 `flags`（既定 0） | `stop_flags` を設定する。テストで使われた値は `NO_LOAD`=4、`NO_UNLOAD`=8、`UNLOAD_ALL`=32、`TRANSFER_INTERVAL`=128 | #394 |
| `maximum_load` | 最大積載率（%） | #468 |
| `spacing` / `spacing_shift` / `delay_tolerance` | 間隔制御に関する値 | #468 |
| `length_coupling_done` | 連結完了判定の長さ | #468 |
| `max_speed` | その停留所での編成の最大速度の上書き（km/h） | #468 |
| `balance_speed` | その停留所でのバランス速度の上書き（km/h） | #468 |
| `journey_time` | 直近 5 回の所要時間（ticks）。前の停留所を出てからこの停留所に着くまで | #472 |
| `waiting_time` | 直近 5 回の貨物の平均待機時間（ticks）。停留所に着いてから積み込まれるまでの加重平均 | #472 |
| `convoy_stopping_time` | 直近 5 回の編成の停車時間（ticks）。到着から出発まで | #472 |

- `journey_time`・`waiting_time`・`convoy_stopping_time` は配列で、index 0 が最新。未記録は 0。
- これらの統計は**路線のスケジュール**に記録される。値を見るには `cnv.get_schedule()` ではなく `line.get_schedule()` を使う。

- 出典: [#394](https://github.com/teamhimeh/simutrans/pull/394)（2026-02-18 マージ）、[#468](https://github.com/teamhimeh/simutrans/pull/468)（2026-04-15 マージ）、[#472](https://github.com/teamhimeh/simutrans/pull/472)（2026-04-19 マージ）、リリース v54_0_1（#468・#471・#472）
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（schedule_entry_x は座標の修正のみ。記載なし）

### schedule_x の追加項目

`schedule_x` に次が足された。

| 名前 | 内容 |
|---|---|
| `flags` | スケジュール全体のフラグ。TEMPORARY=1、SAME_DEP_TIME=2 など |
| `max_speed` | スケジュール全体の最大速度の上書き（km/h）。0 は無制限 |
| `departure_slot_group_id` | 出発スロットグループのリーダーとなる路線 |
| `current` | 現在の停留所のインデックス |
| `next_line` | このスケジュールが終わったあと編成が移る路線。**読み取り専用** |

- `next_line` を設定するには `set_next_line(line)` を使う。`set_next_line_id()` は削除された。
- `set_next_line()` は、waytype の一致、エントリ数が 2 以上、停車できる停留所があること、をチェックする。
- `set_next_line()` がスケジュールの末尾に付けるダミーのエントリは、Squirrel 側の `entries` には含まれない。
- レビューでは、無効な路線を渡すと、それまでの `next_line` が消える副作用が指摘されている。

**wiki との違い:** wiki の OTRP-Home は schedule_x について `base_waiting_time` しか書いていない。上の項目は v54_0_1 で追加された。

- 出典: [#471](https://github.com/teamhimeh/simutrans/pull/471)（2026-04-18 マージ）、リリース v54_0_1
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（記述が古い）

### 編成の API と貨物パケット（good_x）

| 名前 | 内容 | 出典 |
|---|---|---|
| `convoy_x::change_schedule()` | 編成のスケジュールを設定する | #375 |
| `convoy_x::get_state()` | 編成の内部状態を返す。`NO_ROUTE` は `get_state() == 5` | #568 |
| `convoy_x::get_cargo()` | 積んでいる貨物を `[[good_x]]` で返す。外側が車両、内側が貨物パケット | #509 |
| `good_x` | `ware_t`（貨物パケット）を公開したクラス | #509 |
| `good_x::get_destination()` | 目的地の `halt_x`、または `null` | #509 |
| `good_x::get_transit_halts()` | 経由する停留所の配列（最終目的地を含む） | #509 |
| `good_x::get_destination_pos()` | 目的地の座標 | #509 |
| `good_x::get_desc()` | `good_desc_x` | #509 |
| `good_x::get_amount()` | 数量（`ware_t::menge`） | #515 |
| `good_x::is_passenger()` / `is_mail()` / `is_freight()` | 旅客か／郵便か／貨物（旅客・郵便以外）か | #515 |

- 出典: [#375](https://github.com/teamhimeh/simutrans/pull/375)（2026-02-13 マージ）、[#568](https://github.com/teamhimeh/simutrans/pull/568)（2026-06-06 マージ）、[#509](https://github.com/teamhimeh/simutrans/pull/509)（2026-05-16 マージ）、[#515](https://github.com/teamhimeh/simutrans/pull/515)（2026-05-16 マージ）、リリース v55_2_1（#509・#515）
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（記載なし）

## 信号・道路・建設の API

### 信号のオプション（OTRP 独自の設定）

信号のオプションを、スクリプトから設定・取得できる。

| 設定 | 取得 | オプション | 出典 |
|---|---|---|---|
| `command_x::set_advance_to_end` | `sign_x::is_advance_to_end` | 終点まで進む | #568 |
| `command_x::set_two_ways` | `sign_x::get_two_ways` | 逆方向からの進入を許可 | #568 |
| `command_x::set_length_based` | `sign_x::is_length_based` | 振分信号の「length based」 | #570 |

- `sign_x::get_state()` と、信号状態の定数 `state_red`・`state_green`・`state_yellow` もある（#375）。
- テストで確かめられた挙動:
  - `two_ways` が false（厳密な片道信号）のとき、逆方向の列車は経路が見つからず `NO_ROUTE` になる。
  - `advance_to_end` が true のとき、列車はホームの奥まで進んで停車する。false のときは最も手前のタイルで停車する。
  - `length_based` が ON のとき、自編成が入れる最も短いホームが自動で選ばれる。
- OTRP 独自の信号オプションとして、テストは次を対象にしている: `choose_signal`、`advance_to_end`、`two_ways`、`start_signal`、`length_based`、`skip_default_route`、`margin_length`。テストは `test_otrp_signal_options.nut` に集約された。

- 出典: [#568](https://github.com/teamhimeh/simutrans/pull/568)（2026-06-06 マージ）、[#570](https://github.com/teamhimeh/simutrans/pull/570)（2026-06-07 マージ）、[#375](https://github.com/teamhimeh/simutrans/pull/375)（2026-02-13 マージ）
- 関連する wiki: [信号システムについて](https://github.com/teamhimeh/simutrans/wiki/%E4%BF%A1%E5%8F%B7%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6)（スクリプトからの設定は記載なし）

### 道路建設のオプション（overtaking_mode・street_flag）

- `street_x` が `way_x` のサブクラスとして追加された。取得した `way_x` を `way instanceof street_x` で調べると、`street_x` の関数が使える。
- `street_x` に `get_overtaking_mode`・`get_street_flags` がある。列挙として `overtaking_modes`・`street_flags` が追加された。
- `command_x.build_road` の第 6 引数がテーブルになった。形式は次のとおり。

```js
{keep_city_roads = false, overtaking_mode = 1, street_flag = 0, height_offset = 0, vehicle_offset = 0}
```

- 出典: [#488](https://github.com/teamhimeh/simutrans/pull/488)（2026-05-04 マージ）、リリース v55_0_3（道路の `overtaking_mode`・`street_flag` の編集）
- 関連する wiki: [ツール定義](https://github.com/teamhimeh/simutrans/wiki/%E3%83%84%E3%83%BC%E3%83%AB%E5%AE%9A%E7%BE%A9)・[wayによる車両オフセット機能-vehicle-offset](https://github.com/teamhimeh/simutrans/wiki/way%E3%81%AB%E3%82%88%E3%82%8B%E8%BB%8A%E4%B8%A1%E3%82%AA%E3%83%95%E3%82%BB%E3%83%83%E3%83%88%E6%A9%9F%E8%83%BD-vehicle-offset)（スクリプトからの指定は記載なし）

### そのほかの追加（建設・世界・デバッグ）

| 名前 | 内容 | 出典 |
|---|---|---|
| `world::get_label_list` | ラベルの一覧。既存の `attraction_list` と同じイテレータ形式 | #368 |
| `tool_build_groundobj`（定数） | 地面オブジェクトを置くツール | #374 |
| `bridge_x::get_desc()` / `tunnel_x::get_desc()` | 橋・トンネルの記述子を取得する | #390 |
| `world.generate_goods()` | 旅客・郵便・貨物をスクリプトから生成する。シナリオ専用 | #390 |
| `debug.set_game_speed(speed)` | ゲーム速度を整数倍率で設定する（1 が通常、5 が 5 倍）。内部で `time_multiplier = speed * 16` として `change_time_multiplier()` を呼ぶ | #380 |
| `world.create_player(player_nr, player_type)` | 会社を作る。シナリオ API | #618 |

- `tool_build_groundobj` は、`default_param` を実行前に検証する（`"Cxxname"` 形式、4 文字以上、先頭は `'0'` か `'1'`）。短い不正なパラメータでクラッシュしていたのを直した。
- デポ建設のエラーメッセージが具体的になった（upstream と同じ）: `"Ship depots must be built on water!"`、`"Depots must be built on flat dead-end way tiles!"`、`"Tile not empty."`、`"Depots cannot be built on runways!"`。
- `world.generate_goods()` は、出発座標を経路探索に渡すようになった（#671）。それ以前は、Squirrel 経由では `walk_cost_to_halt` が経路選択に反映されなかった。
- `world.create_player` の `player_nr` は未使用の 2〜14、`player_type` は 1〜4（1 人間、2 貨物 AI、3 旅客 AI、4 スクリプト AI）。使用済み・範囲外の番号や不正な型は `false`。ネットワークゲームでは、作成の反映が遅れる。

- 出典: [#368](https://github.com/teamhimeh/simutrans/pull/368)（2026-02-11 マージ）、[#374](https://github.com/teamhimeh/simutrans/pull/374)（2026-02-13 マージ）、[#390](https://github.com/teamhimeh/simutrans/pull/390)（2026-02-16 マージ）、[#380](https://github.com/teamhimeh/simutrans/pull/380)（2026-02-14 マージ）、[#618](https://github.com/teamhimeh/simutrans/pull/618)（2026-06-24 マージ）、リリース v52（自動テストの追加として #368・#374・#375・#380・#390・#394 が載る）、v55_9（#618）
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（いずれも記載なし）

## settings クラスの追加

ゲームの設定をスクリプトから読み書きする関数が、テストのために追加された。

| 名前 | 対応する設定 | 出典 |
|---|---|---|
| `settings.get_advance_to_end()` / `settings.set_advance_to_end(bool)` | `advance_to_end` | #437 |
| `settings.get_first_come_first_serve()` / `settings.set_first_come_first_serve(bool)` | `first_come_first_serve` | #621 |
| `settings.get_time_based_routing_enabled(good_desc_x)` / `settings.set_time_based_routing_enabled(good_desc_x, bool)` | 貨物カテゴリごとの所要時間ベース経路探索 | #621 |
| `settings.get_allow_elevated_way_over_others_halt()` / `settings.set_allow_elevated_way_over_others_halt(bool)` | `allow_elevated_way_over_others_halt`（他社駅の上に高架線を敷設できるか） | #606 |
| `transit_by_foot`、`foot_path_weight`、`foot_path_time_ticks`、`walk_cost_to_halt` の getter / setter | 徒歩連絡の設定 | #671 |

- #671 の getter / setter は、PR の本文に 4 項目の名前だけが書かれている。関数名の綴りは本文からは分からない。
- 設定の意味は、settings のページ側を見ること。

- 出典: [#437](https://github.com/teamhimeh/simutrans/pull/437)（2026-03-22 マージ）、[#621](https://github.com/teamhimeh/simutrans/pull/621)（2026-06-29 マージ）、[#606](https://github.com/teamhimeh/simutrans/pull/606)（2026-07-11 マージ）、[#671](https://github.com/teamhimeh/simutrans/pull/671)（2026-07-20 マージ）、リリース v55_10（#621）、v57_0_1（#606）、v58_0_2（#671）
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（記載なし）

## gui クラスの追加（画面の操作と取得）

MCP の `run_squirrel` は AI 側の VM で動くので、これらは scenario 専用ではなく通常の API として登録されている。

| 名前 | 内容 | 出典 |
|---|---|---|
| `gui.open_dialog_tool(tool_nr)` | `simmenu.h` の `DIALOG_*` の番号でダイアログを開く（例: 2 で地図）。不正な番号やダイアログを作れないときは `false` | #624・#625 |
| `gui.get_windows()` | 開いているウィンドウの一覧を取得する | #625 |
| `gui.get_window_components(window_id)` | ウィンドウの中の部品ツリーを取得する。各部品は role・text・children と、`scroll_x`・`scroll_y` など部品ごとの値を持つ | #625 |
| `gui.click(x, y, shift = false, ctrl = false)` | GUI にマウスクリックを入れる | #626 |
| `gui.drag(from_x, from_y, to_x, to_y, shift = false, ctrl = false)` | GUI にドラッグを入れる | #626 |

- `world.open_dialog_tool` は #624 で入り、#625 で `gui.open_dialog_tool` に移って `world` 側は削除された。
- 使用例: `gui.open_dialog_tool(6)` で開いたウィンドウで `gui.click(368, 200)` を実行すると、「プレイヤー会社」ボタンが押され「財務」ウィンドウが出た（#626 の確認）。
- リリース v55_10 の記述は「ダイアログツールを開く機能」「スクリーンショットを取得する機能」「マウス入力機能」（#624・#625・#626）。#625 の PR の内容はウィンドウと部品ツリーの取得で、画像の取得ではない。

**wiki との違い:** wiki の OTRP-Home の gui クラスの節は `jump`・`close_all_windows`・`take_screenshot`・`set_zoom` までで、上の 5 つは記載がない（すべて 2026-06-28 マージ、リリース v55_10）。

- 出典: [#624](https://github.com/teamhimeh/simutrans/pull/624)・[#625](https://github.com/teamhimeh/simutrans/pull/625)・[#626](https://github.com/teamhimeh/simutrans/pull/626)（いずれも 2026-06-28 マージ）、リリース v55_10
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（記述が古い）

## 地図全域の画像保存

地図ウィンドウの全域画像を保存する機能は、リリース v62_2 で、ツール（`simple_tool[53]`）に加えて MCP サーバーとスクリプトからも動くようになった。PR の本文は「squirrel、mcp に対応」「シナリオから呼べるように対応」と書くだけで、関数名やツール名は書かれていないので、ここでは示せない。

- 出典: [#753](https://github.com/teamhimeh/simutrans/pull/753)（2026-10-12 マージ）、リリース v62_2
- 関連する wiki: [ツール定義](https://github.com/teamhimeh/simutrans/wiki/%E3%83%84%E3%83%BC%E3%83%AB%E5%AE%9A%E7%BE%A9)（ツールの設定は記載あり。スクリプト・MCP からの呼び出しは記載なし）

## API リファレンス

### 公開先と更新のしかた

OTRP の Squirrel API リファレンスは、Doxygen で生成して GitHub Pages に公開されている。URL は `https://teamhimeh.github.io/simutrans/otrp-squirrel-api/`（wiki のサイドバーにリンクがある）。

- `.github/workflows/otrp-sqapi-docs.yml` が、`v*` タグの push か、`workflow_dispatch`（バージョン文字列を指定できる）で動く。
- 必要なリポジトリ設定は、Settings → Pages → Source を「GitHub Actions」にすること。
- `Doxyfile_SQAPI` はバージョンを環境変数 `OTRP_VERSION` から取る。OTRP で追加した `api_good.cc`・`api_obj_desc_base.cc` が入力に入っている。
- 継承図・コラボレーション図を出すには graphviz が要る（CI の `apt-get install` に追加済み）。

- 出典: [#513](https://github.com/teamhimeh/simutrans/pull/513)（2026-05-16 マージ）、[#514](https://github.com/teamhimeh/simutrans/pull/514)（2026-05-16 マージ）
- 関連する wiki: _Sidebar（リンクのみ）

### 新しい API を足すときの型情報

新しい API の型は `squirrel_types_scenario.awk`（AI 側は `squirrel_types_ai.awk`）に登録する。登録がないと、ドキュメント上の戻り値が `void`、引数なしと表示される。#516 では、登録漏れの `good_x` の 8 メソッドなどが直された。#671 のレビューでも、追加した 8 個の accessor の型定義の追加が求められている。

- 出典: [#516](https://github.com/teamhimeh/simutrans/pull/516)（2026-05-16 マージ）、[#437](https://github.com/teamhimeh/simutrans/pull/437)（2026-03-22 マージ）、[#671](https://github.com/teamhimeh/simutrans/pull/671)（2026-07-20 マージ）
- 関連する wiki: 記載なし
