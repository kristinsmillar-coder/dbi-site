#!/usr/bin/env python3
"""Preview server with HTTP Range support.

python3 -m http.server does not honour Range requests, and video seeking
depends on them: Chrome stalls on scrubbing, Safari refuses to play at all.
Any real host (Netlify, Vercel, GitHub Pages, nginx) supports ranges — this
just makes the preview behave like production.

    python3 tools/serve.py            # serves the site root on :8420
"""

import os
import re
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8420
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class RangeHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Chrome heuristically caches from Last-Modified; during design iteration
        # that serves the previous round's CSS and manufactures phantom bugs.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()
        rng = self.headers.get("Range")
        if not rng:
            return super().send_head()

        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None

        size = os.fstat(f.fileno()).st_size
        m = re.match(r"bytes=(\d*)-(\d*)", rng)
        start = int(m.group(1)) if m and m.group(1) else 0
        end = int(m.group(2)) if m and m.group(2) else size - 1
        end = min(end, size - 1)
        if start > end or start >= size:
            f.close()
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{size}")
            self.end_headers()
            return None

        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        f.seek(start)
        # copyfile in the caller streams to EOF; hand back a bounded reader instead
        remaining = end - start + 1

        class Bounded:
            def read(self, n=-1):
                nonlocal remaining
                if remaining <= 0:
                    return b""
                chunk = f.read(min(n if n > 0 else remaining, remaining))
                remaining -= len(chunk)
                return chunk

            def close(self):
                f.close()

        return Bounded()


if __name__ == "__main__":
    os.chdir(ROOT)
    handler = partial(RangeHandler, directory=ROOT)
    print(f"Serving {ROOT} on http://localhost:{PORT}/  (Range-capable)")
    ThreadingHTTPServer(("", PORT), handler).serve_forever()
