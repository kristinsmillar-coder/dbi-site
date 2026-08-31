/**
 * DBI Flagship interview sign-ups — backend.
 *
 * SETUP (once, ~5 minutes, from the dbi@cathedralcatholic.org account):
 *  1. Create a new Google Sheet named "DBI Interview Signups".
 *  2. In the Sheet: Extensions → Apps Script. Delete any starter code,
 *     paste this entire file, and save.
 *  3. Deploy → New deployment → type "Web app":
 *       - Execute as: Me
 *       - Who has access: Anyone
 *     Click Deploy, authorize when asked, and copy the Web app URL
 *     (ends in /exec). Send that URL to Claude to wire into the site.
 *
 * The Sheet stays private to this account. Each booking appends one row.
 */

var SLOT_CATALOG = (function () {
  var mk = function (day, times) {
    return times.map(function (t) { return day + '|' + t; });
  };
  var full = ['2:30–2:36','2:38–2:44','2:46–2:52','2:54–3:00','3:02–3:08',
              '3:10–3:16','3:18–3:24','3:26–3:32','3:34–3:40','3:42–3:48',
              '4:00–4:06','4:08–4:14','4:16–4:22','4:24–4:30','4:32–4:38',
              '4:40–4:46','4:48–4:54','4:56–5:02'];
  var short_ = full.slice(0, 17); // Thu/Fri end at 4:48–4:54
  var ids = [];
  ids = ids.concat(mk('tue', full), mk('wed', full), mk('thu', short_), mk('fri', short_));
  return ids;
})();

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('Bookings');
  if (!sh) {
    sh = ss.insertSheet('Bookings');
    sh.appendRow(['Slot ID','Day','Time','Name','School','Phone','Email',
                  'Grad year','Parent name','Parent email','Parent phone','Booked at']);
  }
  return sh;
}

function bookedIds_() {
  var sh = sheet_();
  var n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, 1).getValues().map(function (r) { return String(r[0]); });
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return out_({ ok: true, booked: bookedIds_() });
}

function doPost(e) {
  var p = (e && e.parameter) || {};
  var required = ['slot','day','time','name','school','phone','email','gradYear',
                  'parentName','parentEmail','parentPhone'];
  for (var i = 0; i < required.length; i++) {
    if (!p[required[i]] || !String(p[required[i]]).trim()) {
      return out_({ ok: false, error: 'missing:' + required[i] });
    }
  }
  if (SLOT_CATALOG.indexOf(p.slot) === -1) return out_({ ok: false, error: 'bad_slot' });

  // The lock is what makes double-booking impossible under simultaneous clicks.
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (bookedIds_().indexOf(p.slot) !== -1) return out_({ ok: false, error: 'taken' });
    sheet_().appendRow([p.slot, p.day, p.time,
      String(p.name).trim(), String(p.school).trim(), String(p.phone).trim(),
      String(p.email).trim(), String(p.gradYear).trim(), String(p.parentName).trim(),
      String(p.parentEmail).trim(), String(p.parentPhone).trim(), new Date()]);
  } finally {
    lock.releaseLock();
  }

  // Confirmations — student, parent, and the DBI inbox. Failures never
  // un-book the slot.
  try {
    var when = p.day.charAt(0).toUpperCase() + p.day.slice(1) + ' · ' + p.time + ' PM';
    var dayNames = { tue: 'Tuesday, September 1', wed: 'Wednesday, September 2',
                     thu: 'Thursday, September 3', fri: 'Friday, September 4' };
    var pretty = (dayNames[p.day] || p.day) + ' · ' + p.time + ' PM';
    var body = 'Hi ' + p.name + ',\n\n' +
      'Your Dons Business Institute Flagship interview is confirmed:\n\n' +
      '  ' + pretty + '\n\n' +
      'Interviews run about six minutes. Arrive a few minutes early, be yourself, ' +
      'and remember: we are not testing what you already know about business.\n\n' +
      '— The Dons Business Institute\ndbi@cathedralcatholic.org';
    MailApp.sendEmail(p.email, 'DBI interview confirmed — ' + pretty, body);
    MailApp.sendEmail(p.parentEmail, 'DBI interview confirmed for ' + p.name + ' — ' + pretty, body);
    MailApp.sendEmail('dbi@cathedralcatholic.org',
      'New interview booking: ' + p.name + ' — ' + pretty,
      p.name + ' (' + p.school + ', class of ' + p.gradYear + ')\n' +
      p.email + ' · ' + p.phone + '\nParent: ' + p.parentName + ' · ' +
      p.parentEmail + ' · ' + p.parentPhone);
  } catch (err) {}

  return out_({ ok: true });
}
