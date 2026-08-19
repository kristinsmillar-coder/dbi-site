# design-sync notes — DBI

- This repo is the static DBI website, NOT a component library. The synced
  package lives at `design-system/` and was authored by hand, 1:1 from
  `assets/styles.css` and the live pages. When the site's design changes,
  update `design-system/src/dbi.css` (and tokens.css) to match — nothing
  regenerates it automatically.
- Build: `cd design-system && npm run build` (esbuild bundle + tsc
  declarations + `cat`-concatenated `dist/dbi.css` = tokens + components).
  `cssEntry` points at `dist/dbi.css` because the converter's `tokensGlob`
  only reads token files from a node_modules package.
- Converter deps live in `.ds-sync/` (gitignored). Node playwright pinned to
  1.60.0 — matches the chromium-1223 build already cached by the machine's
  Python playwright (`~/Library/Caches/ms-playwright`).
- `cardMode: column` overrides: ChooseGrid, ChallengeLadder, Surface,
  SectionHeader (wide stories).
- Brand photos + logo are copied into `ds-bundle/guidelines/assets/` AFTER
  the build from `design-system/brand/` — package-build wipes the out dir, so
  re-copy before every upload (`cp -r design-system/brand/photos/* …` etc.).
- Masthead is statically positioned in the DS (the live site fixes it to the
  viewport); phone hamburger behavior is site JS and deliberately not in the DS.

## Known render warns

- (none — 17/17 clean, all cells graded good on 2026-08-21)

## Re-sync risks

- The DS duplicates the site's CSS by hand — it silently drifts when
  `assets/styles.css` changes. On re-sync, diff `design-system/src/dbi.css`
  against the site stylesheet's matching rules.
- The site's program facts (50 seats, session dates, $20,000+) are baked into
  preview copy and docs — refresh when the program year rolls over.
- guidelines/assets are outside the converter's build; forgetting the
  post-build copy uploads a bundle whose imagery.md points at missing files.
- Grades carried in `.design-sync/.cache/` are machine-local; the uploaded
  `_ds_sync.json` is the durable anchor.
