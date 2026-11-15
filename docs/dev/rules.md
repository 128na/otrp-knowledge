# 開発の決まり

> この内容は、OTRP の PR とリリースノートの記述から拾ったものです（2026-11-14 時点）。ゲームの動作やソースコードでは確かめていません。仕様は [OTRP wiki](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home) が正です。

OTRP 本体（C++）に PR を出す人向けに、PR のレビューで繰り返し指摘された決まり、セーブデータ形式の変え方、ネットワークゲームで同期を崩さないための決まり、feature flag、自動テスト、CI・ビルド・配布の知見をまとめる。PR のレビューには AI による自動レビューも含まれるため、出どころが自動レビューのものはそう明記する（プロジェクトの正式な規約として文書化されたものではない）。

## PR の出し方・レビューの運用

### PR の大きさと混ぜてよい変更

- 追加行数の目安は wiki の Feature Flag のページ（テストを除き 250 行）にある。実例として、変更行数が多い PR が「機能ごとに分割して出してほしい」とクローズされている（#636、2026-07-02 時点でクローズ）。
- 「一行ずつ丁寧に確認しないといけない種類の変更」は、混ぜずに 1 項目ずつ別 PR にするよう求められた。出した側は PR を取り下げて分けた（#60、クローズ）。
- IDE の自動整形による、趣旨と無関係な差分は混ぜない（#245）。ブランチを切り忘れて別の変更が混入した場合は、rebase して force-push し、履歴を整える（#372）。
- 動いていない機能のコード（#52 の `reverse_base_offsets` 関連）は、別 PR に分けるよう求められた。無関係な `.gitignore` の変更も同様（#53 のレビュー）。
- 出典: [#52](https://github.com/teamhimeh/simutrans/pull/52)（2024-10-19 マージ）、[#53](https://github.com/teamhimeh/simutrans/pull/53)（2025-01-04 マージ）、[#60](https://github.com/teamhimeh/simutrans/pull/60)、[#245](https://github.com/teamhimeh/simutrans/pull/245)（2026-01-04 マージ）、[#372](https://github.com/teamhimeh/simutrans/pull/372)（2026-02-18 マージ）、[#636](https://github.com/teamhimeh/simutrans/pull/636)
- 関連する wiki: [開発者向け:-Feature-Flagの利用について](https://github.com/teamhimeh/simutrans/wiki/%E9%96%8B%E7%99%BA%E8%80%85%E5%90%91%E3%81%91:-Feature-Flag%E3%81%AE%E5%88%A9%E7%94%A8%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6)（250 行の目安のみ）

### PR 本文に書くこと

- マージしてよい版（または必要な版）を書く。セーブデータの形式に関わる変更は、OTRP のバージョンが上がるまでマージできないため。例: 「v51 でマージ」（#266）、「セーブデータの保護のため v51 以降」（#268）、「v63 以降」（#741、#768）。
- 互換性を明記する例がある（#186: 「セーブデータ互換性: major version up 不要（既存変数の空きビットを使うため）」「NS 互換性: 下位バージョンと互換性なし」。#207: 「セーブデータ互換性: 影響なし」「ネットワーク同期互換性: 影響なし」）。
- 出典: [#266](https://github.com/teamhimeh/simutrans/pull/266)（2026-01-31 マージ）、[#268](https://github.com/teamhimeh/simutrans/pull/268)（2026-01-31 マージ）、[#741](https://github.com/teamhimeh/simutrans/pull/741)（2026-11-01 マージ）、[#768](https://github.com/teamhimeh/simutrans/pull/768)（2026-11-01 マージ）、[#186](https://github.com/teamhimeh/simutrans/pull/186)（2025-10-21 マージ）、[#207](https://github.com/teamhimeh/simutrans/pull/207)（2025-11-29 マージ）
- 関連する wiki: 記載なし

### 日本語訳（`ja.OTRP.tab`）の扱い

- `ja.OTRP.tab` は機能 PR で競合しやすいので、機能のマージ後に別 PR でまとめて更新するよう求められた例がある（#274 → #280）。一方、機能 PR に定義を足すよう求められた例もある（#245）。どちらにするかはレビューで決まる。
- 末尾の改行は消さない。空行を作らない（#506）。UI の文字列に camelCase を使わない（#174）。日本語と英語の意味を合わせる（#174）。既存の `ja.tab` に訳があるか確認する（#278）。
- 翻訳が多い PR では、`#地形データ出力` のようにセクションを分け、セクション見出しをハイフンで強調し、`#------その他の翻訳------` の前に置くよう求められた（#790）。`simutrans/text/ja.tab` は OTRP の対応範囲外で、`ja.OTRP.tab` に統一する（#790）。
- `documentation/OTRP_information_en.md` と `documentation/OTRP_v13_information.md` は保守していない。説明は wiki に書く（#174）。
- 出典: [#245](https://github.com/teamhimeh/simutrans/pull/245)、[#274](https://github.com/teamhimeh/simutrans/pull/274)（2026-01-11 マージ）、[#280](https://github.com/teamhimeh/simutrans/pull/280)（2026-01-12 マージ）、[#278](https://github.com/teamhimeh/simutrans/pull/278)（2026-01-12 マージ）、[#506](https://github.com/teamhimeh/simutrans/pull/506)（2026-05-20 マージ）、[#174](https://github.com/teamhimeh/simutrans/pull/174)（2025-11-22 マージ）、[#790](https://github.com/teamhimeh/simutrans/pull/790)（2026-11-04 マージ）
- 関連する wiki: 記載なし

### 手動テストのチェックリストと自動レビュー

- PR ごとに、コードの変更から AI が作った「手動テストケース」のチェックリストがコメントとして付く。リリース v55_6_1 で「プルリクエストごとに手動テストチェックリストを自動作成」と告知され、元の PR（#556）はそのためのスキルを追加した。
- 手順を実施した作者は、確認した項目にチェックを付けるよう求められる。チェックボックスは書き込み権限のある人しか操作できず、権限の無い作者は付けられなかった（#637）。
- Windows の IME まわりの PR は、Microsoft Japanese IME を使う Windows GDI 版での確認が前提だった（#585）。
- コードの自動レビュー（Claude、Gemini、Codex、Antigravity と署名されたもの）が、メンテナのアカウントからコメントとして投稿される。指摘が外れることもあり、取捨される。例: 独自コンテナ `vector_tpl` に戻すよう求めた自動レビューに対し、メンテナは「どっちでもいいです」と返した（#506）。
- 出典: [#556](https://github.com/teamhimeh/simutrans/pull/556)（2026-06-02 マージ）、[#585](https://github.com/teamhimeh/simutrans/pull/585)（2026-06-11 マージ）、[#637](https://github.com/teamhimeh/simutrans/pull/637)（2026-07-08 マージ）、[#506](https://github.com/teamhimeh/simutrans/pull/506)、リリース v55_6_1
- 関連する wiki: 記載なし

## セーブデータ形式の変え方

### OTRP バージョンの上げ方

- `simversion.h` の OTRP バージョンは、PR では上げない。リリース直前にメンテナが上げる。動作確認のために手元で上げるのは可（#52、2024-10 のレビュー）。
- 本文で「この変更を有効にするには major version を 50 に上げる必要がある」と書いて、版の引き上げを求めた例がある（#249）。2026-11-13 に出された未マージの PR（#810）も、way ごとに 1 バイト足すため `OTRP_VERSION_MAJOR` を 63 から 64 に上げる、と本文に書き、「版の引き上げを自分で行いたければ知らせてほしい」と添えている。
- セーブデータ構造を変えると `OTRP_VERSION_MAJOR` を上げる必要がある、という認識は PR の作者側にもある。これを避けるために、セーブしない値を `finish_rd()` で復元して済ませた例がある（#680、2026-08-03 マージ）。
- 古いバージョンで読むと壊れる変更は、バージョンを上げた次のリリースに入れる（#230 は v49、#149・#174 は v47 以降、#741・#768 は v63 以降）。
- 機能の追加・変更は、次のリリースで minor version を上げるよう求められた例がある（#150）。PR によって「minor version」「major version」と呼び方が揺れており、どの桁を上げるかは本文では確定できない。
- 出典: [#52](https://github.com/teamhimeh/simutrans/pull/52)、[#249](https://github.com/teamhimeh/simutrans/pull/249)（2026-01-03 マージ）、[#810](https://github.com/teamhimeh/simutrans/pull/810)（未マージ、2026-11-13 時点で OPEN）、[#680](https://github.com/teamhimeh/simutrans/pull/680)、[#230](https://github.com/teamhimeh/simutrans/pull/230)（2025-12-26 マージ）、[#150](https://github.com/teamhimeh/simutrans/pull/150)（2025-09-07 マージ）、[#174](https://github.com/teamhimeh/simutrans/pull/174)
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home) の「セーブデータの互換性」は一般論のみ（バージョンの運用は記載なし）

### `rdwr` の書き方

- 読み書きの分岐は `file->get_OTRP_version()` の比較（`<N`、`>=N`）で書く。ファイルのバージョン以外の条件を入れない。
  - 実例: ネットワークモードで保存したデータが通常モードで読めなかった。`time_multiplier` と `fix_game_speed` の読み書きが、セーブファイルの属性ではなく実行時の `env_t::networkmode` に依存して、5 バイトずれたため（#378、2026-02-14 マージ）。マージされた最終コードは本文から確認できなかった。
- 例: 振分信号の `choose_sign_flag`（uint8）は OTRP バージョン 46 以上で保存し、22 以上 46 未満は `guide_signal`（bool）を読んで `advance_to_end` を true にする（#168、2025-09-14 マージ）。
- 追加したデータは、`save` 側にも `load` 側にも同じバージョンの条件を付ける（#508 の自動レビュー）。バージョンの判定は、`file` が使える所では `file->get_OTRP_version() < N` のパターンに合わせる（#461 の自動レビュー）。
- 旧バージョンの形式で保存できる機能（v54 までさかのぼれる、#535。バージョンの選択は `loadsave_frame_t` のコンボボックスにする案がレビューで出た）を使うときの注意。
  - 今後の機能追加で `get_OTRP_version()==0` と `>0` の分岐をなるべく作らない。マージしたバージョンによってセーブデータの長さが変わりうるため（#535）。
  - `file->is_saving()` の処理が無いと、旧バージョンで保存したときにセーブデータが壊れる（#636 のレビュー）。
  - 保存の処理はゲーム状態を読み取り専用にする。旧形式で保存しただけで駅の権限などが変わってはならない（#540 の自動レビュー）。
- `rdwr` を書き忘れていたため、v49 までは旧バージョンのロードと同じ処理、v50 以上はセーブデータに書く、と分けた修正がある（#243、`convoi_t::need_electric`、2026-01-02 マージ）。
- `gui_frame_t` を継承する GUI クラスの `rdwr` はネットワークモードでの GUI 復元にだけ使われる。バージョン互換の処理は要らない（#53）。
- `most_parent_convoi` は、pak が欠けているときのバグを考えて `rdwr` しない（#229、2025-12-20 マージ）。
- pak に依存するデータ（貨物など）は、番号ではなく名前で保存する。貨物を追加・削除すると番号がずれるため（#634、2026-07-08 マージ）。
- `finish_rd()` に `OTRP_version` の引数がある。オブジェクトのフラグ上書きなどをバージョン差分に応じて行うため（#731、2026-09-10 マージ）。
- 出典: [#378](https://github.com/teamhimeh/simutrans/pull/378)、[#168](https://github.com/teamhimeh/simutrans/pull/168)、[#508](https://github.com/teamhimeh/simutrans/pull/508)（2026-07-08 マージ）、[#461](https://github.com/teamhimeh/simutrans/pull/461)（2026-04-18 マージ）、[#535](https://github.com/teamhimeh/simutrans/pull/535)（2026-05-28 マージ）、[#636](https://github.com/teamhimeh/simutrans/pull/636)、[#540](https://github.com/teamhimeh/simutrans/pull/540)（2026-07-11 マージ）、[#243](https://github.com/teamhimeh/simutrans/pull/243)、[#53](https://github.com/teamhimeh/simutrans/pull/53)、[#229](https://github.com/teamhimeh/simutrans/pull/229)、[#634](https://github.com/teamhimeh/simutrans/pull/634)、[#731](https://github.com/teamhimeh/simutrans/pull/731)
- 関連する wiki: 記載なし

### 設定項目（`settings_t`）を足すとき

- 新しい設定や配列は `settings_t::settings_t()`（コンストラクタ）で初期化する。以前の `env_t` の static 配列はゼロ初期化されていたが、`settings_t` に移すと不定値になりうる。`simuconf.tab` から設定できるようにするなら `parse_simuconf()` にも足す（#599、#606 の自動レビュー）。
- 保存するバージョンは PR で明示する（#606 では「57 に変更してください」と指示された）。
- 出典: [#606](https://github.com/teamhimeh/simutrans/pull/606)（2026-07-11 マージ）、[#599](https://github.com/teamhimeh/simutrans/pull/599)（2026-07-08 マージ）
- 関連する wiki: 記載なし

## ネットワークゲームで同期を崩さないための決まり

### ツールの情報は `default_param` で渡す

- `static` 変数に頼るツールは、スクリプトやネットワークゲームで使えない。ツールの対象（都市の座標など）は `default_param` で渡し、`init` で受け取る。不正な値なら `init` が false を返して拒否する（#53 のレビュー）。
- `is_work_network_safe()` を true にしただけでは、サーバーでは動いてもクライアントの操作で切断・非同期になった。最終的に `default_param` だけで対象を扱う形に直して動いた（#53）。
- `env_t` に置けるのは、セーブデータに依存しない永続値だけ。マップごとに違う値を置くと、別のマップで復元されて誤動作する（#53）。
- `tool_build_way_t` は `rdwr_custom_data` をやめ、`default_param` に `"way_name,overtaking_mode,street_flag,height_offset,vehicle_offset"`（例 `"asphalt_road,1,0,0,0"`）の形で渡す形に変わった。ネットワークパケットの形式が変わるため、異なる版の間では接続できない（#486）。
- 状態を変える処理は `init` ではなく `do_work` で行う。`init` で上書きしていた `default_electric` が、サーバーとクライアントで異なる架線を引く原因になった（#258）。
- GUI 専用のツール（ダイアログを開くだけのもの）は `is_init_network_safe()` を true にする。これを override しないと、クライアントのショートカットから呼んだツールが `NWC_TOOL` としてサーバーに送られ、サーバー側でもウィンドウが開いた（#583）。必要なら `init()` で `can_use_gui()` も確認する。
- ドラッグ中に Ctrl を切り替えるツールは、ドラッグ開始時の状態でモードを固定する。固定しないと、ネットワークモードで矩形の処理がサーバーに送られずクライアントだけで実行され、同期がずれる（#662 の自動レビュー）。
- 出典: [#53](https://github.com/teamhimeh/simutrans/pull/53)、[#486](https://github.com/teamhimeh/simutrans/pull/486)（2026-05-04 マージ）、[#258](https://github.com/teamhimeh/simutrans/pull/258)（2026-01-08 マージ）、[#583](https://github.com/teamhimeh/simutrans/pull/583)（2026-06-14 マージ）、[#662](https://github.com/teamhimeh/simutrans/pull/662)（2026-07-15 マージ）
- 関連する wiki: 記載なし

### 乱数・同期処理・ログ

- 乱数は `simrandom.h` の `simrand` を使う。ネットワークゲームのサーバーとクライアントで同じ値になる。クライアントだけが計算する乱数には `sim_async_rand()` を使う。`simrand` を使うとサーバーとの同期が崩れる（#181）。
- `sync_step` ではルート計算をしてはいけない（#179 の作業項目）。`find_most_parent_convoi` は全編成を探索するので、`sync_step` から呼ばれる処理では避ける（#108 のレビュー）。
- ネットワークまわりのログレベル: コマンドの受信は `message`、サーバーとの時刻差のログは `debug`、チェックリストの一致は `message`、チェックリスト不一致による切断は `error`（`sync_step` の情報をメッセージに足した、#401）。
- 出典: [#181](https://github.com/teamhimeh/simutrans/pull/181)（2025-12-13 マージ）、[#179](https://github.com/teamhimeh/simutrans/pull/179)（2025-10-21 マージ）、[#108](https://github.com/teamhimeh/simutrans/pull/108)（2025-07-21 マージ）、[#401](https://github.com/teamhimeh/simutrans/pull/401)（2026-02-22 マージ）
- 関連する wiki: 記載なし

## コードの決まり（レビューで繰り返し指摘されたもの）

### 書き方

- enum の値は全て大文字（#52）。「編成」は英語で `convoy`。`convoi` は既存の `convoi_t` に関わる所だけ（#52）。
- 略語（`p_c`、`cor`、`temp` など）を避け、意味のある名前にする（#52、#65、#67）。関数名は「何か」を表し、「いつ」「誰が」を入れない（#75）。`check_xxx` は例外を投げる関数に使う慣習なので避ける（#114。Simutrans の C++ はほぼ例外を使わない）。単位が km/h の変数は名前に `kmh` を付ける（#174）。
- `int` は使わず `uint16` などの固定幅整数型を使う。OS によって `int` の幅が違うため（#67）。`welt` ではなく `world()` を使う（`welt` はドイツ語なので、#80）。
- early return でネストを浅くする（その後の `else` は不要）。状態を変えない関数と変えない変数に `const` を付ける（#65、#67、#79）。
- 真偽の引数で動作を大きく分ける関数は避け、別の関数にする（control coupling、#52）。
- 状態を表す数値は enum にする（#106 の依頼から #107）。
- ヘッダに不要な `#include` を書かない（再ビルドが増える）。差分に意味のない行（末尾の空白など）を混ぜない（#80）。括弧の直後・直前の空白は 2 つまで可で、1 つは規約に無い（`documentation/coding_styles.txt`、#278）。
- `env_t` の static 変数の定義は `environment.cc` に置く（#59）。
- `draw` のように頻繁に呼ばれる関数では処理を減らす（毎フレーム `update_label()` しない、など。#80）。
- ロード後の事後処理は、狭いスコープの場所（`gebaeude_t::finish_rd()` など）に書く（#79）。
- コメントアウトしたコードは残さず削除する。経緯のコメントは `git blame` に残るのでコードに書かない。複雑な副作用がある呼び出しには理由をコメントで書く（#558、#62、#70）。
- マップに 1 つだけあればよいオブジェクトは `static` にせず、通常のメンバ関数にして `karte_t` に持たせる。特に理由がなければ STL より `vector_tpl` など独自の型を検討する（#506）。
- `#include <bits/stdc++.h>` のような GCC 固有のヘッダは使わない（#309 の自動レビュー）。
- 画面だけに使う状態を、`haltestelle_t` や `convoi_t` などゲームのモデルのクラスに持たせない（#358 の自動レビュー）。
- ユーザーが変えられる文字列（停留所名・翻訳済みのアドオン名）を `printf` の書式文字列に直接渡さない。`%` を含むと未定義動作になる（#612、#616 の自動レビュー）。
- `sprintf` ではなく `snprintf` を使う（#535）。コンボボックスの項目は `translator::translate` を通す（#535 の自動レビュー）。
- デバッグ用の一時的なテストは `all_tests.nut` に入れない。不具合の検出に使えるテストは残す（#558）。
- 出典: [#52](https://github.com/teamhimeh/simutrans/pull/52)、[#59](https://github.com/teamhimeh/simutrans/pull/59)（2025-01-13 マージ）、[#62](https://github.com/teamhimeh/simutrans/pull/62)（2025-02-07 マージ）、[#65](https://github.com/teamhimeh/simutrans/pull/65)（2025-02-15 マージ）、[#67](https://github.com/teamhimeh/simutrans/pull/67)（2025-02-27 マージ）、[#70](https://github.com/teamhimeh/simutrans/pull/70)（2025-02-25 マージ）、[#75](https://github.com/teamhimeh/simutrans/pull/75)（2025-02-27 マージ）、[#79](https://github.com/teamhimeh/simutrans/pull/79)（2025-04-01 マージ）、[#80](https://github.com/teamhimeh/simutrans/pull/80)（2025-04-12 マージ）、[#106](https://github.com/teamhimeh/simutrans/pull/106)（2025-07-10 マージ）、[#114](https://github.com/teamhimeh/simutrans/pull/114)（2025-07-27 マージ）、[#107](https://github.com/teamhimeh/simutrans/pull/107)（2025-07-14 マージ）、[#174](https://github.com/teamhimeh/simutrans/pull/174)、[#278](https://github.com/teamhimeh/simutrans/pull/278)、[#309](https://github.com/teamhimeh/simutrans/pull/309)（2026-01-31 マージ）、[#358](https://github.com/teamhimeh/simutrans/pull/358)（2026-02-22 マージ）、[#506](https://github.com/teamhimeh/simutrans/pull/506)、[#535](https://github.com/teamhimeh/simutrans/pull/535)、[#558](https://github.com/teamhimeh/simutrans/pull/558)（2026-06-05 マージ）、[#612](https://github.com/teamhimeh/simutrans/pull/612)（2026-06-30 マージ）、[#616](https://github.com/teamhimeh/simutrans/pull/616)（2026-06-27 マージ）
- 関連する wiki: 記載なし（`documentation/coding_styles.txt` が基準）

### ticks の扱い

- `ticks`（uint32）は、全ての値を使い切る前にリセットされる。リセット時は、`haltestelle_t::departure_t` と `convoi_t::scheduled_departure_time` も同様にリセットする（#306、2026-01-24 マージ）。
- `ticks` の大小比較は `is_first_ticks_bigger(v1, v2)` を使う。`1U<<31` を跨ぐと不正確で、早発や `1U<<(32-bpm)` 月待機などの不正な発車時刻になっていた。`|v1-v2|>1U<<31` のときは値が `1U<<32` を跨いだものとみなして大小を反転する（#236、2025-12-27 マージ）。
- 出典: [#306](https://github.com/teamhimeh/simutrans/pull/306)、[#236](https://github.com/teamhimeh/simutrans/pull/236)
- 関連する wiki: 記載なし

### ビルド対象の追加は Makefile のみ

- メンテナのレビュー（2026-05-20）で、「OTRP では cmake はメンテナンスしていません。Makefile だけ足してもらえばよい」と指示された（#506）。
- その後の PR も、ビルド対象の追加は Makefile のみで行い、CMake と Visual Studio のプロジェクト定義は変更していない（#716、2026-08-30 マージ。#748 のレビューでも `cmake/SimutransSourceList.cmake` は「現在管理されていない」とされた。#790、2026-11-04 マージ）。
- 出典: [#506](https://github.com/teamhimeh/simutrans/pull/506)、[#716](https://github.com/teamhimeh/simutrans/pull/716)、[#748](https://github.com/teamhimeh/simutrans/pull/748)（2026-10-12 マージ）、[#790](https://github.com/teamhimeh/simutrans/pull/790)
- 関連する wiki: 記載なし
- 補足: テスト用の C++ ファイルは C++11 の範囲で書く（#748 のレビュー）。

## feature flag

### `config.default` への書き方

- wiki の Feature Flag のページは、C プリプロセッサの `#if NEW_FEATURE` でコードを囲み、ローカルでは `config.default` の `CFLAGS += -DNEW_FEATURE=1` で有効にする、と説明する（`Makefile` や `config.template` には書かない）。
- メンテナも PR のレビュー（2026-05-20）で「CFLAGS は `config.default` で直接注入できるので、Makefile に読み替え処理は書かないでください」と述べた。さらに「feature flag のガイドライン側が不適切だったので、あとで更新する」と書いている（#506）。
- PR #526（2026-05-21 マージ）の本文は「`config.default` に `CONVOI_TEMPLATE = 1` を追加して有効化」と書いた。自動レビューは「Makefile に `ifdef` のスタンザが無く `-D` が渡らない」と指摘し、メンテナは「今回は feature flag で無効化しなくても誰も困らないので（スタンザは）いらない」と返している。
- **wiki との違い:** wiki の同じページの中で、本文は `CFLAGS += -DNEW_FEATURE=1`、末尾の表は「`config.default` に `FEATURE_X = 1` を追加」と書き、食い違っている（wiki の原文に日付は無い）。#506 のメンテナの発言（2026-05-20）は本文の書き方（`CFLAGS +=`）と合う。「ガイドラインを更新する」という予告が wiki に反映されたかは、確かめていない。
- 出典: [#506](https://github.com/teamhimeh/simutrans/pull/506)、[#526](https://github.com/teamhimeh/simutrans/pull/526)
- 関連する wiki: [開発者向け:-Feature-Flagの利用について](https://github.com/teamhimeh/simutrans/wiki/%E9%96%8B%E7%99%BA%E8%80%85%E5%90%91%E3%81%91:-Feature-Flag%E3%81%AE%E5%88%A9%E7%94%A8%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6)（記述が揺れている）

### 使い終えたら外す

- 編成テンプレートの一連の PR は、最後に `CONVOI_TEMPLATE` のガードを外す PR で完結した（#543、2026-05-28 マージ）。wiki の「段階的マージの流れ」の最終ステップ（リリース PR）にあたる。
- 出典: [#543](https://github.com/teamhimeh/simutrans/pull/543)
- 関連する wiki: [開発者向け:-Feature-Flagの利用について](https://github.com/teamhimeh/simutrans/wiki/%E9%96%8B%E7%99%BA%E8%80%85%E5%90%91%E3%81%91:-Feature-Flag%E3%81%AE%E5%88%A9%E7%94%A8%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6)（概要のみ）

## 自動テスト

### 置き場所・登録・実行

- テストは `tests/automated-tests/tests/test_*.nut` に置き、`all_tests.nut` に `include("tests/test_xxx")` と関数の登録を足す（#606）。通るテストは `all_tests`、まだ失敗するものは `failing_tests` に分けて管理する。コード変更なしで通っていた 72 件を移し、`all_tests` は 40 件から 112 件、`failing_tests` は 46 件になった（#383）。
- 全体の実行は、`unzip tests/simutrans-test-base.zip -d ~/` でテストベースを展開し、`WORKDIR=~/simutrans-test-base ./run-automated-tests.sh` を実行する。詳しい手順は `tests/README.txt`（#367）。
- 個別のテスト関数名を引数に渡して単独で実行できる（例: `./run-automated-tests.sh test_label`、#373）。変数で渡す書き方は `WORKDIR=${SIMUTRANS_TEST_BASE} SIM_BINARY=./sim tests/run-automated-tests.sh <テスト関数名>`（#624）。テストのファイルは WORKDIR の scenario ディレクトリに自動でコピーされ、各テストは独立したゲームインスタンスで実行される（#373）。
- アサーションの失敗を検出すると Simutrans を即座に終了する（以前は 5 分のタイムアウトまで待っていた、#368）。Win32 GUI ビルドで、テストが終わっても自動で終了しない問題が修正された（#681。リリース v58_3 に「windows 版にて、自動テスト実施時に `simutrans.exe` が終了しないバグを修正」）。
- リリース v52 で「ビルド時の自動テスト機能」が告知された。
- 出典: [#606](https://github.com/teamhimeh/simutrans/pull/606)、[#383](https://github.com/teamhimeh/simutrans/pull/383)（2026-02-14 マージ）、[#367](https://github.com/teamhimeh/simutrans/pull/367)（2026-02-11 マージ）、[#373](https://github.com/teamhimeh/simutrans/pull/373)（2026-02-12 マージ）、[#624](https://github.com/teamhimeh/simutrans/pull/624)（2026-06-28 マージ）、[#368](https://github.com/teamhimeh/simutrans/pull/368)（2026-02-11 マージ）、[#681](https://github.com/teamhimeh/simutrans/pull/681)（2026-08-03 マージ）、リリース v52、v58_3
- 関連する wiki: 記載なし

### テストの書き方で指摘されたこと

- 実機能の PR にテストを足すよう、レビューで繰り返し依頼されている（#421 など）。
- 「同時に走れる」のように、結果が同じで経路だけ違う挙動は、到達しただけを確かめても従来のバイナリでも通る。通過の順序を示すフラグなどで直接確かめる（#584 の自動レビューと作者の返答）。
- OTRP では撤去ツールの Ctrl+クリックが範囲撤去に割り当てられているため、Ctrl+クリックでのトンネル一括撤去はテストで使えない。`tool_remove_way` を使う。木の上限値などはハードコードせず設定値から取る。ツールの `init()` が不正な `default_param` を reject することも確かめる（#393）。
- 都市の成長に左右される位置への建物の配置は非決定的。後片付けの `remover.work` の結果は Fatal のアサーションにしない（`tool_remover` は対象タイルに何も無いと空文字を返す、#484 のレビュー）。
- テストの時間を縮めるには `debug.set_game_speed(5)` が使える（#380）。
- 設定を切り替えるテストには、Squirrel の `settings` の API が要る。経路キャッシュは既定が OFF なので、ON にする API を足してテストした（#587）。
- 出典: [#421](https://github.com/teamhimeh/simutrans/pull/421)（2026-03-29 マージ）、[#584](https://github.com/teamhimeh/simutrans/pull/584)（2026-07-17 マージ）、[#393](https://github.com/teamhimeh/simutrans/pull/393)（2026-02-17 マージ）、[#484](https://github.com/teamhimeh/simutrans/pull/484)（2026-05-04 マージ）、[#380](https://github.com/teamhimeh/simutrans/pull/380)（2026-02-14 マージ）、[#587](https://github.com/teamhimeh/simutrans/pull/587)
- 関連する wiki: 記載なし

### GUI の確認（MCP 経由）

- `-load <セーブ名> -mcp-port <ポート>` でテスト環境のセーブを直接起動し、MCP の `run_squirrel` で操作し、`capture_screen` で画面を確かめる。Python の補助スクリプトで JSON-RPC を直接書かずに呼べる。ダイアログのツールは Squirrel の `world.open_dialog_tool(tool_nr)`（`simmenu.h` の `DIALOG_*` の番号）で開ける（#624、スキル `simutrans-mcp-gui-debug`）。
- 出典: [#624](https://github.com/teamhimeh/simutrans/pull/624)
- 関連する wiki: [MCP-Server](https://github.com/teamhimeh/simutrans/wiki/MCP-Server)（スキル名や GUI デバッグの手順は記載なし）

## CI・ビルド・配布

### GitHub Actions のワークフロー

- 自動テストのワークフローは `.github/workflows/otrp-automated-tests.yml`。Pull Request の作成時と手動実行で動き、Ubuntu latest で実行する。失敗時はログをアーティファクトとしてアップロードし、成否は GitHub Checks API で判定する（#367）。build / list-tests / test の 3 ジョブに分かれ、テストをバッチにまとめて並列ジョブ数を減らす。バッチの大きさは、10 個ずつ（35 ジョブから 4 ジョブ、#373）から 20 個ずつ（#383）に変わった。
- Windows 64bit ビルドのワークフローにも `pull_request` のトリガーが足された（#348）。macOS のビルドも PR で実行される（#633）。
- ビルド成果物の名前（#207）:
  - タグ付きコミット（例 v48）: `sim-mac-OTRPv48`、`sim-linux-OTRPv48`、`sim-WinGDI-OTRPv48.exe`
  - 手動実行（`workflow_dispatch`）: `sim-mac-OTRP_<ブランチ名>`（macOS のみ）
  - PR: 従来どおり `sim-linux-OTRP`（Ubuntu のみ）
  - 対象は `otrp-macos.yml`、`otrp-ubuntu.yml`、`otrp-windows-64.yml`。
- SDL3 のバックエンドが追加された（`BACKEND=sdl3`。SDL3 を使える Linux・macOS では SDL3 を優先して選ぶ。Windows は従来の GDI を維持して SDL3 のビルドを追加。#716）。Ubuntu 向けの SDL3 の自動ビルドは、失敗が続いたため一旦削除された（#727、2026-09-07 マージ）。Linux の配布バイナリは Ubuntu 24.04 と SDL2 で作る（#716 の本文）。リリース v60_1_1 で「SDL3 ビルドに対応、mac 版のみ配布開始」。
- 出典: [#367](https://github.com/teamhimeh/simutrans/pull/367)、[#373](https://github.com/teamhimeh/simutrans/pull/373)、[#383](https://github.com/teamhimeh/simutrans/pull/383)、[#348](https://github.com/teamhimeh/simutrans/pull/348)（2026-02-05 マージ）、[#633](https://github.com/teamhimeh/simutrans/pull/633)（2026-06-30 マージ）、[#207](https://github.com/teamhimeh/simutrans/pull/207)、[#716](https://github.com/teamhimeh/simutrans/pull/716)、[#727](https://github.com/teamhimeh/simutrans/pull/727)、リリース v60_1_1
- 関連する wiki: 記載なし（[OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home) の導入方法・Linux の節は zstd のみ言及し、SDL2/SDL3 の記載は無い）

### macOS ビルドの変遷

- 2025-10-07: GitHub Actions の mac ビルドで static link を強制した。生成バイナリは依存ライブラリを含み、別途ライブラリを入れる必要が無い。arm64 専用で Intel Mac では動かない（#182）。
- 2026-06-30: macOS の CI 成果物を `.app` バンドルにした。Homebrew の動的ライブラリを同梱する形（動的リンク＋同梱 Frameworks）に変え、static link を前提にした処理をやめた（#633）。リリース v55_10 から `.app` 形式で、初回に `xattr -dr com.apple.quarantine <app>` が要る。
- 2026-11-10・11-11: 署名と公証（notarization）に対応した。`OTRP-KUTAv6` と、その履歴内のコミットを指す `v*` タグの手動ビルドが対象で、通常のブランチの push では macOS のワークフローは動かない。`macos-signing` の environment と、ブランチのルール、secrets、variables の設定が要る（`.github/macos/README-OTRP.md`）。タグの公証はデフォルトブランチ（`OTRP-KUTAv6`）から実行する。Homebrew の FreeType が Brotli にリンクしているとバンドルの検査が失敗するため、`libbrotlidec` と `libbrotlicommon` を同梱する（#807、#808）。#807 の時点で、実際の署名・公証は未検証と書かれている。リリース v63_3 に「macOS notarization support」。
- **wiki との違い:** OTRP-Home の mac の節は、配布バイナリは Apple の認証を受けていないので `xattr` の操作が要る、と書く。v63_3（2026-11-12）で公証に対応したが、公証済みのビルドでこの操作が要らなくなるかは、PR とリリースノートから読み取れなかった。
- 出典: [#182](https://github.com/teamhimeh/simutrans/pull/182)（2025-10-07 マージ）、[#633](https://github.com/teamhimeh/simutrans/pull/633)、[#807](https://github.com/teamhimeh/simutrans/pull/807)（2026-11-10 マージ）、[#808](https://github.com/teamhimeh/simutrans/pull/808)（2026-11-11 マージ）、リリース v55_10、v63_3
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（xattr の手順のみ。記述が古い可能性）

### Squirrel API ドキュメントの公開

- `.github/workflows/otrp-sqapi-docs.yml` が、`v*` タグの push または `workflow_dispatch`（バージョン文字列を指定できる）で動き、Doxygen で作った HTML を `https://teamhimeh.github.io/simutrans/otrp-squirrel-api/` に公開する。リポジトリの Settings → Pages → Source を「GitHub Actions」にしておく必要がある（#513）。
- `Doxyfile_SQAPI` はバージョンを環境変数 `OTRP_VERSION` から取る。継承図には graphviz が要る（#514）。
- Squirrel API の型情報を `squirrel_types_scenario.awk` に登録しないと、戻り値がドキュメント上で `void` と表示される（#516）。
- 出典: [#513](https://github.com/teamhimeh/simutrans/pull/513)、[#514](https://github.com/teamhimeh/simutrans/pull/514)、[#516](https://github.com/teamhimeh/simutrans/pull/516)（いずれも 2026-05-16 マージ）
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（サイドバーに公開先のリンクはあるが、公開の手順は記載なし）

### `makeobj` のビルド

- 画像の入出力（`io/raw_image_png.cc`、`io/raw_image_bmp.cc`）が `sys/simsys.h`（`dr_fopen`）に依存すると、`makeobj` は `simsys.cc` をリンクしないのでリンクに失敗する。`FILE *dr_fopen(...)` を前方宣言し、`makeobj`（`MAKEOBJ` が定義されたとき）はマクロで標準の `fopen` に置き換える形で直した（#649、2026-07-08 マージ）。
- 出典: [#649](https://github.com/teamhimeh/simutrans/pull/649)
- 関連する wiki: 記載なし
