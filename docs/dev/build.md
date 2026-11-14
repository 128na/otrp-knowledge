# OTRP のビルドとテストの知見

> 対象は fork の [128na/simutrans](https://github.com/128na/simutrans) の `OTRP-KUTAv6` ブランチ。本家 OTRP（teamhimeh/simutrans）で確かめたものではない。

OTRP 本体を Windows（MinGW）でビルド・テスト・配布して分かったこと。「なぜそうするか」と確かめた事実だけを書く。
各項目に確かめた日付を書く。環境やブランチが変わったら確かめ直す。文中の `simutrans/` はリポジトリのルートを指す。

GitHub issue `128na/simutrans#1`・`#2`（開発メモ）の内容をここへ移した（2026-11-14）。その時点の確認結果は
[記録](../records/2026-10-23_otrp-kutav6-baseline.md)にある。

## 1. ビルド環境（Windows・MinGW）

| こと | 中身 | 確かめた日 |
|---|---|---|
| 道具の場所 | GNU Make は `C:\msys64\usr\bin`、g++ は `C:\msys64\mingw64\bin` | 2026-11-14 |
| 実行するシェル | PowerShell から `PATH` の先頭に上の 2 つを足して `make -j8`。Git Bash から実行すると一時ファイルを作れず失敗する | 2026-11 |
| `config.default` | git 無視のファイル。無いと `make` は止まる。作り直すたびに設定（特に FreeType）を確かめる | 2026-10-23 |
| 公式 CI の Windows 設定 | `simutrans/.github/build64.sh`（`USE_FREETYPE=1`） | 2026-10-23 |
| FreeType の開発パッケージ | この MSYS2 には無い（`mingw64/include/freetype2` が無い） | 2026-11-14 |
| 出力 | `build/default/sim.exe`。実行には隣に `libpng16-16.dll` などが要る | 2026-11 |
| MSYS2 のミラー | `mirror.msys2.org` から選ばれたミラーが 403 を返したことがある。`repo.msys2.org` から取れた | 2026-10-23 |

## 2. FreeType とフォント（配布で実際に起きた問題）

- `USE_FREETYPE=0` でビルドした exe は bitmap フォントしか読めない。`font/` を持たない環境では `No fonts found!` で止まる
- **利用者の本家 125.0.1 の配布環境には `font/` が無い。** 検証用のフォルダは bitmap フォントを持っているので、そこで起動できても配布先で動く保証にならない（2026-10-23、利用者の環境で停止して分かった）
- `USE_FREETYPE=1` にすると、Windows の `C:\Windows\Fonts\YuGothR.ttc` を読んで日本語を表示できる。フォントの追加ではなく、ビルド設定で解消した
- 手元の検証用ビルドは `USE_FREETYPE = 0` で足りる（`font/` のあるフォルダで動かす）。配布用は `USE_FREETYPE=1` と `STATIC=1`

### 配布用ビルドで確かめること

1. `USE_FREETYPE=1`（公式の Windows 設定に合わせる）
2. 持ち運ぶ exe は `STATIC=1`。リンク後に `objdump -p sim.exe` の `DLL Name` を見て、MinGW や FreeType の DLL が要らないことを確かめる
3. bitmap フォント入りのフォルダだけで判断しない。最新の配布データのコピーを使い、`font/` なしで起動・日本語表示・機能の操作を確かめる

### FreeType を自前で用意したときの構成（2026-10-23）

開発パッケージが無かったので、FreeType の `VER-2-14-3`（`0a0221a1347e2f1e07c395263540026e9a0aa7c7`）を作業フォルダで静的ビルドした。
Harfbuzz・Brotli・PNG・BZip2・Zlib への外部依存を無効にした構成で、Windows の TTC/TTF の読み込みは確かめた。
公式 CI の依存の構成と同じではない。作ったライブラリはリポジトリに入れていない。

## 3. ソースの登録と CMake

- 新しい C++ ソースは `Makefile`・`cmake/SimutransSourceList.cmake`・`Simutrans-Main.vcxitems` の 3 か所に登録する。Windows 用のヘッダーの登録も確かめる
- **CMake は通らない。** 構成時に `gui/components/gui_schedule.cc` が無いとして失敗する。`cmake/SimutransSourceList.cmake` の一覧が実ファイルと合っていない（2026-10-23）。
  新しいソースは CMake の一覧にも足すが、一覧全体は直していない。CMake を使うなら、先に一覧と実ファイルの棚卸しが要る
- ビルドと検証は Make で行う

## 4. テスト

- ローカルでは影響する個別テストだけを走らせ、全件は CI に任せる
- `tests/automated-tests/all_tests.nut` の `failing_tests` に載っているテストは、元から失敗する。自分の変更による退行と区別する。
  2026-11-14 の時点で 34 件（`test_terraform_raise_lower_land`・`test_terraform_raise_lower_land_at_map_border` など）。件数は変わるのでファイルを見る
- 自動テストの実行先（`WORKDIR`）は、`font/` と pak のある検証用のフォルダにする。`test_label` が通ることを確かめた（2026-11-14）。
  テストのファイルは実行のたびに `<WORKDIR>\pak\scenario\automated-tests` へコピーされる
- sim は標準出力をファイルに向けるとまとめて書き出すので、進み具合は `<WORKDIR>\script-scenario.log` で見る（`tests/run-automated-tests.sh` の説明）
- `tests/README.txt` の CI の分割数（10 件）は、workflow（20 件）と合っていなかった（2026-10-23）。手順はコードと照らす
- キーバインドの単体テスト: `python tests/test_keybindings_unicode.py --cxx g++`

## 5. CI（GitHub Actions）

- `otrp-automated-tests.yml` は PR（opened・synchronize・reopened）と手動実行で動く。ブランチへ push しただけでは動かない（2026-11-14 に workflow で確認）
- CI は Linux（ubuntu-24.04）で、FreeType を入れてビルドする。Windows の配布ビルドの確認にはならない

## 6. GUI の確認（MCP）

- `-mcp-port` で起動し、`run_squirrel` と `capture_screen` を使う。Squirrel の戻り値だけで GUI が正しいと判断しない（画面を撮って見る）
- MCP から保存・ロード・クリックの確認は当てにしない。ゲームオプションから新規マップ作成へ移るモーダル画面で、MCP の応答が止まったことがある（2026-10-23、`128na/simutrans#3`）

## 7. 作業の前に読むもの（本体側）

- `simutrans/.agents/skills/` の `run-automated-tests`・`simutrans-mcp-gui-debug`・`simutrans-pr-manual-tests`・`simutrans-pr-review`・`fix-failing-test`
- `simutrans/documentation/coding_styles.txt` と `.editorconfig`（C++11、タブ、固定幅整数型、既存の書式）
- `simutrans/tests/README.txt`（一般の手順。上のとおり古い所がある）
