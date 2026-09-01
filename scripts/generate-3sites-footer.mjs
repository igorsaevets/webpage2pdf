import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('D:/Hermes/webpage2pdf/.output/pdfs');
fs.mkdirSync(OUT_DIR, { recursive: true });

const URLS = [
  'https://biznespark.by/',
  'https://growcluster.com/',
  'https://krokitclub.com/',
];

const DESKTOP_W = 1920;
const DESKTOP_H = 1080;

function escapeHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function footerHtml(url){
  const u=escapeHtml(url);
  // only URL, no pagination — requested
  return `<div style="width:100%; padding:0 0.4in; box-sizing:border-box; font-family:-apple-system,Arial,sans-serif;">
    <div style="font-size:7.5px; color:#6b7280; line-height:1.35; text-align:center; word-break:break-all; overflow-wrap:anywhere; white-space:normal; border-top:1px solid #e5e7eb; padding-top:6px;">${u}</div>
  </div>`;
}
const browser=await puppeteer.launch({headless:true, args:['--no-sandbox','--disable-setuid-sandbox','--disable-gpu']});
for(const url of URLS){
  const slug=url.replace(/^https?:\/\//,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'');
  const page=await browser.newPage();
  await page.setViewport({width:DESKTOP_W,height:DESKTOP_H,deviceScaleFactor:1,isMobile:false});
  console.log('\n===', url);
  await page.goto(url,{waitUntil:'networkidle2',timeout:35000});
  await page.evaluate(()=>document.fonts?document.fonts.ready:true);
  await new Promise(r=>setTimeout(r,1200));
  await page.evaluate(()=>{
    document.querySelectorAll('img[loading="lazy"]').forEach(i=>{i.loading='eager'; i.decoding='sync'; try{i.src=i.src}catch{}});
    document.querySelectorAll('[loading="lazy"]').forEach(el=>el.loading='eager');
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await new Promise(r=>setTimeout(r,900));
  await page.evaluate(()=>window.scrollTo(0,0));
  await new Promise(r=>setTimeout(r,500));
  await page.emulateMediaType('screen');
  const client=await page.target().createCDPSession();
  await client.send('Emulation.setDeviceMetricsOverride',{width:DESKTOP_W,height:DESKTOP_H,deviceScaleFactor:1,mobile:false,screenWidth:DESKTOP_W,screenHeight:DESKTOP_H});
  await new Promise(r=>setTimeout(r,350));
  const scale=(8.27-0.8)*96/DESKTOP_W;
  console.log('scale', scale);
  const outPath=path.join(OUT_DIR, `${slug}-desktop-scaled-A4-footer.pdf`);
  const res=await client.send('Page.printToPDF',{
    paperWidth:8.27,paperHeight:11.69,marginTop:0.4,marginBottom:0.6,marginLeft:0.4,marginRight:0.4,
    printBackground:true,preferCSSPageSize:false,scale,
    displayHeaderFooter:true,headerTemplate:'<div></div>',footerTemplate:footerHtml(url),generateTaggedPDF:true
  });
  fs.writeFileSync(outPath, Buffer.from(res.data,'base64'));
  console.log('wrote', outPath, fs.statSync(outPath).size);
  await client.send('Emulation.clearDeviceMetricsOverride');
  await page.emulateMediaType(null);
  await client.detach(); await page.close();
}
await browser.close();
console.log('\nDONE', OUT_DIR);
for(const f of fs.readdirSync(OUT_DIR).filter(f=>f.endsWith('-footer.pdf'))) console.log(f,(fs.statSync(path.join(OUT_DIR,f)).size/1024|0)+'KB');
