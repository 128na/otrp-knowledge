# 互換性とバージョン

> この内容は、OTRP の PR とリリースノートの記述から拾い、OTRP v63_4 のソースコードと照らし合わせたものです（2026-11-21）。ゲームを動かしての確認はしていません。仕様は [OTRP wiki](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home) が正です。

本家（standard）のセーブデータ・pak・makeobj をどの版まで読めるか、OTRP のセーブを旧版形式で保存できるか、ネットワークゲームの互換性、要注意の版、配布バイナリの形態をまとめる。版ごとの変更の一覧は「リリースの早見表」を参照。

## 本家のセーブデータ・pak の読み込み

### 本家セーブデータの読込範囲と保存

本家のセーブデータは、次の版から読める。書き出しは本家 122 形式（「Readable by standard」）のままで、本家の新しい形式では書き出せない。

| OTRP の版 | 読める本家のセーブデータ |
|---|---|
| v51 | standard 124.3.1 まで |
| v54_0_1 | 124.4 |
| v63_0_1 | 125.0.1 |

- v51 のリリースノートに「保存はできません。一部情報は互換性が無いため失われます」とある。
- 124.3.1 の読み込みでは、仕様が変わった一部の変数はデータを破棄するか OTRP 用のデータに変換する。動作確認は、産業・市あり、列車走行中の 124.3.1 データ。
- v63_4 のソースでは、セーブデータの版が本家形式の 125.6 より新しいもの、または OTRP の版が v63 より新しいものは読み込まず、「互換性が無いため、ロードできません。」と表示する。この上限が本家のどの版に当たるかは、コードでは確かめていない。
- 本家が保存した `settings.xml`（設定ファイル）は OTRP では読めず、起動時に削除される。
- v51_1 から Windows 等でシステムフォントを読むため、`font` フォルダを無効にした Win11 でも起動できる（124.3.1 の環境のまま OTRP を起動できるようにするため）。指定のフォントが読めないときはシステムのフォント、それも無ければ内蔵フォントの順に試す。
- v52_1 で、124.3.1 の既定の pakset インストール先（Windows は `C:\ProgramData\Simutrans`）の pakset も読める。
- 出典: [#305](https://github.com/teamhimeh/simutrans/pull/305)（2026-01-31 マージ）、[#347](https://github.com/teamhimeh/simutrans/pull/347)（2026-02-06 マージ）、[#770](https://github.com/teamhimeh/simutrans/pull/770)（2026-11-01 マージ）、リリース v51、v51_1、v52_1、v54_0_1、v63_0_1
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（124.3.1 まで概要のみ / 124.4・125.0.1 は記載なし）

**wiki との違い:** OTRP-Home は「v51 では 124.3.1 の pakset・セーブのロードに対応」までで、124.4（v54_0_1）と 125.0.1（v63_0_1）への対応は載っていない。リリースノート側が新しい。

### 電力単価の入力単位の変更（v54_0_1）

124.4 のセーブデータを読むため、電力単価の入力値を「1MW あたりのクレジット」から「1クレジットを得られる kw」（本家と同じ単位）に変更した。旧単位の値は、OTRP v51〜v53 のセーブを読むときだけ読み替えて使う。

- 出典: [#454](https://github.com/teamhimeh/simutrans/pull/454)（2026-04-11 マージ）、[#482](https://github.com/teamhimeh/simutrans/pull/482)（2026-04-29 マージ）、[#476](https://github.com/teamhimeh/simutrans/pull/476)（2026-04-22 マージ。`settings_t::rdwr()` の不具合でセーブできなかった修正）、リリース v54_0_1
- 関連する wiki: 記載なし

### makeobj の版と読める pak

| OTRP の版 | 読めるもの |
|---|---|
| v44_4 | dat の sint64 整数型（cost と maintenance を sint64 化。standard 124.3.1 用の最新 makeobj で作った pak） |
| v54_0_1 | makeobj 60.9 のアドオン、Extended 用の pak ファイル |
| v55_9 | makeobj 60.11 のアドオン。産業の発電所フラグに対応 |
| v60_0_1 | 60.11 の一部 pak が読めない不具合を修正（橋の `clip_below` を読めなかった） |
| v62_3 | makeobj 60.12（125.0 相当）のアドオン |
| v62_4_1 | 60.12 で追加された建物の `height clearance` 機能を有効化 |
| v63_3 | 60.12 で追加された斜め方向の信号画像 |

- Extended 用 pak は読み込めるだけで、Extended の拡張機能は使えない。
- makeobj 60.9 で追加された `clip_below` に対応し、表示設定の「高架下の道の描画を省略(Clip below elevated ways)」で「省略しない」「全て省略」「アドオンの設定を使用」を選べる。アドオン側の設定は way と橋が持つ。pak128 Nightly 2026-04-04（124.4 用）が読めることを作者が確認している。
- 建物の `height clearance`（#696）: 建物アドオンに上空の高さ制限を設定でき、制限より低い高架線は建物の上に建設できない（制限と同じ高さなら建設できる）。逆に、建物を建てるとき、真上から制限の段数までの間に高架や橋があると建設できない。未設定のアドオンは建物画像の高さ等から自動算出される。
- 斜め信号画像（#809）: 斜めタイルでは、way に diagonal 設定がなくても信号が斜めに表示されることを作者が確認した。直角のカーブタイルと直線タイルは従来どおり。
- 産業の発電所フラグ（#566）は、pak ファイル側で設定できる。フラグが設定されていない（旧来の）産業は、wiki にあるとおり産業名の末尾が `kraftwerk` か `Power Plant` であれば発電所として扱う。フラグのキー名は確かめられなかった。
- OTRP のソースに含まれる makeobj は、上の `clip_below`・`height clearance`・斜めの信号画像・発電所フラグを pak に書き出す処理を持たない。これらを使うアドオンは、本家の新しい makeobj で作る。
- 出典: [#86](https://github.com/teamhimeh/simutrans/pull/86)（2025-07-10 マージ）、[#455](https://github.com/teamhimeh/simutrans/pull/455)（2026-04-11 マージ）、[#464](https://github.com/teamhimeh/simutrans/pull/464)（2026-04-18 マージ）、[#566](https://github.com/teamhimeh/simutrans/pull/566)（2026-06-27 マージ）、[#695](https://github.com/teamhimeh/simutrans/pull/695)（2026-08-13 マージ）、[#771](https://github.com/teamhimeh/simutrans/pull/771)（2026-10-18 マージ）、[#696](https://github.com/teamhimeh/simutrans/pull/696)（2026-10-24 マージ）、[#809](https://github.com/teamhimeh/simutrans/pull/809)（2026-11-12 マージ）、リリース v44_4、v54_0_1、v55_9、v60_0_1、v62_3、v62_4_1、v63_3
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（v54 の makeobj 60.9 と Extended 用 pak までは記載あり / 60.11 以降は記載なし）

**wiki との違い:** OTRP-Home は「v54 以降は makeobj 60.9 の pak と Extended 用 pak を読める」までで、60.11（v55_9）・60.12（v62_3）は載っていない。

### 古い pak・アドオンの扱い（v50、v50_5）

- v50: 路面軌道（`tram_track`）属性の wayobj と roadsignal のアドオンは、pak 読み込み時に鉄道（`track`）属性に読み替える。路面軌道の wayobj・roadsign は route 計算ができず、設置できない・連続設置でクラッシュするバグがあったため。
- v50_5: 緩急坂の導入前のアドオンや、古い makeobj で作った pak（112.3 以前用）を、緩坂・急坂の両方に設置できる。
- 出典: [#248](https://github.com/teamhimeh/simutrans/pull/248)（2026-01-03 マージ）、[#316](https://github.com/teamhimeh/simutrans/pull/316)（2026-01-27 マージ）、リリース v50、v50_5
- 関連する wiki: 記載なし

## OTRP のセーブデータと版の混用

### 旧版（v54 まで）の形式で保存する

OTRP のセーブを、少し前の版の形式で保存できる（v55_3）。保存時に選ぶ。

- 戻せるのは v54 まで。v55 以降に追加された機能の情報は保存されない。
- 選択肢は保存ウィンドウのコンボボックスにある（上から「v63 (現在のバージョン)」、v62〜v54、最後に standard 用の「Readable by standard.」）。
- 抑止状態の編成がいる状態で v54 形式で保存するとデータが壊れる不具合があり、v55_6_1 で修正した。v54 形式で保存した場合、抑止の情報は破棄される（抑止中の編成は、旧版にもある別の状態に置き換えて保存される）。
- v55_6_1 では、新しい版で作ったマップを終了したあと、古い版を起動する、または古い版でセーブデータをロードすると fatal error になる問題も修正した。新しい版のセーブデータを開こうとすると、クラッシュせず「互換性が無いため、ロードできません。」の警告が出て読み込まれない。新しい版の `settings.xml` はスキップされ、既定値で起動する。作者が linux SDL2 版で確認している。
- 出典: [#535](https://github.com/teamhimeh/simutrans/pull/535)（2026-05-28 マージ）、[#559](https://github.com/teamhimeh/simutrans/pull/559)（2026-06-02 マージ）、[#560](https://github.com/teamhimeh/simutrans/pull/560)（2026-06-06 マージ）、リリース v55_3、v55_6_1
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（「Readable by standard」のみ。v54 形式での保存は記載なし）

### 会社数 63 社と旧版での保存（v59_0_2）

会社数の上限を 63 社（有効な番号は 0〜62）に増やした。

- 16 番目以降の会社がある状態で、v58 以前の形式（v54〜v58、または standard 用）を選んで保存する場合の扱い: ローカルでは、それらの会社が会社 0 に統合される（取り消せない）。統合する前に、SHIFT を押しながらもう一度保存ボタンを押す確認がある。作者が確認している。追加した会社を含む保存・ロードは v58 以降で確認済み。
- ネットワークモードで 16 番目以降の会社がある状態では、古い形式を選んでも「プレイヤーが16社以上存在するため、選択した古い形式では保存できません。代わりに現在の形式で保存します。」と表示され、現在の形式で保存される。16 番目以降の会社が無ければ、ネットワークモードでも古い形式で保存できる。
- ネットワークのパスワード解除、駅の接続会社の記録などを 64 ビットの値に拡張した。
- v62_2 で `nettool` を 15 より大きい会社に対応させた（パスワードの設定・解除ができない問題の修正）。必要なら `nettool` をソースからビルドし直す。
- v62_3: 63 社目などの会社番号が大きい会社でプレイヤーカラーが不正な値になり、色の変更ウィンドウでクラッシュする問題を修正した。ロードしたファイルのプレイヤーカラーが不正なら、ロード時に上書きする。
- v63_0_1: 会社ごとの編成数を数え直す。譲渡や会社合併で編成数が更新されていなかったため、v62 以前のデータをロードするときに再カウントする。
- 作者は画像のプレイヤー別キャッシュによる RAM 増加を懸念して一度 v59 以降へ延期し、その後「画像キャッシュを減らした」としてマージした。
- 出典: [#613](https://github.com/teamhimeh/simutrans/pull/613)（2026-08-09 マージ）、[#691](https://github.com/teamhimeh/simutrans/pull/691)（2026-08-09 マージ）、[#759](https://github.com/teamhimeh/simutrans/pull/759)（2026-10-12 マージ）、[#769](https://github.com/teamhimeh/simutrans/pull/769)（2026-11-01 マージ）、[#773](https://github.com/teamhimeh/simutrans/pull/773)（2026-10-18 マージ）、リリース v59_0_2、v62_2、v62_3、v63_0_1
- 関連する wiki: 記載なし

### 旧版で保存すると読めなくなる機能

- 同じ waytype の重ならない斜めタイルを同じタイルに 2 種類置く機能（v62_0_3）を使ったマップは、古い版で保存すると「踏切アドオン不足」でセーブデータが読めなくなる。
- 編成・路線・駅の最大数を 65534 から 32 ビット整数の範囲に引き上げた（v55_0_3）。
- コードでは確かめていない。
- 出典: [#738](https://github.com/teamhimeh/simutrans/pull/738)（2026-09-19 マージ）、リリース v62_0_3、v55_0_3
- 関連する wiki: 記載なし

### v51 のネットワーク／ローカル共用セーブ（v52 で修正）

v51 で保存したデータは、ネットワークモードとローカルモードで共用できなかった。ゲーム速度（速度倍率と固定速度の設定）の読み書きが、セーブファイルの版ではなく実行モード（ネットワークモードか）に依存していたため、ネットワークモードで保存したデータを非ネットワークモードで読むと 5 バイトずれて壊れた。

- v52 での扱い: v51 のデータは、v51 で保存したときと同じモードでロードし、その後 v52 として保存すればどちらのモードでも使える。ローカルモードでもゲーム速度が保存されるようになった。
- PR の議論では、非ネットワークモードのロード時にゲーム速度を読むべきでないとして、ダミー値を読み書きする案が出た。v63_4 では、v51 のデータはネットワークモードでロードするときだけゲーム速度を読み、v52 以降のデータはモードに関係なく読み書きする。
- 出典: [#378](https://github.com/teamhimeh/simutrans/pull/378)（2026-02-14 マージ）、リリース v52
- 関連する wiki: 記載なし

### 反転編成のオフセットのセーブと同期（v56）

`reverse_base_offset`（反転編成の描画オフセット）は、サーバーとの同期が要るためセーブデータにも書く。保存時は常に記録する。

- ロード時は原則として `simuconf.tab` の値を使う。ネットワークのクライアントとして接続するときだけ、サーバー側（セーブ側）の値に同期する。
- この値を持たない旧セーブも読める。
- 出典: [#599](https://github.com/teamhimeh/simutrans/pull/599)（2026-07-08 マージ）、リリース v56
- 関連する wiki: [編成反転機能-連結親子関係反転機能-reverse-convoy---reverse-convoy-coupling](https://github.com/teamhimeh/simutrans/wiki/%E7%B7%A8%E6%88%90%E5%8F%8D%E8%BB%A2%E6%A9%9F%E8%83%BD-%E9%80%A3%E7%B5%90%E8%A6%AA%E5%AD%90%E9%96%A2%E4%BF%82%E5%8F%8D%E8%BB%A2%E6%A9%9F%E8%83%BD-reverse-convoy---reverse-convoy-coupling)（simuconf.tab での設定方法のみ）

### pak の貨物を増減してもセーブの設定がずれない（v56）

以前は、所要時間ベース経路検索の貨物ごとのフラグを、貨物名を参照せずに並び順のまま保存していた。このため pak に貨物を追加・削除するとインデックスがずれ、貨物の経路検索方法が意図せず変わった。v56 で、フラグがオンの貨物の名前を保存する形にした。

- 記録済みの貨物が pak に無い場合は、その設定は無効になる。新しく追加された貨物は、フラグが初期化され所要時間ベースにならない（`false`）。
- 出典: [#634](https://github.com/teamhimeh/simutrans/pull/634)（2026-07-08 マージ）、リリース v56
- 関連する wiki: [所要時間ベース旅客経路探索について](https://github.com/teamhimeh/simutrans/wiki/%E6%89%80%E8%A6%81%E6%99%82%E9%96%93%E3%83%99%E3%83%BC%E3%82%B9%E6%97%85%E5%AE%A2%E7%B5%8C%E8%B7%AF%E6%8E%A2%E7%B4%A2%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6)（v55_10 以前の既知バグとして記載）

**wiki との違い:** wiki は「v55 台（v55_10）以前は貨物アドオンの追加・削除でセーブの経路データが入れ替わる」と書く。v56（2026-07-08）で貨物名を保存する形に直った。

## ネットワークゲーム（NS）の互換性

- OTRP の版が違う相手との接続: v47 で、NS で OTRP のバージョン違いを警告する機能が入った。あわせてリビジョン番号を OTRP のバージョンにした。v63_4 では、サーバー一覧の「リビジョン:」が自分の版と違うと赤く表示され、「ゲームに参加」ボタンが押せなくなる（相手のリビジョンが不明のときは一致とみなす）。
- 道路の属性「建物を接道しない」（v46）を追加したとき、PR 本文に「セーブデータ互換性は major version up 不要（既存変数の空きビットを使うため）。NS 互換性は下位バージョンと互換性なし」とある。
- 道路・線路などの建設ツールを `default_param`（`"way_name,overtaking_mode,street_flag,height_offset,vehicle_offset,allow_closed_diagonal"` の形式。最後の項目は省略でき、省略すると `allow_closed_diagonal` はオフ）で渡すようにした（リリース v55_0_3 の「API 関連」に #486 が載っている）。ネットワークパケットの形式が変わり、異なる版の間では接続できない（PR 本文）。
- v62_1: `-net` 引数でサーバーに接続するときに pakset の比較をしないでアクセスできた不具合を修正した。異なる pakset でのアクセスを禁止できる。
- 会社数 63 社（v59_0_2）では、ネットワークモードで 16 番目以降の会社がある状態では、古い版の形式を選んでも現在の形式で保存される（上の節を参照）。
- 出典: [#186](https://github.com/teamhimeh/simutrans/pull/186)（2025-10-21 マージ）、[#202](https://github.com/teamhimeh/simutrans/pull/202)（2025-11-21 マージ）、[#486](https://github.com/teamhimeh/simutrans/pull/486)（2026-05-04 マージ）、[#755](https://github.com/teamhimeh/simutrans/pull/755)（2026-10-09 マージ）、リリース v46、v47、v59_0_2、v62_1
- 関連する wiki: 記載なし

## 要注意の版

リリースノートが、別の版を使うよう書いているもの。

| 版 | 内容 | 使う版 |
|---|---|---|
| v51_1 | 致命的なバグがある | v51_1_1 |
| v53 | バグが多数報告されている | v53_0_2 |
| v54 仮リリース版 | セーブデータが破損する場合がある | v54_0_1 以降 |
| v55_3 | 既知のバグ: v53 からこの版まで、セーブデータのロード時に予約区間の不正な取得が起きる | v55_6_1 で信号の予約区間の不正ロードを修正 |
| v58_0_2、v58_1 | 線路予約に関するバグがある | v58_2 |
| v61_0_2 | 一部バグがある（v61_0_3 は無限ループの修正） | v61_0_4 |
| v62_4_1 | 「表示設定」ウィンドウを開くとクラッシュする | v62_4_2 |

- v62_5_1 でも「セーブデータがロードできなくなる不具合」（同じタイルに複数編成がいる状態で保存すると、編成の割り当て前の車両を処理してクラッシュしていた）を修正している（#794）。
- 出典: リリース v51_1、v53、v54_0_1、v55_3、v55_6_1、v58_0_2、v58_1、v61_0_2、v61_0_3、v61_0_4、v62_4_1、v62_4_2、v62_5_1、[#794](https://github.com/teamhimeh/simutrans/pull/794)（2026-10-31 マージ）
- 関連する wiki: 記載なし（wiki の既知バグの記載は貨物番号のずれのみ）

## 配布バイナリ

### Mac 版の配布形態の変遷

| 版 | 内容 |
|---|---|
| v40_1（2024-08-16） | app bundle 形式。notarization なし。初回は右クリックから開く |
| v40_1_1（2024-10-05） | x86_64・arm64 両対応でライブラリを static link した生の実行ファイル。Homebrew によるライブラリのインストールは不要。App bundle にすると Sequoia で起動不能になるため |
| v46（2025-10-25）以降 | Mac 版は Apple Silicon Mac でのみ動作 |
| v47_1 | 権限を修正 |
| v55_10（2026-06-30） | `.app` bundle 形式に戻る。初回のみ `xattr -dr com.apple.quarantine <app>` を実行 |
| v60_1_1（2026-09-05） | SDL3 ビルドに対応。Mac のみ配布 |
| v63_3（2026-11-12） | macOS notarization support |

- GitHub Actions の Mac ビルドは、#182 では static link を強制していた。v63_4 のビルドは static link ではなく、必要なライブラリ（SDL3・FreeType・libpng など）を `.app` の中に同梱する。Apple Silicon（arm64）向けで、Intel Mac 向けのビルドは無い。
- #807 は Mac 版の署名・notarization の CI を追加した。v63_4 では、タグ（`v` で始まる）が `OTRP-KUTAv6` ブランチの履歴上にあるときと、そのブランチでの手動実行のときに署名・notarization した `.app` を作り、それ以外（PR、ほかのブランチ、履歴上に無いタグ）は従来どおり ad-hoc 署名の `.app` になる。notarization 済みの `.app` で xattr の手順が不要になるかは、コードでは確かめていない。
- 出典: [#182](https://github.com/teamhimeh/simutrans/pull/182)（2025-10-07 マージ）、[#716](https://github.com/teamhimeh/simutrans/pull/716)（2026-08-30 マージ）、[#807](https://github.com/teamhimeh/simutrans/pull/807)（2026-11-10 マージ）、[#808](https://github.com/teamhimeh/simutrans/pull/808)（2026-11-11 マージ）、リリース v40_1、v40_1_1、v46、v47_1、v55_10、v60_1_1、v63_3
- 関連する wiki: [OTRP-Home](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home)（xattr の手順のみ）、[OTRP-Releases-(v31‐v35)](https://github.com/teamhimeh/simutrans/wiki/OTRP-Releases-(v31%E2%80%90v35))

**wiki との違い:** OTRP-Releases-(v31‐v35)（v33_2_2）は「Universal binary、Homebrew でのライブラリのインストールが必要」と書く。v40_1_1（2024-10-05）以降は Homebrew 不要の静的リンク版になり、v46 以降は Apple Silicon 専用になった。OTRP-Home の Mac の項は xattr の手順だけで、Apple Silicon 専用であることは書かれていない。

### GitHub Actions の成果物名

タグ付きコミット（例 v63_4）でビルドすると、成果物名にタグ名が付く（`sim-mac-OTRPv63_4.app`、`sim-linux-OTRPv63_4`、`sim-WinGDI64-OTRPv63_4.exe`、`sim-WinSDL3-OTRPv63_4.exe`）。Mac 版は、タグの push と手動実行（workflow_dispatch）でだけビルドされ、手動実行の成果物名は `sim-mac-OTRP_<ブランチ名>.app`（ブランチ名の `/` は `_` になる）。Pull Request では Ubuntu 版（`sim-linux-OTRP`）と Windows 版（GDI・SDL3）がビルドされ、Mac 版はビルドされない。

- 出典: [#207](https://github.com/teamhimeh/simutrans/pull/207)（2025-11-29 マージ）
- 関連する wiki: 記載なし
