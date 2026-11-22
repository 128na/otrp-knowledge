# 本家と OTRP の修正の追従: r10251 以前の FIX 23 件（2026-11-23）

[2026-11-22 の初回の確認](./2026-11-22_std-sync.md)の 7 章で「読まなかったもの」に挙げた、本家 r10251 以前の取りこぼし候補のうち、題名が修正のもの 23 件を読んだ記録。書いたら変えない。
決まりは [開発 / 本家と OTRP の修正の追従](../dev/std-sync.md)、確かめ済みの範囲は [128na/simutrans#19](https://github.com/128na/simutrans/issues/19)、取りこぼしの一覧は [128na/simutrans#20](https://github.com/128na/simutrans/issues/20) にある。

## 1. 見たもの

- 本家 r9281（git の分岐点）〜 r10251（KUTA_v6 の取り込みの元と見積もった版）のコミットのうち、機械の仕分けで「取りこぼし候補」に出た 55 件の中で、題名が `FIX` で始まる 23 件。
- 照らした相手は初回と同じ。OTRP `d4d61158e`（2026-11-21）、本家 r12117（`eb7dafc31`）。
- 不具合のあるコードは分岐点の時点で OTRP にもあったはずなので、「当てはまらない」は「本家が r9281 より後に作り直した部分の不具合で、OTRP はその作り直しを入れていない」ものにした。
- 読み手（サブエージェント）が 1 件ずつ判定し、取りこぼしとした 4 件は全部、別のサブエージェントに反証を探させた。ゲームでは確かめていない。

## 2. 結果

| 判定 | 件数 | 版 |
|---|---|---|
| 取りこぼし | 3 | r9576、r9587、r9618 |
| 反証が出て外した | 1 | r10144 |
| 別の形で直っている | 7 | r9541、r9627、r9707、r9820、r10058、r10119、r10203 |
| 当てはまらない | 12 | r9379、r9396、r9397、r9462、r9465、r9481、r9494、r9526、r9608、r9721、r9776、r9930 |

- 当てはまらない 12 件のうち 11 件は、本家の路線・時刻表の画面の作り直し（`gui_schedule_t` と、それを使う路線の窓・編成の窓の時刻表のタブ）の不具合。OTRP はこの作り直しを入れておらず、`schedule_gui_t` を土台にした独自の画面を持つ。残りの r9930 は、OTRP が積み降ろしの処理を書き換えていて、対象の状態が無い。
- OTRP の履歴に `trunk@` の残る取り込みがあったのは r9541 だけ（`2a616fcac`、2021-01）。KUTA_v6 の入れ替えの後も `simfab.h` の部分は残り、`simtool.cc` の部分は OTRP の側で別に直っていた。ほかの 22 件に、一度入って入れ替えで消えた跡は無かった。

## 3. 取りこぼし

| 版 | コミット | 重さ | 確かめ | OTRP の場所 | 題名 | 中身 |
|---|---|---|---|---|---|---|
| r9618 | `d705c0ec3` | med | 反証なし | `dataobj/loadsave.cc:608-609`（`loadsave_t::flush_buffer`） | FIX: Assertion failure when running out of disk space during saving | ディスクが満杯で書き込みが足りないと `assert(sz == pos)` で落ちる。`Makefile` は `DEBUG` を定義しないときだけ `-DNDEBUG` を足すので、`DEBUG = 0` の配布用の設定でも assert は効く。直すのは `flush_buffer` だけで足りる（`close()` には容量不足の文言がすでにある）。 |
| r9587 | `2b225197b` | low | 反証なし | `simworld.cc:2737`（`karte_t::can_lower_to`）、`simtool.cc` の `tool_set_slope_work` | FIX: disallow lowering tunnels below world_minimum_height | 地形やトンネルを下げるときに最低高度（`world_minimum_height`）を見ない。ただし地下水位より 3〜4 段下で先に止まるので、地下水位が -9 より低いような極端な設定でないと届かない。 |
| r9576 | `d8f257538` | low | 反証なし | — | FIX: Fatal error when querying gameinfo of servers running ancient versions | ネットワーク越しに届きうるので、場所と中身はこの記録に書かない。 |


### 反証が出て外したもの

| 版 | コミット | 題名 | 反証 |
|---|---|---|---|
| r10144 | `5d3408085` | FIX: untranslocate our bundle on MacOS, so it can be run as downloaded | 本家はこの修正を後の r10633・r10635 で消した（macOS のアプリの作りを変えた）。本家の最新に残っていないので、取り込む意味が無い。OTRP に残る `OSX/translocation.m` は、呼び出しも見出しファイルも無い取り込みの残りで、扱いは別。 |

## 4. 確かめた場所

- 本家 `master` の `eb7dafc31`（r12117）、OTRP `OTRP-KUTAv6` の `d4d61158e`。2026-11-23。
- 3 件は [#20](https://github.com/128na/simutrans/issues/20) の一覧に足した。r9576 の場所と中身は、公開しない手元の記録に置いた。
