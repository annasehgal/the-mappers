"""Generate a print-ready entrance QR for a reachable app URL.
Usage: python3 generate_qr.py http://YOUR-LAN-IP:8001/
Requires the qrcode package; generated assets can be served without Python packages.
"""
import sys
from urllib.parse import urlsplit, urlunsplit, urlencode
import qrcode
import qrcode.image.svg

base = urlsplit(sys.argv[1])
if base.scheme not in ("http", "https") or not base.netloc:
    raise SystemExit("Supply a reachable http(s) app URL.")
entries = [
    ("a", "holt-entry-a"), ("b", "holt-entry-b"),
    ("c", "holt-entry-c"), ("d", "holt-entry-d"),
]
for letter, identifier in entries:
    url = urlunsplit((base.scheme, base.netloc, base.path or "/", urlencode({
        "building": "holt", "floor": "1", "location": identifier
    }), ""))
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    qr.make_image(image_factory=qrcode.image.svg.SvgPathImage).save(f"entrance-{letter}.svg")
    print(f"Entry {letter.upper()}: {url}")
