// The one orchestrated moment on the page is the descent. Scroll owns the
// camera: progress through the section scrubs the video, and the copy stages
// hand off from altitude to the ground. With reduced motion (or no JS) the
// section is simply a still of the campus with the full headline — nothing moves.
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var root = document.documentElement;
  root.classList.add("animate");

  var sect = document.querySelector(".descent");
  var vid = sect.querySelector(".descent-video");
  var stages = [].slice.call(sect.querySelectorAll(".stage-copy"));
  var hint = sect.querySelector(".intro-lockup");
  var introWords = hint ? hint.querySelectorAll(".intro-title > span") : [];
  var introBars = hint ? hint.querySelectorAll(".hero-progress > span") : [];
  var introElapsed = 0;
  var introLastTime = null;
  var introIndex = 0;
  var introInterval = 2500;

  // The title runs on time, independently of the scroll-controlled camera.
  // Preserve its place while the tab or opening title is out of view.
  document.addEventListener("visibilitychange", function () {
    introLastTime = null;
  });
  function updateIntro(now) {
    if (!introWords.length) return;
    if (document.hidden || target > 0.105 || current > 0.105) {
      introLastTime = null;
      return;
    }
    if (introLastTime !== null) {
      introElapsed =
        (introElapsed + Math.max(0, now - introLastTime)) %
        (introInterval * introWords.length);
    }
    introLastTime = now;
    var next = Math.floor(introElapsed / introInterval) % introWords.length;
    if (next !== introIndex) {
      introWords[next].classList.add("is-active");
      introWords[introIndex].classList.remove("is-active");
      introIndex = next;
    }
    var progress = (introElapsed % introInterval) / introInterval;
    introBars.forEach(function (bar, index) {
      bar.style.setProperty(
        "--progress",
        index < introIndex ? 1 : index === introIndex ? progress : 0,
      );
    });
  }
  var holdStart = sect.querySelector(".hold-start");
  var holdEnd = sect.querySelector(".hold-end");
  var duration = 0,
    target = 0,
    current = -1;

  // The ladder: stream the 5.6MB tier instantly, then pull each tier fully
  // into memory and swap to the blob — a blob-backed video cannot stall a
  // seek, on any device or connection. Quality upgrades ride in behind.
  var h264 = vid.canPlayType('video/mp4; codecs="avc1.640028"');
  var retina = window.innerWidth * (window.devicePixelRatio || 1) >= 2200;
  // navigator.connection.downlink is privacy-capped at 10Mbps in Chrome, so it
  // can't gate a 65MB file. Instead, the 960 fetch below doubles as a REAL
  // bandwidth probe: the measured speed decides whether 2880 is affordable.
  var probeMbps = 0;

  // True once the video has EVER delivered metadata. Blob swaps zero out
  // `duration` for a moment — this flag is what tells "mid-upgrade" apart
  // from "never loaded at all" (Low Power Mode before any touch).
  var everLoaded = false;

  // ── Two stacked elements. `front` is live and owns the scrub; upgrades
  // load fully in the hidden `back` element and only become front once
  // provably seekable. The live video is NEVER touched by an upgrade, so a
  // wedged or failed upgrade costs nothing — the old tier just keeps playing.
  var back = vid.cloneNode(false);
  back.removeAttribute("poster");
  // Safari honors the muted/playsinline PROPERTIES, not cloned attributes,
  // on dynamically-inserted videos — without these the standby's play()
  // rejects and its seek pipeline never opens.
  back.muted = true;
  back.playsInline = true;
  back.style.visibility = "hidden";
  vid.parentNode.insertBefore(back, vid.nextSibling);
  var front = vid;
  front.muted = true;

  // iPadOS reports a Mac user agent; touch points give it away. Older iPad
  // silicon can't decode 1440p60 all-intra at scrub rate — gate the tier by
  // core count (Apple-silicon and Pro iPads report 8+) and halve the seek
  // rate so the decoder keeps up.
  var iPad =
    navigator.maxTouchPoints > 1 && /iPad|Macintosh/.test(navigator.userAgent);
  var weakDecode = iPad && (navigator.hardwareConcurrency || 4) < 8;
  var seekStep = weakDecode ? 0.034 : 0.015;

  // iOS will not paint seek frames on a video that has never entered
  // playback — one muted play/pause on arrival opens the pipeline.
  [front, back].forEach(function (v) {
    v.addEventListener("loadedmetadata", function () {
      everLoaded = true;
      if (v === front) duration = v.duration;
      var kick = v.play();
      if (kick)
        kick
          .then(function () {
            v.pause();
          })
          .catch(function () {});
    });
    // Only a LIVE element's failure matters; a failed upgrade is abandoned.
    v.addEventListener("error", function () {
      if (v !== front || fellBack) return;
      fellBack = true;
      duration = 0;
      front.dataset.tier = "fallback-1440";
      front.src = "assets/descent-1440.mp4";
      front.load();
    });
  });
  var fellBack = false;

  // Low Power Mode blocks preload until a real gesture. A play() call inside
  // the gesture starts the load — and is harmless if loading is already under
  // way (no load() here: restarting a healthy in-flight load causes the
  // startup stutter). Re-arms on every touch until something has loaded.
  function gestureKick() {
    if (everLoaded) {
      removeEventListener("touchstart", gestureKick);
      removeEventListener("pointerdown", gestureKick);
      return;
    }
    var k = front.play();
    if (k)
      k.then(function () {
        front.pause();
      }).catch(function () {});
  }
  addEventListener("touchstart", gestureKick, { passive: true });
  addEventListener("pointerdown", gestureKick, { passive: true });

  function upgradeTo(url, label, done) {
    var next = back;
    var guard = setTimeout(fail, 10000);
    function cleanup() {
      clearTimeout(guard);
      next.removeEventListener("loadedmetadata", onMeta);
      next.removeEventListener("seeked", onSeeked);
    }
    function fail() {
      cleanup();
      if (done) done(false);
    }
    function onMeta() {
      // Align the standby to the live frame; 'seeked' proves it can paint.
      try {
        next.currentTime = front.currentTime;
      } catch (e) {
        fail();
      }
    }
    function onSeeked() {
      cleanup();
      next.style.visibility = "";
      front.style.visibility = "hidden";
      var old = front;
      front = next;
      back = old;
      duration = front.duration;
      front.dataset.tier = label;
      // Re-open the paint pipeline on the newly-live element — its earlier
      // kick may have been refused before the mute settings landed.
      var k = front.play();
      if (k)
        k.then(function () {
          front.pause();
        }).catch(function () {});
      if (done) done(true);
    }
    next.addEventListener("loadedmetadata", onMeta);
    next.addEventListener("seeked", onSeeked);
    next.dataset.tier = "loading:" + label;
    next.src = url;
    next.load();
  }

  function fetchToBlob(name, cb) {
    fetch("assets/" + name)
      .then(function (r) {
        return r.ok ? r.blob() : Promise.reject();
      })
      .then(function (bl) {
        cb(URL.createObjectURL(bl));
      })
      .catch(function () {});
  }

  if (h264) {
    front.src = "assets/descent-960.mp4";
    front.dataset.tier = "960-stream";
    var probeStart = performance.now();
    fetchToBlob("descent-960.mp4", function (url) {
      probeMbps =
        (5.6 * 8) / Math.max(0.05, (performance.now() - probeStart) / 1000);
      upgradeTo(url, "960-blob", function () {
        // 65MB wants ~40Mbps to arrive before most visitors finish reading
        // the fold; below that, 1440 (21.5MB) is the honest ceiling.
        if (weakDecode) return; // 960 is what this chip can scrub
        var finalTier = !iPad && retina && probeMbps >= 40 ? "2880" : "1440";
        fetchToBlob("descent-" + finalTier + ".mp4", function (u2) {
          upgradeTo(u2, finalTier + "-blob");
        });
      });
    });
  } else {
    front.src = "assets/descent-1440.webm";
    front.dataset.tier = "webm-stream";
    fetchToBlob("descent-1440.webm", function (url) {
      upgradeTo(url, "webm-blob");
    });
  }
  front.load();

  function clamp01(x) {
    return Math.min(1, Math.max(0, x));
  }

  function measure() {
    var runway = sect.offsetHeight - window.innerHeight;
    target =
      runway > 0 ? clamp01(-sect.getBoundingClientRect().top / runway) : 0;
  }
  addEventListener("scroll", measure, { passive: true });
  addEventListener("resize", measure);
  measure();

  var lastWritten = -1;
  function tick(now) {
    requestAnimationFrame(tick);
    updateIntro(now);
    // Idle when the hero is far off-screen: these writes are pure tax on
    // every other animation on the page.
    if (window.scrollY > sect.offsetHeight + window.innerHeight) return;
    // Ease toward the scroll position so fast flicks glide instead of jumping —
    // then snap, so the pin can never release with the video mid-descent.
    current = current < 0 ? target : current + (target - current) * 0.3;
    if (Math.abs(target - current) < 0.002) current = target;
    var settled = current === lastWritten;
    lastWritten = current;

    // The video seek runs every frame even when scroll is settled: the buffer
    // frontier keeps advancing during download, and the clamped scrub must
    // glide forward with it or it freezes at wherever the clamp caught it.
    if (duration) {
      var t = current * Math.max(0, duration - 0.05);
      // Never seek past the download frontier: an unbuffered seek stalls the
      // video and reads as stutter. Clamp to the contiguous buffered range
      // from 0 — the scrub simply waits at the frontier and glides on as
      // bytes arrive.
      var br = front.buffered,
        lim = 0;
      for (var bi = 0; bi < br.length; bi++) {
        if (br.start(bi) <= lim + 0.1) lim = Math.max(lim, br.end(bi));
      }
      t = Math.min(t, Math.max(0, lim - 0.1));
      if (Math.abs(front.currentTime - t) > seekStep) front.currentTime = t;
    }
    if (settled) return; // style writes below only when something changed

    var veil = 0;
    for (var i = 0; i < stages.length; i++) {
      var el = stages[i];
      var a = +el.dataset.from,
        b = +el.dataset.to,
        span = b - a || 1;
      var o = Math.min(
        clamp01((current - a) / (span * 0.28)), // fade in
        b >= 0.999 ? 1 : clamp01((b - current) / (span * 0.28)), // fade out; final stage stays
      );
      el.style.opacity = o;
      if (el.classList.contains("stage-c")) {
        el.style.pointerEvents = o > 0.5 ? "auto" : "none";
        el.querySelectorAll("a").forEach(function (a) {
          a.tabIndex = o > 0.5 ? 0 : -1;
        });
      } else {
        el.style.visibility = o > 0.01 ? "visible" : "hidden";
        veil = Math.max(veil, o);
      }
    }

    sect.style.setProperty("--landing", clamp01((current - 0.6) / 0.28));
    sect.style.setProperty("--veil", (veil * 0.85).toFixed(3));
    if (hint) {
      var ho = Math.max(0, 1 - current * 9);
      hint.style.opacity = ho;
      hint.style.visibility = ho > 0.02 ? "visible" : "hidden";
    }
    // Header appearance is managed by site.js.
    // At rest, show the pristine stills; the video only carries the motion.
    // If the video never produced frames (Low Power Mode with no touch yet),
    // the two stills crossfade over the whole descent instead — degraded,
    // but never a black hole. Keyed on everLoaded, NOT current duration:
    // blob swaps zero duration transiently and must not flash the stills.
    var frames = everLoaded;
    if (holdStart)
      holdStart.style.opacity = frames
        ? clamp01(1 - current * 12)
        : clamp01(1 - current * 1.6);
    if (holdEnd) {
      // Eased hand-off over the final 10% — by the time the camera settles,
      // the still is already fully in and nothing visibly "switches".
      var e = frames
        ? clamp01((current - 0.9) / 0.1)
        : clamp01((current - 0.5) / 0.35);
      holdEnd.style.opacity = e * e * (3 - 2 * e);
    }
    // The film: dark while travelling, gone at both resting points — it masks
    // motion-compression and lifts the copy stages off the terrain.
    sect.style.setProperty(
      "--film",
      (Math.min(1, Math.min(current, 1 - current) * 5) * 0.34).toFixed(3),
    );
  }
  requestAnimationFrame(tick);
})();
