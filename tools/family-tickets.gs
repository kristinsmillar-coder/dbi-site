/** @OnlyCurrentDoc
 * Bound to DBI's private December 2 roster. Public callers may submit an RSVP
 * but cannot list or look up guests. All callable editor helpers end in "_".
 */
const TYPES = ['Adult guest','Student','Cathedral Catholic faculty'];
const END = Date.parse('2026-12-03T01:00:00Z'); // doors close 5 PM Pacific
const MAIL = 'dbi@cathedralcatholic.org';
const reply_ = obj => ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
function doGet() { return reply_({event:'DBI-2026-12-02', open:Date.now()<END}); }
function doPost(e) {
  try {
    if (!e || !e.postData || e.postData.contents.length>10000) return reply_({ok:false});
    const p=JSON.parse(e.postData.contents);
    return reply_(p.action==='status'||p.action==='cancel' ? manage_(p) : reserve_(e));
  }
  catch (err) { return reply_({ok:false,message:'We could not confirm your RSVP. Please retry, or contact '+MAIL+'.'}); }
}
function ticketHtml_(body,url){
 const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 return '<div style="max-width:560px;margin:16px auto;font:16px/1.55 Arial,sans-serif;color:#25221f"><div style="background:#a81b1b;color:white;padding:22px 26px;font:24px Georgia,serif">Dons Business Institute</div><div style="padding:22px;border:1px solid #ddd5ca"><p>'+esc(body).replace(/\n/g,'<br>')+'</p><p><a style="display:inline-block;background:#a81b1b;color:white;padding:12px 20px;text-decoration:none" href="'+esc(url)+'">Manage reservation</a></p><p>Cancel individual tickets or your whole reservation.</p><small>Case Competition · Sponsored by Squarena<br>Questions? '+MAIL+'</small></div></div>';
}
function reserve_(e) {
  if (Date.now()>=END) return {ok:false,message:'Online RSVPs are closed.'};
  if (!e.postData || e.postData.contents.length>10000) return {ok:false};
  const p=JSON.parse(e.postData.contents), id=p.id||'', email=String(p.email||'').trim().toLowerCase();
  if (!/^[a-f0-9-]{36}$/i.test(id) || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email) || email.length>200 ||
      !['yes','no'].includes(p.attending) || !Array.isArray(p.guests) || !p.guests.length || p.guests.length>20 ||
      (p.attending==='no' && p.guests.length!==1) || p.website ||
      !p.guests.every(g=>g && typeof g.name==='string' && g.name.trim() && g.name.length<=80 && !/[\x00-\x1f\x7f]/.test(g.name) && TYPES.includes(g.type))) return {ok:false,message:'Please check the email, name and guest type for every guest.'};
  const guests=p.guests.map(g=>({name:g.name.trim(),type:g.type}));
  const lock=LockService.getScriptLock();lock.waitLock(15000);
  try {
    const store=PropertiesService.getScriptProperties(), key='booking:'+id;
    let b=JSON.parse(store.getProperty(key)||'null');
    if(b && (b.email!==email || b.attending!==p.attending || JSON.stringify(b.guests)!==JSON.stringify(guests))) return {ok:false,message:'This request has changed. Reload the page to start a new RSVP.'};
    if(!b) {
      const now=Date.now(), recent=Object.entries(store.getProperties()).filter(([k])=>k.startsWith('booking:')).map(([,v])=>JSON.parse(v)).filter(r=>now-r.time<10*60*1000);
      if(recent.length>=70 || recent.filter(r=>r.email===email).length>=3) return {ok:false,message:'Too many recent reservations. Please try again in ten minutes.'};
      b={code:'DBI-'+Utilities.getUuid().slice(0,8).toUpperCase(),email,attending:p.attending,guests,time:now,mailed:false};
      store.setProperty(key,JSON.stringify(b));
    }
    if(b.attending==='yes' && !b.secret) { b.secret=Utilities.getUuid();store.setProperty(key,JSON.stringify(b)); }
    const manage=b.secret ? 'https://cathedralcatholicdbi.org/rsvp.html#manage='+id+'.'+b.secret : '';
    if(!b.mailed && (!b.attempt || Date.now()-b.attempt>20000)) {
      b.attempt=Date.now();store.setProperty(key,JSON.stringify(b));
      try {
        const yes=b.attending==='yes', names=b.guests.map((g,i)=>(i+1)+'. '+g.name+' — '+g.type).join('\n');
        const body=yes ? 'Your free reservation is confirmed. Show this email at the door for everyone listed below.\n\nReservation: '+b.code+'\n'+names+'\n\nWednesday, December 2, 2026\nGuadalupe Center Theater, Cathedral Catholic High School\n5555 Del Mar Heights Rd, San Diego, CA 92130\nDoors open at 4:30 PM and close at 5:00 PM. The program runs 5:00–8:30 PM Pacific. Teams present in random order with a 10-minute break after the fifth team. Food follows the presentations.\n\nAdd to calendar: https://cathedralcatholicdbi.org/assets/dbi-case-competition-2026.ics'+(guests.some(g=>g.type==='Adult guest')?'\nOptional adult donations: https://cathedralcatholicdbi.org/donate.html#giving':'') : 'Thanks for letting us know you cannot attend. No seats have been reserved.';
        MailApp.sendEmail({to:email,name:'Dons Business Institute',replyTo:MAIL,...(yes?{htmlBody:ticketHtml_(body,manage)}:{}),subject:yes?'Your DBI Case Competition tickets · December 2 · '+b.code:'Your DBI Case Competition RSVP · Unable to attend',body:body+(yes?'\n\nManage reservation or cancel individual guests: '+manage:'')+'\n\nDBI Case Competition · Sponsored by Squarena\nQuestions or changes? '+MAIL});
        b.mailed=true;
      } catch (_) {}
      store.setProperty(key,JSON.stringify(b));
    }
    return {ok:true,code:b.code,mailed:b.mailed,manage:manage};
  } finally {lock.releaseLock();}
}
function status_(b,i) {
  return b.attending==='no'?'Declined':(b.canceled||{})[i]?'Canceled':(b.checked||{})[i]?'Checked in':'Attending';
}
function manage_(p) {
  const denied={ok:false,message:'This private link is invalid. Open the Manage reservation link from your ticket email.'};
  if(typeof p.token!=='string'||!/^[a-f\d-]{36}\.[a-f\d-]{36}$/i.test(p.token))return denied;
  const [id,secret]=p.token.split('.'),store=PropertiesService.getScriptProperties(),key='booking:'+id;
  const lock=LockService.getScriptLock();lock.waitLock(15000);
  try {
    const b=JSON.parse(store.getProperty(key)||'null');
    if(!b||b.secret!==secret||b.attending!=='yes')return denied;
    let notified;
    if(p.action==='cancel'){
      if(Date.now()>=END)return {ok:false,message:'Online changes have closed. Please speak with the check-in team.'};
      if(!Array.isArray(p.indices)||!p.indices.length||p.indices.length>b.guests.length||
         !p.indices.every(i=>Number.isInteger(i)&&i>=0&&i<b.guests.length))return {ok:false,message:'Select at least one guest.'};
      if(p.indices.some(i=>status_(b,i)==='Checked in'))return {ok:false,message:'A selected guest has already checked in. Refresh the guest list and try again.'};
      const changes=[...new Set(p.indices)].filter(i=>status_(b,i)==='Attending');
      if(changes.length){
        b.canceled=b.canceled||{};changes.forEach(i=>b.canceled[i]=Date.now());store.setProperty(key,JSON.stringify(b));
        const remaining=b.guests.filter((_,i)=>['Attending','Checked in'].includes(status_(b,i))).map(g=>g.name);
        try {MailApp.sendEmail({to:b.email,name:'Dons Business Institute',replyTo:MAIL,subject:'Updated DBI tickets · '+b.code,
          body:'Your December 2 Case Competition reservation has been updated.\n\nCanceled: '+changes.map(i=>b.guests[i].name).join(', ')+
          '\nStill on the guest list: '+(remaining.join(', ')||'None — your entire reservation is canceled.')+'\n\nReservation: '+b.code+
          '\nManage reservation: https://cathedralcatholicdbi.org/rsvp.html#manage='+p.token+'\n\nQuestions? '+MAIL});notified=true;} catch(_){notified=false;}
      }
    }
    return {ok:true,code:b.code,open:Date.now()<END,notified,guests:b.guests.map((g,i)=>({i,name:g.name,type:g.type,status:status_(b,i)}))};
  }finally{lock.releaseLock();}
}
const COLUMNS=['Checked in','Guest name','Guest type','Status','Reservation','Ticket email','Checked in (Pacific)','Canceled (Pacific)','Submitted (Pacific)','Guest ID'];
function rosterRow_(b,id,i){
 const g=b.guests[i],status=status_(b,i), f=t=>t?Utilities.formatDate(new Date(t),'America/Los_Angeles','MM/dd/yyyy HH:mm'):'';
 const safe=v=>/^\s*[=+@\-]/.test(v)?"'"+v:v;
 return [status==='Checked in',safe(g.name),g.type,status,b.code,safe(b.email),f((b.checked||{})[i]),f((b.canceled||{})[i]),f(b.time),id+':'+i];
}
function onOpen(){SpreadsheetApp.getUi().createMenu('DBI tickets').addItem('Refresh guest list','refreshRoster_').addToUi();refreshRoster_();}
// Runs from the spreadsheet or its minute timer, with this-file-only access.
function canceledGuestIds_(props){
 const canceled=new Set();
 for(const [key,value] of Object.entries(props)){
  if(!key.startsWith('booking:'))continue;
  const b=JSON.parse(value);
  for(const i of Object.keys(b.canceled||{}))if(b.canceled[i])canceled.add(key.slice(8)+':'+i);
 }
 return canceled;
}
function pruneCanceledRows_(sh,canceled){
 const n=sh.getLastRow()-1;
 if(!canceled.size||n<1)return;
 const ids=sh.getRange(2,10,n,1).getValues().flat();
 for(let i=n-1;i>=0;){
  if(!canceled.has(String(ids[i]))){i--;continue;}
  const last=i;while(i>=0 && canceled.has(String(ids[i])))i--;
  sh.deleteRows(i+3,last-i);
 }
}
function syncCanceledGuests(){
 // Ticket cancellation closes at the start of the event.
 if(Date.now()>END+86400000)return;
 const lock=LockService.getScriptLock();if(!lock.tryLock(10000))return;
 try{
  const store=PropertiesService.getScriptProperties(),props=store.getProperties();
  const ids=canceledGuestIds_(props);
  if(!ids.size)return;
  const signature=Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,[...ids].sort().join('|')));
  if(signature===props['roster:removed'])return;
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Guest list');
  if(sh){pruneCanceledRows_(sh,ids);SpreadsheetApp.flush();store.setProperty('roster:removed',signature);}
 }finally{lock.releaseLock();}
}
function refreshRoster_(){
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try {
  const ss=SpreadsheetApp.getActive(), sh=ss.getSheetByName('Guest list')||ss.insertSheet('Guest list');
  const props=PropertiesService.getScriptProperties().getProperties(), rows=[],byId={};
  Object.keys(props).filter(k=>k.startsWith('booking:')).map(k=>[k.slice(8),JSON.parse(props[k])]).sort((a,b)=>a[1].time-b[1].time).forEach(([id,b])=>{
    b.guests.forEach((g,i)=>{if(status_(b,i)==='Canceled')return;const row=rosterRow_(b,id,i);byId[row[9]]=row;});
  });
  // Keep existing guest rows stable, including after staff sort the sheet.
  pruneCanceledRows_(sh,canceledGuestIds_(props));
  const prev=sh.getLastRow();
  if(prev>1)sh.getRange(2,10,prev-1,1).getValues().flat().forEach(k=>{if(byId[k]){rows.push(byId[k]);delete byId[k];}});
  rows.push(...Object.values(byId));
  sh.getRange(1,1,1,10).setValues([COLUMNS]).setFontWeight('bold').setBackground('#a81b1b').setFontColor('#ffffff');sh.setFrozenRows(1);
  if(rows.length){sh.getRange(2,1,rows.length,1).insertCheckboxes();sh.getRange(2,1,rows.length,10).setValues(rows);}
  if(prev>rows.length+1)sh.getRange(rows.length+2,1,prev-rows.length-1,10).clearContent().clearDataValidations();
  sh.autoResizeColumns(1,9);sh.hideColumns(10);
 }finally{lock.releaseLock();}
}
function onEdit(e){
 const r=e&&e.range;if(!r||r.getSheet().getName()!=='Guest list'||r.getColumn()!==1||r.getRow()<2)return;
 const lock=LockService.getScriptLock();lock.waitLock(15000);
 try{
  const sh=r.getSheet(),store=PropertiesService.getScriptProperties();
  for(let n=r.getNumRows()-1;n>=0;n--){
   const row=r.getRow()+n, match=/^([a-f\d-]{36}):(\d+)$/i.exec(String(sh.getRange(row,10).getValue()));
   if(!match)continue;
   const key='booking:'+match[1],i=Number(match[2]),b=JSON.parse(store.getProperty(key)||'null');
   if(!b||!b.guests[i])continue;
   const status=status_(b,i),checked=sh.getRange(row,1).isChecked();
   if(status==='Canceled'){sh.deleteRows(row,1);continue;}
   if(status==='Attending'||status==='Checked in'){
     b.checked=b.checked||{};if(checked)b.checked[i]=b.checked[i]||Date.now();else delete b.checked[i];
     store.setProperty(key,JSON.stringify(b));
   }else if(checked){e.source.toast('This guest is '+status.toLowerCase()+' and cannot be checked in.');}
   sh.getRange(row,1,1,10).setValues([rosterRow_(b,match[1],i)]);
  }
 }finally{lock.releaseLock();}
}
