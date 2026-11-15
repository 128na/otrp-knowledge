# 分岐（switch）の絵の固定

> 関連する wiki: [OTRP Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)
> フォーク元への PR: [teamhimeh/simutrans#810](https://github.com/teamhimeh/simutrans/pull/810)（レビュー待ち。マージされたら、ここの「状況」を直す）

T字・十字の way が持つ「分岐の絵（switch 画像）」を、プレイヤーがタイルの詳細ダイアログで選んで固定し、セーブデータに残す機能を実装したときの知見。
アドオン側の dat のキーと絵の作り方は、アドオン開発リポジトリの way 系リファレンスの「分岐（switch）の絵」にある。ここには本体を改修する人向けのことだけを書く。

## 要点

- 選択は `weg_t::switch_image_override`（`sint8`）に持つ。`-1` = 自動、`0` = 標準、`1`・`2` = switch 画像（`nw` が true・false）、`3`・`4` = ex 画像（同）。
- セーブデータには 1 バイト足す（OTRP v64 以降）。`rdwr` は 0〜4 以外を `-1` にして読む。
- 形が変わったら自動に戻す。pak が変わって絵が無くなった選択も、ロード後（`finish_rd`）に自動へ戻す。
- 自動選択があるのは線路（tram を含む）と道路だけ。固定の選択は、画像を持つ way なら waytype を問わず使える。

## 詳細

### 状態の持ち方と戻し方

| 場面 | 処理 | 場所 |
|---|---|---|
| ribi が変わる | `update_ribi` が値を `-1` に戻す。`ribi_add`・`ribi_rem`・`set_ribi` はここを通す | `boden/wege/weg.h` |
| T字・十字でなくなる | `calc_image` が `-1` に戻す。T字・十字は `is_switch_junction()`（三方以上で、斜め・近接斜めでない） | `boden/wege/weg.cc` |
| 絵の再計算の最後 | 値が 0 以上で T字・十字なら、固定の絵で上書きする（`apply_switch_image_override`） | `boden/wege/weg.cc` |
| 列車の予約 | 線路の予約で絵を切り替える処理を、固定されているときは飛ばす | `boden/wege/schiene.cc` |
| ロード後 | 値が 0 以上で、その絵がもう無ければ `-1` に戻す（`finish_rd`） | `boden/wege/weg.cc` |

- 選択肢が使えるかは `is_switch_image_choice_available`。1・2 は switch 画像が、3・4 は ex 画像が空でないことを見る。ダイアログはこの判定で、使えない選択肢を出さない。
- ロードの順序: `finish_rd` の時点で desc と ribi は読み込み済みで、斜めの印はまだ付いていない。このため、有効な値は `finish_rd` で消えず、絵が無い値だけが消える（保存→ロードで維持されることをゲームで確かめた、2026-11-15）。
- 保存の形式を変えたので、`simversion.h` の OTRP バージョンを 63 から 64 に上げた。途中の試作の形式（1 バイトより前の符号）で保存したデータは、今のビルドでは `-1` になる。確かめるときは新しい形式で保存し直す。

### ツールとスクリプトの API

- ツールは `TOOL_SET_SWITCH_IMAGE`（`tool_set_switch_image_t`、`simtool.cc`）。既定の引数は `"<waytype>,<選択>"`。範囲外・使えない選択・削除できないタイルは拒否する。
- ネットワークゲームでは、ダイアログが `call_work` でコマンドを送る。ツールの `work` の中で状態を書き換え、ダイアログから直接 way を書き換えない。
- スクリプトの API: `way_x.get_switch_image_override()`、`way_x.get_image_id()`、`way_desc_x.has_switch_image()` / `has_switch_ex_image()`、定数 `tool_set_switch_image`。AI 用・シナリオ用の型の定義（`squirrel_types_*.awk`）にも足す。

### ダイアログ（`gui/ground_info.cc`）

- 1 タイルに way が 2 本あるときは、選択肢の組を 2 つ出す（`MAX_SWITCH_CHOICES`）。
- 選択の表示を毎フレーム `set_selection` で合わせると、ユーザーの選択が、コマンドが実行されるまで元に戻る。**値が変わったときだけ**合わせる（`shown_value`）。
- ダイアログを開いている間に分岐が解消したら、リストを隠す。
- 名前の付け方（画面の向き）は、アドオン側のリファレンスの対応表が正。ラベルの翻訳は `ja.OTRP.tab` に足す。

### テスト

- `tests/automated-tests/tests/test_switch_image_override.nut`: 範囲外・使えない選択の拒否、標準・状態 1・状態 2 の絵が別になること、隣を建てても固定が残ること、十字になる・戻すと自動に戻ること。
- スクリプトからは保存もロードもできない。ロードの確認は、人がゲームで保存してロードし直す。

## 本体改修で踏んだ落とし穴

- 検証用の実行ファイルを `USE_ZSTD = 1` でビルドすると `libzstd.dll` を動的に読む。検証用のフォルダに無いと起動できない（MSYS2 の mingw64 の `bin` から DLL をコピーした）。
- air の `system_type` は 0 = 誘導路、1 = 滑走路。滑走路は T字を作れない（`bauer/wegbauer.cc`）ので、分岐の絵は十字にだけ使われる。
- 電線は `leitung_t` で `weg_t` ではないので、この機能の対象外。
- 選択肢の番号と絵の対応は、実際に描かれるカーブで決める。隣のタイルの向きで名前を付けると、画面のカーブと逆になる。

## 確かめた場所

- OTRP `feature/switch-image-override`（コミット `6ddabcb5c` まで）、`boden/wege/weg.cc`・`weg.h`・`schiene.cc`、`simtool.cc`、`gui/ground_info.cc`（2026-11-15）
- ゲームでの確認: 選択・ダイアログ・保存→ロード・形の変化で自動に戻ること（rail の実アドオンと、単色の検証用アドオンによる road・water・air・ex。2026-11-14〜15）

## 状況

- `128na/simutrans` の PR は閉じ、フォーク元への PR #810 にまとめた。レビュー待ち。
- ex 画像の dat のキー名は正式には決まっていない（今の makeobj は書けない）。
