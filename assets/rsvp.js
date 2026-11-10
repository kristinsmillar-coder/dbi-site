(function () {
  // Paste the Apps Script web-app URL (ends in /exec) from tools/rsvp-backend.gs here.
  var BACKEND = '';

  var form = document.getElementById('rsvp-form');
  if (!form) return;
  var $ = function (id) { return document.getElementById(id); };
  var yesBlock = form.querySelector('.rsvp-if-yes');
  var errorBox = $('rsvp-error');
  var submit = $('rsvp-submit');
  var done = $('rsvp-done');

  function attending() {
    var c = form.querySelector('input[name="attending"]:checked');
    return c ? c.value : 'yes';
  }
  function syncChoice() {
    var yes = attending() === 'yes';
    yesBlock.hidden = !yes;
    submit.textContent = yes ? 'Send my RSVP' : 'Send my response';
  }
  form.addEventListener('change', function (e) {
    if (e.target.name === 'attending') syncChoice();
    if (e.target.getAttribute('aria-invalid')) e.target.removeAttribute('aria-invalid');
  });
  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid')) e.target.removeAttribute('aria-invalid');
  });
  syncChoice();

  function showError(msg, field) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
    if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
  }

  function validate() {
    var checks = [
      [form.firstName, 'Please enter your first name.'],
      [form.lastName, 'Please enter your last name.']
    ];
    for (var i = 0; i < checks.length; i++) {
      if (!checks[i][0].value.trim()) return showError(checks[i][1], checks[i][0]), false;
    }
    var email = form.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      showError('Please enter a valid email address so we can send your confirmation.', form.email);
      return false;
    }
    return true;
  }

  function finish(data) {
    var yes = data.attending === 'yes';
    var size = parseInt(data.partySize, 10) || 1;
    $('rsvp-done-title').textContent = yes
      ? 'You’re on the list, ' + data.firstName + '.'
      : 'Thank you, ' + data.firstName + '.';
    $('rsvp-done-body').textContent = yes
      ? 'We’ve saved ' + (size === 1 ? 'a seat for you' : size + ' seats for your party') +
        ' on Wednesday, December 2. Doors open at 4:30 PM.'
      : 'We’re sorry you can’t make it, and we appreciate you letting us know.';
    $('rsvp-done-mail').textContent = 'A confirmation is on its way to ' + data.email + '.';
    $('rsvp-done-cal').hidden = !yes;
    form.hidden = true;
    done.hidden = false;
    done.focus();
    done.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $('rsvp-again').addEventListener('click', function () {
    done.hidden = true;
    form.hidden = false;
    form.firstName.focus();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorBox.hidden = true;
    if (!validate()) return;

    var data = {
      attending: attending(),
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      email: form.email.value.trim(),
      partySize: attending() === 'yes' ? form.partySize.value : '0',
      dietary: attending() === 'yes' ? form.dietary.value.trim() : '',
      website: form.website.value
    };

    if (!BACKEND) {
      showError('Online RSVPs are being switched on. Please email dbi@cathedralcatholic.org to RSVP in the meantime.');
      return;
    }

    var label = submit.textContent;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    fetch(BACKEND, { method: 'POST', body: new URLSearchParams(data) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        submit.disabled = false;
        submit.textContent = label;
        if (res && res.ok) return finish(data);
        showError('We couldn’t save your RSVP. Please check your details and try again, or email dbi@cathedralcatholic.org.');
      })
      .catch(function () {
        submit.disabled = false;
        submit.textContent = label;
        showError('We couldn’t reach the RSVP list. Check your connection and try again, or email dbi@cathedralcatholic.org.');
      });
  });
})();
