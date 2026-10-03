# 赤べこと車箪笥: PixelLab の 8 方向の物と動き(2026-10-03)

- 赤べこ: object e15b6b8c-f375-492f-8ef9-055492cf76d4(参考の絵 = 初稿の akabeko.png)。動き「drive」(走る、首がゆれる)を南・東・北・西に 7 コマ
- 車箪笥: object 3f2c05d2-6e0b-4790-82af-812fcfea561a(参考の絵 = 初稿の tansu.png)。動き「idle」(エンジンでゆれる)を南・東・西に 5 コマ
- 取り出し: 絵の置き場(backblaze)はこの環境から通らないので、API の書き出し `GET /v2/objects/{id}/spritesheet`(zip)から取る(`*_sheet.png`、`*_layout.json`)
- ゲームの向きとの対応(D120 の読み): 赤べこはそのまま。車箪笥は PixelLab の南 = 西へ走る(引き出しの面、左に STP)、東へ = その左右反転、こちらへ = PixelLab の東(STP とナンバーの短い面)、向こうへ = PixelLab の西
- 見本: `preview.gif`(マップの上で 4 方向)、`frames.png`(全コマ)
- ぼぎカー: 1 回目 ff206967…(横の下絵を南として回され、東が箱型にくずれた)。2 回目 c2055184…(1 回目の南東の絵を参考にした)は 8 方向とも厚い波の形がそろった。高い(目穴の)はしは PixelLab の西の絵で右 → ゲームの東 = PixelLab の西
