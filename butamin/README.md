# ブタミン表示テスト GitHub Pages版

## 内容
HubSpotカスタムモジュールのHTML、CSS、JavaScriptを、GitHub Pagesで単独動作する形式へ変換した試作です。

## ファイル
- index.html: 単独ページとCanvas要素
- style.css: テストページとブタミン表示位置
- script.js: スプライトアニメーション

## GitHubへの配置
`project/butamin/`フォルダーとして、ZIPを展開した中身をアップロードしてください。

公開URLの形式:
`https://bibiman1.github.io/project/butamin/`

## 変換内容
- 貼り付け時に混入したHTMLエンティティ、リンクタグ、brタグを除去
- 重複配置に備えてID依存をクラスとdata属性へ変更
- CSSを `.butamin-module` 配下へ限定
- JavaScriptをモジュール単位の初期化関数へ変更
- 一時停止動作中に歩行用rowへ即時上書きされる問題を修正

## 画像素材
スプライト画像は `assets/piggybank_simple_sprite_sheet.png` に同梱しています。GitHub Pages版はHubSpot Filesへ依存せず単独動作します。

## HubSpotへ戻す場合
- index.html内の `.butamin-module` 部分をmodule.htmlへ移す
- style.cssの該当CSSをmodule.cssへ移す
- script.jsをmodule.jsへ移す
- テストページ用の `.demo-page` と `.demo-card` は移植しない
