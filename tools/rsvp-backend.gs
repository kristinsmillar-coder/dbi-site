/** @OnlyCurrentDoc */
/**
 * DBI Case Competition RSVPs (December 2, 2026) — backend.
 *
 * SETUP (once, ~5 minutes, from the dbi@cathedralcatholic.org account so
 * confirmation emails come from the DBI inbox):
 *  1. Create a new Google Sheet named "DBI Case Competition RSVPs".
 *  2. In the Sheet: Extensions → Apps Script. Delete any starter code,
 *     paste this entire file, and save.
 *  3. Deploy → New deployment → type "Web app":
 *       - Execute as: Me
 *       - Who has access: Anyone
 *     Click Deploy, authorize when asked, and copy the Web app URL
 *     (ends in /exec).
 *  4. Paste that URL into BACKEND at the top of assets/rsvp.js and push.
 *
 * The Sheet stays private to this account. Each email address gets one row;
 * submitting again with the same email updates that row instead of adding a
 * duplicate. Every RSVP emails the guest a confirmation and notifies the DBI
 * inbox.
 */

var NOTIFY = 'dbi@cathedralcatholic.org';
var EVENT = {
  name: 'The DBI Case Competition',
  date: 'Wednesday, December 2, 2026',
  doors: '4:30 PM',
  time: '4:30 – 8:00 PM',
  food: 'Food is served to close the evening',
  place: 'Guadalupe Center Theater, Cathedral Catholic High School',
  address: '5555 Del Mar Heights Rd, San Diego, CA 92130',
  calendar: 'https://cathedralcatholicdbi.org/assets/dbi-case-competition-2026.ics',
  page: 'https://cathedralcatholicdbi.org/rsvp.html'
};
var HEADERS = ['First RSVP', 'Last updated', 'First name', 'Last name', 'Email',
               'Attending', 'Party size', 'Dietary needs'];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('RSVPs');
  if (!sh) {
    sh = ss.insertSheet('RSVPs');
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function clean_(v, max) {
  return String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max || 200);
}

function esc_(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Simple health check: opening the /exec URL in a browser shows the totals.
function doGet() {
  var sh = sheet_();
  var n = sh.getLastRow();
  var yes = 0, guests = 0, no = 0;
  if (n >= 2) {
    sh.getRange(2, 6, n - 1, 2).getValues().forEach(function (r) {
      if (r[0] === 'Yes') { yes++; guests += Number(r[1]) || 0; } else { no++; }
    });
  }
  return out_({ ok: true, accepted: yes, totalGuests: guests, declined: no });
}

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.website) return out_({ ok: true }); // honeypot: bots fill hidden fields

  var first = clean_(p.firstName, 60);
  var last = clean_(p.lastName, 60);
  var email = clean_(p.email, 120).toLowerCase();
  var yes = p.attending === 'yes';
  var size = yes ? Math.min(Math.max(parseInt(p.partySize, 10) || 1, 1), 6) : 0;
  var dietary = yes ? clean_(p.dietary, 400) : '';

  if (!first || !last) return out_({ ok: false, error: 'missing_name' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return out_({ ok: false, error: 'bad_email' });

  var updated = false;
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh = sheet_();
    var now = new Date();
    var row = [first, last, email, yes ? 'Yes' : 'No', size, dietary];
    var n = sh.getLastRow();
    var emails = n >= 2 ? sh.getRange(2, 5, n - 1, 1).getValues() : [];
    for (var i = 0; i < emails.length; i++) {
      if (String(emails[i][0]).trim().toLowerCase() === email) {
        sh.getRange(i + 2, 2, 1, 7).setValues([[now].concat(row)]);
        updated = true;
        break;
      }
    }
    if (!updated) sh.appendRow([now, now].concat(row));
  } finally {
    lock.releaseLock();
  }

  // Emails never undo a saved RSVP.
  try { sendGuestEmail_(first, email, yes, size, dietary, updated); } catch (err) {}
  try {
    MailApp.sendEmail({
      to: NOTIFY,
      subject: (updated ? 'Updated RSVP: ' : 'New RSVP: ') + first + ' ' + last + ' — ' +
        (yes ? 'Yes (' + size + ')' : 'No'),
      body: first + ' ' + last + '\n' + email + '\nAttending: ' + (yes ? 'Yes' : 'No') +
        (yes ? '\nParty size: ' + size + (dietary ? '\nDietary: ' + dietary : '') : '')
    });
  } catch (err) {}

  return out_({ ok: true, updated: updated });
}

