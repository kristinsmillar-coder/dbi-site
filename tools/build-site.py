#!/usr/bin/env python3
"""Build static HTML from the shared Cathedral layout and authored page fragments."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
layout = (ROOT / 'site/templates/base.html').read_text()
for slug, page in json.loads((ROOT / 'site/pages.json').read_text()).items():
    values = {'extra_head': '', 'extra_scripts': '', 'body_class': 'inner', **page}
    values['robots'] = 'noindex, nofollow' if slug in {'interviews', 'update', 'update-finance'} else 'index, follow'
    values['canonical'] = 'https://cathedralcatholicdbi.org/' + ('' if slug == 'index' else slug + '.html')
    values['content'] = (ROOT / 'site/pages' / f'{slug}.html').read_text()
    html = layout
    for key, value in values.items():
        html = html.replace('{{' + key + '}}', value)
    if '{{' in html:
        raise ValueError(f'Unresolved template field in {slug}')
    (ROOT / f'{slug}.html').write_text('\n'.join(line.rstrip() for line in html.splitlines()) + '\n')
print('Built all nine DBI pages.')
