#!/usr/bin/env python3
"""
build_html.py — assemble the final StudyBuddy HTML.

Run from THIS folder:
    python3 build_html.py

Inputs (resolved relative to this script):
    REQUIRED:  build/head.html, build/app.jsx
    OPTIONAL:  build/extras.jsx, build/world.jsx, build/arena.jsx, build/arena.css
    REQUIRED:  modules_all.json + deadlines.json + grades.json
               OR fallback: ../StudyBuddy.html (the previous build) — module
               data and deadlines will be auto-extracted from its embedded
               <script id="..." type="application/json"> blocks.

Output:
    ./StudyBuddy.html (right next to this script). If you want it in your
    Downloads/files folder, copy or move it after the build.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT_FILE = os.path.join(ROOT, 'StudyBuddy.html')

# --------- helpers ---------
def load_json_file(path):
    with open(path, encoding='utf-8') as f: return json.load(f)

def extract_from_html(html_path):
    """Extract modules/deadlines/grades from a previously-built StudyBuddy.html."""
    with open(html_path, encoding='utf-8') as f: html = f.read()
    def grab(name):
        m = re.search(r'<script id="'+name+'" type="application/json">(.*?)</script>', html, re.DOTALL)
        if not m: return None
        # reverse the safe-json `<\/` → `</` escape that build_html.py applies
        raw = m.group(1).replace(r'<\/', '</')
        return json.loads(raw)
    return grab('modules-data'), grab('deadlines-data'), grab('grades-data')

def find_inputs():
    """Return (modules_obj, deadlines_obj, grades_obj). Try local JSON first; else fall back to extracting from a sibling StudyBuddy.html."""
    raw_p   = os.path.join(ROOT, 'modules_all.json')
    dl_p    = os.path.join(ROOT, 'deadlines.json')
    gr_p    = os.path.join(ROOT, 'grades.json')
    if all(os.path.exists(p) for p in [raw_p, dl_p, gr_p]):
        return load_json_file(raw_p), load_json_file(dl_p), load_json_file(gr_p)
    # Fallback: extract from sibling Downloads/files/StudyBuddy.html
    candidates = [
        os.path.join(os.path.dirname(ROOT), 'StudyBuddy.html'),  # parent folder
        os.path.join(ROOT, 'StudyBuddy.html'),                   # same folder
    ]
    for c in candidates:
        if os.path.exists(c):
            print(f'[fallback] Extracting modules/deadlines/grades from {c}')
            mods, dls, grs = extract_from_html(c)
            if mods and dls is not None and grs is not None:
                return mods, dls, grs
    raise FileNotFoundError(
        'Could not find modules_all.json (and deadlines.json / grades.json) here, '
        'and no existing StudyBuddy.html to extract from. Place those JSON files '
        'next to this script or put a previously-built StudyBuddy.html in the '
        'parent folder.'
    )

# --------- enrichment ---------
def build_question_note(q, concept):
    if q.get('note'): return q['note']
    parts = []
    if concept.get('definition'):
        parts.append(f"**Concept ground-truth.** {concept['definition']}")
    a = q.get('answer')
    if a is not None:
        if isinstance(a, bool):
            parts.append(f"**The right call.** {'True' if a else 'False'} — and here's why this matters: " + (q.get('explanation') or 'be precise about the wording.'))
        else:
            parts.append(f"**The right answer.** {a}")
    if q.get('explanation'):
        parts.append(f"**Why.** {q['explanation']}")
    if q.get('keywords'):
        kws = ', '.join(f'`{k}`' for k in q['keywords'])
        parts.append(f"**Words a marker looks for.** {kws}")
    if q.get('code') and q.get('type','').startswith('code'):
        parts.append("**Code under inspection.**\n```\n" + q['code'] + "\n```")
    if q.get('expectedOutput'):
        parts.append(f"**Expected output.** `{q['expectedOutput']}`")
    return "\n\n".join(parts) if parts else None

def build_level_notes(level):
    if level.get('notes'): return level['notes']
    parts = [f"**{level['name']}** covers {len(level['concepts'])} concept(s):"]
    for c in level['concepts']:
        line = f"- **{c['name']}** — {c.get('definition','')}".rstrip(' —')
        parts.append(line)
    parts += ["", "Walk through each concept's notes, then quiz yourself."]
    return "\n".join(parts)

def build_level_summary(level):
    if level.get('summary'): return level['summary']
    return f"{len(level['concepts'])} concept(s): " + ", ".join(c['name'] for c in level['concepts'])

def build_concept_summary(c):
    if c.get('summary'): return c['summary']
    if c.get('definition'):
        s = c['definition']
        return s[:137] + '…' if len(s) > 140 else s
    return c.get('name','')

def enrich_modules(modules):
    for m in modules:
        for lv in m['levels']:
            lv['notes']   = build_level_notes(lv)
            lv['summary'] = build_level_summary(lv)
            for c in lv['concepts']:
                c['summary'] = build_concept_summary(c)
                for q in c['questions']:
                    q['note'] = build_question_note(q, c)
        if not m.get('examTemplate'):
            m['examTemplate'] = {
                'durationMin': 90, 'totalMarks': 50,
                'composition': [
                    {'type':'mcq','count':6,'marks':2},
                    {'type':'tf','count':4,'marks':1},
                    {'type':'define','count':4,'marks':2},
                    {'type':'explain','count':3,'marks':4},
                    {'type':'short_essay','count':2,'marks':6},
                ]
            }
    return modules

# --------- main ---------
def main():
    raw, deadlines, grades = find_inputs()
    modules = enrich_modules(raw['modules'])

    head_path = os.path.join(ROOT, 'build', 'head.html')
    app_path  = os.path.join(ROOT, 'build', 'app.jsx')
    if not os.path.exists(head_path) or not os.path.exists(app_path):
        sys.exit('Missing required source: build/head.html and/or build/app.jsx')

    with open(head_path, encoding='utf-8') as f: head = f.read()
    with open(app_path,  encoding='utf-8') as f: app  = f.read()

    extras_blocks = []
    extra_files = (
        'extras.jsx',
        'world.jsx',
        'bonuses.jsx',
        'skills.jsx',
        'caveman.jsx',
        'enemies.jsx',
        'multimob.jsx',
        'cram.jsx',
        'lockin.jsx',
        'study_pass.jsx',
        'arena_runtime.jsx',
        'raids.jsx',
        'combat.jsx',
        'arena_views.jsx',
    )
    for fname in extra_files:
        p = os.path.join(ROOT, 'build', fname)
        if os.path.exists(p):
            with open(p, encoding='utf-8') as f: extras_blocks.append(f.read())
    if extras_blocks:
        combined = '\n\n'.join(extras_blocks)
        # Splice AFTER the React destructure line so hooks are already bound (avoids TDZ)
        react_destructure = 'const { useState, useEffect, useMemo, useRef } = React;'
        if react_destructure in app:
            app = app.replace(react_destructure, react_destructure + '\n\n' + combined)
        elif '/* ============ APP SHELL ============ */' in app:
            app = app.replace('/* ============ APP SHELL ============ */', combined + '\n\n/* ============ APP SHELL ============ */')
        else:
            app = app.replace('ReactDOM.createRoot', combined + '\n\nReactDOM.createRoot')
    arena_css_path = os.path.join(ROOT, 'build', 'arena.css')
    if os.path.exists(arena_css_path):
        with open(arena_css_path, encoding='utf-8') as f: arena_css = f.read()
        head = head.replace('</style>', arena_css + '\n</style>')

    def safe_json(obj): return json.dumps(obj, separators=(',',':')).replace('</','<\\/')

    html = head.replace('__MODULES__', safe_json({'modules': modules}))
    html = html.replace('__DEADLINES__', safe_json(deadlines))
    html = html.replace('__GRADES__', safe_json(grades))
    html += '\n' + app + '\n'

    with open(OUT_FILE, 'w', encoding='utf-8') as f: f.write(html)
    # Also write to parent folder so the user can open StudyBuddy.html from there
    parent_out = os.path.join(os.path.dirname(ROOT), 'StudyBuddy.html')
    try:
        with open(parent_out, 'w', encoding='utf-8') as f: f.write(html)
        print(f'Also wrote {parent_out}')
    except Exception as e:
        print(f'(skipped writing to parent: {e})')

    nm = len(modules)
    nl = sum(len(m['levels']) for m in modules)
    nc = sum(len(lv['concepts']) for m in modules for lv in m['levels'])
    nq = sum(len(c['questions']) for m in modules for lv in m['levels'] for c in lv['concepts'])
    print(f'OK: {nm} modules, {nl} levels, {nc} concepts, {nq} questions')
    print(f'Wrote {OUT_FILE} ({os.path.getsize(OUT_FILE):,} bytes)')

if __name__ == '__main__':
    main()
