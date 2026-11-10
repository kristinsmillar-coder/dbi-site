(() => {
  const endpoint = 'https://script.google.com/macros/s/AKfycbw3etwqRXBk9bqtY42lgk-LVlgW0mpWomSMYcmGWhD_ApXAa3dc6DnOS6HuC1FaBTEw/exec';
  const $ = id => document.getElementById(id);
  const form=$('family-rsvp'), list=$('family-guests'), result=$('family-result'), submit=$('family-submit'), add=$('add-guest');
  const yes=()=>form.elements.attending.value==='yes';
  const cards=()=>Array.from(list.children);
  function sync(){
    const attending=yes(), all=cards();
    all.forEach((el,i)=>{
      const hide=!attending && i>0;
      el.hidden=el.disabled=hide;
      el.querySelector('legend').textContent=attending?'Guest '+(i+1):'Your details';
      el.querySelector('button').hidden=i===0||!attending;
    });
    $('email-help').textContent=attending?'We’ll send all your tickets in one email.':'We’ll email you a copy of your response.';
    add.hidden=!attending||all.length>=20;
    $('family-count').textContent=attending?all.length+(all.length===1?' guest':' guests'):'No tickets requested';
    submit.textContent=attending?'Reserve '+all.length+(all.length===1?' free ticket':' free tickets'):'Send my response';
  }
  function append(focus){
    if(list.children.length>=20)return;
    const el=$('guest-fields').content.firstElementChild.cloneNode(true);
    list.append(el);
    el.querySelector('button').addEventListener('click',()=>{el.remove();sync();add.focus();});
    sync();if(focus)el.querySelector('input').focus();
  }
  function error(text){$('family-error').textContent=text;$('family-error').hidden=false;}
  function getId(signature){
    if(!getId.entry || getId.entry.signature!==signature){
      let saved;try{saved=JSON.parse(sessionStorage.getItem('dbi-ticket-request'));}catch{}
      getId.entry=(saved && saved.signature===signature)?saved:{signature,id:crypto.randomUUID()};
      try{sessionStorage.setItem('dbi-ticket-request',JSON.stringify(getId.entry));}catch{}
    }
    return getId.entry.id;
  }
  let payload,busy=false;
  async function send(){
    if(busy)return;busy=true;submit.disabled=true;$('mail-retry').disabled=true;
    submit.textContent='Sending…';$('family-error').hidden=true;
    try{
      const r=await fetch(endpoint,{method:'POST',body:JSON.stringify(payload),headers:{'Content-Type':'text/plain;charset=utf-8'},credentials:'omit',signal:AbortSignal.timeout(45000)});
      const data=await r.json();
      if(!data.ok)throw new Error(data.message||'Please check your details and try again.');
      const attending=payload.attending==='yes';
      form.hidden=true;result.hidden=false;
      $('result-title').textContent=attending?'You’re on the guest list.':'Thanks for letting us know.';
      $('result-message').textContent=data.mailed?'A confirmation has been sent to '+payload.email+'.':(attending?'Your seats are saved.':'Your response is saved.')+' The confirmation email hasn’t been sent yet.';
      $('result-ref').textContent=attending?'Your ticket reference: '+data.code:'No tickets were reserved.';
      $('result-names').replaceChildren(...(attending?payload.guests:[]).map(g=>{const li=document.createElement('li');li.textContent=g.name+' · '+g.type;return li;}));
      $('mail-retry').hidden=data.mailed;$('mail-status').textContent=data.mailed?'':('Keep this confirmation. If the email doesn’t arrive, please contact dbi@cathedralcatholic.org.');
      $('manage-result').hidden=!data.manage; if(data.manage)$('manage-result').href=data.manage;
      result.focus();
    }catch(e){
      const msg=/^Please check|^Online RSVPs|^Too many|^This request/.test(e.message)?e.message:'We couldn’t verify the response. Try again with the same details, or email dbi@cathedralcatholic.org.';
      if(result.hidden)error(msg);else $('mail-status').textContent=msg;
    }finally{busy=false;submit.disabled=false;$('mail-retry').disabled=false;sync();}
  }
  form.addEventListener('change',e=>{if(e.target.name==='attending')sync();});
  add.addEventListener('click',()=>append(true));
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(busy)return;
    const guests=cards().filter(c=>!c.disabled).map(c=>({name:c.querySelector('input').value.trim(),type:c.querySelector('select').value}));
    if(guests.some(g=>!g.name)){error('Please enter a full name for each guest.');return;}
    const raw={email:form.elements.email.value.trim(),attending:yes()?'yes':'no',guests,website:form.elements.website.value};
    const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(raw))))).map(v=>v.toString(16).padStart(2,'0')).join('');
    payload={...raw,id:getId(digest)};await send();
  });
  $('mail-retry').addEventListener('click',send);
  let manageToken='', selection=[], booking=null;
  const manager=$('ticket-manager'),review=$('review-cancel'),confirm=$('confirm-cancel');
  function showBooking(d){
    booking=d;selection=[];review.disabled=true;$('confirm-panel').hidden=true;
    $('manage-code').textContent='Reservation '+d.code;
    const live=d.guests.filter(g=>g.status==='Attending'||g.status==='Checked in').length;
    $('manage-note').textContent=live?live+' active '+(live===1?'ticket':'tickets')+'.':'Your entire reservation is canceled. No seats are reserved.';
    if(!d.open)$('manage-note').textContent+=' Online changes are closed.';
    const list=$('manage-list');list.replaceChildren();const legend=document.createElement('legend');legend.textContent='Guests on this reservation';list.append(legend);
    d.guests.forEach(g=>{const label=document.createElement('label'),cb=document.createElement('input'),span=document.createElement('span');
      cb.type='checkbox';cb.value=g.i;cb.disabled=!d.open||g.status!=='Attending';
      span.textContent=g.name+' · '+g.type+' · '+g.status;label.append(cb,span);list.append(label);
      cb.onchange=()=>{review.disabled=!list.querySelector('input:checked');$('confirm-panel').hidden=true;review.hidden=false;};});
    review.hidden=!d.open||!d.guests.some(g=>g.status==='Attending');$('choose-all').hidden=review.hidden;$('manage-controls').hidden=false;
  }
  async function manage(action,indices){
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},credentials:'omit',signal:AbortSignal.timeout(45000),body:JSON.stringify({action,token:manageToken,indices})});
    const d=await response.json();if(!d.ok)throw Error(d.message||'Could not load this reservation.');return d;
  }
  async function route(){
    if(!location.hash.startsWith('#manage='))return;
    manageToken=location.hash.slice(8);
    form.hidden=result.hidden=true;manager.hidden=false;
    document.querySelector('.ticket-invite > h2').hidden=true; document.querySelector('.ticket-invite > .lede').hidden=true;
    $('manage-note').textContent='Loading your guest list…';$('manage-controls').hidden=true;
    manager.scrollIntoView({block:'start'});
    try{showBooking(await manage('status'));}catch(e){$('manage-note').textContent=e.message+' For help, email dbi@cathedralcatholic.org.';}
  }
  $('choose-all').onclick=()=>{
    $('manage-list').querySelectorAll('input:not(:disabled)').forEach(cb=>cb.checked=true);
    review.disabled=false;review.hidden=false;$('confirm-panel').hidden=true;
  };
  review.onclick=()=>{
    selection=Array.from($('manage-list').querySelectorAll('input:checked')).map(el=>Number(el.value));if(!selection.length)return;
    const names=booking.guests.filter(g=>selection.includes(g.i)).map(g=>g.name);
    const left=booking.guests.filter(g=>['Attending','Checked in'].includes(g.status)&&!selection.includes(g.i)).map(g=>g.name);
    $('cancel-summary').textContent='Cancel tickets for '+names.join(', ')+'? '+(left.length?'Still attending: '+left.join(', ')+'.':'This cancels the entire reservation.');
    review.hidden=true;$('confirm-panel').hidden=false;confirm.focus();
  };
  $('keep-guests').onclick=()=>{$('confirm-panel').hidden=true;review.hidden=false;review.focus();};
  confirm.onclick=async()=>{
    confirm.disabled=true;$('keep-guests').disabled=true;$('manage-list').disabled=true;
    try{const d=await manage('cancel',selection);showBooking(d);$('manage-note').textContent='Cancellation saved. '+$('manage-note').textContent+(d.notified===true?' We emailed you the update.':d.notified===false?' The update email could not be sent.':'');}
    catch(e){$('manage-note').textContent=e.message+' Reload to see the current guest list.';}
    finally{confirm.disabled=false;$('manage-list').disabled=false;$('keep-guests').disabled=false;}
  };
  append(false);form.hidden=false;route();window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#manage='))route();else location.reload();});
})();
