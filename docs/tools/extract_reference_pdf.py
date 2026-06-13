from pathlib import Path
from pypdf import PdfReader

source = Path(r"C:\Users\HP\Downloads\Authentication FR_AUTH_XX.pdf")
out = Path(__file__).resolve().parents[1] / "_authentication_reference.txt"

reader = PdfReader(str(source))
parts = []
for index, page in enumerate(reader.pages, start=1):
    parts.append(f"\n===== PAGE {index} =====\n")
    parts.append(page.extract_text() or "[NO EXTRACTABLE TEXT]")

out.write_text("\n".join(parts), encoding="utf-8")
print(f"pages={len(reader.pages)}")
print(out)
