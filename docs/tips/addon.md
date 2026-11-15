# アドオン制作

> この内容は、OTRP の PR とリリースノートの記述から拾ったものです（2026-11-14 時点）。ゲームの動作やソースコードでは確かめていません。仕様は [OTRP wiki](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home) が正です。

アドオン制作者向けに、dat のパラメータ、画像の決まり、pak と makeobj（読み込める版）まわりの、wiki に載っていない（または wiki より新しい）内容をまとめる。dat のキー名が PR・リリースノートから分からないものは、その旨を書いた。

## 車両の画像

### 反転時用画像（Reverse）の表示ルール

反転した編成の画像を pak 側で用意する仕組み。使い方とサンプルは wiki にある。ここでは、wiki に無い画像選択の優先順位と読み込みの条件を補う。

- 用意するもの: 貨物 `Obj=goods` / `Name=Reverse` の pak（ほかの数値はダミーで任意）。車両側は `freightimagetype[n]` に `Reverse` を足し、反転時用画像を `FreightImage[n][direc]` として積載画像と同じ形式で書く。画像の向きは変えなくてよい（反転の処理は本体が共通で行う）。
- 空車で反転しているとき: `freightimagetype[n]=Reverse` の画像を表示する。無ければ `EmptyImage`。
- 積載して反転しているとき: `Reverse` の画像を表示する。無ければ、`freightimagetype` で指定した貨物を積んでいる場合はその積載画像、それも無ければ積載中の画像、どれも無ければ `EmptyImage`。
- `freightimagetype` に指定した貨物の pak が無くても XREF エラーにならない。`freight` に指定した貨物の pak が無いとエラーになる。
- 空車で反転しているときに積載画像が出てしまう不具合は #223 で直った（リリース v48）。
- 作者は「makeobj の改造の検討」を TODO に挙げたが、結果は PR から分からない。

