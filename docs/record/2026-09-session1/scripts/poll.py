import json,subprocess,sys,time,base64,io
from PIL import Image
def poll(job,out,tries=60):
  for _ in range(tries):
    r=subprocess.run(["curl","-sS","https://api.pixellab.ai/v2/background-jobs/"+job],capture_output=True,text=True)
    d=json.loads(r.stdout)
    if d.get('status')=='completed':
      lr=d.get('last_response') or {}
      imgs=lr.get('images') or ([lr['image']] if 'image' in lr else None)
      if not imgs:
        print(json.dumps(d)[:500]); return None
      im=imgs[0]
      b=im.get('base64') if isinstance(im,dict) else im
      Image.open(io.BytesIO(base64.b64decode(b))).save(out); return out
    if d.get('status') in ('failed','error'): print(json.dumps(d)[:500]); return None
    time.sleep(8)
if __name__=='__main__': print(poll(sys.argv[1],sys.argv[2]))
