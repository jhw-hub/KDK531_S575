from playwright.sync_api import sync_playwright
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as playwright:
 browser=playwright.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page()
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.route('https://pfs.example/**',lambda route: route.fulfill(path=str(ROOT / (urlparse(route.request.url).path.lstrip('/') or 'index.html')),content_type={'js':'text/javascript','css':'text/css','html':'text/html'}.get(Path(urlparse(route.request.url).path).suffix.lstrip('.'),'text/plain')))
 page.goto('https://pfs.example/',wait_until='domcontentloaded')
 assert page.get_by_text('Before You Start: Strengths, Weaknesses & Limitations').count()==1
 assert page.get_by_text('Your data').count()==1
 page.get_by_role('button',name='Start learning').click()
 assert page.get_by_text('Variables and arithmetic').count()>=1
 assert page.get_by_role('button',name='View worked explanation').count()==0
 editor=page.locator('#code');editor.fill('def total_revenue(price, units):\n    return price * units')
 assert 'total_revenue' in editor.input_value()
 page.reload(wait_until='networkidle')
 assert 'return price * units' in page.locator('#code').input_value()
 page.get_by_role('button',name='Progress & settings').click()
 assert page.get_by_text('Backup and portability').count()==1
 page.get_by_role('button',name='Create local profile').click()
 assert 'learning dashboard' in page.locator('h1').inner_text().lower()
 page.get_by_role('button',name='Course Companion').click()
 assert page.locator('.session').count()==12
 page.get_by_role('button',name='S575 · AI & ML').click()
 assert page.locator('.session').count()==12
 page.locator('.session').first.click()
 assert page.get_by_role('button',name='Commit answer & check').count()==1
 page.get_by_role('button',name='Commit answer & check').click()
 assert 'Choose an answer' in page.locator('#feedback').inner_text()
 page.locator('input[name=choice][value="1"]').check()
 page.get_by_role('button',name='Commit answer & check').click()
 assert 'Correct judgment' in page.locator('#feedback').inner_text()
 page.wait_for_timeout(1500)
 assert 'Fresh transfer task' in page.locator('h3').all_inner_texts()
 page.get_by_role('button',name='About & limits').click()
 assert page.get_by_text('Reporting an issue').count()==1
 assert not errors,errors
 print('Chromium UI smoke PASSED: welcome disclosures, learning/editor autosave, local profiles, both session maps, interpretation transfer, about page.')
 browser.close()
