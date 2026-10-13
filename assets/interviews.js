(function () {
  var BACKEND = 'https://script.google.com/macros/s/AKfycbyr9wBfiSPzpP6_0KvxD6rRUuaxgj_jj4Hq1DmAybUb58q378bk1p3vhFtZInJQmr54/exec';
  var PASSWORD = 'DBI2026FLAGSHIP';
  var DAY_NAMES = { tue: 'Tuesday, September 1', wed: 'Wednesday, September 2',
                    thu: 'Thursday, September 3', fri: 'Friday, September 4' };

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  // ── gate ──
  var unlocked = false;
  try { unlocked = sessionStorage.getItem('dbi-iv') === '1'; } catch (e) {}
  function unlock() { $('gate').hidden = true; $('iv-look').hidden = false; }
  if (unlocked) unlock();
  $('iv-pass').addEventListener('submit', function (e) {
    e.preventDefault();
    if ($('iv-pw').value.trim().toUpperCase() === PASSWORD) {
      try { sessionStorage.setItem('dbi-iv', '1'); } catch (err) {}
      unlock();
    } else {
      $('iv-wrong').hidden = false;
      $('iv-pw').select();
    }
  });

  // ── lookup ──
  $('iv-lookup').addEventListener('submit', function (e) {
    e.preventDefault();
    var email = $('iv-email').value.trim();
    var box = $('iv-result');
    box.hidden = false;
    box.className = 'iv-result';
    box.innerHTML = '<p class="fine">Looking&hellip;</p>';
    $('iv-find').disabled = true;
    fetch(BACKEND + '?email=' + encodeURIComponent(email), { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        $('iv-find').disabled = false;
        if (!d.found) {
          box.innerHTML = '<p class="fine">The lookup is still being switched on — try again ' +
            'in a few minutes, or email <a href="mailto:dbi@cathedralcatholic.org">dbi@cathedralcatholic.org</a>.</p>';
          return;
        }
        if (!d.found.length) {
          box.innerHTML = '<p class="fine">No interview found under <strong>' + esc(email) +
            '</strong>. Try the exact email you signed up with — or email ' +
            '<a href="mailto:dbi@cathedralcatholic.org">dbi@cathedralcatholic.org</a>.</p>';
          return;
        }
        box.className = 'iv-result on';
        box.innerHTML = d.found.map(function (f) {
          return '<p class="when" style="color:var(--gold)">Confirmed' +
                 (f.name ? ' · ' + esc(f.name) : '') + '</p>' +
                 '<h2 style="margin:0.5rem 0 0.25rem">' + (DAY_NAMES[f.day] || esc(f.day)) + '</h2>' +
                 '<p class="lede">' + esc(f.time) + ' PM</p>';
        }).join('<hr style="border:0;border-top:1px solid #241f20;margin:1.5rem 0">');
      })
      .catch(function () {
        $('iv-find').disabled = false;
        box.innerHTML = '<p class="fine">Couldn&rsquo;t reach the booking record — check your ' +
          'connection and try again.</p>';
      });
  });
})();
