#!/usr/bin/env python3
"""Local dev server for The Wendigo that disables browser caching
and supports HTTP byte-range requests for video playback.

Usage:  python3 serve.py        (then open http://localhost:8080)
"""
import http.server
import os
import re
import socketserver

PORT = 8080
RANGE_RE = re.compile(r"^bytes=(\d*)-(\d*)$")


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        range_hdr = self.headers.get("Range")
        path = self.translate_path(self.path)
        if not range_hdr or not os.path.isfile(path):
            return super().do_GET()

        m = RANGE_RE.match(range_hdr.strip())
        if not m:
            return super().do_GET()

        size = os.path.getsize(path)
        start_s, end_s = m.groups()
        if start_s == "" and end_s == "":
            return super().do_GET()

        if start_s == "":
            length = int(end_s)
            start = max(0, size - length)
            end = size - 1
        else:
            start = int(start_s)
            end = int(end_s) if end_s else size - 1

        if start >= size or start > end:
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{size}")
            self.end_headers()
            return

        end = min(end, size - 1)
        length = end - start + 1
        ctype = self.guess_type(path)
        self.send_response(206)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(length))
        self.end_headers()

        with open(path, "rb") as f:
            f.seek(start)
            remaining = length
            while remaining > 0:
                chunk = f.read(min(65536, remaining))
                if not chunk:
                    break
                self.wfile.write(chunk)
                remaining -= len(chunk)


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
    print(f"Serving The Wendigo at http://localhost:{PORT}  (Ctrl+C to stop)")
    httpd.serve_forever()
