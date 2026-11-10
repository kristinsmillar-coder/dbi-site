const fs=require('node:fs'),vm=require('node:vm'),{randomUUID}=require('node:crypto'),assert=require('node:assert/strict');
const {test}=require('node:test');
function setup(){
 const records=new Map(),mail=[];const ctx={PropertiesService:{getScriptProperties:()=>({getProperties:()=>Object.fromEntries(records),getProperty:k=>records.get(k),setProperty:(k,v)=>records.set(k,v)})},Utilities:{getUuid:randomUUID,formatDate:()=>''},LockService:{getScriptLock:()=>({waitLock(){},releaseLock(){}})},MailApp:{sendEmail:e=>mail.push(e)}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../tools/family-tickets.gs','utf8'),ctx);
 const request={id:randomUUID(),email:'parent@example.test',attending:'yes',guests:[{name:'Parent',type:'Adult guest'},{name:'Child',type:'Student'}]};
 const reserve=()=>ctx.reserve_({postData:{contents:JSON.stringify(request)}});const b=reserve(),token=b.manage.split('#manage=')[1],manage=(action,indices)=>ctx.manage_({action,indices,token});
 return {ctx,mail,request,reserve,b,token,manage,records};
}
test('one family reference, one email, private management link',()=>{
 const {ctx,b,reserve,mail}=setup();assert.equal(reserve().code,b.code);assert.equal(mail.length,1);assert.match(mail[0].htmlBody,/Manage reservation/);assert.equal(ctx.manage_({action:'status',token:b.code}).ok,false);
});
test('partial and full cancellations retain the audit trail and retries do not resend',()=>{
 const {manage,mail,ctx,token}=setup();assert.equal(ctx.manage_({action:'cancel',token:token.replace(/.$/,c=>c==='a'?'b':'a'),indices:[1]}).ok,false);
 assert.equal(manage('cancel',[44]).ok,false);const partial=manage('cancel',[1]);assert.equal(partial.guests[1].status,'Canceled');assert.equal(partial.guests[0].status,'Attending');
 manage('cancel',[1]);assert.equal(mail.length,2);assert.match(mail[1].body,/Still on the guest list: Parent/);
 assert.equal(manage('cancel',[0]).guests.every(g=>g.status==='Canceled'),true);
});
test('staff check-in prevents cancellation; canceled guests cannot check in',()=>{
 const {ctx,manage,request}=setup();let rowIndex=0,checked=true,written;const sheet={getName:()=> 'Guest list',getRange:(_,c)=>({getValue:()=>request.id+':'+rowIndex,isChecked:()=>checked,setValues:rows=>written=rows[0]})};const edit=()=>ctx.onEdit({range:{getSheet:()=>sheet,getColumn:()=>1,getRow:()=>2,getNumRows:()=>1},source:{toast(){}}});
 edit();assert.equal(written[3],'Checked in');assert.equal(manage('cancel',[0]).ok,false);checked=false;edit();assert.equal(written[3],'Attending');manage('cancel',[1]);rowIndex=1;checked=true;edit();assert.equal(written[0],false);assert.equal(written[3],'Canceled');
});
