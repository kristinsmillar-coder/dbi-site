"""Render the editable speaker directory into the shared page fragment."""
import json
from html import escape
from pathlib import Path

def render_speakers(root: Path):
    data = json.loads((root / 'site/speakers.json').read_text())
    result = {}
    for group, people in data.items():
        cards = []
        for person in people:
            p = {k: escape(v, quote=True) for k, v in person.items()}
            initials = ''.join(word[0] for word in person['name'].split()[:2])
            portrait = (f'<img src="{p["image"]}" alt="{p["name"]}" width="600" height="600" loading="lazy" decoding="async">' if p['image'] else f'<div class="speaker-monogram" aria-hidden="true">{initials}</div>')
            topic = f'<p class="speaker-topic">{p["topic"]}</p>' if p['topic'] else ''
            cards.append(f'''<article class="speaker" id="{p['id']}">
              <div class="speaker-portrait {p['id']}">{portrait}</div>
              <div class="speaker-copy">{topic}<h3>{p['name']}</h3>
              <p class="speaker-role">{p['role']}</p><p class="speaker-bio">{p['bio']}</p>
              <a class="text-link" href="{p['url']}" target="_blank" rel="noopener" aria-label="Professional profile: {p['name']} (opens in a new tab)">Professional profile ↗</a></div>
            </article>''')
        result[group] = '\n'.join(cards)
    return result
