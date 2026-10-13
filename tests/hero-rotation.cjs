// Regression: an earlier first RAF timestamp must never select word -1.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const source = fs.readFileSync(
  path.join(__dirname, "../assets/descent.js"),
  "utf8",
);
const controller = source.slice(
  source.indexOf("  var introWords ="),
  source.indexOf("  var holdStart ="),
);
assert(controller.includes("function updateIntro"));
const words = ["Enterprise", "Leadership", "Purpose"].map((text, i) => {
  const classes = new Set(i === 0 ? ["is-active"] : []);
  return {
    text,
    classes,
    classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c) },
  };
});
const bars = words.map(() => ({
  progress: 0,
  style: {
    setProperty(_, value) {
      this.owner.progress = value;
    },
  },
}));
bars.forEach((b) => (b.style.owner = b));
const events = {};
const context = vm.createContext({
  hint: {
    querySelectorAll: (selector) =>
      selector.includes("intro-title") ? words : bars,
  },
  document: {
    hidden: false,
    addEventListener: (event, fn) => (events[event] = fn),
  },
  target: 0,
  current: 0,
});
vm.runInContext(controller, context);
function frame(time, expected) {
  context.updateIntro(time);
  assert.deepEqual(
    words.filter((w) => w.classes.has("is-active")).map((w) => w.text),
    [expected],
  );
  assert(bars.every((b) => b.progress >= 0 && b.progress <= 1));
}
frame(100, "Enterprise");
frame(90, "Enterprise"); // Previously removed Enterprise, then threw on index -1.
frame(2590, "Enterprise");
assert.equal(bars[0].progress, 0.5);
frame(5090, "Leadership");
frame(10090, "Purpose");
frame(15090, "Enterprise");
context.target = context.current = 0.2;
frame(18090, "Enterprise");
context.target = context.current = 0;
frame(20090, "Enterprise");
frame(25090, "Leadership");
context.document.hidden = true;
events.visibilitychange();
frame(30090, "Leadership");
context.document.hidden = false;
events.visibilitychange();
frame(40090, "Leadership");
frame(45090, "Purpose");
console.log(
  "Hero rotation passes: earlier timestamps, progress, full cycle, scroll pause and tab resume.",
);
