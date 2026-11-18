# 画像数を増やせる条件の確認：way は固定キー、駅の建物は layouts（2026-11-18）

「`image[nse10]` のようにキーを足して、同じ方角の絵を増やせるか」を、makeobj と本体のソースで確かめた記録。書いたら変えない。

- 対象: OTRP `OTRP-KUTAv6` の `20ed2495b`（v63_3 のタグと同じコミット）
- ゲームでの動作確認はしていない。ソースを読んで確かめたもの。

## 1. 結論

- **way には、画像数をキー名で増やす抜け道が無い。** 増やすには、本体と makeobj の両方を変える必要がある。
- OTRP が駅（スロープ・斜め線のプラットフォーム）で使っているのは、building の `dims` の 3 つ目（layouts）の値で、画像の組の数を決める方式。way のキーを増やす方式とは別物。

## 2. way（`way_writer.cc`・`way_desc.h`・`way_reader.cc`）

| 項目 | 内容 |
|---|---|
| 読むキー | 固定の 26 個（`ribi_codes[26]`）。`nse`・`new`・…・`nsew` の 16 個と、`nse1`〜`nsew1`・`nse2`〜`nsew2` の 10 個 |
| 未知のキー | `image[nse10]` のようなキーは読まれず、エラーも警告も出ずに無視される |
| 枚数の決まり方 | `image[new2]` が dat に有るか無いかで、16 枚か 26 枚の二択（`way_writer.cc` の `ribinr`） |
| 本体の取り出し | キー名は見ない。リストの番号で取る。通常は ribi（0〜15）、switch は `16 + ribi_to_extra + 5 × nw`、ex は `26 + ribi_to_extra + 5 × nw`（`way_desc.h`） |
| 枚数の判定 | 16 枚を超えると switch 画像あり、26 枚を超えると ex 画像あり（`way_reader.cc`）。それ以上の段は無い |
| 範囲外の番号 | 空の絵（`IMG_EMPTY`）になる（`image_list.h` の `get_image_id`） |

- 季節別の絵（`image[nse][1]` など）は、リストを季節ごとに別に作る仕組みで、同じ方角の絵を増やすものではない。
- 36 番以降は、書いても本体が読まない。

## 3. 駅の建物（`building_writer.cc`・`building_reader.cc`・`hausbauer.cc`）

| 項目 | 内容 |
|---|---|
| dat | `dims=x,y,layouts`。layouts の数だけ絵の組を書く（`building_writer.cc`） |
| 通常の layouts | 1・2・4・8・16（駅は 16 まで）。それ以外の値は丸められ、エラーが出る |
| 特例 | 駅（`generic_stop`）だけ、48・80・112 を許す（`building_reader.cc` の `is_diagonal_supporting_station`・`is_slope_and_diagonal_supporting_station`） |
| 絵の並び | 0〜47 が平地、48〜63 が北/西の単スロープ、64〜79 が南/東の単スロープ、80〜95 が北/西の二段スロープ、96〜111 が南/東の二段スロープ（`hausbauer.cc` の `build_station_on_slope_way` の周辺） |
| 絵が無いとき | 番号が layouts を超えるなら、平地の絵に戻る。二段スロープの絵が無ければ、単スロープの絵を使う |
| 斜め線 | layouts が 48 以上の駅だけ、斜めの way に置ける（`build_station_on_diagonal_way`・`build_station_on_closed_diagonal`） |

- スロープの駅は PR #607（`0960ed57d`、"halt on the slopetile"）で入った。
- 本体は「値ごとに番号の範囲の意味を決めて、読む側が解釈する」方式。dat のキー名が枚数を決めるわけではない。

## 4. way で枚数を増やすなら

- 固定のキーを足す方式が、今の仕組みに合う。本体の取り出し（`way_desc.h`）、枚数の判定（`way_reader.cc`）、makeobj のキー（`way_writer.cc`）をそろえて変える。
- building の layouts に倣って、way に枚数の指定を足す方式もある。キーの形式から変える大きな変更になる。
- どちらも、既存の pak との互換（16 枚・26 枚の判定）を壊さないことが前提。

## 5. 確かめていないこと

- スロープ・斜め線のプラットフォームの見た目と動作（ゲームでは確かめていない）。
- way の switch 画像（[開発 / 分岐（switch）の絵の固定](../dev/switch-image-override.md)）との関係。switch 画像は way の枚数を 26 枚まで広げた仕組みで、building の layouts とは別。
