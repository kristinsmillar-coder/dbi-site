
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cv = document.getElementById('confetti');
  var cx = cv.getContext('2d');
  var W, H, parts = [], running = false;
  function size() {
    W = cv.width = innerWidth * devicePixelRatio;
    H = cv.height = innerHeight * devicePixelRatio;
  }
  size(); addEventListener('resize', size);
  var COLORS = ['#C3A65C', '#E6B62B', '#A81B1B', '#FDFBF5', '#C3A65C'];
  function burst(x, y, n, spread, power) {
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * spread;
      var v = (0.4 + Math.random() * 0.6) * power;
      parts.push({
        x: x, y: y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        w: (4 + Math.random() * 5) * devicePixelRatio,
        h: (7 + Math.random() * 7) * devicePixelRatio,
        r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.25,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        life: 1, decay: 0.003 + Math.random() * 0.004
      });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  function tick() {
    cx.clearRect(0, 0, W, H);
    var g = 0.16 * devicePixelRatio;
    parts = parts.filter(function (p) { return p.life > 0 && p.y < H + 40; });
    parts.forEach(function (p) {
      p.vy += g; p.vx *= 0.992; p.vy *= 0.992;
      p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= p.decay;
      cx.save();
      cx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
      cx.translate(p.x, p.y); cx.rotate(p.r);
      cx.fillStyle = p.c;
      cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * (0.6 + 0.4 * Math.sin(p.r * 3)));
      cx.restore();
    });
    if (parts.length) requestAnimationFrame(tick); else running = false;
  }
  var P = devicePixelRatio;
  setTimeout(function () {
    burst(0.08 * W, H, 90, 1.1, 26 * P);
    burst(0.92 * W, H, 90, 1.1, 26 * P);
  }, 1150);
  setTimeout(function () { burst(0.5 * W, 0.42 * H, 70, Math.PI * 2, 9 * P); }, 1500);
  setTimeout(function () {
    var i = 0, rain = setInterval(function () {
      burst(Math.random() * W, -20, 8, 0.6, 4 * P);
      if (++i > 14) clearInterval(rain);
    }, 220);
  }, 1900);
})();

(function () {
  var els = [].slice.call(document.querySelectorAll('.rise'));
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el) { io.observe(el); });
})();
