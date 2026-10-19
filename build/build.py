import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
import p_index, p_papers, p_dash, p_team
OUT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pages = {
 'index.html': p_index.build(),
 'team.html': p_team.build(),
 'papers/precipitation-shift.html': p_papers.precip(),
 'papers/mjo-prediction.html': p_papers.mjo(),
 'papers/chill-risk.html': p_papers.chill(),
 'papers/decision-tools.html': p_papers.tools(),
 'dashboards/index.html': p_dash.hub(),
 'dashboards/mjo.html': p_dash.mjo(),
 'dashboards/precipitation.html': p_dash.precip(),
 'dashboards/chill.html': p_dash.chill(),
}
for p, html in pages.items():
    path = os.path.join(OUT, p); os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w').write(html)
open(os.path.join(OUT, 'assets/favicon.svg'), 'w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#fff" stroke="#0f1f26" stroke-width="1.5"/><path d="M12.2 12.4c1.9-.9 3.4 1.2 2.3 2.9-1.7 2.6-6.1 1.3-6.1-2.2 0-4.2 5.4-6.1 8.8-3.3" fill="none" stroke="#0b5d7e" stroke-width="2" stroke-linecap="round"/></svg>')
open(os.path.join(OUT, '.nojekyll'), 'w').write('')
print('built', len(pages))
