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
  try { return reply_(reserve_(e)); }
  catch (err) { return reply_({ok:false,message:'We could not confirm your RSVP. Please retry, or contact '+MAIL+'.'}); }
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
    if(!b.mailed && (!b.attempt || Date.now()-b.attempt>20000)) {
      b.attempt=Date.now();store.setProperty(key,JSON.stringify(b));
      try {
        const yes=b.attending==='yes', names=b.guests.map((g,i)=>(i+1)+'. '+g.name+' — '+g.type).join('\n');
        const body=yes ? 'Your free reservation is confirmed. Show this email at the door for everyone listed below.\n\nReservation: '+b.code+'\n'+names+'\n\nWednesday, December 2, 2026\nGuadalupe Center Theater, Cathedral Catholic High School\n5555 Del Mar Heights Rd, San Diego, CA 92130\nDoors open at 4:30 PM and close at 5:00 PM. The program runs 5:00–8:30 PM Pacific. Teams present in random order with a 10-minute break after the fifth team. Food follows the presentations.\n\nAdd to calendar: https://cathedralcatholicdbi.org/assets/dbi-case-competition-2026.ics'+(guests.some(g=>g.type==='Adult guest')?'\nOptional adult donations: https://cathedralcatholicdbi.org/donate.html#giving':'') : 'Thanks for letting us know you cannot attend. No seats have been reserved.';
        MailApp.sendEmail({to:email,name:'Dons Business Institute',replyTo:MAIL,subject:yes?'Your DBI Case Competition tickets · December 2 · '+b.code:'Your DBI Case Competition RSVP · Unable to attend',body:body+'\n\nDBI Case Competition · Sponsored by Squarena\nQuestions or changes? '+MAIL});
        b.mailed=true;
      } catch (_) {}
      store.setProperty(key,JSON.stringify(b));
    }
    return {ok:true,code:b.code,mailed:b.mailed};
  } finally {lock.releaseLock();}
}
function onOpen(){
 SpreadsheetApp.getUi().createMenu('DBI tickets').addItem('Refresh guest list','refreshRoster_').addToUi();
 refreshRoster_();
}
function refreshRoster_(){
 const ss=SpreadsheetApp.getActive(), sh=ss.getSheetByName('Guest list')||ss.insertSheet('Guest list');
 const rows=[['Reservation','Submitted (Pacific)','Attendance','Ticket email','Guest name','Guest type','Email sent']];
 const props=PropertiesService.getScriptProperties().getProperties();
 const safe=v=>/^[=+@\-]/.test(v)?"'"+v:v;
 Object.keys(props).filter(k=>k.startsWith('booking:')).map(k=>JSON.parse(props[k])).sort((a,b)=>a.time-b.time).forEach(b=>{
  b.guests.forEach(g=>rows.push([b.code,Utilities.formatDate(new Date(b.time),'America/Los_Angeles','yyyy-MM-dd HH:mm'),b.attending==='yes'?'Attending':'Declined',safe(b.email),safe(g.name),g.type,b.mailed?'Yes':'No']));
 });
 sh.getRange(1,1,rows.length,7).setValues(rows);sh.setFrozenRows(1);sh.getRange(1,1,1,7).setFontWeight('bold');sh.autoResizeColumns(1,7);
}
