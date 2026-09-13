const {chromium}=require('@playwright/test');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto('http://localhost:3100');await page.waitForTimeout(800);
 // Exercise actual wheel input over the entire journey, including pin boundaries.
 const positions=[];
 for(let i=0;i<36;i++){await page.mouse.wheel(0,280);await page.waitForTimeout(180);positions.push(await page.evaluate(()=>scrollY));}
 assert(positions.every((y,i)=>i===0||y>=positions[i-1]),'Downward wheel must not jump backward');
 await page.waitForTimeout(900);
 const bottom=await page.evaluate(()=>({y:scrollY,max:document.documentElement.scrollHeight-innerHeight}));
 assert(Math.abs(bottom.max-bottom.y)<3,'Wheel reaches footer');
 const start=await page.locator('#work').evaluate(el=>el.getBoundingClientRect().top+scrollY);
 await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),start+1485);await page.waitForTimeout(600);
 const stage=await page.locator('.project-stage').boundingBox();
 await page.mouse.move(stage.x+300,stage.y+140);await page.mouse.down();await page.mouse.move(stage.x+150,stage.y+145,{steps:12});await page.mouse.up();await page.waitForTimeout(500);
 assert((await page.getByRole('tabpanel').innerText()).includes('WizzBot v2'));
 // Simulate graphics context loss without disabling content or navigation.
 const lost=await page.locator('.project-scene canvas').evaluate(canvas=>{const gl=canvas.getContext('webgl2');const ext=gl?.getExtension('WEBGL_lose_context');if(!ext)return false;window.qaContext=ext;ext.loseContext();return true;});
 if(lost){await page.waitForTimeout(300);assert.equal(await page.locator('.project-scene').getAttribute('data-ready'),'false');await page.getByRole('button',{name:'Next project',exact:true}).click();assert((await page.getByRole('tabpanel').innerText()).includes('XenoX'));await page.evaluate(()=>window.qaContext.restoreContext());await page.waitForTimeout(900);assert.equal(await page.locator('.project-scene').getAttribute('data-ready'),'true');}
 const scene=await page.locator('.project-scene').boundingBox();await page.mouse.click(scene.x+scene.width*.22,scene.y+scene.height*.53);await page.waitForTimeout(700);
 console.log(JSON.stringify({wheel:'monotonic through entire page',bottom,drag:'passed',webglContextRecovery:lost,selectedAfterCanvasClick:await page.getByRole('tab',{selected:true}).innerText()}));
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
