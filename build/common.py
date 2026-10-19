"""Shared page chrome for the Fusion Outlook site."""

SITE = "Fusion Outlook"
FONTS = ("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500"
         "&family=Schibsted+Grotesk:wght@400;500;600;700"
         "&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap")

MARK = ('<svg class="brand-mark" viewBox="0 0 24 24" aria-hidden="true">'
        '<circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" stroke-width="1.5"/>'
        '<path d="M4.6 4.6l14.8 14.8M19.4 4.6L4.6 19.4M1.5 12h21M12 1.5v21" stroke="currentColor" stroke-width="0.8" opacity=".35"/>'
        '<path d="M12.2 12.4c1.9-.9 3.4 1.2 2.3 2.9-1.7 2.6-6.1 1.3-6.1-2.2 0-4.2 5.4-6.1 8.8-3.3" fill="none" '
        'stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/></svg>')

NAV = [
    ("index.html", "Overview", "home"),
    ("papers/precipitation-shift.html", "Precipitation shift", "p1"),
    ("papers/mjo-prediction.html", "MJO prediction", "p2"),
    ("papers/chill-risk.html", "Chill risk", "p3"),
    ("papers/decision-tools.html", "Decision tools", "p4"),
    ("dashboards/index.html", "Dashboards", "dash"),
    ("team.html", "Team", "team"),
]


def head(title, desc, depth, extra=""):
    r = "../" * depth
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{FONTS}">
<link rel="stylesheet" href="{r}assets/site.css">
<link rel="icon" href="{r}assets/favicon.svg" type="image/svg+xml">
{extra}</head>
<body>
"""


def topbar(active, depth):
    r = "../" * depth
    links = "".join(
        f'<a href="{r}{href}"{" aria-current=\"page\"" if key == active else ""}>{label}</a>'
        for href, label, key in NAV)
    return f"""<header class="topbar"><div class="wrap">
<a class="brand" href="{r}index.html">{MARK}<span>{SITE}</span><small>UC Climate Action</small></a>
<nav class="nav" aria-label="Site">{links}</nav>
</div></header>
"""


def footer(depth):
    r = "../" * depth
    return f"""<footer class="site"><div class="wrap">
<div class="row"><strong style="color:var(--ink)">{SITE}</strong><span>Observations and AI for California water and agriculture decisions</span></div>
<div class="row">
<span>Funded by the University of California Office of the President, California Climate Action Seed Grant R02CP7584</span>
<span>Lead institution: University of California, Irvine</span>
</div>
<div class="row">
<a href="{r}index.html#references">References</a>
<a href="{r}dashboards/index.html">Dashboards</a>
<a href="{r}team.html">Team</a>
<a href="{r}index.html#data">Data and code</a>
<span>Figures reproduced from open-access articles under CC BY 4.0, cropped and recompressed for the web.</span>
</div>
</div></footer>
</body>
</html>
"""


def page(title, desc, active, depth, body, extra_head="", scripts=""):
    return head(title, desc, depth, extra_head) + topbar(active, depth) + "<main>\n" + body + "\n</main>\n" + scripts + footer(depth)


def fig(src, caption, credit, depth, alt=None, cls=""):
    r = "../" * depth
    alt = alt or caption.split(".")[0]
    return f"""<figure class="fig {cls}"><div class="frame"><img src="{r}assets/img/{src}" alt="{alt}" loading="lazy"></div>
<figcaption>{caption} <span class="credit">{credit}</span></figcaption></figure>"""


def pager(prev, nxt, depth):
    r = "../" * depth
    out = '<nav class="pager" aria-label="Study sequence">'
    out += (f'<a class="prev" href="{r}{prev[0]}"><span class="eyebrow">Previous · {prev[2]}</span><strong>{prev[1]}</strong></a>'
            if prev else '<span></span>')
    out += (f'<a class="next" href="{r}{nxt[0]}"><span class="eyebrow">Next · {nxt[2]}</span><strong>{nxt[1]}</strong></a>'
            if nxt else '<span></span>')
    return out + "</nav>"
