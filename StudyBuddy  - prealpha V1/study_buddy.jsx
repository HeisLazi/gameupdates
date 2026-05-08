import { useState, useEffect, useCallback } from "react";

// ─── WORLD DATA ────────────────────────────────────────────────────────────────
const WORLD = {
  id: "ari711s",
  name: "ARI711S — Artificial Intelligence",
  topics: [
    {
      id: "agents",
      name: "Agents & Architecture",
      color: "#7c5cbf",
      notes: [
        { heading: "What is an Agent?", body: "An entity that perceives its environment through sensors and acts upon it through actuators. The agent function maps percept sequences to actions. The agent program implements this on hardware." },
        { heading: "Types of Agents", body: "Simple Reflex — acts on current percept only, no memory. Fast but limited.\nModel-Based — keeps internal world state, adapts to unseen parts of environment.\nGoal-Based — considers future states to reach a goal.\nUtility-Based — picks the action maximising a numerical utility score.\nLearning Agent — improves its own behaviour over time from experience." },
        { heading: "Trade-off: SRA vs MBA", body: "Efficiency: SRA is faster (no overhead). MBA slower but makes better decisions.\nAdaptability: SRA can't adapt without reprogramming. MBA adapts via world model.\nRobustness: SRA fails in noisy environments. MBA handles noise using context and history." },
        { heading: "Exam Tip", body: "Q1 Test 1 (4 marks) — always cover all three: efficiency, adaptability, robustness. Two points per dimension." },
      ],
      concepts: [
        { id: "agent_types", name: "Types of Agents", definition: "Agents classified by how much world knowledge they use", questions: [
          { prompt: "Which agent type acts only on the current percept with no memory?", answer: "Simple Reflex Agent", difficulty: "easy" },
          { prompt: "What key advantage does a model-based agent have over a simple reflex agent?", answer: "It maintains an internal world state, allowing it to reason about parts of the environment it can't currently perceive", difficulty: "medium" },
          { prompt: "Compare a simple reflex agent and a model-based agent on: efficiency, adaptability, and robustness.", answer: "Efficiency: SRA faster, MBA slower but smarter. Adaptability: SRA rigid, MBA adapts via model. Robustness: SRA fails in noise, MBA handles it.", difficulty: "hard" },
          { prompt: "An email spam filter that learns from flagged emails is what type of agent?", answer: "Learning Agent", difficulty: "easy" },
          { prompt: "What distinguishes a goal-based agent from a utility-based agent?", answer: "Goal-based checks binary goal reached/not. Utility-based compares outcomes numerically and picks the best.", difficulty: "medium" },
        ]},
      ]
    },
    {
      id: "search_foundations",
      name: "Search Foundations",
      color: "#2980b9",
      notes: [
        { heading: "Search Problem Components", body: "State space — all possible configurations\nSuccessor function — given a state, returns next states + costs\nStart state — where the agent begins\nGoal test — checks if current state is the solution\nSolution — sequence of actions from start to goal\nPath cost — total cost of the solution" },
        { heading: "World State vs Search State", body: "World state = every detail of the environment. Search state = only what's needed for planning (abstraction). Example: pathing only needs (x,y). Eat-all-dots needs (x,y) + dot booleans." },
        { heading: "Planning vs Identification", body: "Planning: the PATH matters. Costs and depths vary. Uses heuristics. Dynamic environment.\nIdentification: the GOAL STATE matters. Path irrelevant. All paths same depth. Static environment." },
        { heading: "Algorithm Properties", body: "Completeness — will find a solution if one exists.\nOptimality — finds the lowest-cost solution.\nTime Complexity — how many nodes expanded (O notation).\nSpace Complexity — how much memory needed at once." },
        { heading: "Exam Tip", body: "Q2 (6 marks) asked to explain a search problem — expect 6 distinct points. Q3 (4 marks) asked to match property names to descriptions — know all four cold." },
      ],
      concepts: [
        { id: "search_problem", name: "Search Problem", definition: "A formal problem: states, actions, start, goal test, solution", questions: [
          { prompt: "List the four key components of a search problem.", answer: "State space, successor function, start state, goal test", difficulty: "easy" },
          { prompt: "What is a solution in a search problem?", answer: "A sequence of actions (a plan) that transforms the start state into a goal state", difficulty: "easy" },
          { prompt: "What is the difference between a world state and a search state?", answer: "World state = every detail. Search state = only the details needed for planning (abstraction).", difficulty: "medium" },
          { prompt: "In planning problems, what is more important — the path or the goal?", answer: "The path — costs and depth of reaching the goal matter", difficulty: "easy" },
          { prompt: "Match: 'A guarantee that the algorithm will find the solution with the lowest cost'", answer: "Optimality", difficulty: "easy" },
          { prompt: "Match: 'A measure of how much memory the algorithm needs to run'", answer: "Space Complexity", difficulty: "easy" },
        ]},
      ]
    },
    {
      id: "uninformed",
      name: "Uninformed Search",
      color: "#27ae60",
      notes: [
        { heading: "BFS — Breadth-First Search", body: "Data structure: Queue (FIFO)\nExplores level by level, shallow nodes first.\nComplete: Yes. Optimal: Yes — ONLY if all step costs equal.\nTime: O(b^d). Space: O(b^d) — stores entire frontier level.\nWeakness: Very high memory usage." },
        { heading: "DFS — Depth-First Search", body: "Data structure: Stack (LIFO)\nDives deep before backtracking.\nComplete: No — can loop forever in infinite spaces.\nOptimal: No — may find long solution before short.\nTime: O(b^m). Space: O(bm) — only current path stored.\nStrength: Very memory efficient." },
        { heading: "UCS — Uniform Cost Search", body: "Data structure: Priority queue by g(n) — actual cost so far.\nAlways expands cheapest node first.\nComplete: Yes. Optimal: Yes — always finds cheapest path.\nBehaves like BFS when all costs are equal.\nExpands in rings of increasing cost, not depth." },
        { heading: "Expansion Order Practice", body: "BFS: level by level, alphabetical at each level.\nDFS: follow leftmost child all the way down, backtrack.\nUCS: always expand node with lowest g(n). Break ties alphabetically.\nExam Q8 (8 marks) — know all three cold." },
        { heading: "Informed vs Uninformed", body: "Uninformed = blind, explores all paths equally.\nInformed = uses heuristic h(n) to focus on promising areas.\nInformed avoids dead ends earlier, terminates early if heuristic suggests no improvement." },
      ],
      concepts: [
        { id: "bfs_dfs_ucs", name: "BFS / DFS / UCS", definition: "Three uninformed strategies with different data structures and properties", questions: [
          { prompt: "What data structure does BFS use?", answer: "Queue (FIFO — First In, First Out)", difficulty: "easy" },
          { prompt: "What data structure does DFS use?", answer: "Stack (LIFO — Last In, First Out)", difficulty: "easy" },
          { prompt: "What does UCS prioritise when choosing the next node?", answer: "The node with the lowest total path cost so far — g(n)", difficulty: "easy" },
          { prompt: "Why is BFS optimal only when step costs are equal?", answer: "It finds the shallowest solution, which is only cheapest when all steps cost the same", difficulty: "medium" },
          { prompt: "Why is DFS not optimal?", answer: "It may find a deep (expensive) solution before discovering a shorter one", difficulty: "medium" },
          { prompt: "Why does BFS use more memory than DFS?", answer: "BFS stores every node at each frontier level. DFS only stores the current path.", difficulty: "medium" },
          { prompt: "BFS vs DFS on completeness?", answer: "BFS is complete. DFS is NOT complete in infinite state spaces — can loop forever.", difficulty: "hard" },
          { prompt: "When does UCS behave exactly like BFS?", answer: "When all step costs are equal", difficulty: "medium" },
        ]},
      ]
    },
    {
      id: "informed",
      name: "Informed Search & A*",
      color: "#e67e22",
      notes: [
        { heading: "Heuristic Function h(n)", body: "Estimates cost from state n to the goal.\nAdmissible: h(n) ≤ actual cost — never overestimates.\nConsistent (monotone): h(n) ≤ arc_cost(n→n') + h(n') for all arcs.\nConsistency implies admissibility. The reverse is NOT guaranteed.\nExample: straight-line distance is admissible for road navigation." },
        { heading: "Greedy Best-First", body: "Priority queue ordered by h(n) only — ignores actual cost.\nFast, often reaches goal quickly in practice.\nNot complete — can loop. Not optimal — ignores g(n).\nUses: h(n)" },
        { heading: "A* Search", body: "Priority queue ordered by f(n) = g(n) + h(n).\ng(n) = actual cost from start. h(n) = estimated cost to goal.\nComplete: Yes. Optimal: Yes — if admissible (tree) or consistent (graph).\nTerminates when a goal is EXPANDED, not just discovered.\nWith strict expanded list + inconsistent heuristic → may miss optimal." },
        { heading: "A* Step-by-Step Table", body: "Exam Q9 (10 marks) — fill: Path, Path Length, Total f(n), Expanded List.\nExpand node with lowest f(n). If tied, alphabetical.\nAfter expanding a node, add to closed list — never expand again." },
        { heading: "Admissibility vs Consistency Check", body: "Admissible check: is h(n) ≤ actual cost from n to goal for ALL states?\nConsistency check: for each arc n→n', is h(n) ≤ arc_cost + h(n')?\nIf inconsistent: A* graph search may find suboptimal paths.\nFix: adjust h(n) values so the arc condition holds." },
        { heading: "Exam Tip", body: "Q10 (8 marks): (a) Is heuristic admissible? (b) Is it consistent? (c) Did A* find optimal? If not, what fix? — The fix is always adjusting h values to restore consistency." },
      ],
      concepts: [
        { id: "astar_heuristics", name: "A* & Heuristics", definition: "f(n) = g(n) + h(n) — balance actual and estimated cost", questions: [
          { prompt: "What is the f(n) formula for A*?", answer: "f(n) = g(n) + h(n) — actual cost so far plus heuristic estimate to goal", difficulty: "easy" },
          { prompt: "What is an admissible heuristic?", answer: "One that never overestimates the true cost — h(n) ≤ actual cost", difficulty: "easy" },
          { prompt: "What is a consistent heuristic?", answer: "h(n) ≤ arc_cost(n→n') + h(n') for every arc. The heuristic decrease never exceeds the arc cost.", difficulty: "medium" },
          { prompt: "When does A* terminate — on goal discovery or goal expansion?", answer: "When a goal node is expanded (popped from priority queue), not when first discovered", difficulty: "medium" },
          { prompt: "A has h=5, C has h=1. Arc A→C costs 3. Is this consistent?", answer: "No — check: h(A) ≤ arc(A→C) + h(C) → 5 ≤ 3+1=4. FALSE. 5 > 4.", difficulty: "hard" },
          { prompt: "Why does A* graph search need consistency, not just admissibility?", answer: "Graph search closes nodes early. Consistency ensures the first time a node is closed, its path is already optimal.", difficulty: "hard" },
          { prompt: "Why is Greedy search not optimal while A* is?", answer: "Greedy only uses h(n) and ignores g(n). It can pick a 'close-looking' node that has an expensive actual path.", difficulty: "medium" },
        ]},
      ]
    },
    {
      id: "csps",
      name: "Constraint Satisfaction",
      color: "#c0392b",
      notes: [
        { heading: "CSP Components", body: "Variables — the things needing values.\nDomains — valid values for each variable.\nConstraints — rules restricting which value combos are valid.\nConstraint graph: nodes = variables, edges = constraints between pairs.\nSolution: complete assignment satisfying all constraints." },
        { heading: "Backtracking Search", body: "Assign one variable at a time.\nCheck constraint consistency after each assignment.\nIf no valid value exists → backtrack.\nNaive backtracking: no lookahead, detects failure late.\nStill better than generate-and-test (all combos then check)." },
        { heading: "Forward Checking", body: "After assigning a variable: remove inconsistent values from all NEIGHBOURS' domains.\nIf any neighbour domain becomes empty → backtrack immediately.\nLooks one step ahead — detects failures earlier than plain backtracking." },
        { heading: "Arc Consistency (AC-3)", body: "For every arc (X→Y): every value in X's domain must have a valid value in Y's domain.\nStronger than forward checking — checks all pairs, not just neighbours of assigned var.\nConstraint propagation: repeatedly enforce arc consistency throughout the whole CSP." },
        { heading: "Ordering Heuristics", body: "MRV (Minimum Remaining Values) — assign the variable with the fewest valid values first.\nLCV (Least Constraining Value) — choose the value that eliminates the fewest options for neighbours." },
        { heading: "Exam Tip", body: "Q6 (6 marks): name and define all 3 filtering techniques. Q11 (8 marks): trace forward checking step by step — show domain state after EACH assignment. Get every domain update." },
      ],
      concepts: [
        { id: "csp_filtering", name: "CSPs & Filtering", definition: "Variables + Domains + Constraints, solved with backtracking + filtering", questions: [
          { prompt: "What are the three key components of a CSP?", answer: "Variables, Domains, Constraints", difficulty: "easy" },
          { prompt: "When does backtracking trigger?", answer: "When no value in a variable's domain satisfies the current constraints", difficulty: "easy" },
          { prompt: "What does forward checking do after a variable is assigned?", answer: "Checks neighbouring variables and removes values inconsistent with the new assignment", difficulty: "medium" },
          { prompt: "What triggers immediate backtracking in forward checking?", answer: "When any unassigned variable's domain becomes empty", difficulty: "medium" },
          { prompt: "How is arc consistency stronger than forward checking?", answer: "Forward checking only checks neighbours of the last assigned variable. Arc consistency ensures ALL variable pairs are mutually consistent throughout the whole CSP.", difficulty: "hard" },
          { prompt: "What does the constraint graph represent?", answer: "Nodes = variables. Edges connect pairs of variables that share a constraint.", difficulty: "easy" },
          { prompt: "What is the MRV heuristic?", answer: "Minimum Remaining Values — assign the variable with the fewest valid values in its domain first", difficulty: "medium" },
        ]},
      ]
    },
    {
      id: "adversarial",
      name: "Adversarial Search",
      color: "#8e44ad",
      notes: [
        { heading: "Minimax Algorithm", body: "Two-player zero-sum game. MAX player maximises, MIN player minimises.\nAssumes both play optimally.\nTerminal states have utility values — backed up through the tree.\nComplete: Yes (finite tree). Optimal: Yes vs perfect opponent.\nTime: O(b^m) — impractical for chess without pruning." },
        { heading: "Alpha-Beta Pruning", body: "Optimisation of minimax — prunes branches that can't affect the result.\nα = best value MAX can guarantee so far.\nβ = best value MIN can guarantee so far.\nPrune when α ≥ β.\nSame result as minimax, faster. Best case O(b^(m/2)).\nOnly works in two-player zero-sum games." },
        { heading: "Resource Limits & Eval Functions", body: "Real games (chess): can't search to terminal states.\nCutoff at fixed depth — use evaluation function instead of true utility.\nEval function estimates state quality based on features.\nPacman example: score, food distance, ghost distance." },
        { heading: "Exam Tip", body: "Supp Q1 T/F — Alpha-Beta CAN improve minimax efficiency: TRUE.\nKnow: it does NOT change the final result, just skips irrelevant branches." },
      ],
      concepts: [
        { id: "minimax_ab", name: "Minimax & Alpha-Beta", definition: "Optimal play in two-player zero-sum games with pruning", questions: [
          { prompt: "What does the MAX player do in minimax?", answer: "Picks the action that maximises the utility value", difficulty: "easy" },
          { prompt: "Under what condition is a branch pruned in alpha-beta?", answer: "When α ≥ β — MAX already has a better option, so the MIN subtree is irrelevant", difficulty: "medium" },
          { prompt: "Does alpha-beta pruning change the final minimax result?", answer: "No — same result as minimax, just computed faster by skipping irrelevant branches", difficulty: "medium" },
          { prompt: "Terminal values at leaves: [3,5,2] and [9,1,7]. Two MIN children under a MAX root. What is the root value?", answer: "Left MIN = min(3,5,2) = 2. Right MIN = min(9,1,7) = 1. MAX root = max(2,1) = 2.", difficulty: "hard" },
          { prompt: "What does α represent in alpha-beta pruning?", answer: "The best value MAX can guarantee from the current position or above", difficulty: "easy" },
          { prompt: "Why is minimax optimal only against a perfect opponent?", answer: "It assumes the opponent plays optimally. A weak opponent might allow better outcomes than minimax predicts.", difficulty: "medium" },
        ]},
      ]
    },
    {
      id: "mdps",
      name: "MDPs & Value Iteration",
      color: "#16a085",
      notes: [
        { heading: "MDP Components", body: "State (S) — complete description of agent's situation.\nAction (A) — decisions the agent can make.\nTransition T(s,a,s') — probability of reaching s' from s via action a.\nReward R(s,a,s') — numerical feedback for the action.\nPolicy π — mapping from states to actions.\nDiscount factor γ — how much future rewards are discounted." },
        { heading: "Bellman Equation", body: "V*(s) = max_a Σ_{s'} T(s,a,s') [R(s,a,s') + γ V*(s')]\nThis says: the value of state s = the best action's expected reward + discounted future value." },
        { heading: "Value Iteration", body: "1. Initialise: V⁰(s) = 0 for all states.\n2. Each iteration: V^(k+1)(s) = max_a Σ T(s,a,s') [R + γ V^k(s')]\n3. Repeat until values converge.\nExam answer: J¹(S1) = 2, J²(S1) = 7.4 for the test graph (γ=0.9)." },
        { heading: "Exam Tip", body: "Supp Q2 (4 marks): define all 5 MDP components.\nSupp Q5 (10 marks): compute J¹ and J² using the Bellman equation. γ=0.9." },
      ],
      concepts: [
        { id: "mdp_vi", name: "MDPs & Value Iteration", definition: "Stochastic decision-making with Bellman equation", questions: [
          { prompt: "What are the five components of an MDP?", answer: "State, Action, Transition function, Reward function, Policy", difficulty: "easy" },
          { prompt: "What does the discount factor γ control?", answer: "How much the agent values future rewards. γ near 0 = myopic. γ near 1 = far-sighted.", difficulty: "medium" },
          { prompt: "Write the Bellman equation for value iteration.", answer: "V*(s) = max_a Σ T(s,a,s') [R(s,a,s') + γ V*(s')]", difficulty: "hard" },
          { prompt: "What are all state values initialised to in value iteration?", answer: "0 — V⁰(s) = 0 for all states", difficulty: "easy" },
          { prompt: "What does the transition function T(s,a,s') represent?", answer: "The probability of transitioning to state s' when action a is taken in state s", difficulty: "medium" },
        ]},
      ]
    },
    {
      id: "ml",
      name: "Machine Learning Basics",
      color: "#f39c12",
      notes: [
        { heading: "Three Learning Paradigms", body: "Supervised — labelled data, learns input→output mapping. Goal: prediction.\nUnsupervised — no labels, finds hidden patterns. Goal: structure discovery.\nReinforcement — reward/penalty signals from environment. Goal: optimal policy." },
        { heading: "Examples", body: "Supervised: neural networks, SVM, linear regression, decision trees.\nUnsupervised: k-means clustering, PCA, autoencoders.\nReinforcement: AlphaGo, robot locomotion, game-playing AI." },
        { heading: "Exam Tip", body: "Supp Q3 (6 marks) — two sub-questions: (1) supervision type, (2) learning goal. Know both dimensions for all three paradigms." },
      ],
      concepts: [
        { id: "ml_paradigms", name: "ML Paradigms", definition: "Supervised, unsupervised, and reinforcement learning", questions: [
          { prompt: "What type of data does supervised learning require?", answer: "Labelled data — inputs paired with correct output labels", difficulty: "easy" },
          { prompt: "What is the goal of unsupervised learning?", answer: "To discover hidden patterns or structure in unlabelled data", difficulty: "easy" },
          { prompt: "Compare all three ML paradigms: data type and learning goal.", answer: "Supervised: labelled → prediction. Unsupervised: unlabelled → patterns. Reinforcement: rewards → optimal policy.", difficulty: "hard" },
          { prompt: "An AI learning to play chess through wins/losses is which paradigm?", answer: "Reinforcement learning — trial and error with reward signals", difficulty: "easy" },
        ]},
      ]
    },
  ]
};

