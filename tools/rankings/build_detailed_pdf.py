"""Detailed ranking PDF (scores per place) for every Phoenix ranking that has
scores in src/rankings.js (tacos for now). Replaces that ranking's PDF in
public/rankings/, same file name, so the site's download button keeps working.

usage: python -I build_detailed_pdf.py <worktree> <workdir> <avatar.png>
"""
import base64, html, json, pathlib, re, subprocess, sys

wt, work, avatar_path = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]), pathlib.Path(sys.argv[3])
work.mkdir(parents=True, exist_ok=True)
src = (wt / "src" / "rankings.js").read_text(encoding="utf-8")
cats = json.loads(re.search(r"phoenix: (\[.*\]),\n\};", src, re.S).group(1))
avatar = base64.b64encode(avatar_path.read_bytes()).decode()
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
DEFAULT_METHOD = {"google": 65, "yelp": 35, "award": 3, "influencer": 2, "community": 2, "max": 107, "reviewFactor": False}
esc = html.escape

CSS = """
@page { size: 8.5in 11in; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { background: #FDFBF8; color: #0D0D0D; font-family: 'Poppins', sans-serif;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 8.5in; height: 11in; padding: 0.42in 0.5in 0.38in; position: relative; overflow: hidden;
  display: flex; flex-direction: column; page-break-after: always; }
.page:last-child { page-break-after: auto; }
.blob { position: absolute; border-radius: 50%; background: #F7B48F; opacity: .28; }
.b1 { width: 2.8in; height: 2.8in; right: -1.1in; top: -1.2in; }
.b2 { width: 2.2in; height: 2.2in; left: -1.1in; bottom: 1.4in; opacity: .18; }
header { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; position: relative; }
.pill { display: inline-block; background: #0D0D0D; color: #FDFBF8; font-weight: 700; font-size: 8.5pt;
  letter-spacing: .14em; padding: 4px 12px; border-radius: 999px; }
h1 { font-family: 'Playfair Display', serif; font-weight: 900; font-size: 26pt; line-height: 1.02; margin-top: 8px; }
h1 b { color: #FD5819; }
.sub { font-family: 'Caveat', cursive; color: #FD5819; font-size: 16pt; font-weight: 700; margin-top: 2px; }
.who { text-align: right; font-size: 8.5pt; color: #555; line-height: 1.35; white-space: nowrap; }
.who b { display: block; color: #0D0D0D; font-size: 10pt; }
.legend { display: flex; gap: 14px; font-size: 7.5pt; color: #555; margin: 12px 0 6px; font-weight: 500; }
.up { color: #16A34A; } .down { color: #DC2626; } .same { color: #9A9A9A; }
.new { background: #FD5819; color: #fff; border-radius: 999px; padding: 1px 6px; font-size: 6.5pt; font-weight: 700; letter-spacing: .06em; }
table { width: 100%; border-collapse: separate; border-spacing: 0; background: #fff; border: 1px solid #EFE7DF;
  border-radius: 12px; overflow: hidden; position: relative; }
thead th { background: #0D0D0D; color: #fff; font-size: 6.8pt; font-weight: 600; letter-spacing: .1em;
  text-transform: uppercase; padding: 6px 8px; text-align: left; }
thead th.r { text-align: right; }
tbody td { padding: 2px 8px; border-top: 1px solid #F1EBE4; font-size: 8.4pt; vertical-align: middle; }
tbody tr:nth-child(even) td { background: #FFFBF7; }
td.pos { font-family: 'Shrikhand', cursive; color: #0D0D0D; font-size: 11pt; width: 0.42in; }
tr.top td.pos { color: #FD5819; }
td.nm b { font-weight: 700; font-size: 8.6pt; display: block; line-height: 1.12; }
td.nm span { color: #6b645d; font-size: 6.6pt; line-height: 1.1; display: block; }
td.chg { font-weight: 700; font-size: 7.6pt; width: 0.5in; white-space: nowrap; }
td.st { font-weight: 600; font-size: 8pt; white-space: nowrap; width: 0.6in; }
td.st small { color: #8a827a; font-weight: 500; font-size: 6.4pt; margin-left: 2px; }
td.st small { color: #8a827a; font-weight: 500; font-size: 6.6pt; }
td.bn { width: 0.7in; white-space: nowrap; }
.ic { display: inline-grid; place-items: center; width: 17px; height: 17px; margin-right: 2px; border-radius: 50%;
  background: #FFF1E8; font-size: 8pt; }
.chip { display: inline-block; font-size: 6.4pt; font-weight: 600; border: 1px solid #E6DDD3; border-radius: 999px;
  padding: 0 5px; margin: 1px 2px 1px 0; white-space: nowrap; }
td.sc { width: 1.05in; text-align: right; white-space: nowrap; }
.bar { display: inline-block; width: 0.45in; height: 5px; background: #F3EEE9; border-radius: 9px; vertical-align: middle;
  margin-right: 6px; overflow: hidden; }
.bar i { display: block; height: 100%; background: #FD5819; border-radius: 9px; }
td.sc b { font-weight: 800; font-size: 10pt; }
.note { font-size: 7pt; color: #6b645d; margin-top: 6px; }
footer { margin-top: auto; display: flex; align-items: center; gap: 10px; padding-top: 0.12in; border-top: 2px solid #0D0D0D; }
footer img { width: 0.55in; height: 0.55in; border-radius: 50%; object-fit: cover; }
footer .t { flex: 1; font-size: 8pt; color: #3b3632; line-height: 1.35; }
footer .t b { color: #0D0D0D; font-size: 9pt; }
footer .u { text-align: right; font-weight: 700; font-size: 8.5pt; }
footer .u span { display: block; color: #FD5819; font-size: 10.5pt; }
/* page 2 */
.method { background: #FFF1E8; border: 2px solid #0D0D0D; border-radius: 14px; padding: 0.26in; margin-top: 0.22in; position: relative; }
.eyebrow { font-weight: 700; font-size: 8pt; letter-spacing: .16em; text-transform: uppercase; color: #FD5819; }
.method h2, .sec h2 { font-family: 'Playfair Display', serif; font-weight: 900; font-size: 20pt; margin-top: 2px; }
.method .intro { font-size: 9.5pt; line-height: 1.55; margin-top: 8px; }
.pills { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 10px; }
.pl { background: #fff; border: 1.5px solid #0D0D0D; border-radius: 999px; padding: 6px 14px; display: flex; align-items: baseline; gap: 7px; }
.pl span { font-weight: 700; font-size: 8pt; letter-spacing: .08em; text-transform: uppercase; }
.pl b { font-family: 'Shrikhand', cursive; color: #FD5819; font-size: 13pt; font-weight: 400; }
.how { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; margin-top: 6px; }
.how div { font-size: 8.6pt; line-height: 1.45; color: #3b3632; }
.how b { display: block; color: #0D0D0D; font-size: 9.2pt; }
.sec { margin-top: 0.24in; position: relative; }
.aw { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
.aw div { background: #fff; border: 1px solid #EFE7DF; border-radius: 10px; padding: 9px 12px; font-size: 8.6pt; }
.aw b { display: block; font-size: 9.4pt; }
.aw span { color: #FD5819; font-weight: 700; }
.rules { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 18px; margin-top: 10px; }
.cap { color: var(--accent); font-weight: 800; }
.rules li { font-size: 9pt; font-weight: 600; display: flex; gap: 8px; align-items: center; }
.rules li::before { content: "\\2713"; display: inline-grid; place-items: center; width: 16px; height: 16px; border-radius: 50%;
  background: #16A34A; color: #fff; font-size: 7pt; font-weight: 800; flex: none; }
.cta { margin-top: 0.24in; background: #0D0D0D; color: #fff; border-radius: 14px; padding: 0.22in 0.26in;
  display: flex; justify-content: space-between; align-items: center; gap: 16px; position: relative; }
.cta h3 { font-family: 'Playfair Display', serif; font-weight: 900; font-size: 15pt; }
.cta p { color: #cfc9c2; font-size: 8.8pt; margin-top: 3px; }
.cta .go { background: #FD5819; color: #fff; font-weight: 700; font-size: 9.5pt; border-radius: 999px; padding: 9px 16px; white-space: nowrap; }
"""

