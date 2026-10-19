from common import page

CORE = [
    ("velicogna", "Isabella Velicogna", "Professor of Earth System Science, UC Irvine; part-time faculty, NASA Jet Propulsion Laboratory",
     "Project lead. PI of multi-institution NASA-funded projects. Collaborates and co-designs with western U.S. water agencies to put Earth science and satellite data to real-world use."),
    ("a", "Geruo A", "Project Scientist, UC Irvine",
     "Co-lead. Bridges scientific development and applications with observations and AI/ML."),
    ("virji", "Khalil Virji", "Assistant Specialist, UC Irvine (now Machine Learning Engineer, Aurora)",
     "Built the deep learning MJO prediction and bias-correction models."),
    ("shalgumbayeva", "Gulnaz Shalgumbayeva", "PhD Candidate, UC Irvine",
     "Studies shifts in precipitation extremes in California and East Antarctica with observations, satellites and models."),
    ("agrawal", "Arnav Agrawal", "Assistant Specialist, UC Irvine",
     "Develops an AI agent that runs geoscience data pipelines, and extends GRACE glacier records to the present."),
]

EXTENDED = [
    ("Prakash K. Jha", "UC Merced"),
    ("Tapan B. Pathak", "UC Merced"),
    ("Natalia Pinzón", "UC Davis"),
    ("Daniele Zaccaria", "UC Davis"),
    ("Mark Cooper", "University of Canterbury, New Zealand (formerly UC Davis)"),
    ("Carlos Gaitan", "Benchmark Labs"),
]

PARTNERS = [
    ("Michael Anderson", "State Climatologist, California Department of Water Resources",
     "S2S precipitation, atmospheric rivers and forecast-informed reservoir operations."),
    ("Jeanine Jones", "Interstate Resources Manager, California Department of Water Resources",
     "Drought planning and interstate water policy."),
    ("Bohumil Svoma", "Principal Climate Scientist and Meteorologist, Salt River Project (Arizona)",
     "Operational streamflow and water-supply forecasting."),
]

COLLAB = [
    ("Joel Kimmelshue", "Land IQ"),
    ("Peter Moller", "Rubicon Water"),
    ("Danny Merkley", "KnoWater Consulting"),
    ("Tom Stein", "American Farmland Trust"),
    ("Maziar Raissi", "University of Colorado Boulder"),
]


def build():
    d = 0
    core = "".join(f"""<article class="person">
<img src="assets/img/team/{slug}.webp" alt="{name}" width="360" height="360" loading="lazy">
<div><h3>{name}</h3><p class="role">{role}</p><p class="bio">{bio}</p></div>
</article>""" for slug, name, role, bio in CORE)
    names = lambda rows: "".join(f'<li><strong>{n}</strong><span>{a}</span></li>' for n, a in rows)
    partners = "".join(f'<li><strong>{n}</strong><span>{r}</span><em>{b}</em></li>' for n, r, b in PARTNERS)
    body = f"""
<header class="paper-head"><div class="wrap">
<p class="eyebrow">Team effort</p>
<h1>Team</h1>
<p class="authors">Scientists at UC Irvine, partners across the University of California, and the water and agriculture practitioners who use the results.</p>
</div></header>

<section><div class="wrap" style="display:grid;gap:22px">
<div class="sec-head" style="margin-bottom:0"><p class="eyebrow">UC Irvine, Department of Earth System Science</p><h2>Core team</h2></div>
<div class="people">{core}</div>
</div></section>

<section><div class="wrap team-lists">
<div><div class="sec-head"><p class="eyebrow">Research partners</p><h2>Extended team</h2></div>
<ul class="roster">{names(EXTENDED)}</ul></div>
<div><div class="sec-head"><p class="eyebrow">Agencies using the results</p><h2>End-user partners</h2></div>
<ul class="roster partners">{partners}</ul></div>
</div></section>

<section><div class="wrap">
<div class="sec-head"><p class="eyebrow">Industry, agriculture and modeling</p><h2>Extended collaborators</h2></div>
<ul class="roster cols">{names(COLLAB)}</ul>
</div></section>


"""
    return page("Fusion Outlook Team", "The UC Irvine core team, research partners, end-user partners and collaborators behind the Fusion Outlook project.", "team", d, body)
