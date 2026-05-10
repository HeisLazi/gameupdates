/* ==========================================================================
 * study_pass.jsx · Pass Sprint — Study-side emergency exam prep
 *
 * Splice position: after cram.jsx, before arena_runtime.jsx.
 * Defines:  StudyPassHub.
 * Reads:    shuffle (app.jsx).
 *
 * UI placement: rendered as a sub-tab under the Exam parent in the Study
 * topnav (was a top-level tab pre-consolidation; folded under Exam 2026-05-09).
 * Surfaces a deadline-aware priority map + 3 launch buttons (Diagnostic,
 * Pass Sprint, Timed Mock).
 *
 * Edit when: tweaking the priority-scoring formula, the diagnostic length,
 * or the deadline-pressure heuristic.
 * ========================================================================== */
/* ============ STUDY PASS MODE ============ */
function StudyPassHub({ mod, state, onStart, onBack }){
  const [hoursLeft, setHoursLeft] = useState('24');
  const [targetPct, setTargetPct] = useState('50');
  const [prepLevel, setPrepLevel] = useState('cold');
  const [format, setFormat] = useState('mixed');

  const allConcepts = useMemo(() => (mod.levels || []).flatMap((lv, levelIndex) =>
    (lv.concepts || []).map((concept, conceptIndex) => ({
      ...concept,
      levelId:lv.id,
      levelName:lv.name,
      levelIndex,
      conceptIndex,
      questions:(concept.questions || []).map(q => ({
        ...q,
        conceptId:concept.id,
        conceptName:concept.name,
        conceptNotes:concept.notes,
        levelName:lv.name,
      })),
    }))
  ), [mod.id]);

  const allQ = useMemo(() => allConcepts.flatMap(c => c.questions), [allConcepts]);

  const typeMarks = useMemo(() => {
    const out = {};
    const comp = mod.examTemplate && Array.isArray(mod.examTemplate.composition) ? mod.examTemplate.composition : [];
    comp.forEach(part => {
      const count = Math.max(1, part.count || 1);
      out[part.type] = (out[part.type] || 0) + (part.marks || 1) * count;
    });
    return out;
  }, [mod.id]);

  const priorityRows = useMemo(() => {
    const mistakes = state?.arena?.mistakePool || [];
    const mistakeSet = new Set(mistakes);
    const dueAt = Date.now();
    const hours = Math.max(1, Number(hoursLeft) || 24);
    const urgency = hours <= 6 ? 1.35 : hours <= 24 ? 1.18 : 1;
    const coldBonus = prepLevel === 'cold' ? 2 : prepLevel === 'some' ? 1 : 0;
    return allConcepts.map(c => {
      const qCount = c.questions.length;
      const markValue = c.questions.reduce((sum, q) => sum + (typeMarks[q.type] || 1), 0);
      const due = c.questions.filter(q => state?.sr?.[q.id] && state.sr[q.id].due <= dueAt).length;
      const misses = c.questions.filter(q => mistakeSet.has(q.id)).length;
      const unseen = state?.seenConcepts?.[c.id] ? 0 : 1;
      const foundation = Math.max(0, 3 - c.levelIndex) * 0.8;
      const formatBoost = format === 'mixed' ? 0 : c.questions.filter(q => q.type === format).length * 2;
      const score = Math.round((markValue * 2.2 + misses * 9 + due * 4 + unseen * (4 + coldBonus) + foundation + formatBoost) * urgency);
      const minutes = Math.max(6, Math.min(18, 6 + Math.ceil(qCount * 1.6) + (misses ? 3 : 0)));
      return { concept:c, qCount, markValue, due, misses, unseen, score, minutes };
    }).sort((a,b) => b.score - a.score);
  }, [allConcepts, state?.arena?.mistakePool?.length, state?.sr, state?.seenConcepts, typeMarks, hoursLeft, prepLevel, format]);

  const topRows = priorityRows.slice(0, 6);
  const target = Math.max(40, Math.min(90, Number(targetPct) || 50));
  const estimatedStart = Math.max(18, Math.min(62, Math.round(28 + (state?.streak?.count || 0) * 0.8 + (allQ.length ? Math.min(18, allQ.filter(q => state?.sr?.[q.id]).length / allQ.length * 24) : 0))));
  const estimatedAfter = Math.min(75, estimatedStart + Math.round(topRows.reduce((sum, r) => sum + r.score, 0) / Math.max(12, topRows.length * 9)));
  const passGap = Math.max(0, target - estimatedStart);

  const selectFromRows = (rows, limit) => {
    const chosen = [];
    const used = new Set();
    rows.forEach(row => {
      const ordered = shuffle(row.concept.questions || []);
      ordered.forEach(q => {
        if (chosen.length >= limit || used.has(q.id)) return;
        chosen.push(q);
        used.add(q.id);
      });
    });
    if (chosen.length < limit){
      shuffle(allQ).forEach(q => {
        if (chosen.length >= limit || used.has(q.id)) return;
        chosen.push(q);
        used.add(q.id);
      });
    }
    return chosen;
  };

  const selectExamMix = (limit) => {
    const used = new Set();
    const selected = [];
    const comp = mod.examTemplate && Array.isArray(mod.examTemplate.composition) ? mod.examTemplate.composition : [];
    if (comp.length){
      comp.forEach(part => {
        const bucket = shuffle(allQ.filter(q => q.type === part.type && !used.has(q.id)));
        bucket.slice(0, part.count || 0).forEach(q => {
          if (selected.length >= limit) return;
          selected.push(q);
          used.add(q.id);
        });
      });
    }
    if (selected.length < limit){
      selectFromRows(priorityRows, limit).forEach(q => {
        if (selected.length >= limit || used.has(q.id)) return;
        selected.push(q);
        used.add(q.id);
      });
    }
    return selected;
  };

  const begin = (kind) => {
    if (!allQ.length){ alert('No questions in this module yet.'); return; }
    if (kind === 'diagnostic'){
      onStart({ questions:selectFromRows(topRows, Math.min(12, allQ.length)), title:`Pass Diagnostic - ${mod.name}`, mode:'study', durationMin:8 });
      return;
    }
    if (kind === 'mock'){
      onStart({ questions:selectExamMix(Math.min(40, allQ.length)), title:`Pass Mock - ${mod.name}`, mode:'exam', durationMin:Math.min(60, mod.examTemplate?.durationMin || 45) });
      return;
    }
    onStart({ questions:selectFromRows(topRows, Math.min(30, allQ.length)), title:`Pass Sprint - ${mod.name}`, mode:'study', durationMin:30 });
  };

  return (
    <div className="study-pass">
      <div className="study-pass-hero">
        <div>
          <div className="tiny pass-kicker">PASS MODE</div>
          <h2>Emergency prep — {mod.name}</h2>
          <div className="muted">Priority-first study for the next exam window.</div>
        </div>
        <div className="pass-odds">
          <div className="tiny">Estimated range</div>
          <b>{estimatedStart}% → {estimatedAfter}%</b>
          <span className={passGap ? 'chip warn' : 'chip ok'}>{passGap ? `${passGap}% gap` : 'on track'}</span>
        </div>
      </div>

      <div className="pass-layout">
        <section className="card pass-panel">
          <h3>Triage</h3>
          <div className="pass-form-grid">
            <label>
              <span className="tiny">Hours left</span>
              <input value={hoursLeft} onChange={e=>setHoursLeft(e.target.value)} inputMode="numeric" />
            </label>
            <label>
              <span className="tiny">Target %</span>
              <input value={targetPct} onChange={e=>setTargetPct(e.target.value)} inputMode="numeric" />
            </label>
            <label>
              <span className="tiny">Prep level</span>
              <select value={prepLevel} onChange={e=>setPrepLevel(e.target.value)}>
                <option value="cold">Cold start</option>
                <option value="some">Some notes</option>
                <option value="ready">Mostly ready</option>
              </select>
            </label>
            <label>
              <span className="tiny">Format focus</span>
              <select value={format} onChange={e=>setFormat(e.target.value)}>
                <option value="mixed">Mixed</option>
                <option value="mcq">MCQ</option>
                <option value="tf">True/False</option>
                <option value="define">Definitions</option>
                <option value="explain">Explain</option>
                <option value="short_essay">Short essays</option>
              </select>
            </label>
          </div>
          <div className="pass-action-row">
            <button className="btn" onClick={()=>begin('diagnostic')}>Start Diagnostic</button>
            <button className="btn ok" onClick={()=>begin('sprint')}>Start Pass Sprint</button>
            <button className="btn ghost" onClick={()=>begin('mock')}>Timed Mock</button>
          </div>
        </section>

        <section className="card pass-panel">
          <h3>Priority map</h3>
          <div className="pass-topic-list">
            {topRows.map((row, i) => (
              <div key={row.concept.id} className="pass-topic-row">
                <div className="pass-rank">{i+1}</div>
                <div>
                  <b>{row.concept.name}</b>
                  <div className="tiny">{row.concept.levelName} · {row.qCount} Q · {row.minutes} min</div>
                </div>
                <div className="pass-topic-flags">
                  {row.misses > 0 && <span className="chip err">{row.misses} miss</span>}
                  {row.due > 0 && <span className="chip warn">{row.due} due</span>}
                  {row.unseen > 0 && <span className="chip">new</span>}
                  <span className="chip accent">{row.score}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="card pass-panel pass-coach">
        <h3>Next 30 minutes</h3>
        <div className="pass-steps">
          <div><b>1</b><span>Diagnostic snapshot</span></div>
          <div><b>2</b><span>Top two concepts</span></div>
          <div><b>3</b><span>Mixed retrieval</span></div>
          <div><b>4</b><span>Timed check</span></div>
        </div>
        <button className="btn ghost" onClick={onBack}>Back</button>
      </div>
    </div>
  );
}
