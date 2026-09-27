import json,subprocess,sys
for name,tid in [("wang_road","3ae51eed-78d3-4c21-9e8e-04c1d86b9aa0"),("wang_ice","a380f6de-76bc-4d9f-8e35-bd167d37d48d"),("wang_floor","3e2008c6-7462-4e9f-b941-e488541e3329")]:
    subprocess.run(["curl","-sS",f"https://api.pixellab.ai/mcp/tilesets/{tid}/image?inline=true","-o",f"gen/{name}.png"],check=True)
    m=json.loads(subprocess.run(["curl","-sS",f"https://api.pixellab.ai/mcp/tilesets/{tid}/metadata"],capture_output=True,text=True).stdout)
    lk={}
    for t in m['tileset_data']['tiles']:
        c=t['corners'];b=t['bounding_box']
        k=''.join('1' if c[x]=='upper' else '0' for x in ('NW','NE','SW','SE'))
        lk.setdefault(k,[]).append([b['x']//32,b['y']//32])
    print(name,len(lk),json.dumps(lk,separators=(',',':')))