FONTS = ('<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&family=Poppins:wght@400;500;600;700;800'
         '&family=Shrikhand&family=Caveat:wght@700&display=block" rel="stylesheet">')


def stars(v):
    return f"{v:.2f}" if round(v * 100) % 10 else f"{v:.1f}"


def meta(it):
    city = it.get("city")
    city = (city if "sucursales" in city.lower() else city + ", AZ") if city else None
    return " · ".join(x for x in [it.get("dish"), city] if x)


def move(prev, pos):
    if prev is None:
        return '<span class="new">NUEVO</span>'
    d = prev - pos
    if d > 0:
        return f'<span class="up">▲ {d}</span>'
    if d < 0:
        return f'<span class="down">▼ {-d}</span>'
    return '<span class="same">—</span>'


for c in cats:
    items = c["items"]
    if not all(it.get("score") for it in items):
        continue
    n = len(items)
    label = c["label"]["es"]
    m = c.get("method") or DEFAULT_METHOD
    MAX = m["max"]
    rows = []
    for i, it in enumerate(items, 1):
        s = it["score"]
        chips = "".join([
            '<span class="ic">🏆</span>' if s.get("award") else "",
            '<span class="ic">📣</span>' if s.get("influencer") else "",
            '<span class="ic">💬</span>' if s.get("community") else "",
        ]) or '<span style="color:#bbb">—</span>'
        yelp = "Sin Yelp" if s.get("noYelp") else f"★ {stars(s['yelp'])}"
        rows.append(
            f'<tr class="{"top" if i <= 3 else ""}"><td class="pos">{i:02d}</td>'
            f'<td class="nm"><b>{esc(it["name"])}</b><span>{esc(meta(it))}</span></td>'
            f'<td class="chg">{move(s.get("prev"), i)}{"<sup class=cap>*</sup>" if s.get("capped") else ""}</td>'
            f'<td class="st">★ {stars(s["google"])}' + (f'<small>({s["gReviews"]:,})</small>' if s.get("gReviews") is not None else "") + '</td>'
            f'<td class="st">{yelp}</td>'
            f'<td class="bn">{chips}</td>'
            f'<td class="sc"><span class="bar"><i style="width:{s["total"] / MAX * 100:.1f}%"></i></span><b>{s["total"]:.1f}</b></td></tr>')

    awards = [(it["name"], it["score"]["award"]) for it in items if isinstance(it["score"].get("award"), str)]
    aw_html = "".join(f'<div><b>{esc(nm)}</b><span>Best of Phoenix®</span> · {esc(a)}</div>' for nm, a in awards)

    footer = (f'<footer><img src="data:image/png;base64,{avatar}" alt=""><div class="t"><b>Mario Padilla</b><br>'
              'Hecha por un mexicano que ha vivido y probado comida mexicana en Phoenix. ¿Cuál falta? Dímelo.</div>'
              '<div class="u">Más rankings<span>eltoaster.com/rankings</span></div></footer>')

    doc = f"""<!doctype html><html lang="es"><head><meta charset="utf-8">{FONTS}<style>{CSS}</style></head><body>
<div class="page"><div class="blob b1"></div><div class="blob b2"></div>
<header><div><span class="pill">EDICIÓN 2026 · RANKING DETALLADO</span>
<h1>Las <b>{n}</b> mejores<br>{esc(label.upper())} · <b>Phoenix</b></h1>
<div class="sub">ordenadas por lo que dice la gente</div></div>
<div class="who"><b>Mario Padilla</b>Actualizado: noviembre 2026</div></header>
<div class="legend"><span><b class="up">▲</b> Subió vs. edición anterior</span><span><b class="down">▼</b> Bajó</span>
<span><b class="same">—</b> Igual</span><span><span class="new">NUEVO</span> Entró</span>
<span>🏆 Premio</span><span>📣 Influencers</span><span>💬 Comunidad</span>{"<span><b class=cap>*</b> Tope de 5</span>" if any(it["score"].get("capped") for it in items) else ""}</div>
<table><thead><tr><th>#</th><th>Lugar</th><th>Cambio</th><th>Google</th><th>Yelp</th><th>Bonos</th><th class="r">Puntaje</th></tr></thead>
<tbody>{''.join(rows)}</tbody></table>
<p class="note">Puntaje sobre {MAX}: estrellas de Google y Yelp más bonos.{" Entre paréntesis, las reseñas en Google: con menos de 50 las estrellas cuentan al 92% y de 50 a 150 al 95%." if m["reviewFactor"] else " Con varias sucursales se promedian las que están abiertas."}</p>
{footer}</div>

<div class="page"><div class="blob b1"></div><div class="blob b2"></div>
<div class="method"><div class="eyebrow">Metodología Desde Zero</div><h2>Así se ordenó</h2>
<p class="intro">Combino lo que dicen tus clientes en <b>Google</b> y <b>Yelp</b> con <b>premios</b> y <b>recomendaciones</b>.
Es una metodología viva: la sigo afinando con cada edición y con lo que ustedes me dicen.</p>
<div class="pills"><div class="pl"><span>Google</span><b>{m["google"]}%</b></div><div class="pl"><span>Yelp</span><b>{m["yelp"]}%</b></div>
<div class="pl"><span>Premio</span><b>+{m["award"]}</b></div><div class="pl"><span>Influencers</span><b>+{m["influencer"]}</b></div><div class="pl"><span>Comunidad</span><b>+{m["community"]}</b></div></div>
<div class="how">
<div><b>Tus estrellas en Google</b>Es lo que más pesa. Ahí te busca la mayoría antes de decidir a dónde ir.</div>
<div><b>Tus estrellas en Yelp</b>Mucha gente compara aquí antes de salir a comer.</div>
<div><b>Premios formales</b>Como el Best of Phoenix de Phoenix New Times. Guías y artículos no cuentan.</div>
<div><b>Influencers y comunidad</b>Puntos extra cuando te recomiendan creadores locales o mi comunidad.</div>
{'<div style="grid-column:1/-1"><b>Cuántas reseñas tienes en Google</b>En este ranking también cuenta: con menos de 50 reseñas tus estrellas valen al 92%, de 50 a 150 al 95% y con más de 150, completas.</div>' if m["reviewFactor"] else ''}
</div></div>
{f'<div class="sec"><div class="eyebrow">Premios considerados</div><h2>Los que tienen premio</h2><div class="aw">{aw_html}</div></div>' if awards else ''}
<div class="sec"><div class="eyebrow">Reglas</div><h2>Lo que no se puede comprar</h2><ul class="rules">
<li>Nadie paga por aparecer ni por subir</li><li>Sin cadenas ni franquicias</li>
<li>Solo lugares abiertos, revisados en Google Maps</li><li>Una sola marca por lugar en la lista</li>
<li>Nadie baja más de 5 lugares por edición</li></ul></div>
<div class="cta"><div><h3>¿Tienes restaurante y quieres subir?</h3><p>Te digo qué dicen tus reseñas y qué mejorar para ganar estrellas. Gratis.</p></div>
<div class="go">eltoaster.com · Diagnóstico gratis</div></div>
{footer}</div>
</body></html>"""

    page = work / f"{c['id']}-detailed.html"
    page.write_text(doc, encoding="utf-8")
    pdf = wt / "public" / "rankings" / f"top-{n}-{c['id']}-phoenix-2026.pdf"
    subprocess.run([EDGE, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=8000",
                    f"--print-to-pdf={pdf}", page.as_uri()], check=True, capture_output=True, timeout=120)
    shot = work / f"{c['id']}-detailed.png"
    subprocess.run([EDGE, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=6000",
                    "--window-size=816,2112", f"--screenshot={shot}", page.as_uri()], capture_output=True, timeout=120)
    print(pdf.name, pdf.stat().st_size, shot)