function sendGuestEmail_(first, email, yes, size, dietary, updated) {
  var subject = yes
    ? 'You’re confirmed: The DBI Case Competition, December 2'
    : 'We’ll miss you at the DBI Case Competition';

  var intro = yes
    ? 'Thank you for your RSVP. We’re delighted you’ll be joining us' +
      (size > 1 ? ' with a party of ' + size : '') + ' for an evening of student strategy ' +
      'and real-company problem solving.'
    : 'Thank you for letting us know you can’t make it. If your plans change, you can ' +
      'update your response on the RSVP page any time.';
  if (updated) intro = 'Your RSVP has been updated. ' + intro;

  var rows = [['Date', EVENT.date], ['Doors open', EVENT.doors], ['Event', EVENT.time],
              ['Dinner', EVENT.food], ['Location', EVENT.place + '<br><span style="color:#68645d">' +
              EVENT.address + '</span>']];
  if (yes) rows.push(['Your party', size === 1 ? '1 guest' : size + ' guests']);
  if (yes && dietary) rows.push(['Dietary notes', esc_(dietary)]);

  var table = rows.map(function (r) {
    return '<tr><td style="padding:12px 0;border-top:1px solid #e6dcc6;width:130px;' +
      'font:600 12px/1.5 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;' +
      'color:#856b30;vertical-align:top">' + r[0] + '</td><td style="padding:12px 0;' +
      'border-top:1px solid #e6dcc6;font:16px/1.5 Arial,sans-serif;color:#333">' +
      r[1] + '</td></tr>';
  }).join('');

  var button = yes
    ? '<a href="' + EVENT.calendar + '" style="display:inline-block;background:#a81b1b;' +
      'color:#ffffff;text-decoration:none;font:16px Arial,sans-serif;padding:14px 26px">' +
      'Add to calendar &rarr;</a>'
    : '<a href="' + EVENT.page + '" style="display:inline-block;background:#a81b1b;' +
      'color:#ffffff;text-decoration:none;font:16px Arial,sans-serif;padding:14px 26px">' +
      'Change my response &rarr;</a>';

  var html =
    '<div style="background:#f1ede3;padding:32px 12px">' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" ' +
    'style="max-width:580px;margin:0 auto;background:#fdfbf5;border-collapse:collapse">' +
    '<tr><td style="background:#901111;padding:36px 40px;text-align:center">' +
    '<div style="font:600 12px/1.4 Arial,sans-serif;letter-spacing:.14em;color:#edd8a2;' +
    'text-transform:uppercase">Dons Business Institute</div>' +
    '<div style="font:32px/1.2 Georgia,serif;color:#ffffff;margin-top:10px">' +
    (yes ? 'You’re on the list.' : 'Thank you for responding.') + '</div>' +
    '</td></tr>' +
    '<tr><td style="padding:36px 40px 8px">' +
    '<p style="font:17px/1.6 Arial,sans-serif;color:#333;margin:0 0 6px">Dear ' +
    esc_(first) + ',</p>' +
    '<p style="font:17px/1.6 Arial,sans-serif;color:#333;margin:0 0 26px">' + intro + '</p>' +
    '<div style="font:24px/1.25 Georgia,serif;color:#a81b1b;margin:0 0 6px">' +
    EVENT.name + '</div>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" ' +
    'style="border-collapse:collapse;border-bottom:1px solid #e6dcc6">' + table + '</table>' +
    '<div style="padding:30px 0 8px">' + button + '</div>' +
    '</td></tr>' +
    '<tr><td style="padding:24px 40px 36px;font:14px/1.6 Arial,sans-serif;color:#68645d">' +
    'Questions? Reply to this email or write to ' +
    '<a href="mailto:' + NOTIFY + '" style="color:#a81b1b">' + NOTIFY + '</a>.<br>' +
    'Dons Business Institute &middot; Cathedral Catholic High School' +
    '</td></tr></table></div>';

  var text = 'Dear ' + first + ',\n\n' + intro + '\n\n' + EVENT.name + '\n' +
    EVENT.date + '\nDoors open ' + EVENT.doors + ' · Event ' + EVENT.time + '\n' +
    EVENT.food + '\n' + EVENT.place + ', ' + EVENT.address + '\n' +
    (yes ? 'Party size: ' + size + '\n' : '') +
    (yes ? '\nAdd to calendar: ' + EVENT.calendar : '\nChange your response: ' + EVENT.page) +
    '\n\nQuestions? ' + NOTIFY + '\n— Dons Business Institute';

  MailApp.sendEmail({
    to: email,
    subject: subject,
    body: text,
    htmlBody: html,
    name: 'Dons Business Institute',
    replyTo: NOTIFY
  });
}
