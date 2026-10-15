# Previous DBI website

Preserved before the Cathedral redesign launch on October 14, 2026.

- Browse: https://cathedralcatholicdbi.org/archive/
- Exact original commit: `f5d073989843ed2a7dc9f20156c00a2795d2995a`
- Permanent snapshot tag: `dbi-before-redesign-2026-10-14`
- Backup branch: `codex/archive-before-redesign-2026-10-14`
- Download: https://github.com/kristinsmillar-coder/dbi-site/archive/refs/tags/dbi-before-redesign-2026-10-14.zip

The browsable archive includes all nine original pages and their original assets. The only HTML additions are noindex metadata and an archived-site notice linking to the current homepage. The tag and backup branch retain the exact original files.

## Restore the original website

In GitHub repository Settings → Pages, change the publishing branch from `main` to `codex/archive-before-redesign-2026-10-14`, with folder `/ (root)`, and Save. Wait for Pages to finish building, then verify https://cathedralcatholicdbi.org/. The custom domain is preserved in the backup branch. This returns the previous website without deleting the redesign or rewriting history.

To return to the redesign, change the Pages source back to `main` and verify the completed build and live site.

For local review of the exact original snapshot, extract the tagged ZIP and run `python3 tools/serve.py 8421` from it.
