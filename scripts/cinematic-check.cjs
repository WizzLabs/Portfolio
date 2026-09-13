const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('http://localhost:3100');await page.waitForTimeout(1000);fs.mkdirSync('qa/cinematic',{recursive:true});
 const root=page.locator('#work');const start=await root.evaluate(el=>el.getBoundingClientRect().top+scrollY);
 const end=start+900*5.1;const seen=[];
 for(const [index,p] of [0,.08,.18,.25,.37,.5,.63,.76,.82,.9,.98].entries()){
   await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),start+(end-start)*p);await page.waitForTimeout(500);
   const selected=await page.getByRole('tab',{selected:true}).innerText();seen.push({p,selected});
   await page.screenshot({path:`qa/cinematic/${String(index).padStart(2,'0')}-${p}.png`});
 }
 assert(seen.find(x=>x.p===.25).selected.includes('Nocturnal'));
 assert(seen.find(x=>x.p===.37).selected.includes('WizzBot'));
 assert(seen.find(x=>x.p===.63).selected.includes('XenoX'));
 assert(seen.find(x=>x.p===.76).selected.includes('Neural Reflex'));
 for(let i=seen.length-2;i>=2;i--){await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),start+(end-start)*seen[i].p);await page.waitForTimeout(120);}
 const reversed=await page.getByRole('tab',{selected:true}).innerText();assert(reversed.includes('Nocturnal'));
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.mouse.wheel(0,320);const samples=[];for(let i=0;i<7;i++){await page.waitForTimeout(55);samples.push(await page.evaluate(()=>scrollY));}assert(samples[0]<samples.at(-1));await page.waitForTimeout(600);const settled=await page.evaluate(()=>scrollY);await page.waitForTimeout(350);assert(Math.abs((await page.evaluate(()=>scrollY))-settled)<2);
 for(const [width,height] of [[1280,800],[390,844]]){await page.setViewportSize({width,height});await page.goto('http://localhost:3100');await page.waitForTimeout(700);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);await page.locator('#work').scrollIntoViewIfNeeded();await page.waitForTimeout(400);await page.screenshot({path:`qa/cinematic/projects-${width}.png`});}
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://localhost:3100');await page.locator('#work').scrollIntoViewIfNeeded();await page.getByRole('tab',{name:/XenoX/}).click();assert((await page.getByRole('tabpanel').innerText()).includes('XenoX'));
 assert.equal(errors.length,0,errors.join('\n'));console.log(JSON.stringify({result:'PASS',seen,smoothSamples:samples,reverse:reversed}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
