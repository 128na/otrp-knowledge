import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type DefaultTheme } from 'vitepress'

const docsDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const repo = 'https://github.com/128na/otrp-knowledge'
const wiki = 'https://github.com/teamhimeh/simutrans/wiki/OTRP-Home'

// 分類。フォルダを足したらここに 1 行足す。ページはフォルダに .md を置くだけで目次に載る。
const sections = [
  { dir: 'spec', text: '仕様の補足' },
  { dir: 'tips', text: 'Tips' },
  { dir: 'dev', text: '開発' },
  { dir: 'records', text: '記録' },
]

// ページの題名は、最初の「# 見出し」から取る。無ければファイル名。
function titleOf(file: string, fallback: string): string {
  const m = readFileSync(file, 'utf8').match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : fallback
}

function pagesOf(dir: string): DefaultTheme.SidebarItem[] {
  return readdirSync(join(docsDir, dir))
    .filter((f) => f.endsWith('.md') && f !== 'index.md')
    .sort()
    .map((f) => {
      const name = f.replace(/\.md$/, '')
      return { text: titleOf(join(docsDir, dir, f), name), link: `/${dir}/${name}` }
    })
}

const sidebar: DefaultTheme.SidebarItem[] = [
  ...sections.map(({ dir, text }) => ({
    text,
    link: `/${dir}/`,
    collapsed: false,
    items: pagesOf(dir),
  })),
  {
    text: 'このサイトについて',
    items: [
      { text: 'wiki のページ一覧', link: '/wiki-index' },
      { text: '書き方', link: '/contributing' },
    ],
  },
]

export default defineConfig({
  lang: 'ja-JP',
  title: 'OTRP Knowledge',
  description: 'OTRP（Simutrans の改造版）の wiki に載っていない仕様の補足と Tips',
  // GitHub Pages のプロジェクトサイト（https://128na.github.io/otrp-knowledge/）で配信する。
  base: '/otrp-knowledge/',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      ...sections.map(({ dir, text }) => ({ text, link: `/${dir}/` })),
      { text: 'OTRP wiki', link: wiki },
    ],
    sidebar,
    socialLinks: [{ icon: 'github', link: repo }],
    editLink: {
      pattern: `${repo}/edit/main/docs/:path`,
      text: 'このページを GitHub で編集する',
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '検索', buttonAriaLabel: '検索' },
          modal: {
            noResultsText: '見つかりませんでした',
            resetButtonTitle: '消す',
            footer: { selectText: '開く', navigateText: '移動', closeText: '閉じる' },
          },
        },
      },
    },
    outline: { level: [2, 3], label: 'このページの目次' },
    docFooter: { prev: '前のページ', next: '次のページ' },
    lastUpdated: { text: '最終更新' },
    darkModeSwitchLabel: '表示',
    lightModeSwitchTitle: '明るい表示にする',
    darkModeSwitchTitle: '暗い表示にする',
    sidebarMenuLabel: 'メニュー',
    returnToTopLabel: '先頭へ戻る',
    externalLinkIcon: true,
  },
})