const ALL_QUESTIONS = WORLD.topics.flatMap(t =>
  t.concepts.flatMap(c => c.questions.map(q => ({ ...q, topic: t.name, topicId: t.id, concept: c.name, topicColor: t.color })))
);

// ─── COMPANION DATA ────────────────────────────────────────────────────────────
const COMPANION_FORMS = [
  { level: 0, name: "Wisp", emoji: "🔮", desc: "A flickering mote of raw potential" },
  { level: 3, name: "Scholar", emoji: "📖", desc: "Knowledge beginning to crystallise" },
  { level: 6, name: "Archmage", emoji: "⚡", desc: "Power fully awakened" },
];

const ABILITIES = [
  { id: "focus", name: "Focus Strike", desc: "+5 bonus damage on streaks ≥3", unlock: "streak_3" },
  { id: "review", name: "Second Chance", desc: "Once per fight: retry a wrong answer", unlock: "mastery_50" },
  { id: "surge", name: "Knowledge Surge", desc: "+15 damage when answering hard questions", unlock: "streak_5" },
  { id: "shield", name: "Iron Memory", desc: "Reduce player damage taken by 10", unlock: "level_5" },
];

// ─── STORAGE HELPERS ───────────────────────────────────────────────────────────
const SAVE_KEY = "studybuddy_save";
const defaultSave = () => ({
  companion: { xp: 0, level: 1, abilities: [] },
  mastery: {},
  totalCorrect: 0,
  totalAnswered: 0,
});

