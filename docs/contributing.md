# 書き方

## 何を書くか

- OTRP の仕様は [OTRP wiki](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home) が正です。wiki にある内容は書き写さず、リンクします。
- ここに書くのは、wiki に足りないことと、wiki に載せるほどでもない細かい知見です。
- 確かめたことには、確かめた場所（ソースのファイルと関数、ゲームのバージョン）と日付を付けます。推測は推測と書きます。
- 個人の環境の絶対パスや、検証用の保存データ・実行ファイルは入れません。

## ページを足す

1. 分類のフォルダに Markdown を 1 つ置きます。ファイル名は英小文字とハイフンにします（URL になります）。

   | フォルダ | 内容 |
   |---|---|
   | `docs/spec/` | 仕様の補足 |
   | `docs/tips/` | Tips |
   | `docs/dev/` | 開発 |
   | `docs/records/` | 記録（その時点の確認結果・経緯。書いたら変えない） |

2. 1 行目に `# 題名` を書きます。これが目次（サイドバー）の表示名になります。目次はファイル名の順に並びます。
3. `main` に入ると、GitHub Actions がサイトを作り直して公開します。

分類を増やすときは、フォルダと `index.md` を作り、`docs/.vitepress/config.mts` の `sections` に 1 行足します。

## ページのひな形

```md
# 題名

> 関連する wiki: [ページ名](https://github.com/teamhimeh/simutrans/wiki/...)

## 要点

結論を先に書く。

## 詳細

確かめた内容。

## 確かめた場所

- OTRP v64.3、`ファイル名` の `関数名`（2026-11-14）
```

画像はページと同じフォルダの `images/` に置き、`![説明](./images/名前.png)` で貼ります。

## 手元で見る

Node.js 20 以上が要ります。

```bash
npm install
```

```bash
npm run dev
```

公開と同じ形で確かめるときは `npm run build` のあと `npm run preview` を使います。リンク切れがあると `build` が失敗します。
