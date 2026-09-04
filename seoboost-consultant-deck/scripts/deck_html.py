#!/usr/bin/env python3
"""
deck_html.py — render the same deck spec as a SELF-CONTAINED HTML deck (preview / share).

Same spec as deck_pptx.py (../assets/deck.example.json). Emits one .html file with inline
CSS + tiny vanilla JS (arrow-key / click navigation) — NO external CDN, works offline and
inside restrictive CSP (e.g. Artifacts). Design tokens = CSS custom properties, kept in
sync with ../references/design-system.md and deck_pptx.py.

Usage:
    python3 deck_html.py --spec ../assets/deck.example.json --out /tmp/deck.html
    # then open the .html, or publish via the Artifact tool for a shareable link.
"""
import argparse
import html
import json

THEME = {
    "navy": "#1B3A6B", "navy_deep": "#12285A", "red": "#C00000", "teal": "#00B0A0",
    "ink": "#262626", "grey": "#7F7F7F", "paper": "#FFFFFF", "wash": "#EEF2F8",
    "green": "#2E7D32", "amber": "#ED9B00",
}
RAG = {"green": "green", "amber": "amber", "red": "red"}


def esc(x):
    return html.escape(str(x))


def li(items):
    return "".join(f"<li>{esc(x)}</li>" for x in (items or []))


def render_slide(s):
    t = s.get("type")
    page = f'<div class="pg">{esc(s["page"])}</div>' if s.get("page") is not None else ""
    kicker = f'<div class="kicker">{esc(s["kicker"])}</div>' if s.get("kicker") else ""
    fn = ("<div class='fn'>" + "".join(f"<div>{esc(x)}</div>" for x in s["footnotes"]) +
          "</div>") if s.get("footnotes") else ""

    if t == "cover":
        return f"""<section class="s cover">
          <div class="hero">[ hero image ]</div><div class="redrule"></div>
          <div class="band"><h1>{esc(s.get('title',''))}</h1>
          <h2>{esc(s.get('subtitle',''))}</h2>
          <p class="tag">{esc(s.get('tag','Final Presentation'))}<br>{esc(s.get('date',''))}</p>
          </div></section>"""
    if t == "divider":
        label = f"{s.get('letter','')}. {s.get('title','')}".strip(". ")
        return f'<section class="s divider"><span class="dr"></span><h1>{esc(label)}</h1></section>'
    if t == "content":
        return f"""<section class="s content"><div class="rule"></div>{kicker}
          <h2 class="title">{esc(s.get('title',''))}</h2>
          <ul class="body">{li(s.get('bullets'))}</ul>{fn}{page}</section>"""
    if t == "table":
        cols = s["columns"]; hl = s.get("highlight_col")
        head = "".join(f'<th class="{"hl" if hl==i else ""}">{esc(c)}</th>'
                       for i, c in enumerate(cols))
        body = ""
        for r, row in enumerate(s["rows"]):
            tds = ""
            for val in row:
                key = str(val).lower()
                if key in RAG:
                    tds += f'<td class="rag {RAG[key]}">{esc(key.upper())}</td>'
                else:
                    tds += f"<td>{esc(val)}</td>"
            body += f"<tr>{tds}</tr>"
        return f"""<section class="s content"><div class="rule"></div>{kicker}
          <h2 class="title">{esc(s.get('title',''))}</h2>
          <table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>{fn}{page}</section>"""
    if t == "conclusion":
        ns = ("<div class='ns'>Next steps</div><ul class='body'>" +
              "".join(f"<li>&rarr; {esc(x)}</li>" for x in s["next_steps"]) +
              "</ul>") if s.get("next_steps") else ""
        return f"""<section class="s content"><div class="rule"></div>
          <div class="kicker">Conclusion</div>
          <h2 class="title">{esc(s.get('title',''))}</h2>
          <ul class="body">{li(s.get('bullets'))}</ul>{ns}{fn}{page}</section>"""
    return f'<section class="s content"><h2>Unknown slide type: {esc(t)}</h2></section>'