- 出典: [#100](https://github.com/teamhimeh/simutrans/pull/100)（2025-07-21 マージ）、[#223](https://github.com/teamhimeh/simutrans/pull/223)（2025-12-12 マージ）、リリース v44_5、v48
- 関連する wiki: [編成反転時用画像について-Image-for-Reversing](https://github.com/teamhimeh/simutrans/wiki/%E7%B7%A8%E6%88%90%E5%8F%8D%E8%BB%A2%E6%99%82%E7%94%A8%E7%94%BB%E5%83%8F%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6-Image-for-Reversing)（使用方法・サンプルは記載あり。優先順位のフォールバックと XREF の扱いは記載なし）

### バスの折り返し時の横向き画像

道路車両が逆向きに出発するとき（バスのバス停での折り返し）、一瞬だけ横向きの画像を挟んで自然な転回を見せる。

- v54_0_1（#463）で追加。PR 本文は、バス停発車時に 1/8 タイル分だけ横向き画像を入れると書く。作者のコメント（2026-04-09）では、この時点で中継点での折り返しには働かない。
- v55_0_3（#477）で、横向き画像の表示時間が出発方向によって違う不具合を直した。1 両編成のバスやトラックが折り返す場合に限り、初期配置が済んだあとで横向き画像を設定するようにして、全方向で表示時間をそろえた。
- 横向き画像を dat でどう指定するかは、PR・リリースノートに書かれていない。

- 出典: [#463](https://github.com/teamhimeh/simutrans/pull/463)（2026-04-21 マージ）、[#477](https://github.com/teamhimeh/simutrans/pull/477)（2026-05-06 マージ）、リリース v54_0_1、v55_0_3
- 関連する wiki: [編成反転機能-連結親子関係反転機能](https://github.com/teamhimeh/simutrans/wiki/%E7%B7%A8%E6%88%90%E5%8F%8D%E8%BB%A2%E6%A9%9F%E8%83%BD-%E9%80%A3%E7%B5%90%E8%A6%AA%E5%AD%90%E9%96%A2%E4%BF%82%E5%8F%8D%E8%BB%A2%E6%A9%9F%E8%83%BD-reverse-convoy---reverse-convoy-coupling)（自動車の反転の車線の説明のみ。横向き画像は記載なし）

### 路線のラインカラーを車両の塗装に使う

路線のラインカラーで、車両画像のプレイヤーカラー 1 に当たる部分を置き換えられる（v55_2_1、#491）。

- 置き換わるのはプレイヤーカラー 1 の部分。リリースノートもそう書く。
- レビューで、プレイヤーカラー 2（0x8008〜0x800F）も置き換え範囲に入っているという指摘が出たが、最終的にどうなったかは PR から確認できなかった。
- ラインカラーの選択肢は v53（#438）で 28 色増えて計 56 色になった。

- 出典: [#491](https://github.com/teamhimeh/simutrans/pull/491)（2026-05-16 マージ）、[#438](https://github.com/teamhimeh/simutrans/pull/438)（2026-03-23 マージ）、リリース v55_2_1、v53
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（路線の色の設定は記載あり。車両塗装への適用は記載なし）

### 長さ 16（1 タイル）を超える車両

v55_0_3（#494）で、車両長が 16 を超えても安全に運行できるようになった。

- 駅発車時の在線確認で、車両長に応じて探索するタイル数を変える。
- 駅発車時の予約区間の設定方法を直した。
- 連結のとき、連結待ちの編成側の車両長に応じて探索するタイル数を変える。連結に必要なのは最後尾の車両の情報なので、車両長の確認は前後 2 両で足りるとした。
- 入庫・車庫への転送・撤去で予約の解除漏れが起きないことは、作者が確認している。

- 出典: [#494](https://github.com/teamhimeh/simutrans/pull/494)（2026-05-10 マージ）、リリース v55_0_3
- 関連する wiki: 記載なし

## 停留所・信号・分岐器の画像

### 勾配タイル停留所の dims と設置の制限（v57_0_1）

勾配タイルに置ける停留所の画像番号と `dims` は wiki の「斜めタイル停留所・勾配タイル停留所について」にある。ここでは、wiki に無い設置の制限を補う。

- `dims` が 48 以下のアドオンは、勾配タイルに設置できない。
- `dims` が 80 のアドオンは、緩坂・急坂のどちらでも勾配用の画像を勾配タイルに置く。
- 勾配タイルに置いたあとでアドオンを上書きした場合は、適当な画像を置く。
- ホーム長は 1 マスを 1.000 として計算する（振り分けでの動作確認済み）。
- 橋の上にも置ける（地平側・ランプ側とも確認済み）。橋を壊すとランプ部も撤去される。
- 孤立した 1 マスの坂道の way にも置ける。置いたあとで way を延ばすこともできる（#661）。
- 未解決: 隣のホームの向きが設置時に反映されない（勾配・地平を問わず）。#607 の作者のチェックリストでは未チェックのまま。

- 出典: [#607](https://github.com/teamhimeh/simutrans/pull/607)（2026-07-11 マージ）、[#661](https://github.com/teamhimeh/simutrans/pull/661)（2026-07-15 マージ）、リリース v57_0_1
- 関連する wiki: [斜めタイル停留所・勾配タイル停留所について](https://github.com/teamhimeh/simutrans/wiki/%E6%96%9C%E3%82%81%E3%82%BF%E3%82%A4%E3%83%AB%E5%81%9C%E7%95%99%E6%89%80%E3%83%BB%E5%8B%BE%E9%85%8D%E3%82%BF%E3%82%A4%E3%83%AB%E5%81%9C%E7%95%99%E6%89%80%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6)（画像番号と dims は記載あり。設置の制限は記載なし）

### 1 マスの斜めタイル停留所のホーム長と、古い pak の緩急坂（v50_5）

- #313: 1 マスだけの斜めタイル停留所のホーム長を、斜めタイル 1 マス分にした（従来はその半分）。リリースノートは「従来の 2 倍。停車位置は変更なし」と書く。
- #316: 緩急坂が導入される前のアドオンや、古い makeobj で作った pak（リリースノートでは 112.3 以前用）も、緩坂・急坂の両方に設置できるようにした。対象のアドオン種別は原文に書かれていない。

**wiki との違い:** wiki「斜めタイル停留所・勾配タイル停留所について」は、停車する端のタイルが斜めなら有効長はその半分（5.65625）と説明するが、v33_2 時点の暫定仕様と断っている。1 マスだけの停留所は #313（2026-01-27 マージ）で斜めタイル 1 マス分に変わった。

- 出典: [#313](https://github.com/teamhimeh/simutrans/pull/313)（2026-01-27 マージ）、[#316](https://github.com/teamhimeh/simutrans/pull/316)（2026-01-27 マージ）、リリース v50_5
- 関連する wiki: [斜めタイル停留所・勾配タイル停留所について](https://github.com/teamhimeh/simutrans/wiki/%E6%96%9C%E3%82%81%E3%82%BF%E3%82%A4%E3%83%AB%E5%81%9C%E7%95%99%E6%89%80%E3%83%BB%E5%8B%BE%E9%85%8D%E3%82%BF%E3%82%A4%E3%83%AB%E5%81%9C%E7%95%99%E6%89%80%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6)（記述が古い）

### 信号・道路標識の画像の Front/Back を反転する設定

信号・道路標識の画像の Front/Back を入れ替える設定が v55_0_3（#490）で入った。pak128.japan のように、信号がもともと左側に描かれている pak で、描画の前後関係を正しくするためのもの。

- 設定の場所は「高度な設定」と simuconf.tab。simuconf.tab のキー名は原文に書かれていない（レビューでは内部名 `signal_reverse_front_back` が出てくる）。
- 全信号の Front/Back を入れ替える。右側通行用と左側通行用の信号を共存させることはできない。
- `ONLY_BACKIMAGE` のアドオンは、この設定に関係なく常に背景側に描く。

- 出典: [#490](https://github.com/teamhimeh/simutrans/pull/490)（2026-05-10 マージ）、リリース v55_0_3
- 関連する wiki: 記載なし

### 斜め方向の信号画像（makeobj 60.12、v63_3）

makeobj 60.12 で追加された斜め方向の信号画像を使えるようになった（#809）。

- 斜めタイルでは、way に diagonal の設定が無くても信号が斜めに表示される。
- 直角のカーブのタイルでは従来どおり通常用の画像、直線のタイルでは直線用の画像を使う。
- dat での指定方法は PR・リリースノートに書かれていない。

- 出典: [#809](https://github.com/teamhimeh/simutrans/pull/809)（2026-11-12 マージ）、リリース v63_3
- 関連する wiki: 記載なし

### 固定した分岐器画像の選択（未マージ）

未マージ（2026-11-14 時点で OPEN、2026-11-13 作成）。分岐点（T 字・十字）のタイル情報ダイアログから、分岐器の画像を自動選択に任せず固定できるようにする提案（#810）。

- switch 画像を持つアドオンだけに選択肢が出る。選択肢は `Auto`（既定）、`Standard`、2 つの分岐状態（T 字: `Branch north/east/south/west`、十字: `Crossover A/B`）。拡張（ex）画像があれば `Y-junction (<dir>)` と `Double crossover A/B` も出る。
- 現行の makeobj は ex 画像を書けない（`way_writer.cc` は `nsew2` までのキー）。ex 用のキーはこの PR に含まれない。
- セーブデータに way ごとに 1 バイト足すため、`OTRP_VERSION_MAJOR` を 63 から 64 に上げる案。古い版では読めなくなる。

- 出典: [#810](https://github.com/teamhimeh/simutrans/pull/810)（未マージ、2026-11-14 時点）
- 関連する wiki: 記載なし

## 建物・産業・way の dat

### 建物の上空の高さ制限（makeobj 60.12、v62_4_1）

建物アドオンに、許可する上空の高さ（height clearance）を設定できる。

- 高さ制限以下の高架線は建設できない。高架が高さ制限以下のときは、建物を建設できない。
- 設定していないアドオンは、建物画像の高さなどから自動で算出する。
- dat のキー名は PR・リリースノートに書かれていない。
- 機能は makeobj 60.12 で追加されたもので、作者は makeobj の公式リリース後にマージするとコメントした。

- 出典: [#696](https://github.com/teamhimeh/simutrans/pull/696)（2026-10-24 マージ）、リリース v62_4_1
- 関連する wiki: 記載なし

### 産業の発電所フラグ（makeobj 60.11）

makeobj 60.11 で産業に発電所のフラグが追加され、OTRP は v55_9（#566）でそれを読めるようにした。

- フラグは pak 側で設定する。キー名と、wiki にある名前による指定との両立は、原文（PR 本文は 1 行）から分からない。
- wiki の OTRP-Home にある、産業名の末尾に `kraftwerk` か `Power Plant` を付ける方法は v54 からのもの。生産できる発電所は v54_0_1（#470・#480）で入った。

- 出典: [#566](https://github.com/teamhimeh/simutrans/pull/566)（2026-06-27 マージ）、リリース v55_9、v54_0_1
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（名前による指定は記載あり。フラグは記載なし）

### 路面軌道属性の wayobj・roadsign は鉄道属性に読み替える（v50）

路面軌道（`tram_track`）属性の wayobj と roadsign のアドオンは、pak の読み込み時に鉄道（`track`）属性へ上書きされる。路面軌道のままだと `calc_route` ができず、設置できないか、連続して設置するとクラッシュするため。

- 出典: [#248](https://github.com/teamhimeh/simutrans/pull/248)（2026-01-03 マージ）、リリース v50
- 関連する wiki: 記載なし

### 併用軌道（tram_wt）を他の軌道の上に敷設する（v44_4）

併用軌道（`tram_wt`）を、モノレール・ナローゲージなど他の軌道の上に敷設できる。本家 124.3.1 までに入った変更の移植。トンネル内にも敷設できるようにした点は OTRP 独自。詳細は「道路・線路・電化・航送・航空」のページを参照。

- 出典: [#94](https://github.com/teamhimeh/simutrans/pull/94)（2025-07-10 マージ）、リリース v44_4
- 関連する wiki: 記載なし

## pak と makeobj の版

OTRP が読める pak の makeobj の版は、wiki の OTRP-Home に「v54 以降は standard 用の最新 pak（makeobj 60.9）と extended 用の pak も読める」とある。それ以降に PR・リリースノートで確かめられた対応は次のとおり。

| OTRP の版 | 内容 | 出典 |
|---|---|---|
| v44_4 | 本家 124.3.1 の makeobj で作った pak を読めるようにした。dat の cost と maintenance を sint64 にした | [#86](https://github.com/teamhimeh/simutrans/pull/86)（2025-07-10 マージ） |
| v52_1 | 本家 124.3.1 の pakset の既定のインストール先（Windows は `C:\ProgramData\Simutrans`）の pakset を、フォルダを動かさずに読める | [#411](https://github.com/teamhimeh/simutrans/pull/411)（2026-03-14 マージ） |
| v54_0_1 | makeobj 60.9 のアドオンを読める。あわせて `env_t::clip_below` のフラグを足し、way を「クリップしない」「すべてクリップ」「pak で指定したものだけクリップ」から選べるようにした（設定の場所は原文に書かれていない） | [#455](https://github.com/teamhimeh/simutrans/pull/455)（2026-04-11 マージ） |
| v54_0_1 | extended 用の pak を読める。extended の機能は使えない | [#464](https://github.com/teamhimeh/simutrans/pull/464)（2026-04-18 マージ） |
| v55_9 | makeobj 60.11 のアドオンを読める（産業の発電所フラグ） | [#566](https://github.com/teamhimeh/simutrans/pull/566)（2026-06-27 マージ） |
| v60_0_1 | 橋の `clip_below` の設定を正しく読めず pak の読み込みに失敗する不具合を直した。リリースノートは「makeobj 60.11 の一部の pak が読めない不具合」と書き、PR のコメントは makeobj 60.9 で作った高架・橋のアドオンで確認したと書く | [#695](https://github.com/teamhimeh/simutrans/pull/695)（2026-08-13 マージ） |
| v62_3 | makeobj 60.12（125.0 相当）の pak を読める | [#771](https://github.com/teamhimeh/simutrans/pull/771)（2026-10-18 マージ） |

- sint64 化（#86）のレビューでは、値を使う側（`goods_manager.cc` など）も、従来の範囲（uint16）を超える値で壊れないよう更新することが求められた。最終的に全部が更新されたかは原文から確認できない。
- makeobj 60.12 が増やした機能のうち、OTRP が使えるようにしたのは、建物の height clearance（v62_4_1）と斜め方向の信号画像（v63_3）。
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（v54 以降の読み込みは記載あり。上の表のうち v54 より後と sint64 は記載なし）

## 使っていないアドオンの確認

マップに使っていないアドオンの一覧を、ロードの完了時に表示できる（v52_1、#414）。ボタンで表示し、CSV としてコピーするとアドオン名と属性の一覧が取れる。pak に入れたアドオンが実際に使われているかを調べるのに使える。

- 出典: [#414](https://github.com/teamhimeh/simutrans/pull/414)（2026-03-14 マージ）、リリース v52_1
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（アドオン名の重複警告は記載あり。未使用アドオンの一覧は記載なし）
