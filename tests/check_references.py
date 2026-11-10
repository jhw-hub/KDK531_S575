import json, subprocess, pathlib, sys
root=pathlib.Path(__file__).resolve().parents[1]
js='''import {lessons} from "./src/curriculum.js";import {solutions} from "./src/solutions.js";console.log(JSON.stringify(lessons.filter(l=>l.type!=="interpret").map(l=>({id:l.id,checks:l.checks,solution:solutions[l.id]}))))'''
p=subprocess.run(['node','--input-type=module','-e',js],cwd=root,text=True,capture_output=True,check=True)
items=json.loads(p.stdout)
errors=[]
for item in items:
 ns={}
 try:
  exec(item['solution'],ns)
  for case in item['checks']:
   got=eval(case['expression'],ns)
   if got!=case['expected']: errors.append((item['id'],case['name'],got,case['expected']))
 except Exception as e: errors.append((item['id'],str(e)))
print(f'Checked {sum(len(x["checks"]) for x in items)} reference behaviors for {len(items)} Python coding modules')
if errors: print(errors);sys.exit(1)
