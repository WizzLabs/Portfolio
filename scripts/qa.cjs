const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
  const url=process.env.QA_URL||'http://localhost:3000';
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404'))errors.push(m.text());});
  fs.mkdirSync('qa/after',{recursive:true});
  await page.goto(url);await page.waitForTimeout(1400);
  const shot=async name=>page.screenshot({path:`qa/after/${name}.png`});
  const jump=async y=>{await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(350);};
  await shot('hero');
  const samples=[];await page.mouse.wheel(0,600);for(let i=0;i<6;i++){await page.waitForTimeout(55);samples.push(await page.evaluate(()=>scrollY));}await page.waitForTimeout(900);
  assert(samples[0]<samples.at(-1),'Wheel should interpolate across frames');
  assert(samples.at(-1)<=605,'Wheel should not double-scroll');
  for(const selector of ['.identity','.about']){await page.locator(selector).scrollIntoViewIfNeeded();await page.waitForTimeout(400);await shot(selector.slice(1));}
  const start=await page.locator('#work').evaluate(el=>el.getBoundingClientRect().top+scrollY);
  for(const progress of [0,.3,.55,.8,1,.5,1]){await jump(start+900*1.65*progress);await shot('passage-'+progress);}
  await page.getByRole('button',{name:'Next project',exact:true}).click();await page.waitForTimeout(400);assert.equal(await page.getByRole('tab',{selected:true}).innerText(),'02\nWizzBot v2 → v3');
  assert((await page.getByRole('tabpanel').innerText()).includes('Active / evolving'));
  await page.getByRole('tab',{selected:true}).focus();await page.keyboard.press('ArrowRight');await page.waitForTimeout(400);assert((await page.getByRole('tabpanel').innerText()).includes('XenoX'));
  await page.keyboard.press('End');assert((await page.getByRole('tabpanel').innerText()).includes('Neural Reflex'));
  for(let i=0;i<6;i++)await page.getByRole('button',{name:'Next project',exact:true}).click();await page.waitForTimeout(450);assert((await page.getByRole('tabpanel').innerText()).includes('WizzBot v2'));
  await shot('projects');
  for(const selector of ['.skills','.experiments','.contact']){await page.locator(selector).scrollIntoViewIfNeeded();await page.waitForTimeout(400);await shot(selector.slice(1));}
  await page.getByLabel('Your name').fill('QA test');await page.getByLabel('Your message').fill('Local interaction check — not submitted.');
  const dimensions=[];
  for(const [width,height] of [[2560,1080],[1280,800],[390,844]]){
    await page.setViewportSize({width,height});await page.goto(url);await page.waitForTimeout(1000);
    await page.mouse.move(width-1,height/2);await page.waitForTimeout(350);await shot(`hero-${width}`);
    const size=await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,canvas:document.querySelector('.cloud-scene canvas').getBoundingClientRect().width}));dimensions.push(size);assert(size.document<=width,'No document overflow');assert(Math.abs(size.canvas-width)<1,'Canvas fits container');
    if(width===390){await page.getByRole('button',{name:/Menu/}).click();await page.getByRole('link',{name:'Projects',exact:true}).click();await page.waitForTimeout(1600);
      const top=await page.locator('#work').evaluate(el=>el.getBoundingClientRect().top+scrollY);await jump(top+844*1.1);await shot('mobile-projects');
      await page.getByRole('button',{name:'Next project',exact:true}).click();assert((await page.getByRole('tabpanel').innerText()).includes('WizzBot v2'));
      await page.locator('.contact').scrollIntoViewIfNeeded();await shot('mobile-contact');
    }
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url);await page.waitForTimeout(900);
  assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('lenis')),false);
  await page.locator('#work').scrollIntoViewIfNeeded();await shot('reduced-motion');
  await page.getByRole('tab',{name:/XenoX/}).click();assert((await page.getByRole('tabpanel').innerText()).includes('XenoX'));
  const fallback=await browser.newPage({viewport:{width:1280,height:800}});
  await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(String(type).includes('webgl'))return null;return original.call(this,type,...args);};});
  await fallback.goto(url);await fallback.waitForTimeout(900);await fallback.screenshot({path:'qa/after/fallback-hero.png'});
  await fallback.emulateMedia({reducedMotion:'reduce'});await fallback.locator('#work').scrollIntoViewIfNeeded();await fallback.getByRole('tab',{name:/Neural Reflex/}).click();assert((await fallback.getByRole('tabpanel').innerText()).includes('Neural Reflex'));
  await fallback.screenshot({path:'qa/after/fallback-projects.png'});
  assert.equal(errors.length,0,errors.join('\n'));
  const report={errors,smoothScrollSamples:samples,dimensions,result:'PASS'};fs.writeFileSync('qa/report.json',JSON.stringify(report,null,2));console.log(report);await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
