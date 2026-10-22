const endpoint='https://high-noon-frontier.high-noon-cloud-service.workers.dev/health';
const el=id=>document.getElementById(id);
let checking=false;
function showStatus(kind,title,description){for(const id of ['status-pill','service-board'])el(id).className=(id==='status-pill'?'status-pill ':'service-board ')+kind;el('status-title').textContent=title;el('status-short').textContent=kind==='online'?'Server online':kind==='unavailable'?'Online play unavailable':kind==='checking'?'Checking server…':'Status unavailable';el('status-description').textContent=description;}
async function checkStatus(){
 if(checking)return;checking=true;el('refresh-status').disabled=true;
 showStatus('checking','Checking the frontier…','Contacting the High Noon online service.');
 try{
  const response=await fetch(endpoint,{cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(8000)});const data=await response.json();
  if(response.ok&&data.ok&&data.accountsReady&&data.service==='high-noon-frontier')showStatus('online','The frontier is online.','Online account sign-in and Battles are available. See you at the table.');
  else if(data.service==='high-noon-frontier')showStatus('unavailable','Online play is unavailable.','Please check back later. Campaign and Practice can still be played offline.');
  else throw Error('Unrecognized status response');
 }catch{showStatus('unknown','Unable to check right now.',navigator.onLine?'The server status could not be reached. Please check back later.':'Your device appears to be offline. Reconnect to check the frontier.');}
 finally{el('status-time').textContent='Last checked '+new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit'}).format(new Date())+' · Checks every minute';checking=false;el('refresh-status').disabled=false;}
}
el('refresh-status').addEventListener('click',checkStatus);
checkStatus();setInterval(()=>{if(!document.hidden)checkStatus();},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkStatus();});

function trustedDownload(url,extension){try{const u=new URL(url);return u.protocol==='https:'&&u.host==='github.com'&&u.pathname.startsWith('/kalvx/highnoon/releases/download/')&&u.pathname.endsWith(extension)&&!u.search&&!u.hash;}catch{return false;}}
function applyRelease(data){
 if(!/^\d+\.\d+\.\d+$/.test(data.version??''))return;
 if(!trustedDownload(data.windowsUrl,'.exe')||!trustedDownload(data.androidUrl,'.apk'))return;
 for(const node of document.querySelectorAll('[data-version]'))node.textContent=data.version;
 el('windows-download').href=data.windowsUrl;el('android-download').href=data.androidUrl;
 el('release-link').href='https://github.com/kalvx/highnoon/releases/tag/v'+data.version;
 if(Number.isFinite(data.windowsBytes))el('windows-size').textContent=Math.round(data.windowsBytes/1000000)+' MB';
 if(Number.isFinite(data.androidBytes))el('android-size').textContent=Math.round(data.androidBytes/1000000)+' MB';
 if(data.date&&/^\d{4}-\d{2}-\d{2}$/.test(data.date)){el('release-date').dateTime=data.date;el('release-date').textContent=new Intl.DateTimeFormat('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'}).format(new Date(data.date+'T12:00:00Z')).toUpperCase();}
 if(data.title)el('release-title').textContent=data.title;
 if(Array.isArray(data.changes)&&data.changes.length){const list=el('changelog');list.replaceChildren();for(const change of data.changes){const li=document.createElement('li'),strong=document.createElement('strong');strong.textContent=change.title+' ';li.append(strong,document.createTextNode(change.text));list.append(li);}}
}
fetch('release.json',{cache:'no-cache',credentials:'omit'}).then(r=>{if(!r.ok)throw Error('Release data unavailable');return r.json();}).then(applyRelease).catch(()=>{});

fetch('apparel.json',{cache:'no-cache',credentials:'omit'}).then(r=>r.json()).then(data=>{
 if(!Array.isArray(data.products)||!data.products.length)return;
 const grid=el('apparel-products');grid.replaceChildren();
 for(const p of data.products){if(typeof p.image!=='string'||!/^assets\/[a-zA-Z0-9._-]+\.(png|jpg|webp)$/.test(p.image))continue;
  const article=document.createElement('article');article.className='product';const image=document.createElement('img');image.src=p.image;image.alt=p.name;image.loading='lazy';image.width=600;image.height=600;const title=document.createElement('h3');title.textContent=p.name;const description=document.createElement('p');description.textContent=p.description??'';article.append(image,title,description);if(p.availability){const availability=document.createElement('p');availability.className='availability';availability.textContent=p.availability;article.append(availability);}
  let url;try{url=new URL(p.url);if(url.protocol!=='https:')url=null;}catch{}
  if(url){const a=document.createElement('a');a.className='button gold';a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent=p.label??'VIEW APPAREL ↗';article.append(a);}else{const note=document.createElement('p');note.className='availability';note.textContent='Contact us on Discord for ordering details.';article.append(note);}
  grid.append(article);
 }
}).catch(()=>{});
