import numpy as np
from PIL import Image
# 思い出の色: 褪せた昭和のカラー写真(黒が浮き、彩度が落ち、ハイライトは黄み、影はわずかに赤紫)
def faded(im, desat=0.32):
  a=np.array(im.convert('RGB')).astype(float)
  l=(a@np.array([0.3,0.59,0.11]))[...,None]
  a=a*(1-desat)+l*desat
  a=22+a*0.86                        # 黒を浮かせ、白を抑える
  t=(l/255.0)
  a=a+np.concatenate([8*t, 3*t, -14*t],-1)          # 明部は黄み
  a=a+np.concatenate([6*(1-t), -2*(1-t), 6*(1-t)],-1)  # 暗部は赤紫
  return Image.fromarray(np.clip(a,0,255).astype(np.uint8))
