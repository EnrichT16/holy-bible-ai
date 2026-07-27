#!/usr/bin/env python3
"""Parse public-domain Bibles (OSIS / USFX / Zefania) into compact offline JSON
for the Holy Bible app. One file per version: { "Book": { "1": {"1": "text"} } }."""
import re, os, json, html, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bible-src")
OUT = os.path.join(ROOT, "mobile", "public", "bibles")
MANIFEST = os.path.join(ROOT, "mobile", "src", "data", "bibles", "manifest.ts")
os.makedirs(OUT, exist_ok=True)
os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)

# ── Canonical names ──────────────────────────────────────────────
CANON = [
    "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
    "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
    "Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon",
    "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
    "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi",
    "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians",
    "Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians",
    "1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter",
    "1 John","2 John","3 John","Jude","Revelation",
]
DEUTERO = [
    "Tobit","Judith","Additions to Esther","Wisdom","Sirach","Baruch","Letter of Jeremiah",
    "Prayer of Azariah","Susanna","Bel and the Dragon","1 Maccabees","2 Maccabees",
]
CANON_SET = set(CANON) | set(DEUTERO)

# OSIS book code -> canonical
OSIS = {
    "Gen":"Genesis","Exod":"Exodus","Lev":"Leviticus","Num":"Numbers","Deut":"Deuteronomy",
    "Josh":"Joshua","Judg":"Judges","Ruth":"Ruth","1Sam":"1 Samuel","2Sam":"2 Samuel",
    "1Kgs":"1 Kings","2Kgs":"2 Kings","1Chr":"1 Chronicles","2Chr":"2 Chronicles","Ezra":"Ezra",
    "Neh":"Nehemiah","Esth":"Esther","Job":"Job","Ps":"Psalms","Prov":"Proverbs","Eccl":"Ecclesiastes",
    "Song":"Song of Solomon","Isa":"Isaiah","Jer":"Jeremiah","Lam":"Lamentations","Ezek":"Ezekiel",
    "Dan":"Daniel","Hos":"Hosea","Joel":"Joel","Amos":"Amos","Obad":"Obadiah","Jonah":"Jonah",
    "Mic":"Micah","Nah":"Nahum","Hab":"Habakkuk","Zeph":"Zephaniah","Hag":"Haggai","Zech":"Zechariah",
    "Mal":"Malachi","Matt":"Matthew","Mark":"Mark","Luke":"Luke","John":"John","Acts":"Acts",
    "Rom":"Romans","1Cor":"1 Corinthians","2Cor":"2 Corinthians","Gal":"Galatians","Eph":"Ephesians",
    "Phil":"Philippians","Col":"Colossians","1Thess":"1 Thessalonians","2Thess":"2 Thessalonians",
    "1Tim":"1 Timothy","2Tim":"2 Timothy","Titus":"Titus","Phlm":"Philemon","Heb":"Hebrews",
    "Jas":"James","1Pet":"1 Peter","2Pet":"2 Peter","1John":"1 John","2John":"2 John","3John":"3 John",
    "Jude":"Jude","Rev":"Revelation",
}
# USFX 3-letter -> canonical (incl. apocrypha)
USFX = {
    "GEN":"Genesis","EXO":"Exodus","LEV":"Leviticus","NUM":"Numbers","DEU":"Deuteronomy",
    "JOS":"Joshua","JDG":"Judges","RUT":"Ruth","1SA":"1 Samuel","2SA":"2 Samuel","1KI":"1 Kings",
    "2KI":"2 Kings","1CH":"1 Chronicles","2CH":"2 Chronicles","EZR":"Ezra","NEH":"Nehemiah",
    "EST":"Esther","JOB":"Job","PSA":"Psalms","PRO":"Proverbs","ECC":"Ecclesiastes","SNG":"Song of Solomon",
    "ISA":"Isaiah","JER":"Jeremiah","LAM":"Lamentations","EZK":"Ezekiel","DAN":"Daniel","HOS":"Hosea",
    "JOL":"Joel","AMO":"Amos","OBA":"Obadiah","JON":"Jonah","MIC":"Micah","NAM":"Nahum","HAB":"Habakkuk",
    "ZEP":"Zephaniah","HAG":"Haggai","ZEC":"Zechariah","MAL":"Malachi","MAT":"Matthew","MRK":"Mark",
    "LUK":"Luke","JHN":"John","ACT":"Acts","ROM":"Romans","1CO":"1 Corinthians","2CO":"2 Corinthians",
    "GAL":"Galatians","EPH":"Ephesians","PHP":"Philippians","COL":"Colossians","1TH":"1 Thessalonians",
    "2TH":"2 Thessalonians","1TI":"1 Timothy","2TI":"2 Timothy","TIT":"Titus","PHM":"Philemon",
    "HEB":"Hebrews","JAS":"James","1PE":"1 Peter","2PE":"2 Peter","1JN":"1 John","2JN":"2 John",
    "3JN":"3 John","JUD":"Jude","REV":"Revelation",
    "TOB":"Tobit","JDT":"Judith","ESG":"Additions to Esther","WIS":"Wisdom","SIR":"Sirach",
    "BAR":"Baruch","LJE":"Letter of Jeremiah","S3Y":"Prayer of Azariah","SUS":"Susanna",
    "BEL":"Bel and the Dragon","1MA":"1 Maccabees","2MA":"2 Maccabees",
}
# Zefania bname -> canonical
ZEF = {n: n for n in CANON}
ZEF.update({"Psalm":"Psalms","AddDan":"Additions to Daniel","Wisdom":"Wisdom","Sirach":"Sirach",
            "Tobit":"Tobit","Judith":"Judith","Baruch":"Baruch","1 Maccabees":"1 Maccabees",
            "2 Maccabees":"2 Maccabees","Letter of Jeremiah":"Letter of Jeremiah"})

