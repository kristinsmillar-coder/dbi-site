#!/usr/bin/env python3
"""Build static HTML from the shared Cathedral layout and authored page fragments."""
import json
import re
import runpy
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
speakers = runpy.run_path(str(ROOT / 'tools/render-speakers.py'))['render_speakers'](ROOT)
# Inline decorative icons at build time; buttons with dynamic labels use the same SVG files as masks.
icons = {p.stem: p.read_text().strip().replace('<svg ', '<svg class="dbi-icon" width="24" height="24" aria-hidden="true" focusable="false" ', 1)
         for p in (ROOT / 'assets/icons').glob('*.svg')}
layout = (ROOT / 'site/templates/base.html').read_text()
for slug, page in json.loads((ROOT / 'site/pages.json').read_text()).items():
    values = {'extra_head': '', 'extra_scripts': '', 'body_class': 'inner', **page}
    values['robots'] = 'noindex, nofollow' if slug in {'interviews', 'update', 'update-finance', 'rsvp'} else 'index, follow'
    values['canonical'] = 'https://cathedralcatholicdbi.org/' + ('' if slug == 'index' else slug + '.html')
    values['content'] = (ROOT / 'site/pages' / f'{slug}.html').read_text()
    if slug == 'speakers':
        for group, cards in speakers.items():
            values['content'] = values['content'].replace('{{' + group + '_speakers}}', cards)
    html = layout
    for key, value in values.items():
        html = html.replace('{{' + key + '}}', value)
    html = re.sub(r'\[\[icon:([a-z-]+)\]\]', lambda m: icons[m[1]], html)
    if '{{' in html:
        raise ValueError(f'Unresolved template field in {slug}')
    (ROOT / f'{slug}.html').write_text('\n'.join(line.rstrip() for line in html.splitlines()) + '\n')
print('Built all DBI pages.')
