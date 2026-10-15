# DBI × Cathedral Catholic redesign

The Cathedral redesign is approved for production on October 14, 2026. GitHub Pages publishes `main` at https://cathedralcatholicdbi.org/. See `ARCHIVE.md` for the previous website and restoration instructions.

## Reference and direction

The homepage and academic overview at https://www.cathedralcatholic.org/ are the direct visual references. This rebuild follows the school's actual page compositions: large white school masthead, divided utility links, persistent framed red menu, low-centered gold hero title, large serif welcome statement with palm/dove artwork, full-height photography, editorial image-and-text sections, red admissions band, and cream footer with solid red calls to action and a pale-gold base.

Inner pages follow the school's full-width photo header, breadcrumb/title overlay, red serif introduction band, and red fact panels. The palette is Cathedral red (#A81B1B), gold (#C3A65C), and warm white (#FDFBF5), using Big Caslon FB and Neue Haas Grotesk. The public school assets and font definitions are the same ones used in the approved Dons Connect build.

DBI's original aerial descent remains the opening interaction. The video files, quality ladder, buffering, rest frames and timing are preserved; the surrounding layout and typography are rebuilt. Reduced motion uses a static campus image and skips video loading. Hidden animation links are excluded from keyboard focus until visible.

Photography uses selected full-resolution originals from the supplied 288-image DBI archive, alongside existing DBI repository assets. See `assets/img/SOURCES.md` for provenance. Use DBI photography first and Cathedral Catholic imagery as the fallback; no stock photos. Finance uses distinct photos and excludes the Flagship entrepreneurship group portrait. Flagship is presented as the main selective program, with dedicated explanations of its fall Case Competition and spring Startup Summit. Finance has a smaller supporting section.

Admissions explains the written application, invited interview and final selection, with new-student applications only at the start of school in the fall. Spring selection is an internal progression for current Flagship students. Exact dates are left to school announcements. Evergreen application buttons are replaced with admissions information; calendars, giving and contact links remain. Original admissions letters and interview content are preserved verbatim.

## Local development

1. Edit fragments in `site/pages`, page metadata in `site/pages.json`, and the shared layout in `site/templates/base.html`.
2. Run `python3 tools/build-site.py` to regenerate the nine root HTML pages.
3. Run `python3 tools/serve.py 8420` and open http://127.0.0.1:8420.

CSS and JavaScript are served directly. No Node dependencies or external build service are needed. The preview server binds only to loopback and supports video Range requests. Public pages have production canonical URLs. Interview and acceptance pages remain noindex; the archived site is also noindex.

## Validation

- All nine pages checked at 320px: no horizontal overflow, no broken loaded images, no browser errors.
- Desktop and phone screenshots reviewed for the homepage, menu, and program headers.
- Menu navigation, Escape dismissal, focus return, and skip-introduction link exercised.
- Reduced-motion mode confirmed: visible static heading, no scroll runway, no video source.
- JavaScript syntax checks pass for all five scripts.
- Every local link, asset path, fragment and page ID validated.
- Admissions and interview body content compared exactly with the original main branch.
- No external application submissions, payments or real student-record lookups performed.

## Program details

The homepage and program pages explicitly describe after-school instruction by working industry professionals. Flagship includes a sample afternoon agenda and a workshop example; calendar dates provide actual session start times. The USD page features Brian Tietje specifically as an advisory board member and includes The Brink SBDC relationship. His profile is not on the homepage. The hero title changes every 2.5 seconds; `node tests/hero-rotation.cjs` verifies timing and the blank-title startup regression.

## Section and action consistency

All nine pages were audited for section boundaries and responsive spacing. Major editorial blocks alternate cream and warm neutral backgrounds; the Flagship semester progression is a compact deep-red band. Thin rules separate remaining shared-color boundaries, while the homepage event introduction remains grouped with its first event. Editorial sections use 90px vertical padding on desktop and 60px on phones, with tighter supporting bands and normalized trailing margins.

Primary actions share the approved giving-button geometry, solid red fill, typography, arrows and hover state. Actions on red bands use a cream inverse for contrast. Secondary actions use simple underlined text links. Desktop, tablet footer and 320px phone layouts were checked, including all nine pages for horizontal overflow and clipped buttons.
