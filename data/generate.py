"""Recreate original synthetic business dataset with deterministic seed."""
import csv,random,pathlib
rng=random.Random(531575)
rows=[]
for i in range(1,181):
    day=i//3
    location=rng.choice(['North','South','East'])
    segment=rng.choice(['New','Returning'])
    days=max(1,round(rng.gauss(3.2,1.3)))
    rate=round(28+(location=='North')*5+(segment=='Returning')*2+rng.gauss(0,3),2)
    promo=int(rng.random()<0.35)
    cost=round(9.5*days+rng.uniform(4,13),2)
    probability=0.09+0.13*(segment=='New')+0.06*(days>4)-0.02*promo
    cancelled=int(rng.random()<probability)
    rows.append(dict(booking_id=i,day_index=day,location=location,customer_segment=segment,rental_days=days,daily_rate=rate,revenue=round(rate*days,2),service_cost=cost,promo=promo,cancelled=cancelled))
for index in (17,68,112):rows[index]['daily_rate']=''
rows.extend([rows[24].copy(),rows[70].copy()])
out=pathlib.Path(__file__).with_name('harbor_rentals.csv')
with out.open('w',newline='') as f:
    w=csv.DictWriter(f,rows[0].keys());w.writeheader();w.writerows(rows)
print(f'{len(rows)} synthetic rows written: {out}')
