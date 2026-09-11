# ネギダック Git用モジュール

## ファイル
- `index.html`
- `style.css`
- `script.js`
- `negiduck_sprite_sheet_v4_back_negi.png`

## 配置方法
1. `negiduck` フォルダーをGitリポジトリへ追加します。
2. GitHub Pagesでは `negiduck/index.html` を開きます。
3. 既存ページへ組み込む場合は、HTML内の `.negiduck-module`、`style.css`、`script.js` を読み込みます。

## 画像
スプライト画像はフォルダー内のローカルPNGを相対パスで参照します。

- 128px × 128px / 1フレーム
- 8列 × 5行
- Row 0: 待機
- Row 1: 右向き歩行
- Row 2: 左向き歩行