async function loadSave() {
  try {
    const r = await window.storage.get(SAVE_KEY);
    return r ? JSON.parse(r.value) : defaultSave();
  } catch { return defaultSave(); }
}

async function writeSave(data) {
  try { await window.storage.set(SAVE_KEY, JSON.stringify(data)); } catch {}
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function getForm(level) {
  return [...COMPANION_FORMS].reverse().find(f => level >= f.level) || COMPANION_FORMS[0];
}

function getMastery(save, topicId) {
  return save.mastery[topicId] ?? 0;
}

function getMasteryClass(val) {
  if (val >= 70) return "#27ae60";
  if (val >= 40) return "#f39c12";
  return "#c0392b";
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("loading");
  const [save, setSave] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);

  useEffect(() => {
    loadSave().then(s => { setSave(s); setScreen("hub"); });
  }, []);

  const showToast = useCallback((msg, color = "#27ae60") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2000);
  }, []);

  const updateSave = useCallback(async (updater) => {
    setSave(prev => {
      const next = updater(prev);
      writeSave(next);
      return next;
    });
  }, []);

  const grantXP = useCallback((amount, topicId, correct) => {
    updateSave(prev => {
      const prevMastery = prev.mastery[topicId] ?? 0;
      const newMastery = Math.max(0, Math.min(100, prevMastery + (correct ? 10 : -20)));
      const newXP = prev.companion.xp + (correct ? amount : 0);
      const newLevel = Math.floor(newXP / 50) + 1;
      const prevLevel = prev.companion.level;
      const levelled = newLevel > prevLevel;

      // ability unlock check
      const newAbilities = [...prev.companion.abilities];
      if (correct) {
        // level 5 → iron memory
        if (newLevel >= 5 && !newAbilities.includes("shield")) newAbilities.push("shield");
        if (newLevel >= 3 && !newAbilities.includes("review")) {
          // check if mastery >= 50 on anything
          const anyMastered = Object.values({...prev.mastery, [topicId]: newMastery}).some(v => v >= 50);
          if (anyMastered) newAbilities.push("review");
        }
      }

      if (levelled) setTimeout(() => showToast(`⬆️ Level up! Now level ${newLevel}`, "#c9a84c"), 200);

      return {
        ...prev,
        mastery: { ...prev.mastery, [topicId]: newMastery },
        totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
        totalAnswered: prev.totalAnswered + 1,
        companion: { ...prev.companion, xp: newXP, level: newLevel, abilities: newAbilities },
      };
    });
  }, [updateSave, showToast]);

  if (screen === "loading" || !save) {
    return <div style={styles.loading}><div style={styles.loadingText}>Loading Study Buddy…</div></div>;
  }

  const go = (s, topic = null) => { setActiveTopic(topic); setScreen(s); };

  return (
    <div style={styles.root}>
      {toast && <div style={{ ...styles.toast, background: toast.color }}>{toast.msg}</div>}

      {screen === "hub" && <Hub save={save} go={go} />}
      {screen === "notes" && <Notes topic={activeTopic} go={go} />}
      {screen === "learn" && <LearnMode topic={activeTopic} save={save} go={go} grantXP={grantXP} showToast={showToast} />}
      {screen === "boss" && <BossFight topic={activeTopic} save={save} go={go} grantXP={grantXP} showToast={showToast} />}
      {screen === "progress" && <Progress save={save} go={go} />}
      {screen === "companion" && <CompanionView save={save} go={go} />}
      {screen === "topicselect" && <TopicSelect go={go} nextScreen={activeTopic} />}
    </div>
  );
}

