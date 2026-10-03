# PixelLab への発注(三面図の下絵から。D137)

2026-10-03 の夜、PixelLab の今月の生成回数を使い切って止まった分。残高が戻ったら、そのまま流す。

    cd docs/assets/noroi/sanmen && python3 gen_pro.py orders/orders.json orders/out

- 下絵は三面図の立体(`../*.py`)から投影した絵(`*_ref.png`、2 倍)。絵柄の見本はスタイルフレーム(`docs/assets/noroi/ad/style_frame.png`)。
- 出てきた候補は、三面図(`../out/sanmen_*.png`)と部品を一つずつ照らす。合わないもの、設定にない物が描き足されたものは没(D135)。
- 選んだ絵の置き場: `rc_*_back` は競争の画面(3 倍)、ほかはマップ。`field/assets/worlds/noroi/` の同じ名前を差し替える(いまは三面図の下絵の仮)。
