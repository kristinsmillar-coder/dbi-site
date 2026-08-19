# Building with the DBI design system

**Wrap everything in `Surface`.** Every design starts with
`<Surface ground="dark">` — it carries the page ground, text color, and body
typography the other components assume. Grounds: `dark` (the default identity —
near-black theater), `paper` (warm classroom), `white` (borderless imagery).
Build pages by stacking Surfaces in alternating grounds, exactly like the site.

```tsx
<Surface ground="dark" padded>
  <SectionHeader eyebrow="Application season · Fall 2026" eyebrowTone="gold"
    title="Applications are open." lede="Two programs. One bar." />
  <ProofBar label="Every year at DBI" items={[
    { n: '~200', label: 'applications reviewed' },
    { n: '$20,000+', label: 'awarded in prizes' },
  ]} />
  <Actions>
    <Button variant="primary" href="#">Apply to DBI</Button>
    <Button href="#">See what a session is like</Button>
  </Actions>
</Surface>
```

**Color is rationed, strictly.** Red (`var(--red)`) = the school; it marks
exactly ONE thing per screen (the primary Button, an active state, a rule).
Gold (`var(--gold)`) = the award only — prizes, winning steps, celebration
eyebrows; wrap inline award text in `<Prize>`. On paper/white grounds use
`var(--gold-ink)` where gold text is needed (components handle this
automatically). Everything else is the neutrals: `--ground`, `--ground-2`,
`--paper`, `--ink`, `--dim`, `--dim-on-dark`.

**Styling idiom: tokens + the shipped class vocabulary, no new invention.**
For your own layout glue, use the CSS custom properties (`var(--red)`,
`var(--gutter)`, `var(--stack)`, `var(--measure)`) and these real classes from
`styles.css`: `.eyebrow` (+`.eyebrow--gold`), `.lede`, `.narrow`, `.fine`,
`.when`, `.prize`, `.motto`, `.actions`, `.two-col`. Square corners
everywhere — never add border-radius, drop shadows, or decorative gradients.
Structure comes from 1px hairline rules: `#241f20` on dark, `#E7E0DA` on light.

**Type voice.** Headings are Young Serif sentence-case declarations ending
with a period ("Applications are open."). All metadata — labels, datelines,
buttons, captions — is DM Mono, uppercase, letterspaced (the `.when` /
`.eyebrow` classes). Body is Work Sans. Concrete numbers beat adjectives.

**Truth lives in** `styles.css` (tokens at the top, every component rule
below) and each component's `.prompt.md`. Photography guidance and the shipped
photo library are in `guidelines/imagery.md` — real photography only, never
stock or AI-generated imagery. The logo is the `Lockup` component (dark
grounds only; never recolor or separate its parts).