// ─── HUB ──────────────────────────────────────────────────────────────────────
function Hub({ save, go }) {
  const form = getForm(save.companion.level);
  const xpInLevel = save.companion.xp % 50;
  return (
    <div style={styles.hub}>
      <div style={styles.hubHeader}>
        <div>
          <div style={styles.worldName}>{WORLD.name}</div>
          <div style={styles.worldSub}>Study Buddy</div>
        </div>
        <div style={styles.compactComp} onClick={() => go("companion")}>
          <span style={{ fontSize: 28 }}>{form.emoji}</span>
          <div>
            <div style={styles.compName}>{form.name}</div>
            <div style={styles.xpBar}><div style={{ ...styles.xpFill, width: `${(xpInLevel / 50) * 100}%` }} /></div>
            <div style={styles.xpLabel}>Lv.{save.companion.level} · {xpInLevel}/50 XP</div>
          </div>
        </div>
      </div>

      <div style={styles.topicsGrid}>
        {WORLD.topics.map(t => {
          const m = getMastery(save, t.id);
          return (
            <div key={t.id} style={{ ...styles.topicCard, borderColor: t.color }}>
              <div style={{ ...styles.topicDot, background: t.color }} />
              <div style={styles.topicCardName}>{t.name}</div>
              <div style={styles.topicMasteryBar}>
                <div style={{ ...styles.topicMasteryFill, width: `${m}%`, background: getMasteryClass(m) }} />
              </div>
              <div style={styles.topicActions}>
                <button style={{ ...styles.topicBtn, borderColor: t.color, color: t.color }} onClick={() => go("notes", t)}>Notes</button>
                <button style={{ ...styles.topicBtn, borderColor: t.color, color: t.color }} onClick={() => go("learn", t)}>Study</button>
                <button style={{ ...styles.topicBtn, borderColor: t.color, color: t.color }} onClick={() => go("boss", t)}>⚔ Fight</button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.hubFooter}>
        <button style={styles.footerBtn} onClick={() => go("progress")}>📊 Progress</button>
        <button style={styles.footerBtn} onClick={() => go("companion")}>🔮 Companion</button>
      </div>
    </div>
  );
}

// ─── NOTES ───────────────────────────────────────────────────────────────────
function Notes({ topic, go }) {
  if (!topic) return null;
  return (
    <div style={styles.screen}>
      <div style={styles.screenHeader}>
        <button style={styles.backBtn} onClick={() => go("hub")}>← Back</button>
        <div style={{ ...styles.screenTitle, color: topic.color }}>{topic.name}</div>
      </div>
      <div style={styles.notesList}>
        {topic.notes.map((n, i) => (
          <div key={i} style={styles.noteCard}>
            <div style={{ ...styles.noteHeading, borderColor: topic.color }}>{n.heading}</div>
            <div style={styles.noteBody}>
              {n.body.split("\n").map((line, j) => (
                <p key={j} style={styles.noteLine}>{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={styles.noteFooter}>
        <button style={{ ...styles.actionBtn, background: topic.color }} onClick={() => go("learn", topic)}>Start Studying →</button>
      </div>
    </div>
  );
}

// ─── LEARN MODE ──────────────────────────────────────────────────────────────
function LearnMode({ topic, save, go, grantXP, showToast }) {
  const questions = topic
    ? ALL_QUESTIONS.filter(q => q.topicId === topic.id)
    : ALL_QUESTIONS.filter(q => getMastery(save, q.topicId) < 50);

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("question"); // question | reveal
  const [input, setInput] = useState("");
  const [streak, setStreak] = useState(0);

  const q = questions[idx];
  if (!q) return (
    <div style={styles.screen}>
      <div style={styles.screenHeader}><button style={styles.backBtn} onClick={() => go("hub")}>← Back</button><div style={styles.screenTitle}>Study Complete</div></div>
      <div style={styles.doneBox}><div style={styles.doneEmoji}>✅</div><div style={styles.doneText}>All questions done!</div><button style={styles.actionBtn} onClick={() => go("hub")}>Back to Hub</button></div>
    </div>
  );

  const color = topic?.color || q.topicColor;

  const submit = () => { if (input.trim()) setPhase("reveal"); };

  const next = (correct) => {
    grantXP(10, q.topicId, correct);
    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);
    if (correct) showToast(`✓ +10 XP | Streak: ${newStreak}`, "#27ae60");
    else showToast("✗ Noted — keep going", "#c0392b");
    setInput("");
    setPhase("question");
    setIdx(i => i + 1);
  };

  return (
    <div style={styles.screen}>
      <div style={styles.screenHeader}>
        <button style={styles.backBtn} onClick={() => go("hub")}>← Back</button>
        <div style={styles.screenTitle}>{topic?.name || "Weak Concepts"}</div>
        <div style={styles.qCounter}>{idx + 1}/{questions.length}</div>
      </div>

      <div style={styles.qMeta}>
        <span style={{ ...styles.qBadge, background: color }}>{q.topic}</span>
        <span style={{ ...styles.diffBadge, color: q.difficulty === "hard" ? "#c0392b" : q.difficulty === "medium" ? "#f39c12" : "#27ae60" }}>{q.difficulty}</span>
        {streak >= 2 && <span style={styles.streakBadge}>🔥 ×{streak}</span>}
      </div>

      <div style={styles.questionCard}>
        <div style={styles.questionText}>{q.prompt}</div>
      </div>

      {phase === "question" && (
        <div style={styles.answerArea}>
          <textarea
            style={styles.textarea}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Write your answer…"
            rows={4}
            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) submit(); }}
          />
          <button style={{ ...styles.actionBtn, background: color }} onClick={submit}>Check Answer</button>
        </div>
      )}

      {phase === "reveal" && (
        <div style={styles.revealArea}>
          <div style={styles.yourAnswer}><span style={styles.label}>Your answer:</span> {input}</div>
          <div style={styles.modelAnswer}><span style={styles.label}>Model answer:</span> {q.answer}</div>
          <div style={styles.selfMark}>How did you do?</div>
          <div style={styles.markBtns}>
            <button style={{ ...styles.markBtn, background: "#27ae60" }} onClick={() => next(true)}>✓ Got it</button>
            <button style={{ ...styles.markBtn, background: "#c0392b" }} onClick={() => next(false)}>✗ Missed it</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BOSS FIGHT ──────────────────────────────────────────────────────────────
function BossFight({ topic, save, go, grantXP, showToast }) {
  const questions = topic
    ? ALL_QUESTIONS.filter(q => q.topicId === topic.id)
    : ALL_QUESTIONS;

  const shuffled = [...questions].sort(() => Math.random() - 0.5);

  const [playerHP, setPlayerHP] = useState(100);
  const [bossHP, setBossHP] = useState(100);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("question");
  const [input, setInput] = useState("");
  const [streak, setStreak] = useState(0);
  const [log, setLog] = useState([]);
  const [done, setDone] = useState(null); // "win" | "lose"

  const addLog = (msg) => setLog(l => [msg, ...l.slice(0, 4)]);

  const q = shuffled[idx % shuffled.length];
  const form = getForm(save.companion.level);
  const color = topic?.color || "#7c5cbf";

  const submit = () => { if (input.trim()) setPhase("reveal"); };

  const resolve = (correct) => {
    grantXP(10, q.topicId, correct);
    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);

    if (correct) {
      const hasAbility = save.companion.abilities.includes("focus");
      const bonus = (hasAbility && newStreak >= 3) ? 5 : 0;
      const dmg = q.difficulty === "hard" ? 20 : q.difficulty === "medium" ? 15 : 10;
      const total = dmg + bonus;
      const newBoss = Math.max(0, bossHP - total);
      setBossHP(newBoss);
      addLog(`${form.emoji} dealt ${total} damage! Boss: ${newBoss}HP`);
      showToast(`⚔ ${total} dmg | Streak: ${newStreak}`, "#c9a84c");
      if (newBoss <= 0) { setDone("win"); return; }
    } else {
      const hasShield = save.companion.abilities.includes("shield");
      const dmg = Math.max(5, 25 - (hasShield ? 10 : 0));
      const newPlayer = Math.max(0, playerHP - dmg);
      setPlayerHP(newPlayer);
      addLog(`❌ Wrong! You took ${dmg} damage. You: ${newPlayer}HP`);
      showToast(`✗ -${dmg} HP`, "#c0392b");
      if (newPlayer <= 0) { setDone("lose"); return; }
    }

    setInput("");
    setPhase("question");
    setIdx(i => i + 1);
  };

  if (done) return (
    <div style={styles.screen}>
      <div style={styles.screenHeader}><div style={styles.screenTitle}>{done === "win" ? "Victory!" : "Defeated"}</div></div>
      <div style={styles.doneBox}>
        <div style={styles.doneEmoji}>{done === "win" ? "🏆" : "💀"}</div>
        <div style={styles.doneText}>{done === "win" ? `You defeated the boss with ${playerHP}HP remaining!` : "The boss won this time. Keep studying!"}</div>
        <button style={styles.actionBtn} onClick={() => go("hub")}>Back to Hub</button>
      </div>
    </div>
  );

  return (
    <div style={styles.screen}>
      <div style={styles.screenHeader}>
        <button style={styles.backBtn} onClick={() => go("hub")}>⬅ Flee</button>
        <div style={styles.screenTitle}>⚔ Boss Fight</div>
        {topic && <span style={{ ...styles.qBadge, background: color }}>{topic.name}</span>}
      </div>

      <div style={styles.hpRow}>
        <div style={styles.hpBlock}>
          <div style={styles.hpLabel}>{form.emoji} You</div>
          <div style={styles.hpBarTrack}><div style={{ ...styles.hpBarFill, width: `${playerHP}%`, background: "#27ae60" }} /></div>
          <div style={styles.hpNum}>{playerHP}</div>
        </div>
        <div style={styles.vsLabel}>VS</div>
        <div style={styles.hpBlock}>
          <div style={styles.hpLabel}>👹 Boss</div>
          <div style={styles.hpBarTrack}><div style={{ ...styles.hpBarFill, width: `${bossHP}%`, background: "#c0392b" }} /></div>
          <div style={styles.hpNum}>{bossHP}</div>
        </div>
      </div>

      {streak >= 2 && <div style={styles.streakBanner}>🔥 Streak ×{streak}</div>}

      <div style={styles.questionCard}>
        <div style={{ ...styles.qMeta, marginBottom: 8 }}>
          <span style={{ ...styles.qBadge, background: q.topicColor }}>{q.topic}</span>
          <span style={{ ...styles.diffBadge, color: q.difficulty === "hard" ? "#c0392b" : q.difficulty === "medium" ? "#f39c12" : "#27ae60" }}>{q.difficulty}</span>
        </div>
        <div style={styles.questionText}>{q.prompt}</div>
      </div>

      {phase === "question" && (
        <div style={styles.answerArea}>
          <textarea style={styles.textarea} value={input} onChange={e => setInput(e.target.value)} placeholder="Your answer…" rows={3} onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) submit(); }} />
          <button style={{ ...styles.actionBtn, background: color }} onClick={submit}>Strike!</button>
        </div>
      )}

      {phase === "reveal" && (
        <div style={styles.revealArea}>
          <div style={styles.yourAnswer}><span style={styles.label}>Yours:</span> {input}</div>
          <div style={styles.modelAnswer}><span style={styles.label}>Answer:</span> {q.answer}</div>
          <div style={styles.markBtns}>
            <button style={{ ...styles.markBtn, background: "#27ae60" }} onClick={() => resolve(true)}>✓ Correct</button>
            <button style={{ ...styles.markBtn, background: "#c0392b" }} onClick={() => resolve(false)}>✗ Wrong</button>
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div style={styles.combatLog}>
          {log.map((l, i) => <div key={i} style={{ ...styles.logLine, opacity: 1 - i * 0.2 }}>{l}</div>)}
        </div>
      )}
    </div>
  );
}

// ─── PROGRESS ────────────────────────────────────────────────────────────────
function Progress({ save, go }) {
  const acc = save.totalAnswered > 0 ? Math.round((save.totalCorrect / save.totalAnswered) * 100) : 0;
  return (
    <div style={styles.screen}>
      <div style={styles.screenHeader}><button style={styles.backBtn} onClick={() => go("hub")}>← Back</button><div style={styles.screenTitle}>Progress</div></div>
      <div style={styles.statsRow}>
        <div style={styles.statBox}><div style={styles.statNum}>{save.totalCorrect}</div><div style={styles.statLabel}>Correct</div></div>
        <div style={styles.statBox}><div style={styles.statNum}>{save.totalAnswered}</div><div style={styles.statLabel}>Answered</div></div>
        <div style={styles.statBox}><div style={styles.statNum}>{acc}%</div><div style={styles.statLabel}>Accuracy</div></div>
      </div>
      <div style={styles.masteryList}>
        {WORLD.topics.map(t => {
          const m = getMastery(save, t.id);
          return (
            <div key={t.id} style={styles.masteryRow}>
              <div style={styles.masteryName}>{t.name}</div>
              <div style={styles.masteryTrack}><div style={{ ...styles.masteryFill, width: `${m}%`, background: getMasteryClass(m) }} /></div>
              <div style={{ ...styles.masteryPct, color: getMasteryClass(m) }}>{m}%</div>
            </div>
          );
        })}
      </div>
      <div style={{ padding: "0 20px 12px", color: "#c0392b", fontSize: 13 }}>
        ⚠ Critical (&lt;30%): {WORLD.topics.filter(t => getMastery(save, t.id) < 30).map(t => t.name).join(", ") || "None — great!"}
      </div>
    </div>
  );
}

// ─── COMPANION VIEW ───────────────────────────────────────────────────────────
function CompanionView({ save, go }) {
  const form = getForm(save.companion.level);
  const xpInLevel = save.companion.xp % 50;
  const nextForm = COMPANION_FORMS.find(f => f.level > save.companion.level);
  return (
    <div style={styles.screen}>
      <div style={styles.screenHeader}><button style={styles.backBtn} onClick={() => go("hub")}>← Back</button><div style={styles.screenTitle}>Companion</div></div>
      <div style={styles.companionPanel}>
        <div style={styles.formEmoji}>{form.emoji}</div>
        <div style={styles.formName}>{form.name}</div>
        <div style={styles.formDesc}>{form.desc}</div>
        <div style={styles.xpRowBig}>
          <div style={styles.xpBarBig}><div style={{ ...styles.xpFillBig, width: `${(xpInLevel / 50) * 100}%` }} /></div>
          <div style={styles.xpLabelBig}>Level {save.companion.level} · {xpInLevel}/50 XP</div>
        </div>
        {nextForm && <div style={styles.nextEvol}>Evolves into {nextForm.name} at level {nextForm.level}</div>}
      </div>
      <div style={styles.abilitySection}>
        <div style={styles.sectionTitle}>Abilities</div>
        {ABILITIES.map(a => {
          const owned = save.companion.abilities.includes(a.id);
          return (
            <div key={a.id} style={{ ...styles.abilityCard, opacity: owned ? 1 : 0.4 }}>
              <div style={styles.abilityName}>{owned ? "✦" : "○"} {a.name}</div>
              <div style={styles.abilityDesc}>{a.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  root: { background: "#0d0d0f", minHeight: "100vh", color: "#e8e4dc", fontFamily: "'Georgia', serif", maxWidth: 600, margin: "0 auto", position: "relative" },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0d0d0f" },
  loadingText: { color: "#c9a84c", fontSize: 18, letterSpacing: 2 },
  toast: { position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", padding: "8px 20px", borderRadius: 20, color: "#fff", fontFamily: "monospace", fontSize: 14, zIndex: 999, whiteSpace: "nowrap" },

  hub: { padding: "20px 16px 100px" },
  hubHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, borderBottom: "1px solid #2a2a30", paddingBottom: 16 },
  worldName: { fontSize: 18, fontWeight: "bold", color: "#e8e4dc", letterSpacing: 1 },
  worldSub: { fontSize: 11, color: "#888", letterSpacing: 2, marginTop: 2 },
  compactComp: { display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: "#18181f", borderRadius: 12, padding: "8px 12px" },
  compName: { fontSize: 13, color: "#c9a84c", fontWeight: "bold" },
  xpBar: { width: 80, height: 4, background: "#2a2a30", borderRadius: 2, marginTop: 4 },
  xpFill: { height: "100%", background: "#c9a84c", borderRadius: 2, transition: "width 0.4s" },
  xpLabel: { fontSize: 10, color: "#888", marginTop: 2 },

  topicsGrid: { display: "flex", flexDirection: "column", gap: 12 },
  topicCard: { background: "#18181f", borderRadius: 12, border: "1px solid", padding: "14px 16px" },
  topicDot: { width: 8, height: 8, borderRadius: "50%", display: "inline-block", marginRight: 8 },
  topicCardName: { display: "inline", fontSize: 15, fontWeight: "bold", color: "#e8e4dc" },
  topicMasteryBar: { height: 3, background: "#2a2a30", borderRadius: 2, margin: "10px 0 8px" },
  topicMasteryFill: { height: "100%", borderRadius: 2, transition: "width 0.4s" },
  topicActions: { display: "flex", gap: 8 },
  topicBtn: { flex: 1, padding: "6px 0", background: "transparent", border: "1px solid", borderRadius: 8, fontSize: 12, cursor: "pointer", transition: "all 0.15s" },

  hubFooter: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 600, display: "flex", background: "#18181f", borderTop: "1px solid #2a2a30", padding: "10px 20px" },
  footerBtn: { flex: 1, padding: "10px", background: "transparent", border: "none", color: "#aaa", cursor: "pointer", fontSize: 13 },

  screen: { display: "flex", flexDirection: "column", minHeight: "100vh", paddingBottom: 24 },
  screenHeader: { display: "flex", alignItems: "center", gap: 12, padding: "16px 16px 12px", borderBottom: "1px solid #2a2a30", flexWrap: "wrap" },
  screenTitle: { fontSize: 17, fontWeight: "bold", flex: 1 },
  backBtn: { background: "transparent", border: "1px solid #333", color: "#aaa", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13 },
  qCounter: { color: "#888", fontSize: 13 },

  notesList: { padding: "16px", display: "flex", flexDirection: "column", gap: 16 },
  noteCard: { background: "#18181f", borderRadius: 12, overflow: "hidden" },
  noteHeading: { padding: "10px 16px", borderLeft: "3px solid", fontSize: 14, fontWeight: "bold", color: "#e8e4dc", background: "#1e1e26" },
  noteBody: { padding: "12px 16px" },
  noteLine: { margin: "4px 0", fontSize: 13.5, color: "#c8c4bc", lineHeight: 1.6 },
  noteFooter: { padding: "16px", borderTop: "1px solid #2a2a30", marginTop: "auto" },

  qMeta: { display: "flex", alignItems: "center", gap: 8, padding: "0 16px 8px" },
  qBadge: { fontSize: 11, padding: "2px 8px", borderRadius: 10, color: "#fff", fontFamily: "monospace" },
  diffBadge: { fontSize: 11, fontFamily: "monospace", fontWeight: "bold" },
  streakBadge: { fontSize: 13, marginLeft: "auto" },
  streakBanner: { textAlign: "center", fontSize: 18, padding: "4px 0 8px", color: "#c9a84c" },

  questionCard: { margin: "8px 16px 16px", background: "#18181f", borderRadius: 12, padding: "20px" },
  questionText: { fontSize: 15, lineHeight: 1.7, color: "#e8e4dc" },

  answerArea: { padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 },
  textarea: { width: "100%", background: "#18181f", border: "1px solid #2a2a30", borderRadius: 10, color: "#e8e4dc", padding: "12px", fontSize: 14, fontFamily: "Georgia, serif", resize: "vertical", outline: "none", boxSizing: "border-box" },
  actionBtn: { padding: "12px", borderRadius: 10, border: "none", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: "bold", transition: "opacity 0.2s" },

  revealArea: { padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 },
  yourAnswer: { background: "#18181f", borderRadius: 10, padding: "12px", fontSize: 13, color: "#aaa" },
  modelAnswer: { background: "#1a2820", borderRadius: 10, padding: "12px", fontSize: 13, color: "#c8e6c9", border: "1px solid #27ae60" },
  label: { fontWeight: "bold", color: "#888", marginRight: 6 },
  selfMark: { fontSize: 13, color: "#888", textAlign: "center" },
  markBtns: { display: "flex", gap: 10 },
  markBtn: { flex: 1, padding: "12px", borderRadius: 10, border: "none", color: "#fff", fontSize: 14, cursor: "pointer", fontWeight: "bold" },

  doneBox: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  doneEmoji: { fontSize: 64 },
  doneText: { fontSize: 16, textAlign: "center", color: "#c8c4bc", maxWidth: 280 },

  hpRow: { display: "flex", alignItems: "center", gap: 12, padding: "12px 16px 8px" },
  hpBlock: { flex: 1 },
  hpLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  hpBarTrack: { height: 10, background: "#2a2a30", borderRadius: 5, overflow: "hidden" },
  hpBarFill: { height: "100%", borderRadius: 5, transition: "width 0.4s" },
  hpNum: { fontSize: 12, color: "#888", marginTop: 2 },
  vsLabel: { color: "#c9a84c", fontSize: 14, fontWeight: "bold", flexShrink: 0 },

  combatLog: { margin: "12px 16px 0", background: "#18181f", borderRadius: 10, padding: "10px 14px" },
  logLine: { fontSize: 12, color: "#aaa", padding: "3px 0", fontFamily: "monospace" },

  statsRow: { display: "flex", gap: 12, padding: "20px 16px 12px" },
  statBox: { flex: 1, background: "#18181f", borderRadius: 12, padding: "16px", textAlign: "center" },
  statNum: { fontSize: 28, fontWeight: "bold", color: "#c9a84c" },
  statLabel: { fontSize: 11, color: "#888", marginTop: 4, letterSpacing: 1 },
  masteryList: { padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 },
  masteryRow: { display: "flex", alignItems: "center", gap: 10 },
  masteryName: { fontSize: 13, color: "#c8c4bc", width: 140, flexShrink: 0 },
  masteryTrack: { flex: 1, height: 6, background: "#2a2a30", borderRadius: 3 },
  masteryFill: { height: "100%", borderRadius: 3, transition: "width 0.4s" },
  masteryPct: { fontSize: 12, fontWeight: "bold", width: 36, textAlign: "right" },

  companionPanel: { padding: "32px 16px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, borderBottom: "1px solid #2a2a30" },
  formEmoji: { fontSize: 72 },
  formName: { fontSize: 24, fontWeight: "bold", color: "#c9a84c" },
  formDesc: { fontSize: 13, color: "#888", textAlign: "center" },
  xpRowBig: { width: "100%", maxWidth: 280 },
  xpBarBig: { height: 8, background: "#2a2a30", borderRadius: 4 },
  xpFillBig: { height: "100%", background: "#c9a84c", borderRadius: 4, transition: "width 0.4s" },
  xpLabelBig: { fontSize: 12, color: "#888", textAlign: "center", marginTop: 4 },
  nextEvol: { fontSize: 12, color: "#7c5cbf" },

  abilitySection: { padding: "16px" },
  sectionTitle: { fontSize: 13, color: "#888", letterSpacing: 2, marginBottom: 12 },
  abilityCard: { background: "#18181f", borderRadius: 10, padding: "12px 14px", marginBottom: 10 },
  abilityName: { fontSize: 14, fontWeight: "bold", color: "#c9a84c", marginBottom: 4 },
  abilityDesc: { fontSize: 12, color: "#888" },
};
