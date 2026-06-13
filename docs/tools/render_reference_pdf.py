import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / ".tmp" / "pymupdf"))
import fitz

source = Path(r"C:\Users\HP\Downloads\Authentication FR_AUTH_XX.pdf")
out = Path(__file__).resolve().parents[1] / "_authentication_reference_page.png"

pdf = fitz.open(source)
page = pdf[0]
pix = page.get_pixmap(matrix=fitz.Matrix(2.5, 2.5), alpha=False)
pix.save(out)
print(out)
