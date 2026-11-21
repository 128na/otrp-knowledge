# スクリプトからのセーブ（world.save_game）

> 関連する wiki: [MCP-Server](https://github.com/teamhimeh/simutrans/wiki/MCP-Server)（`run_squirrel` の使い方）

スクリプトから任意の名前でセーブする `world.save_game(name)` の仕様と、実装・検証で分かったことをまとめる。実装は PR [teamhimeh/simutrans#812](https://github.com/teamhimeh/simutrans/pull/812)（2026-11-15 時点で CI 確認待ち）。確認の経緯は[記録](../records/2026-11-15_script-save-game.md)にある。

## 要点

- `world.save_game(name)` は `save/<name>.sve` に保存する。保存は autosave と同じ silent（ダイアログ無し）。
- 成功すると `null`、失敗すると理由の文字列を返す。名前が文字列でないときだけ例外になる。
- 名前は**検証するだけで書き換えない**。不正なら何も書かない。
- 専用の起動オプションは無い。シナリオ・AI・ツールのスクリプトと MCP の `run_squirrel` から呼べる。
- ネットワークゲームでも制限は無い。サーバー・クライアントのどちらでも、画面からの保存と同じ `karte_t::save` を通る（クライアントの保存はローカルの写しになる）。
- 既存の読み取り専用ファイルは上書きせず、エラーを返す。

## 名前の検証

`utils/save_filename.cc` の `is_valid_script_save_name`。Windows・macOS・Linux のどれでも安全な名前だけを通す。次を拒否する。

| 種類 | 拒否するもの |
|---|---|
| 長さ | 空、128 バイト超（`.sve` は別） |
| 文字コード | 不正な UTF-8（過長形式、サロゲート、U+10FFFF 超え、5 バイト形式） |
| 制御文字 | C0（NUL 含む）、DEL、C1、ソフトハイフン、ゼロ幅文字、行・段落区切り、双方向制御文字、BOM、私用領域、非文字 |
| パス | `/ \ : * ? " < > \|`、先頭のドット（`.`・`..` を含む）、先頭・末尾の空白、末尾のドット |
| Windows の予約名 | `CON PRN AUX NUL CONIN$ CONOUT$ CLOCK$ COM0-9 LPT0-9`。大文字小文字を問わず、拡張子や空白が付いても拒否 |

日本語・絵文字・結合文字など、正しい UTF-8 は通す。区切り文字を一切通さないので、保存先の `save/` の外には出られない（ディレクトリトラバーサルの対策はこれで足りる）。

## 実装で気を付けること

- **Squirrel の文字列は NUL を含められる。** `const char*` で受けると `ok\0evil` が `ok` に切り詰められ、検証を通ってしまう。`sq_getstringandsize` で長さごと受け取り、全体を検証する。
- **`karte_t::save` は成否を `bool` で返す。** 元は `void` で、置き換え（`dr_rename`）の失敗を無視して成功ダイアログを出していた。
- **Windows では読み取り専用の相手に rename できない。** `MoveFileEx` が失敗し、一時ファイル `.sv_` が残ったまま「保存しました」と出ていた。POSIX の `dr_rename` は `remove` してから `rename` するので、読み取り専用でも黙って置き換わる。OS で動作が分かれるため、`karte_t::save` の先頭で「既存で、追記で開けないファイルは書き込む前に拒否」に統一した（`dr_fopen(filename, "ab")` で判定）。置き換えに失敗したときと、書き込みに失敗したときは `.sv_` を消す。この修正は画面からの保存にも効く。
- **スクリプトだけ制限しない。** 画面からの保存（`gui/loadsave_frame.cc`）も、クライアントでも同じ `karte_t::save` を呼び、ネットワークかどうかの判定が無い。最初の版は「サーバー上のスクリプトだけ可、クライアントと MCP は不可」にしていたが、レビューの指摘で外した（`script_vm_t::from_mcp` も戻した。2026-11-21）。
- **登録は `STATIC register_function(vm, fn, "save_game", 2, ".s")`。** `if (scenario)` の外に置くと、AI・ツール・MCP の VM にも出る。`world_create_player` などは `if (scenario)` の中にあり、シナリオ専用。
- **新しい C++ ソースは 2 か所に登録する。** `Makefile` と `Simutrans-Main.vcxitems`（`ClCompile` と `ClInclude`）。`cmake/SimutransSourceList.cmake` は管理対象外なので足さない（足した PR は、fork 元の contributor から外すよう求められた）。

## テスト

- `tests/test_save_name.py`（`tests/save_name_test.cc`）: 検証関数だけを単体で確かめる。ゲーム本体もパックセットも要らない（`python tests/test_save_name.py --cxx g++`）。受理・拒否の例に加え、短い組み合わせを総当たりして「通った名前に区切り文字が無く、先頭がドットでない」ことを確かめる。
- `tests/automated-tests/tests/test_save_game.nut`: ゲーム側の戻り値を確かめる（9 件）。
- Squirrel からはファイルの有無を見られない。読み取り専用ファイルの拒否だけは、`tests/run-automated-tests.sh` が `save/` に固定のファイルを読み取り専用で用意し、実行後に「中身が変わっていない」「`.sv_` が残っていない」を確かめて後始末する（`test_file_base` が `test_save_game` のときだけ）。
- 修正前のバイナリでこのテストが失敗し、修正後に合格することを確かめてある。

## 検証の環境で引っかかったこと

- **共有の検証用フォルダの `script/` が、別ブランチの版のことがある。** `scenario_base.nut` の `is_tool_allowed` が引数 5 個を期待するのに、ビルドは 4 個しか渡さず、シナリオ中のツール操作で「wrong number of parameters: 4 provided (instead 5)」が出た。ビルドの元のブランチの `simutrans/script/` に合わせれば直る。別ブランチの exe で検証するときは戻す。
- **シナリオの検証スクリプトで `gui.add_message` を使うと、`script_compat.nut` の版によっては「Called tool with player == null」で失敗する。** 結果は `print` と、`get_info_text` から返す文字列で見るのが確実。
- **自動テストをネットワークモードで動かすには、`SIM_BINARY` に `-server <port>` を足して起動する小さな wrapper スクリプトを指す。** `run-automated-tests.sh` は引数を固定で渡すため。
- **ネットワークの手動確認の起動方法。**
  - サーバー: `-load <保存名> -server <port>`
  - クライアント: `-load net:127.0.0.1:<port>`（`-server host:port` では参加できず、新しいサーバーが立つ）
  - どちらにも `-mcp-port` を付けると、`run_squirrel` で状態を見られる。サーバーが読み込みを終える前にクライアントを起動すると「Server did not respond!」になるので、少し待つ。
- **CI の自動テストには、実行ごとに結果が変わる失敗がある。** `test_remove_house_one_click` が `get_current_maintenance() == 0`（`2720 == 0`）で 1 回だけ落ちたが、同じテストは前の実行では合格しており、この変更とは関係が見えない。fork 元の管理者権限が無いと、失敗したジョブを再実行できない。

## 確かめた場所

- OTRP `feature/script-save`（`OTRP-KUTAv6` から分岐、2026-11-15）の `script/api/api_world.cc` の `world_save_game`、`simworld.cc` の `karte_t::save`、`utils/save_filename.cc`、`network/mcp_tools.cc`、`script/script.h`。
- 検証は Windows（MinGW・GDI 版）で行った。Linux・macOS の実機では確かめていない（CI のビルドとテストは通っている）。
