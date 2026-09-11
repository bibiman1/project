# フクリン表示テスト GitHub Pages版

## 内容
HubSpotカスタムモジュールのHTML、CSS、JavaScriptを、GitHub Pagesで単独動作する形式へ変換した試作です。

## ファイル
- index.html: 単独ページとCanvas要素
- style.css: テストページとフクリン表示位置
- script.js: スプライトアニメーション
- assets/fukurin_sprite_sheet_v2.png: 8列×5行のスプライト画像

## GitHubへの配置
ZIPを展開し、フォルダー一式を `project/fukurin/` としてアップロードしてください。

公開URLの形式:
`https://bibiman1.github.io/project/fukurin/`

## 変換内容
- 貼り付け時に混入したHTMLエンティティ、リンクタグ、brタグを除去
- HubSpot Filesの画像URLをローカル相対パスへ変更
- ID依存をクラスとdata属性へ変更
- CSSを `.fukurin-module` 配下へ限定
- JavaScriptをモジュール単位の初期化関数へ変更
- 待機・お辞儀を1.2秒維持するよう補正
- 狭い画面で座標が負になる問題を補正

## HubSpotへ戻す場合
- index.html内の `.fukurin-module` 部分をmodule.htmlへ移す
- style.cssの `.fukurin-module` 関連部分をmodule.cssへ移す
- script.jsをmodule.jsへ移す
- `.demo-page` と `.demo-card` はテストページ用なので移植しない
