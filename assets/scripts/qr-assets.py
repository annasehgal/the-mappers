"""Build-only QR output. Receives URLs from the existing JS location registry."""
import json
import sys
from pathlib import Path
import qrcode
import qrcode.image.svg

output = Path(sys.argv[1]).resolve()
for entry in json.load(sys.stdin):
    name = entry["file"]
    if Path(name).name != name or not name.endswith(".svg"):
        raise SystemExit("Invalid QR output filename.")
    code = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=4)
    code.add_data(entry["url"])
    code.make(fit=True)
    code.make_image(image_factory=qrcode.image.svg.SvgPathImage).save(output / name)