TAG = re.compile(r"<[^>]+>")
WS = re.compile(r"\s+")

def clean(t):
    t = TAG.sub(" ", t)
    t = html.unescape(t)
    return WS.sub(" ", t).strip()

def add(data, book, ch, vs, text):
    if book not in CANON_SET or not text:
        return
    data.setdefault(book, {}).setdefault(str(ch), {})[str(vs)] = text

# ── OSIS (container-verse form) ──────────────────────────────────
def parse_osis(path):
    raw = open(path, encoding="utf-8").read()
    data = {}
    for m in re.finditer(r"<verse\b[^>]*osisID=['\"]([^'\" ]+)[^>]*>(.*?)</verse>", raw, re.S):
        osid, body = m.group(1), m.group(2)
        parts = osid.split(".")
        if len(parts) != 3:
            continue
        code, ch, vs = parts
        book = OSIS.get(code)
        if book:
            add(data, book, ch, vs, clean(body))
    return data

# ── USFX (milestone-verse form) ──────────────────────────────────
def parse_usfx(path):
    raw = open(path, encoding="utf-8").read()
    data = {}
    for bm in re.finditer(r'<book id="([A-Z0-9]+)">(.*?)</book>', raw, re.S):
        book = USFX.get(bm.group(1))
        if not book:
            continue
        body = bm.group(2)
        # split into tokens on chapter/verse milestones
        ch = None
        # iterate over <c id="N"/> and <v id="M"...>...text  boundaries
        pos = 0
        # normalise: capture sequence of markers
        for mm in re.finditer(r'<c id="(\d+)"\s*/>|<v id="([\w-]+)"[^>]*/>(.*?)(?=<v id="|<c id="|<ve\s*/>|</book>)', body, re.S):
            if mm.group(1):
                ch = mm.group(1)
            elif mm.group(2) and ch:
                vs = mm.group(2)
                if "-" in vs:
                    vs = vs.split("-")[0]
                add(data, book, ch, vs, clean(mm.group(3)))
    return data

# ── Zefania ──────────────────────────────────────────────────────
def parse_zefania(path):
    raw = open(path, encoding="utf-8").read()
    data = {}
    for bm in re.finditer(r'<BIBLEBOOK[^>]*bname="([^"]+)"[^>]*>(.*?)</BIBLEBOOK>', raw, re.S):
        book = ZEF.get(bm.group(1))
        if not book:
            continue
        for cm in re.finditer(r'<CHAPTER cnumber="(\d+)"[^>]*>(.*?)</CHAPTER>', bm.group(2), re.S):
            ch = cm.group(1)
            for vm in re.finditer(r'<VERS vnumber="(\d+)"[^>]*>(.*?)</VERS>', cm.group(2), re.S):
                add(data, book, ch, vm.group(1), clean(vm.group(2)))
    return data

JOBS = [
    ("kjv", "kjv.osis.xml", parse_osis),
    ("web", "web.usfx.xml", parse_usfx),
    ("asv", "asv.osis.xml", parse_osis),
    ("ylt", "ylt.osis.xml", parse_osis),
    ("dra", "dra.zefania.xml", parse_zefania),
    ("darby", "darby.osis.xml", parse_osis),
]

manifest = {}
for vid, fname, parser in JOBS:
    path = os.path.join(SRC, fname)
    data = parser(path)
    # The open-bibles Douay Zefania mislabels its deuterocanon (its "Tobit"
    # holds Sirach text, etc.), so trust only its 66 protocanonical books.
    # The Deuterocanon tab is served by WEB, which is complete and correct.
    allowed = CANON if vid == "dra" else (CANON + DEUTERO)
    ordered = {b: data[b] for b in allowed if b in data}
    out = os.path.join(OUT, vid + ".json")
    json.dump(ordered, open(out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    size = os.path.getsize(out)
    # per-book chapter counts
    counts = {b: len(ordered[b]) for b in ordered}
    manifest[vid] = counts
    nverse = sum(len(c) for b in ordered.values() for c in b.values())
    print(f"{vid}: {len(ordered)} books, {nverse} verses, {size//1024}KB -> {out}")

# emit manifest.ts
ts = "// AUTO-GENERATED by build_bibles.py — per-version book → chapter count.\n"
ts += "export const BIBLE_MANIFEST: Record<string, Record<string, number>> = "
ts += json.dumps(manifest, ensure_ascii=False, separators=(",", ":"))
ts += " as const;\n"
open(MANIFEST, "w", encoding="utf-8").write(ts)
print("manifest ->", MANIFEST)