PAGE = """<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><style>
:root{{{vars}}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:#0b1526;font-family:'Segoe UI',Arial,sans-serif;color:var(--ink)}}
.s{{position:relative;width:96vw;max-width:1280px;aspect-ratio:16/9;margin:2.5vh auto;
  background:var(--paper);box-shadow:0 8px 40px rgba(0,0,0,.4);overflow:hidden;
  padding:4.5% 4.2%}}
.rule{{position:absolute;top:6%;left:6.5%;right:4%;height:3px;background:var(--navy)}}
.rule::before{{content:"";position:absolute;left:-2.3%;top:-9px;width:22px;height:22px;
  background:var(--red)}}
.kicker{{color:var(--red);font-weight:700;font-size:1.5vw;margin-top:2.5%}}
.title{{color:var(--navy);font-weight:700;font-size:2.7vw;line-height:1.15;margin:.4% 0 2%}}
.body{{list-style:none;font-size:1.7vw;line-height:1.5}}
.body li{{margin:.7% 0;padding-left:1.3em;text-indent:-1.3em}}
.body li::before{{content:"\\2022  ";color:var(--red);font-weight:700}}
.ns{{color:var(--red);font-weight:700;font-size:1.5vw;margin-top:2%}}
.fn{{position:absolute;bottom:5%;left:6.5%;right:4%;color:var(--grey);font-size:.95vw}}
.pg{{position:absolute;bottom:3.5%;left:4.2%;color:var(--grey);font-size:1vw}}
table{{width:100%;border-collapse:collapse;margin-top:2.5%;font-size:1.4vw}}
th{{background:var(--navy);color:#fff;padding:1% 1.2%;text-align:left}}
th.hl{{background:var(--red)}}
td{{padding:1% 1.2%;border-bottom:1px solid var(--wash)}}
td.rag{{color:#fff;font-weight:700;text-align:center}}
td.green{{background:var(--green)}}td.amber{{background:var(--amber)}}td.red{{background:var(--red)}}
.cover{{padding:0}}
.cover .hero{{height:55%;background:var(--wash);display:flex;align-items:center;
  justify-content:center;color:var(--grey);font-size:1.3vw}}
.cover .redrule{{height:.6%;background:var(--red)}}
.cover .band{{height:44.4%;background:var(--navy);color:#fff;padding:3% 4%}}
.cover h1{{font-size:3vw}}.cover h2{{font-size:1.7vw;margin-top:.4%}}
.cover .tag{{margin-top:3%;font-size:1.2vw}}
.divider{{background:var(--navy_deep);display:flex;align-items:center;padding-left:6%}}
.divider h1{{color:#fff;font-size:3.4vw}}
.divider .dr{{position:absolute;left:6%;top:38%;width:64px;height:8px;background:var(--red)}}
@media print{{.s{{margin:0;box-shadow:none;page-break-after:always}}body{{background:#fff}}}}
</style></head><body>{slides}
<script>
var i=0,S=[].slice.call(document.querySelectorAll('.s'));
function go(n){{i=Math.max(0,Math.min(S.length-1,n));
  S[i].scrollIntoView({{behavior:'smooth',block:'center'}});}}
document.addEventListener('keydown',function(e){{
  if(e.key==='ArrowRight'||e.key==='PageDown'){{go(i+1);}}
  if(e.key==='ArrowLeft'||e.key==='PageUp'){{go(i-1);}}}});
document.addEventListener('click',function(){{go(i+1);}});
</script></body></html>"""


def build(spec, out):
    t = dict(THEME)
    for k, v in (spec.get("theme") or {}).items():
        t[k] = v
    cssvars = ";".join(f"--{k}:{v}" for k, v in t.items())
    slides = "\n".join(render_slide(s) for s in spec.get("slides", []))
    doc = PAGE.format(title=esc(spec.get("meta", {}).get("title", "Deck")),
                      vars=cssvars, slides=slides)
    with open(out, "w", encoding="utf-8") as f:
        f.write(doc)
    print(f"Wrote {out} — {len(spec.get('slides', []))} slides")


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--spec", required=True)
    ap.add_argument("--out", default="deck.html")
    a = ap.parse_args()
    with open(a.spec, encoding="utf-8") as f:
        spec = json.load(f)
    build(spec, a.out)


if __name__ == "__main__":
    main()
