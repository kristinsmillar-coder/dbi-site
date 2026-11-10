(() => {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#site-menu");
  const group=menu.querySelector('.program-group'), child=group.querySelector('.nav-subprogram'), disclosure=group.querySelector('button');
  function showFinance(open){
    child.hidden=!open;
    disclosure.setAttribute('aria-expanded',String(open));
    disclosure.setAttribute('aria-label',(open?'Hide':'Show')+' Finance Program');
  }
  group.addEventListener('pointerenter', e=>{if(e.pointerType==='mouse')showFinance(true);});
  group.addEventListener('pointerleave', e=>{if(e.pointerType==='mouse' && document.activeElement!==child)showFinance(false);});
  disclosure.addEventListener('click',()=>showFinance(child.hidden));
  group.addEventListener('focusout',e=>{if(!group.contains(e.relatedTarget))showFinance(false);});
  group.addEventListener('keydown',e=>{if(e.key==='Escape' && !child.hidden){e.preventDefault();e.stopPropagation();showFinance(false);disclosure.focus();}});
  menu.addEventListener('close',()=>showFinance(false));
  let previousOverflow = "";
  toggle.addEventListener("click", () => {
    previousOverflow = document.body.style.overflow;
    menu.showModal();
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    menu.querySelector("nav a").focus();
  });
  menu
    .querySelector(".menu-close")
    .addEventListener("click", () => menu.close());
  menu
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", () => menu.close()));
  menu.addEventListener("close", () => {
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = previousOverflow;
    toggle.focus();
  });
  const reducedMotion = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelector(".back-top").addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: reducedMotion() ? "instant" : "smooth",
    });
    document.querySelector(".brand").focus({ preventScroll: true });
  });
  const current = location.pathname.split("/").pop() || "index.html";
  menu.querySelectorAll("nav a").forEach((a) => {
    if (a.getAttribute("href") === current)
      a.setAttribute("aria-current", "page");
  });
  const track = document.querySelector(".stories-track");
  if (track) {
    const prev = document.querySelector("[data-story-prev]");
    const next = document.querySelector("[data-story-next]");
    const update = () => {
      prev.disabled =
        track.scrollLeft <= parseFloat(getComputedStyle(track).paddingLeft) + 5;
      next.disabled =
        track.scrollLeft >= track.scrollWidth - track.clientWidth - 5;
    };
    const step = (direction) => {
      const cards = track.querySelectorAll(".story");
      const distance =
        cards.length > 1
          ? cards[1].offsetLeft - cards[0].offsetLeft
          : track.clientWidth;
      track.scrollBy({
        left: direction * distance,
        behavior: reducedMotion() ? "instant" : "smooth",
      });
    };
    prev.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(1));
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }
})();
