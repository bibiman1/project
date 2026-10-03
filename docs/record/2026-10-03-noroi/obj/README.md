# 赤べこと車箪笥: PixelLab の 8 方向の物と動き(2026-10-03)

- 赤べこ: object e15b6b8c-f375-492f-8ef9-055492cf76d4(参考の絵 = 初稿の akabeko.png)。動き「drive」(走る、首がゆれる)を南・東・北・西に 7 コマ
- 車箪笥: object 3f2c05d2-6e0b-4790-82af-812fcfea561a(参考の絵 = 初稿の tansu.png)。動き「idle」(エンジンでゆれる)を南・東・西に 5 コマ
- 取り出し: 絵の置き場(backblaze)はこの環境から通らないので、API の書き出し `GET /v2/objects/{id}/spritesheet`(zip)から取る(`*_sheet.png`、`*_layout.json`)
- ゲームの向きとの対応(D120 の読み): 赤べこはそのまま。車箪笥は PixelLab の南 = 西へ走る(引き出しの面、左に STP)、東へ = その左右反転、こちらへ = PixelLab の東(STP とナンバーの短い面)、向こうへ = PixelLab の西
- 見本: `preview.gif`(マップの上で 4 方向)、`frames.png`(全コマ)
- ぼぎカー: 1 回目 ff206967…(横の下絵を南として回され、東が箱型にくずれた)。2 回目 c2055184…(1 回目の南東の絵を参考にした)は 8 方向とも厚い波の形がそろった。高い(目穴の)はしは PixelLab の西の絵で右 → ゲームの東 = PixelLab の西
- ぼぎカー 第 3 版(D128、作者「よこむきの前側がなんで９０度のぜっぺきになっているのさ」): 部品の写真の輪郭から、前の縁がうしろへ流れる(へさきのような)厚みのある下絵 `docs/assets/noroi/settei/bogicar_ref2.png` を作り、PixelLab の画像編集で仕上げ(seed 7、`bogicar3_side.png`)、8 方向に回した(generate-8-rotations-v3)。1 回目(`bogicar3_rot_*`)は前後の絵が細い板になった。2 回目(`bogicar4_rot_*`、厚みを言葉で強く指示)は前後も厚い塊になった。4 方向の見本 `bogicar4_4dir.png`。残る難: こちら向き(2)で目穴が前の面に描かれた(目穴は横をつらぬく)、前後の絵で戸車が黒い
- ぼぎカー 第 4 版(作者「なおしてすすめて」): こちら向き・向こう向きを画像編集で直した(目穴を前の面から消す、戸車を白に)。背景に描かれた市松は、元の絵の形で切り抜いた。東の絵から、きーが立つ絵(ゲームのきーを重ねた)、きーが張り付く絵(のばしたきーを重ねた下絵を画像編集で仕上げ)、炎の絵(画像編集)を作った。一式 `bogicar_set_v4.png`。ゲーム用: bogicar_{east,west,south,north}.png、bogicar_east_ki.png、bogicar_east_stick_cut.png、bogicar_east_flame_cut.png
