# OTRP-KUTAv6 の基準状態と、Windows 配布ビルドの FreeType の件（2026-10-23）

GitHub issue `128na/simutrans#1`・`#2`（開発メモ、2026-10-22〜23 に作成）の内容を、2026-11-14 にここへ移して issue を閉じた。
この記録はその時点で確かめたことで、書いたら変えない。今も使う決まりは [開発 / ビルドとテスト](../dev/build.md) にある。

## 1. 基準にした状態（issue #2）

`OTRP-KUTAv6` の `002e51b3238010d429790800693ecf2817ca81f3`（ソース上 OTRP 62.4）。PNG 高さマップ出力の機能を足す前からある問題と、新しい退行を分けるために確かめた。

- Windows GDI 版の Make でビルドできた（MinGW、`make -j8`）
- `python tests/test_keybindings_unicode.py --cxx g++` は成功
- 次のシナリオ 4 件は成功。PNG の機能を足した後も同じ 4 件が成功した
  - `test_slope_set_near_map_border`
  - `test_slope_set_and_restore`
  - `test_slope_max_height_diff`
  - `test_gui_accessibility_windows_and_components`
- `test_terraform_raise_lower_land` と `test_terraform_raise_lower_land_at_map_border` は変更の前から失敗していた（`null == "Zu nah am Kartenrand"` の期待値の不一致）。
  どちらも `tests/automated-tests/all_tests.nut` の `failing_tests` に登録済みで、直していない
- 全テストの成功を確かめた記録ではない
- CMake は、構成時に `gui/components/gui_schedule.cc` が無いとして失敗した。`cmake/SimutransSourceList.cmake` が実ファイルと合っていない。
  PNG 出力は Make でビルド・検証した。新しいソースは CMake の一覧にも足したが、一覧全体は直していない
- `tests/README.txt` は CI の分割数を 10 件としていたが、workflow は 20 件だった
- このときはブランチの push だけを行い、PR は延期した。Actions はタグの push・PR・手動実行が対象で、ブランチの push では動かなかった

## 2. Windows 配布ビルドの FreeType（issue #1）

PNG 高さマップ出力の開発中に分かった。

- 最初の検証用 exe は `USE_FREETYPE=0` だった。古いテスト用のフォルダは bitmap フォントを持っていたので起動できたが、
  利用者の本家 125.0.1 の配布環境には `font/` が無く、`No fonts found!` で止まった
- `USE_FREETYPE=1` で作り直すと、125.0.1 由来のデータ・古いフォントなしの環境で起動できた。
  `C:\Windows\Fonts\YuGothR.ttc` の読み込み、日本語の表示、PNG の保存まで確かめた
- 利用者からも、直した版で起動とマップの出力ができたと報告があった。フォントの追加ではなく、ビルド設定の修正で解消した
- `tests/heightmap-export.md`（検証ガイド）にも、この確認を足した

### このときの環境づくり

- 手元の MSYS2 には g++・CMake・Ninja はあったが GNU Make が無かった。MSYS2 の Make パッケージを作業フォルダに展開して使い、システムには入れなかった
  （2026-11-14 の時点では `C:\msys64\usr\bin` に Make がある）
- `mirror.msys2.org` から選ばれたミラーが 403 を返したので、`repo.msys2.org` から取った
- FreeType の開発パッケージも無かったので、`VER-2-14-3`（`0a0221a1347e2f1e07c395263540026e9a0aa7c7`）を作業フォルダで静的ビルドした。
  Harfbuzz・Brotli・PNG・BZip2・Zlib への外部依存を無効にした構成で、Windows の TTC/TTF の読み込みは確かめた
- 作った exe・ライブラリ・取得したテストデータ・個人の絶対パスはブランチに入れていない

関連する実装: `128na/simutrans` の `7bc836f48d9d539801de8df696ea0fda9486a5a1`
