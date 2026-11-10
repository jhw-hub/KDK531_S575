import {test, expect} from '@playwright/test';
import {lessons} from '../../src/curriculum.js';
import {solutions} from '../../src/solutions.js';
const transfers = {
 variables:'def gross_margin(revenue, cost):\n    return revenue-cost',
 types:'def price_with_tax(price_text):\n    return float(price_text)*1.1',
 condition:'def qualifies(order_total):\n    return order_total >= 50',
 collections:'def first_and_last(values):\n    return values[0]+values[-1]',
 loops:'def sum_positive(values):\n    return sum(v for v in values if v>0)',
 functions:'def break_even_units(fixed_cost, contribution):\n    return fixed_cost/contribution',
 errors:'def discount_price(price):\n    return price*.9',
 validation:'def safe_ratio(numerator, denominator):\n    return numerator/denominator if denominator else None',
 csv:'def count_complete(rows):\n    return sum(r["price"] is not None for r in rows)',
 group:'def count_by_store(records):\n    return {s:records.count(s) for s in records}',
 clean:'def nonmissing_count(values):\n    return sum(v is not None for v in values)',
 threshold:'def positive_rate(labels):\n    return sum(labels)/len(labels) if labels else None',
 metrics:'def specificity(tn, fp):\n    return tn/(tn+fp) if tn+fp else None',
 pandas:'import pandas as pd\ndef mean_by_team(rows):\n    return pd.DataFrame(rows).groupby("team")["sales"].mean().to_dict()',
 plot:'import matplotlib.pyplot as plt\ndef volume_chart(names, values):\n    fig, ax = plt.subplots()\n    ax.bar(names, values)\n    ax.set_xlabel("Team")\n    ax.set_ylabel("Orders")\n    return ax',
 model:'def mean_absolute_error(actual, predicted):\n    return sum(abs(a-p) for a,p in zip(actual,predicted))/len(actual)',
};
async function openLesson(page,id){
 await page.goto('/');
 await page.locator('[data-nav="practice"]').click();
 await page.locator(`[data-action="open:${id}"]`).click();
}
async function submit(page,code){
 await page.getByRole('textbox',{name:'Python code editor',exact:true}).fill(code);
 await page.getByRole('button',{name:'Run Python & check',exact:true}).click();
 await expect(page.locator('#feedback')).not.toContainText('Loading Python',{timeout:140000});
}
for(const lesson of lessons.filter(l=>l.type!=='interpret')){
 test(`real Python: ${lesson.id} initial and transfer`,async({page})=>{
  await openLesson(page,lesson.id);
  await submit(page,solutions[lesson.id]);
  await expect(page.locator('#feedback')).toContainText('Initial checks passed');
  await expect(page.getByRole('heading',{name:'Fresh transfer task',exact:true})).toBeVisible();
  await submit(page,transfers[lesson.id]);
  await expect(page.locator('#feedback')).toContainText('Independent transfer demonstrated');
  if(lesson.id==='plot')await expect(page.locator('#feedback img').first()).toBeVisible();
  await page.reload();
  await expect(page.locator('main')).toContainText('Demonstrated independently');
 });
}
test('syntax, runtime and logic errors; alternate correct implementation',async({page})=>{
 await openLesson(page,'variables');
 await submit(page,'def total_revenue(price, units)\n    return price * units');
 await expect(page.locator('#feedback')).toContainText('SyntaxError');
 await submit(page,'def total_revenue(price, units):\n    return price * units\nprint(1/0)');
 await expect(page.locator('#feedback')).toContainText('ZeroDivisionError');
 await submit(page,'def total_revenue(price, units):\n    return 36');
 await expect(page.locator('#feedback')).toContainText('Failed Other inputs');
 await submit(page,'def total_revenue(price, units):\n    result = 0\n    for _ in range(units):\n        result += price\n    return result');
 await expect(page.locator('#feedback')).toContainText('Initial checks passed');
});
test('sandbox executes fundamentals, Unicode, and harness-like names',async({page})=>{
 await page.goto('/');await page.locator('[data-nav="sandbox"]').click();
 await page.getByRole('textbox',{name:'Sandbox Python code'}).fill('json = "learner"\n_checks = 123\n_error = "safe"\nvalues = [2, 3]\nrecord = {"name": "Café ✈"}\ndef double(x):\n    return x * 2\nfor value in values:\n    print(record["name"], double(value))');
 await page.getByRole('button',{name:'Run Python',exact:true}).click();
 await expect(page.locator('#feedback')).toContainText('Café ✈ 6',{timeout:140000});
});
test('stop, timeout, recovery and clean state',async({page})=>{
 await page.goto('/');await page.locator('[data-nav="sandbox"]').click();
 const editor=page.getByRole('textbox',{name:'Sandbox Python code'}),run=page.getByRole('button',{name:'Run Python',exact:true});
 await editor.fill('while True:\n    pass');await run.click();
 await page.getByRole('button',{name:'Stop execution',exact:true}).click();
 await expect(page.locator('#feedback')).toContainText('Execution stopped');
 await run.click();await expect(page.locator('#feedback')).toContainText('took too long',{timeout:150000});
 await editor.fill('print("recovered")\nx = 42');await run.click();
 await expect(page.locator('#feedback')).toContainText('recovered',{timeout:140000});
 await editor.fill('print(x)');await run.click();
 await expect(page.locator('#feedback')).toContainText('NameError',{timeout:140000});
});
test('all interpretation activities complete initial and fresh checks',async({page})=>{
 for(const l of lessons.filter(l=>l.type==='interpret')){
  await openLesson(page,l.id);
  await page.locator(`input[name=choice][value="${l.correct}"]`).check();
  await page.getByRole('button',{name:'Commit answer & check'}).click();
  await expect(page.getByRole('heading',{name:'Fresh transfer task',exact:true})).toBeVisible();
  await page.locator(`input[name=choice][value="${l.transferCorrect}"]`).check();
  await page.getByRole('button',{name:'Commit answer & check'}).click();
  await expect(page.locator('#feedback')).toContainText('Transfer check passed');
 }
});
test('wrong transfer cannot count as independent; guest never persists',async({page})=>{
 const l=lessons.find(l=>l.type==='interpret');await openLesson(page,l.id);
 await page.locator(`input[name=choice][value="${l.correct}"]`).check();await page.locator('[data-action="judge"]').click();
 await expect(page.getByRole('heading',{name:'Fresh transfer task',exact:true})).toBeVisible();
 await page.locator(`input[name=choice][value="${(l.transferCorrect+1)%l.transferOptions.length}"]`).check();await page.locator('[data-action="judge"]').click();
 await page.locator(`input[name=choice][value="${l.transferCorrect}"]`).check();await page.locator('[data-action="judge"]').click();
 await page.reload();await expect(page.locator('main')).toContainText('Practiced with assistance');
 await page.locator('[data-nav="progress"]').click();await page.locator('[data-action="guest"]').click();
 await page.locator('[data-nav="progress"]').click();await page.locator('#profiles').selectOption({label:'Learner'});await page.locator('[data-action="switch"]').click();
 await page.reload();await page.locator('[data-nav="progress"]').click();await expect(page.locator('#profiles')).not.toContainText('Guest');
});
test('journal, download, import preview and restore',async({page})=>{
 await openLesson(page,'variables');await page.getByRole('textbox',{name:'Python code editor',exact:true}).fill('# my saved draft');
 await page.locator('[data-nav="journal"]').click();await page.getByRole('textbox',{name:'Task',exact:true}).fill('Check AI totals');await page.getByRole('textbox',{name:'Verification performed'}).fill('Compared two cases');await page.locator('[data-action="addjournal"]').click();
 await page.locator('[data-nav="progress"]').click();
 const downloading=page.waitForEvent('download');await page.locator('[data-action="export"]').click();const download=await downloading;
 await page.locator('#import').setInputFiles(await download.path());await expect(page.locator('#importstatus')).toContainText('1 journal entries');await page.locator('#confirmimport').click();
 await expect(page.locator('main')).toContainText('Learner (imported)');await page.reload();await expect(page.getByRole('textbox',{name:'Python code editor',exact:true})).toHaveValue('# my saved draft');
});
test('mobile navigation, course maps and downloadable public assets',async({page,request})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await page.locator('[data-nav="courses"]').click();await expect(page.locator('.session')).toHaveCount(12);
 await page.locator('[data-course="S575"]').click();await expect(page.locator('.session')).toHaveCount(12);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect((await request.get('/data/harbor_rentals.csv')).ok()).toBe(true);
 expect((await request.get('/notebooks/leakage_pipeline_lab.ipynb')).ok()).toBe(true);
 await page.screenshot({path:'test-results/mobile.png',fullPage:true});
});
test('blocked runtime reports unavailable without recording an assessment',async({page,context})=>{
 await context.route('https://cdn.jsdelivr.net/**',route=>route.abort());
 await openLesson(page,'variables');await submit(page,solutions.variables);
 await expect(page.locator('#feedback')).toContainText('not graded');
 const attempts=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('pfs_profiles_v3'));return s.profiles.find(p=>p.id===s.active).lessons.variables.attempts.length});
 expect(attempts).toBe(0);
});
test('hint and worked-solution flow retains assistance',async({page})=>{
 await openLesson(page,'variables');
 for(let i=0;i<3;i++)await submit(page,'def total_revenue(price, units):\n    return -1');
 await page.locator('[data-action="solution"]').click();
 await expect(page.getByRole('heading',{name:'Fresh transfer task',exact:true})).toBeVisible();
 await submit(page,transfers.variables);await expect(page.locator('#feedback')).toContainText('Completed with assistance');
});
test('navigation cancels execution and prevents stale lesson feedback',async({page})=>{
 await openLesson(page,'variables');await page.getByRole('textbox',{name:'Python code editor',exact:true}).fill('while True:\n    pass');
 await page.locator('[data-action="run"]').click();await page.locator('[data-nav="practice"]').click();await page.locator('[data-action="open:types"]').click();
 await expect(page.locator('#feedback')).toBeEmpty();await expect(page.locator('[data-action="run"]')).toBeEnabled();
});
