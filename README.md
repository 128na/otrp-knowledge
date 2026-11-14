# otrp-knowledge

OTRP（[teamhimeh/simutrans](https://github.com/teamhimeh/simutrans)）の実装や知見をメモするところ。

- 公開サイト: <https://128na.github.io/otrp-knowledge/>
- OTRP の仕様は [OTRP wiki](https://github.com/teamhimeh/simutrans/wiki/OTRP-Home) が正。ここには、wiki に足りないことと、wiki に載せるほどでもない細かい知見だけを書く。

## 構成

| 場所 | 内容 |
|---|---|
| `docs/spec/` | 仕様の補足 |
| `docs/tips/` | Tips |
| `docs/dev/` | 開発 |
| `docs/wiki-index.md` | wiki のページ一覧 |
| `docs/contributing.md` | 書き方（ページの足し方・ひな形） |
| `docs/.vitepress/config.mts` | サイトの設定。目次はフォルダの中身から自動で作る |
| `.github/workflows/deploy.yml` | `main` への push でサイトを作って GitHub Pages に公開する |

## 手元で見る

Node.js 20 以上が要る。

```bash
npm install
```

```bash
npm run dev
```

## 公開

`main` に push すると GitHub Actions が [VitePress](https://vitepress.dev/) でサイトを作り、GitHub Pages に公開する。リポジトリの Settings → Pages の Source は「GitHub Actions」にしておく。
