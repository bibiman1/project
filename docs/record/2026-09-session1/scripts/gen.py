import json,sys,base64,subprocess,concurrent.futures as cf,time
specs=json.load(open(sys.argv[1]))
def run(s):
    body={"description":s["desc"],"image_size":{"width":s["w"],"height":s["h"]},"no_background":s.get("nobg",False)}
    if "neg" in s: body["negative_description"]=s["neg"]
    for k in ("view","direction","outline","shading","detail"):
        if k in s: body[k]=s[k]
    for i in range(6):
        p=subprocess.run(["curl","-sS","-m","180","https://api.pixellab.ai/v2/create-image-pixflux","-H","Content-Type: application/json","-d",json.dumps(body)],capture_output=True,text=True)
        try:
            d=json.loads(p.stdout); b=d["image"]["base64"]
            open(f"gen/{s['name']}.png","wb").write(base64.b64decode(b)); return s["name"]+" ok"
        except Exception as e:
            err=p.stdout[:200]; time.sleep(20)
    return s["name"]+" FAIL "+err
with cf.ThreadPoolExecutor(2) as ex:
    for r in ex.map(run,specs): print(r)
