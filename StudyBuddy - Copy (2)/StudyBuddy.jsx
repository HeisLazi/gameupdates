import { useState, useEffect, useCallback } from "react";

// ─── NOTES DATA (from ARI711S lectures) ──────────────────────────────────────
const NOTES_DATA = [
  {
    id: "agents", title: "Agents & Architecture", tag: "Lecture 1",
    sections: [
      { heading: "What is an Agent?", points: [
        "Perceives environment via sensors, acts via actuators",
        "Agent function: maps percept sequences → actions (abstract spec)",
        "Agent program: implements the agent function on physical hardware",
        "Autonomous agents act without human intervention"
      ]},
      { heading: "Types of Agents", points: [
        "Simple Reflex — acts on current percept only, no memory. E.g. thermostat",
        "Model-Based — maintains internal world state. E.g. chess program tracking board",
        "Goal-Based — considers future states to reach goal. E.g. Google Maps",
        "Utility-Based — maximises a utility score. E.g. self-driving car (weighs safety + speed)",
        "Learning Agent — improves behaviour over time. E.g. spam filter"
      ]},
      { heading: "Exam: SRA vs MBA Trade-offs", points: [
        "Efficiency: SRA faster (no computation overhead); MBA slower but smarter decisions",
        "Adaptability: SRA can't adapt without reprogramming; MBA adapts via world model",
        "Robustness: SRA fails in noisy environments; MBA handles noise using context + history"
      ]}
    ]
  },
  {
    id: "search_foundations", title: "Search Problem Foundations", tag: "Lecture 2",
    sections: [
      { heading: "Search Problem Components", points: [
        "State space — all possible configurations of the world",
        "Successor function — given state S, returns reachable states + action costs",
        "Start state — where the agent begins",
        "Goal test — function that returns true if state = goal",
        "Solution — sequence of actions transforming start state → goal state"
      ]},
      { heading: "State Space vs Search Tree", points: [
        "State space graph: each state appears ONCE — a mathematical model",
        "Search tree: 'what if' tree of plans — a state can appear multiple times",
        "We build both ON DEMAND — as little as possible",
        "Each node in search tree = an entire PATH in the state space graph"
      ]},
      { heading: "Planning vs Identification Problems", points: [
        "Planning: the PATH matters — costs vary, heuristics guide, dynamic environment",
        "Identification: the GOAL STATE matters — not how you got there, static environment",
        "Planning example: robot navigating a maze",
        "Identification example: medical diagnosis from symptoms"
      ]},
      { heading: "Algorithm Properties (EXAM)", points: [
        "Completeness — guaranteed to find a solution IF one exists",
        "Optimality — finds the LOWEST COST solution",
        "Time Complexity — number of nodes expanded",
        "Space Complexity — nodes held in memory at once"
      ]}
    ]
  },
  {
    id: "uninformed", title: "Uninformed Search", tag: "Lecture 2–3",
    sections: [
      { heading: "Breadth-First Search (BFS)", points: [
        "Data structure: Queue (FIFO)",
        "Explores level by level — shallow nodes first",
        "Complete: YES | Optimal: YES (when step costs are equal)",
        "Time: O(b^d) | Space: O(b^d) — stores all frontier nodes",
        "Weakness: very high memory usage"
      ]},
      { heading: "Depth-First Search (DFS)", points: [
        "Data structure: Stack (LIFO)",
        "Dives deep before backtracking",
        "Complete: NO (can loop infinitely) | Optimal: NO",
        "Time: O(b^m) | Space: O(bm) — only current path stored",
        "Strength: very memory efficient"
      ]},
      { heading: "Uniform Cost Search (UCS)", points: [
        "Priority queue ordered by g(n) — actual path cost so far",
        "Always expands the CHEAPEST node next",
        "Complete: YES | Optimal: YES",
        "When costs are equal → behaves like BFS",
        "Explores rings of increasing cost, not depth"
      ]},
      { heading: "Iterative Deepening (IDS)", points: [
        "Runs DFS with increasing depth limit: 0, 1, 2, 3...",
        "Combines BFS completeness + DFS memory efficiency",
        "Optimal for unit costs"
      ]}
    ]
  },
  {
    id: "informed", title: "Informed Search & A*", tag: "Lecture 4",
    sections: [
      { heading: "Heuristics", points: [
        "h(n) = estimated cost from state n to goal",
        "Admissible: h(n) ≤ actual cost — NEVER overestimates",
        "Consistent: h(n) ≤ arc_cost(n→n') + h(n') for every arc",
        "Consistent → admissible (but not vice versa)",
        "Example: straight-line distance is admissible for road navigation"
      ]},
      { heading: "Greedy Best-First Search", points: [
        "Priority queue ordered by h(n) ONLY",
        "Always goes to the node that looks closest to goal",
        "Complete: NO | Optimal: NO",
        "Fast in practice, but can be misled by bad heuristics"
      ]},
      { heading: "A* Search (EXAM CRITICAL)", points: [
        "f(n) = g(n) + h(n) — actual cost + heuristic estimate",
        "Complete: YES | Optimal: YES (if heuristic is admissible/consistent)",
        "Terminates when goal is EXPANDED, not when first discovered",
        "Tree search: needs admissible heuristic",
        "Graph search (strict expanded list): needs CONSISTENT heuristic",
        "Inconsistent heuristic → A* graph search can miss optimal path"
      ]},
      { heading: "Admissibility Check", points: [
        "For each state: is h(n) ≤ true cost to goal? → Admissible",
        "For each arc: h(n) ≤ arc_cost(n→n') + h(n') → Consistent",
        "If NOT consistent: A* with expanded list may fail",
        "Fix: adjust h values so arc condition holds"
      ]}
    ]
  },
  {
    id: "csps", title: "Constraint Satisfaction Problems", tag: "Lecture 5–6",
    sections: [
      { heading: "CSP Fundamentals", points: [
        "Variables — things that need values assigned",
        "Domains — valid values for each variable",
        "Constraints — rules restricting valid combinations",
        "Solution — complete assignment violating NO constraints",
        "Constraint graph: nodes = variables, edges = constraints between pairs"
      ]},
      { heading: "Backtracking Search", points: [
        "Assign one variable at a time, in order",
        "Check constraint consistency after each assignment",
        "Backtrack when no valid value remains for any variable",
        "More efficient than generating all combinations then checking"
      ]},
      { heading: "Filtering Techniques (EXAM)", points: [
        "Forward Checking: after assigning var, remove inconsistent values from neighbours",
        "Trigger immediate backtrack if any domain becomes empty",
        "Arc Consistency (AC-3): ensure every value in domain has valid counterpart in all connected vars",
        "Arc consistency is STRONGER than forward checking",
        "Constraint Propagation: propagate arc consistency throughout the whole CSP"
      ]},
      { heading: "Ordering Heuristics", points: [
        "MRV (Minimum Remaining Values): pick var with fewest valid values first",
        "Least Constraining Value: pick value that eliminates fewest options for neighbours",
        "These reduce backtracking significantly"
      ]},
      { heading: "Tree-Structured CSPs", points: [
        "If constraint graph is a tree → solve in O(nd²) without backtracking",
        "Cutset Conditioning: remove a set of vars to make remaining graph a tree",
        "K-consistency: strong enough consistency for tree-structured CSPs"
      ]}
    ]
  },
  {
    id: "adversarial", title: "Adversarial Search", tag: "Lecture 7",
    sections: [
      { heading: "Game Types", points: [
        "Zero-sum: one player's gain = other's loss",
        "Deterministic: no randomness (chess, tic-tac-toe)",
        "Perfect information: full state visible to both players"
      ]},
      { heading: "Minimax Algorithm", points: [
        "MAX player: picks action maximising utility",
        "MIN player: picks action minimising utility (opponent)",
        "Back up terminal values through tree — alternate MAX/MIN layers",
        "Complete: YES | Optimal: YES (vs perfect opponent)",
        "Time: O(b^m) — impractical for large games"
      ]},
      { heading: "Alpha-Beta Pruning (EXAM)", points: [
        "α = best value MAX can guarantee so far",
        "β = best value MIN can guarantee so far",
        "Prune when α ≥ β — current branch can't change the result",
        "Does NOT change final minimax value — just skips irrelevant branches",
        "Best case: O(b^(m/2)) — effectively doubles search depth",
        "Most effective when best moves explored first"
      ]},
      { heading: "Evaluation Functions & Depth Limits", points: [
        "Can't search to terminal state in real games — use depth limit",
        "Evaluation function estimates utility at cutoff state",
        "Linear combo of features: e.g. material count in chess",
        "Horizon effect: can miss important moves just past depth limit"
      ]}
    ]
  },
  {
    id: "mdps", title: "Markov Decision Processes", tag: "Supp Test",
    sections: [
      { heading: "MDP Components (EXAM)", points: [
        "State (S) — complete description of agent's current situation",
        "Action (A) — decision the agent can make",
        "Transition T(s,a,s') — probability of reaching s' from s via action a",
        "Reward R(s,a,s') — numerical feedback for taking action a in state s",
        "Policy π — mapping from states to actions (what to do everywhere)",
        "Discount factor γ — how much to value future rewards (0 ≤ γ ≤ 1)"
      ]},
      { heading: "Value Iteration", points: [
        "Initialise all state values: V⁰(s) = 0",
        "Bellman equation: V*(s) = max_a Σ T(s,a,s') [R(s,a,s') + γV*(s')]",
        "Repeat until values converge (Δ < ε)",
        "Optimal policy: at each state, pick action achieving V*(s)"
      ]},
      { heading: "Exam Values (Test Graph, γ=0.9)", points: [
        "J¹(S1) = 2",
        "J²(S1) = 7.4",
        "Always start with V⁰ = 0 for all states",
        "Take max over actions, weight each outcome by transition probability"
      ]}
    ]
  },
  {
    id: "ml", title: "Machine Learning Basics", tag: "Supp Test",
    sections: [
      { heading: "Three Paradigms (EXAM)", points: [
        "Supervised: labelled data → prediction (classification/regression)",
        "Unsupervised: unlabelled data → pattern discovery (clustering)",
        "Reinforcement: reward/penalty signals → optimal policy via trial & error"
      ]},
      { heading: "Examples", points: [
        "Supervised: spam filter (labelled emails), image classification",
        "Unsupervised: k-means clustering, PCA, anomaly detection",
        "Reinforcement: AlphaGo, robot locomotion, game-playing AI"
      ]},
      { heading: "Key Distinctions", points: [
        "Supervision: supervised uses labels; RL uses reward signals; unsupervised uses neither",
        "Learning goal: supervised=predict, unsupervised=understand, RL=decide optimally",
        "Environment: supervised=static dataset; RL=dynamic environment"
      ]}
    ]
  }
];

// ─── WORLD DATA (questions) ──────────────────────────────────────────────────
const WORLD = {
  id: "ari711s", name: "ARI711S: Artificial Intelligence",
  levels: [
    {
      id: "agents", name: "Agents",
      concepts: [
        { id: "agent_types", name: "Types of Agents",
          definition: "Agents are classified by how much world knowledge they use to select actions.",
          analogy: "From a light switch (reflex) to a chess grandmaster planning 10 moves ahead (utility).",
          breakdown: ["Simple Reflex — acts on current percept, no memory","Model-Based — maintains internal world state","Goal-Based — considers future states","Utility-Based — maximises a numerical score","Learning Agent — improves over time"],
          questions: [
            { type:"recall", difficulty:"easy", prompt:"Which agent type uses only the current percept and predefined rules?", answer:"Simple reflex agent" },
            { type:"understanding", difficulty:"medium", prompt:"Why does a model-based agent outperform a simple reflex agent in partial environments?", answer:"It keeps an internal model so it can reason about parts of the environment it cannot currently perceive" },
            { type:"comparison", difficulty:"hard", prompt:"Compare SRA vs MBA on efficiency, adaptability, and robustness.", answer:"Efficiency: SRA faster; MBA slower but smarter. Adaptability: SRA needs reprogramming; MBA uses world model. Robustness: SRA fails in noise; MBA handles it." }
          ]
        }
      ]
    },
    {
      id: "search_foundations", name: "Search Foundations",
      concepts: [
        { id: "search_problem", name: "Search Problem",
          definition: "A problem defined by a state space, successor function, start state, goal test, and solution.",
          analogy: "GPS navigation — map is the state space, destination is the goal, route is the solution.",
          breakdown: ["State space — all possible configurations","Successor function — transitions + costs","Start state — where agent begins","Goal test — checks if goal is reached","Solution — sequence of actions start→goal"],
          questions: [
            { type:"recall", difficulty:"easy", prompt:"List the four key components of a search problem.", answer:"State space, successor function, start state, goal test" },
            { type:"recall", difficulty:"easy", prompt:"What is a solution in a search problem?", answer:"A sequence of actions that transforms the start state into a goal state" },
            { type:"comparison", difficulty:"medium", prompt:"Difference between a world state and a search state?", answer:"World state has every detail; search state keeps only what's needed for planning (abstraction)" }
          ]
        },
        { id: "algo_properties", name: "Algorithm Properties",
          definition: "Four properties to evaluate any search algorithm: completeness, optimality, time complexity, space complexity.",
          analogy: "Judging a detective: will they always solve the case? The right culprit? How fast? How many notes?",
          breakdown: ["Completeness — finds solution if one exists","Optimality — finds lowest cost solution","Time Complexity — nodes expanded","Space Complexity — nodes in memory at once"],
          questions: [
            { type:"recall", difficulty:"easy", prompt:"What does 'complete' mean for a search algorithm?", answer:"It will always find a solution if one exists" },
            { type:"recall", difficulty:"easy", prompt:"What does 'optimal' mean for a search algorithm?", answer:"It finds the solution with the lowest path cost" },
            { type:"understanding", difficulty:"medium", prompt:"Can an algorithm be complete but not optimal?", answer:"Yes — BFS is complete but only optimal when all step costs are equal" }
          ]
        }
      ]
    },
    {
      id: "uninformed", name: "Uninformed Search",
      concepts: [
        { id: "bfs", name: "Breadth-First Search",
          definition: "Explores nodes level by level using a FIFO queue.",
          analogy: "Checking every room on Floor 1 before going to Floor 2.",
          breakdown: ["Queue (FIFO)","Level by level","Complete: YES, Optimal: YES (equal costs)","Time/Space: O(b^d)","High memory usage"],
          questions: [
            { type:"recall", difficulty:"easy", prompt:"What data structure does BFS use?", answer:"Queue (FIFO)" },
            { type:"understanding", difficulty:"medium", prompt:"Why is BFS only optimal when step costs are equal?", answer:"It finds the shallowest solution, which is cheapest only when all steps cost the same" },
            { type:"comparison", difficulty:"medium", prompt:"BFS vs DFS memory usage?", answer:"BFS uses far more memory — stores all nodes at each level; DFS only stores the current path" }
          ]
        },
        { id: "dfs", name: "Depth-First Search",
          definition: "Explores as far as possible along each branch before backtracking, using a LIFO stack.",
          analogy: "Following one hallway to its dead end before trying the next.",
          breakdown: ["Stack (LIFO)","Deep first, backtrack later","Complete: NO, Optimal: NO","Space: O(bm) — memory efficient","Can loop infinitely"],
          questions: [
            { type:"recall", difficulty:"easy", prompt:"What data structure does DFS use?", answer:"Stack (LIFO)" },
            { type:"understanding", difficulty:"medium", prompt:"Why is DFS not optimal?", answer:"It may find a deep expensive solution before discovering a shorter one" },
            { type:"comparison", difficulty:"medium", prompt:"DFS vs BFS on completeness?", answer:"BFS is complete. DFS is NOT complete in infinite state spaces." }
          ]
        },
        { id: "ucs", name: "Uniform Cost Search",
          definition: "Expands the node with lowest cumulative path cost g(n), using a priority queue.",
          analogy: "Always picking the cheapest flight leg when planning a multi-stop trip.",
          breakdown: ["Priority queue ordered by g(n)","Expands cheapest node first","Complete: YES, Optimal: YES","When costs equal → same as BFS"],
          questions: [
            { type:"recall", difficulty:"easy", prompt:"What value does UCS use to order its priority queue?", answer:"g(n) — the actual cumulative path cost from start to n" },
            { type:"understanding", difficulty:"medium", prompt:"When does UCS behave exactly like BFS?", answer:"When all step costs are equal" }
          ]
        }
      ]
    },
    {
      id: "informed", name: "Informed Search & A*",
      concepts: [
        { id: "heuristics", name: "Heuristics",
          definition: "h(n) estimates the cost from state n to the goal, guiding informed search.",
          analogy: "Estimating remaining drive time using straight-line distance — actual road might be longer.",
          breakdown: ["h(n) = estimated cost to goal","Admissible: h(n) ≤ actual cost (never overestimates)","Consistent: h(n) ≤ arc_cost(n→n') + h(n')","Consistent → admissible (not vice versa)"],
          questions: [
            { type:"recall", difficulty:"easy", prompt:"What is an admissible heuristic?", answer:"One that never overestimates — h(n) ≤ actual cost to goal" },
            { type:"understanding", difficulty:"hard", prompt:"Why does A* graph search need consistency, not just admissibility?", answer:"Graph search closes nodes early. Consistency ensures once expanded, the path is already optimal." },
            { type:"application", difficulty:"hard", prompt:"h(A)=5, h(C)=1, arc A→C costs 3. Is this consistent?", answer:"Check: h(A) ≤ arc + h(C) → 5 ≤ 3+1=4. FALSE — not consistent." }
          ]
        },
        { id: "astar", name: "A* Search",
          definition: "Expands node with lowest f(n) = g(n) + h(n), combining actual cost and estimate.",
          analogy: "GPS considering both how far you've driven AND how far you still need to go.",
          breakdown: ["f(n) = g(n) + h(n)","Priority queue ordered by f(n)","Complete: YES, Optimal: YES","Terminates when goal is EXPANDED not discovered","Needs admissible (tree) or consistent (graph) heuristic"],
          questions: [
            { type:"recall", difficulty:"easy", prompt:"What is the f(n) formula for A*?", answer:"f(n) = g(n) + h(n) — actual cost so far + heuristic estimate" },
            { type:"understanding", difficulty:"medium", prompt:"When does A* terminate?", answer:"When the goal node is expanded (popped from queue), not when first added to frontier" },
            { type:"application", difficulty:"hard", prompt:"A→C costs 3, h(C)=1. A→B costs 1, h(B)=4. What is expanded first after A?", answer:"C — f(C)=3+1=4. f(B)=1+4=5. C has lower f(n)." }
          ]
        }
      ]
    },
    {
      id: "csps", name: "CSPs",
      concepts: [
        { id: "csp_basics", name: "CSP Fundamentals",
          definition: "Problem defined by variables, domains, and constraints. Goal: assign all variables without constraint violation.",
          analogy: "Scheduling a timetable — teachers are variables, time slots are domains, 'no double-booking' is a constraint.",
          breakdown: ["Variables — things needing values","Domains — valid values per variable","Constraints — rules on combinations","Solution — complete assignment, no violations","Constraint graph: nodes=vars, edges=shared constraints"],
          questions: [
            { type:"recall", difficulty:"easy", prompt:"What are the three key components of a CSP?", answer:"Variables, Domains, Constraints" },
            { type:"understanding", difficulty:"medium", prompt:"What does a constraint graph represent?", answer:"Nodes are variables; edges connect pairs of variables sharing a constraint" }
          ]
        },
        { id: "filtering", name: "Filtering Techniques",
          definition: "Methods that prune domains during search to detect failures early.",
          analogy: "Before placing a chess piece, check if it causes immediate problems — don't wait until checkmate.",
          breakdown: ["Forward Checking: after assignment, prune neighbours' domains","Backtrack immediately if any domain becomes empty","Arc Consistency: every value has valid counterpart in all neighbours","AC is stronger than forward checking","Constraint Propagation: propagate consistency throughout CSP"],
          questions: [
            { type:"recall", difficulty:"easy", prompt:"What does forward checking do after a variable is assigned?", answer:"Removes inconsistent values from neighbouring variables' domains" },
            { type:"understanding", difficulty:"medium", prompt:"What triggers immediate backtracking in forward checking?", answer:"When any unassigned variable's domain becomes empty" },
            { type:"comparison", difficulty:"hard", prompt:"How is arc consistency stronger than forward checking?", answer:"FC only checks neighbours of the most recent assignment; AC ensures all variable pairs are mutually consistent" }
          ]
        }
      ]
    },
    {
      id: "adversarial", name: "Adversarial Search",
      concepts: [
        { id: "minimax", name: "Minimax",
          definition: "Finds optimal move in two-player zero-sum game assuming opponent plays perfectly.",
          analogy: "You maximise your score; opponent minimises it. Both play perfectly.",
          breakdown: ["MAX layer: pick highest value","MIN layer: pick lowest value","Back up terminal values through tree","Complete: YES, Optimal: YES vs perfect opponent","Time: O(b^m) — impractical for chess"],
          questions: [
            { type:"recall", difficulty:"easy", prompt:"What does the MAX player do in minimax?", answer:"Picks the action that maximises the utility value" },
            { type:"application", difficulty:"hard", prompt:"Leaves: [3,5,2] and [9,1,7]. Two MIN children under one MAX root. What is the minimax value?", answer:"Left MIN=min(3,5,2)=2. Right MIN=min(9,1,7)=1. Root MAX=max(2,1)=2." }
          ]
        },
        { id: "alpha_beta", name: "Alpha-Beta Pruning",
          definition: "Optimises minimax by skipping branches that cannot affect the final result.",
          analogy: "Don't check every option if you already know a better one exists — cut dead branches.",
          breakdown: ["α = best MAX can guarantee","β = best MIN can guarantee","Prune when α ≥ β","Does NOT change minimax result","Best case: O(b^(m/2))"],
          questions: [
            { type:"recall", difficulty:"easy", prompt:"What does alpha represent in alpha-beta pruning?", answer:"The best value MAX can guarantee from the current position or above" },
            { type:"understanding", difficulty:"medium", prompt:"Does alpha-beta pruning change the final minimax result?", answer:"No — it always produces the same result as minimax, just more efficiently" }
          ]
        }
      ]
    },
    {
      id: "mdps", name: "MDPs",
      concepts: [
        { id: "mdp_components", name: "MDP Components",
          definition: "Framework for decision-making in stochastic environments.",
          analogy: "A robot that chooses actions but can slip — outcomes are probabilistic.",
          breakdown: ["State S — complete situation description","Action A — decision agent can make","Transition T(s,a,s') — probability of reaching s'","Reward R(s,a,s') — numerical feedback","Policy π — state-to-action mapping","Discount γ — how much to value future rewards"],
          questions: [
            { type:"recall", difficulty:"easy", prompt:"What are the five core components of an MDP?", answer:"State, Action, Transition function, Reward function, Policy" },
            { type:"understanding", difficulty:"medium", prompt:"What does the discount factor γ control?", answer:"How much the agent values future rewards vs immediate rewards. γ≈0 is myopic, γ≈1 is far-sighted" },
            { type:"understanding", difficulty:"medium", prompt:"What is a policy in an MDP?", answer:"A mapping from every state to an action — what to do in any situation" }
          ]
        }
      ]
    }
  ]
};

// ─── COMPANION CONFIG ────────────────────────────────────────────────────────
const FORMS = [
  { name:"Seedling", emoji:"🌱", minLevel:1 },
  { name:"Scholar", emoji:"📚", minLevel:3 },
  { name:"Sage",    emoji:"🔮", minLevel:6 }
];
const ABILITIES = [
  { id:"focus",    name:"Focus Strike",   desc:"Extra damage on streak ×3",  req:{streak:3}  },
  { id:"recall",   name:"Total Recall",   desc:"See hint on first wrong answer", req:{streak:5}  },
  { id:"insight",  name:"Deep Insight",   desc:"Double XP on hard questions", req:{mastery:50} }
];

function getForm(level) {
  for (let i = FORMS.length-1; i >= 0; i--)
    if (level >= FORMS[i].minLevel) return FORMS[i];
  return FORMS[0];
}

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────
async function saveProgress(state) {
  try { await window.storage.set("sb_progress", JSON.stringify(state)); } catch {}
}
async function loadProgress() {
  try {
    const r = await window.storage.get("sb_progress");
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Space+Mono:wght@400;700&display=swap');
  :root {
    --bg: #080a0f; --surface: #0f1117; --card: #141720;
    --border: #1e2333; --border2: #252a3a;
    --gold: #e8a020; --gold2: #f5c050; --gold-dim: rgba(232,160,32,0.15);
    --blue: #4a90d9; --blue-dim: rgba(74,144,217,0.15);
    --red: #d94a4a; --red-dim: rgba(217,74,74,0.2);
    --green: #4ad97a; --green-dim: rgba(74,217,122,0.15);
    --text: #d4cfc8; --text2: #8a8680; --text3: #5a5650;
    --font-head: 'Crimson Pro', Georgia, serif;
    --font-mono: 'Space Mono', monospace;
  }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:var(--bg); color:var(--text); font-family:var(--font-mono); font-size:13px; }
  .sb { min-height:100vh; display:flex; flex-direction:column; }
  button { cursor:pointer; border:none; background:none; font-family:inherit; }

  /* NAV */
  .nav { display:flex; align-items:center; gap:12px; padding:12px 20px;
    border-bottom:1px solid var(--border); background:var(--surface); }
  .nav-title { font-family:var(--font-head); font-size:18px; color:var(--gold); flex:1; letter-spacing:.5px; }
  .nav-btn { padding:5px 12px; border:1px solid var(--border2); border-radius:4px;
    color:var(--text2); font-size:11px; transition:all .15s; }
  .nav-btn:hover { border-color:var(--gold); color:var(--gold); }
  .nav-btn.active { border-color:var(--gold); color:var(--gold); background:var(--gold-dim); }

  /* HOME */
  .home { flex:1; display:grid; place-items:center; padding:40px 20px; }
  .home-inner { max-width:480px; width:100%; }
  .home-hero { text-align:center; margin-bottom:40px; }
  .home-title { font-family:var(--font-head); font-size:42px; color:var(--gold); line-height:1.1; }
  .home-sub { color:var(--text2); margin-top:8px; font-size:12px; letter-spacing:1px; text-transform:uppercase; }
  .companion-preview { font-size:64px; margin:24px 0 8px; filter:drop-shadow(0 0 20px var(--gold)); animation:float 3s ease-in-out infinite; }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  .xp-bar-wrap { margin:0 auto 8px; max-width:200px; }
  .xp-bar-bg { height:4px; background:var(--border2); border-radius:2px; }
  .xp-bar-fill { height:4px; background:var(--gold); border-radius:2px; transition:width .4s; }
  .companion-stats { color:var(--text2); font-size:11px; text-align:center; }

  .menu-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .menu-btn { padding:16px; border:1px solid var(--border2); border-radius:8px;
    background:var(--card); color:var(--text); text-align:left; transition:all .15s; }
  .menu-btn:hover { border-color:var(--gold); transform:translateY(-2px); box-shadow:0 4px 20px rgba(232,160,32,.15); }
  .menu-btn .mb-icon { font-size:24px; margin-bottom:8px; display:block; }
  .menu-btn .mb-title { font-family:var(--font-head); font-size:16px; color:var(--gold2); }
  .menu-btn .mb-desc { font-size:10px; color:var(--text3); margin-top:3px; }

  /* NOTES */
  .notes-wrap { flex:1; display:grid; grid-template-columns:220px 1fr; height:calc(100vh - 49px); }
  .notes-sidebar { border-right:1px solid var(--border); overflow-y:auto; background:var(--surface); padding:12px 0; }
  .notes-nav-item { display:block; width:100%; text-align:left; padding:10px 16px;
    border-left:2px solid transparent; color:var(--text2); font-size:11px; transition:all .12s; }
  .notes-nav-item:hover { color:var(--text); background:var(--card); }
  .notes-nav-item.active { color:var(--gold); border-left-color:var(--gold); background:var(--gold-dim); }
  .notes-tag { font-size:9px; color:var(--text3); margin-top:2px; }
  .notes-content { overflow-y:auto; padding:32px 40px; }
  .notes-chapter { font-family:var(--font-head); font-size:28px; color:var(--gold); margin-bottom:4px; }
  .notes-chapter-tag { font-size:11px; color:var(--text3); margin-bottom:32px; }
  .notes-section { margin-bottom:28px; }
  .notes-section-head { font-family:var(--font-head); font-size:17px; color:var(--gold2);
    padding-bottom:6px; border-bottom:1px solid var(--border); margin-bottom:12px; }
  .notes-point { display:flex; gap:10px; margin-bottom:7px; color:var(--text); font-size:12px; line-height:1.6; }
  .notes-point::before { content:"▸"; color:var(--gold); flex-shrink:0; margin-top:1px; }

  /* LEARN */
  .learn-wrap { flex:1; display:flex; flex-direction:column; align-items:center; padding:32px 20px; }
  .learn-progress { font-size:11px; color:var(--text3); margin-bottom:24px; }
  .concept-card { background:var(--card); border:1px solid var(--border2); border-radius:12px;
    padding:28px; max-width:600px; width:100%; }
  .concept-name { font-family:var(--font-head); font-size:24px; color:var(--gold); margin-bottom:4px; }
  .concept-def { color:var(--text); font-size:13px; margin-bottom:14px; line-height:1.6; }
  .concept-analogy { background:var(--blue-dim); border:1px solid var(--blue); border-radius:6px;
    padding:10px 14px; font-size:12px; color:var(--text2); margin-bottom:16px; font-style:italic; }
  .concept-analogy strong { color:var(--blue); font-style:normal; }
  .breakdown-list { list-style:none; }
  .breakdown-list li { display:flex; gap:10px; margin-bottom:6px; font-size:12px; color:var(--text2); }
  .breakdown-list li::before { content:"◆"; color:var(--gold); font-size:8px; margin-top:4px; flex-shrink:0; }

  .q-card { background:var(--card); border:1px solid var(--border2); border-radius:12px;
    padding:24px; max-width:600px; width:100%; margin-top:20px; }
  .q-type { font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; }
  .q-prompt { font-family:var(--font-head); font-size:18px; color:var(--text); margin-bottom:18px; line-height:1.4; }
  .q-input { width:100%; background:var(--bg); border:1px solid var(--border2); border-radius:6px;
    padding:10px 14px; color:var(--text); font-family:var(--font-mono); font-size:12px;
    resize:vertical; min-height:80px; outline:none; }
  .q-input:focus { border-color:var(--gold); }
  .btn { padding:10px 20px; border-radius:6px; font-family:var(--font-mono); font-size:12px;
    font-weight:700; transition:all .15s; }
  .btn-gold { background:var(--gold); color:var(--bg); }
  .btn-gold:hover { background:var(--gold2); transform:translateY(-1px); }
  .btn-ghost { border:1px solid var(--border2); color:var(--text2); }
  .btn-ghost:hover { border-color:var(--gold); color:var(--gold); }
  .btn-row { display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; }

  .feedback { border-radius:8px; padding:14px; margin-top:14px; font-size:12px; }
  .feedback.correct { background:var(--green-dim); border:1px solid var(--green); color:var(--green); }
  .feedback.wrong { background:var(--red-dim); border:1px solid var(--red); color:var(--red); }
  .feedback .ans { color:var(--text); margin-top:6px; font-size:12px; line-height:1.5; }

  .reward-pop { font-size:12px; color:var(--gold); margin-top:10px; }

  /* BOSS */
  .boss-wrap { flex:1; display:flex; flex-direction:column; align-items:center; padding:24px 20px; }
  .boss-arena { max-width:620px; width:100%; }
  .hp-row { display:flex; align-items:center; gap:12px; margin-bottom:8px; }
  .hp-label { font-size:11px; color:var(--text2); width:80px; }
  .hp-bar-bg { flex:1; height:10px; background:var(--border2); border-radius:5px; overflow:hidden; }
  .hp-bar-fill { height:100%; border-radius:5px; transition:width .4s; }
  .hp-player { background: linear-gradient(90deg, var(--blue), #6ab0f5); }
  .hp-boss { background: linear-gradient(90deg, var(--red), #f57a7a); }
  .hp-val { font-size:11px; color:var(--text2); width:40px; text-align:right; }

  .boss-display { text-align:center; padding:20px 0; }
  .boss-emoji { font-size:72px; filter:drop-shadow(0 0 30px var(--red));
    animation:shake-idle 4s ease-in-out infinite; }
  @keyframes shake-idle { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-6px) rotate(2deg)} }
  .boss-name { font-family:var(--font-head); font-size:22px; color:var(--red); margin-top:8px; }

  .companion-display { text-align:center; padding:12px 0; }
  .companion-emoji { font-size:52px; filter:drop-shadow(0 0 20px var(--blue)); }
  .companion-name { font-size:11px; color:var(--blue); margin-top:4px; }

  .streak-bar { display:flex; gap:6px; justify-content:center; margin:10px 0; }
  .streak-pip { width:8px; height:8px; border-radius:50%; background:var(--border2); transition:background .2s; }
  .streak-pip.active { background:var(--gold); box-shadow:0 0 8px var(--gold); }

  .combat-log { background:var(--card); border:1px solid var(--border); border-radius:8px;
    padding:10px 14px; font-size:11px; color:var(--text2); margin:10px 0; min-height:36px; }

  .boss-hp-shake { animation:boss-hit .3s ease; }
  .player-hit { animation:player-hit .3s ease; }
  @keyframes boss-hit { 0%,100%{transform:translateX(0)} 25%{transform:translateX(10px)} 75%{transform:translateX(-10px)} }
  @keyframes player-hit { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }

  .victory { text-align:center; padding:40px; }
  .victory h2 { font-family:var(--font-head); font-size:36px; color:var(--gold); }
  .defeat { text-align:center; padding:40px; }
  .defeat h2 { font-family:var(--font-head); font-size:36px; color:var(--red); }

  /* PROGRESS */
  .progress-wrap { flex:1; padding:32px 40px; max-width:700px; margin:0 auto; width:100%; }
  .progress-title { font-family:var(--font-head); font-size:28px; color:var(--gold); margin-bottom:24px; }
  .mastery-level { margin-bottom:24px; }
  .mastery-level-name { font-family:var(--font-head); font-size:18px; color:var(--text); margin-bottom:10px; }
  .mastery-concept { display:flex; align-items:center; gap:12px; margin-bottom:8px; }
  .mastery-concept-name { font-size:11px; color:var(--text2); width:160px; flex-shrink:0; }
  .mastery-bg { flex:1; height:6px; background:var(--border2); border-radius:3px; overflow:hidden; }
  .mastery-fill { height:100%; border-radius:3px; transition:width .4s; }
  .mastery-val { font-size:10px; color:var(--text3); width:32px; text-align:right; }
  .mastery-critical { color:var(--red) !important; }

  /* COMPANION */
  .comp-wrap { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 20px; }
  .comp-card { background:var(--card); border:1px solid var(--border2); border-radius:16px;
    padding:40px; max-width:420px; width:100%; text-align:center; }
  .comp-form-emoji { font-size:80px; filter:drop-shadow(0 0 30px var(--gold)); margin-bottom:16px; }
  .comp-form-name { font-family:var(--font-head); font-size:24px; color:var(--gold); }
  .comp-level { font-size:12px; color:var(--text2); margin:4px 0 20px; }
  .ability-list { margin-top:24px; text-align:left; }
  .ability-item { display:flex; gap:12px; align-items:flex-start; margin-bottom:12px;
    background:var(--bg); border:1px solid var(--border); border-radius:8px; padding:10px 14px; }
  .ability-icon { font-size:20px; }
  .ability-name { font-size:12px; color:var(--gold2); }
  .ability-desc { font-size:11px; color:var(--text2); margin-top:2px; }
  .ability-locked { opacity:.35; }

  .divider { border:none; border-top:1px solid var(--border); margin:20px 0; }
  .section-label { font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:12px; }
`;

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function StudyBuddy() {
  const [screen, setScreen] = useState("home");
  const [companion, setCompanion] = useState({ level:1, xp:0, abilities:[] });
  const [mastery, setMastery] = useState({});
  const [streak, setStreak] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Load progress on mount
  useEffect(() => {
    loadProgress().then(data => {
      if (data) {
        if (data.companion) setCompanion(data.companion);
        if (data.mastery) setMastery(data.mastery);
      }
      setLoaded(true);
    });
  }, []);

  // Auto-save
  useEffect(() => {
    if (loaded) saveProgress({ companion, mastery });
  }, [companion, mastery, loaded]);

  const awardXP = useCallback((amount, isCorrect) => {
    setStreak(s => isCorrect ? s+1 : 0);
    setCompanion(c => {
      const newXP = c.xp + (isCorrect ? amount : 0);
      const newLevel = Math.floor(newXP / 50) + 1;
      const unlockedAbilities = ABILITIES
        .filter(a => {
          if (a.req.streak && streak >= a.req.streak) return true;
          if (a.req.mastery) {
            const vals = Object.values(mastery);
            return vals.length > 0 && vals.every(v => v >= a.req.mastery);
          }
          return false;
        })
        .map(a => a.id);
      const mergedAbilities = [...new Set([...c.abilities, ...unlockedAbilities])];
      return { ...c, xp: newXP, level: newLevel, abilities: mergedAbilities };
    });
  }, [streak, mastery]);

  const updateMastery = useCallback((conceptId, correct) => {
    setMastery(m => ({
      ...m,
      [conceptId]: Math.max(0, Math.min(100, (m[conceptId] || 0) + (correct ? 10 : -20)))
    }));
  }, []);

  const form = getForm(companion.level);
  const xpInLevel = companion.xp % 50;
  const xpPercent = (xpInLevel / 50) * 100;

  if (!loaded) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"var(--gold)",fontFamily:"'Space Mono',monospace"}}>Loading...</div>;

  return (
    <>
      <style>{css}</style>
      <div className="sb">
        {screen !== "home" && (
          <nav className="nav">
            <span className="nav-title">Study Buddy</span>
            <span style={{marginRight:4, fontSize:16}}>{form.emoji}</span>
            <span style={{fontSize:11,color:"var(--text2)",marginRight:12}}>Lv.{companion.level}</span>
            {["notes","learn","boss","progress","companion"].map(s => (
              <button key={s} className={`nav-btn ${screen===s?"active":""}`} onClick={()=>setScreen(s)}>
                {s==="notes"?"Notes":s==="learn"?"Learn":s==="boss"?"Boss":s==="progress"?"Progress":"Companion"}
              </button>
            ))}
            <button className="nav-btn" onClick={()=>setScreen("home")}>← Menu</button>
          </nav>
        )}

        {screen === "home" && <HomeScreen form={form} companion={companion} xpPercent={xpPercent} setScreen={setScreen} />}
        {screen === "notes" && <NotesScreen />}
        {screen === "learn" && <LearnScreen awardXP={awardXP} updateMastery={updateMastery} streak={streak} companion={companion} />}
        {screen === "boss" && <BossScreen awardXP={awardXP} updateMastery={updateMastery} streak={streak} companion={companion} setScreen={setScreen} />}
        {screen === "progress" && <ProgressScreen mastery={mastery} />}
        {screen === "companion" && <CompanionScreen companion={companion} form={form} xpPercent={xpPercent} streak={streak} />}
      </div>
    </>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────
function HomeScreen({ form, companion, xpPercent, setScreen }) {
  return (
    <div className="home">
      <div className="home-inner">
        <div className="home-hero">
          <div className="home-title">Study Buddy</div>
          <div className="home-sub">ARI711S — Artificial Intelligence</div>
          <div className="companion-preview">{form.emoji}</div>
          <div className="xp-bar-wrap">
            <div className="xp-bar-bg"><div className="xp-bar-fill" style={{width:`${xpPercent}%`}} /></div>
          </div>
          <div className="companion-stats">{form.name} · Lv.{companion.level} · {companion.xp % 50}/50 XP</div>
        </div>
        <div className="menu-grid">
          {[
            { id:"notes",     icon:"📖", title:"Notes",     desc:"Read lecture notes" },
            { id:"learn",     icon:"🧠", title:"Learn",     desc:"Study concepts + Q&A" },
            { id:"boss",      icon:"⚔️",  title:"Boss Fight", desc:"Combat exam mode" },
            { id:"progress",  icon:"📊", title:"Progress",  desc:"Mastery tracker" },
            { id:"companion", icon:"🌟", title:"Companion", desc:"Stats + abilities" },
          ].map(m => (
            <button key={m.id} className="menu-btn" onClick={()=>setScreen(m.id)}>
              <span className="mb-icon">{m.icon}</span>
              <div className="mb-title">{m.title}</div>
              <div className="mb-desc">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── NOTES ───────────────────────────────────────────────────────────────────
function NotesScreen() {
  const [active, setActive] = useState(NOTES_DATA[0].id);
  const chapter = NOTES_DATA.find(n => n.id === active);
  return (
    <div className="notes-wrap">
      <aside className="notes-sidebar">
        {NOTES_DATA.map(n => (
          <button key={n.id} className={`notes-nav-item ${active===n.id?"active":""}`} onClick={()=>setActive(n.id)}>
            <div>{n.title}</div>
            <div className="notes-tag">{n.tag}</div>
          </button>
        ))}
      </aside>
      <main className="notes-content">
        <h1 className="notes-chapter">{chapter.title}</h1>
        <div className="notes-chapter-tag">{chapter.tag}</div>
        {chapter.sections.map((s,i) => (
          <div key={i} className="notes-section">
            <div className="notes-section-head">{s.heading}</div>
            {s.points.map((p,j) => (
              <div key={j} className="notes-point"><span>{p}</span></div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}

// ─── LEARN ───────────────────────────────────────────────────────────────────
function LearnScreen({ awardXP, updateMastery, streak, companion }) {
  const allConcepts = WORLD.levels.flatMap(l => l.concepts.map(c => ({...c, levelName: l.name})));
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState("read"); // read | quiz
  const [qIdx, setQIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // null | {correct, answer}
  const [rewardText, setRewardText] = useState("");
  const [done, setDone] = useState(false);

  const concept = allConcepts[idx];
  const questions = concept?.questions || [];
  const q = questions[qIdx];

  if (done) return (
    <div className="learn-wrap">
      <div className="concept-card" style={{textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>✨</div>
        <div className="concept-name">Session Complete!</div>
        <div style={{color:"var(--text2)",marginTop:8,fontSize:13}}>All concepts reviewed.</div>
        <div className="btn-row" style={{justifyContent:"center",marginTop:20}}>
          <button className="btn btn-gold" onClick={()=>{setIdx(0);setPhase("read");setQIdx(0);setFeedback(null);setDone(false);}}>
            Restart
          </button>
        </div>
      </div>
    </div>
  );

  const submit = () => {
    if (!answer.trim()) return;
    const correct = answer.trim().length > 3;
    setFeedback({ correct, answer: q.answer });
    awardXP(correct ? 10 : 0, correct);
    updateMastery(concept.id, correct);
    setRewardText(correct ? `+10 XP | Streak: ${streak+1}` : `−20 Mastery | Streak reset`);
  };

  const next = () => {
    setFeedback(null); setAnswer("");
    if (qIdx + 1 < questions.length) {
      setQIdx(q => q+1);
    } else {
      if (idx + 1 < allConcepts.length) {
        setIdx(i => i+1); setPhase("read"); setQIdx(0);
      } else { setDone(true); }
    }
  };

  const skip = () => {
    setFeedback(null); setAnswer("");
    if (idx + 1 < allConcepts.length) {
      setIdx(i=>i+1); setPhase("read"); setQIdx(0);
    } else { setDone(true); }
  };

  return (
    <div className="learn-wrap">
      <div className="learn-progress">
        Concept {idx+1} / {allConcepts.length} — {concept.levelName}
      </div>

      {phase === "read" && (
        <div className="concept-card">
          <div className="concept-name">{concept.name}</div>
          <div className="concept-def">{concept.definition}</div>
          {concept.analogy && (
            <div className="concept-analogy">
              <strong>Analogy:</strong> {concept.analogy}
            </div>
          )}
          {concept.breakdown?.length > 0 && (
            <>
              <div className="section-label" style={{marginTop:16}}>Key Points</div>
              <ul className="breakdown-list">
                {concept.breakdown.map((b,i) => <li key={i}>{b}</li>)}
              </ul>
            </>
          )}
          <div className="btn-row" style={{marginTop:24}}>
            {questions.length > 0
              ? <button className="btn btn-gold" onClick={()=>setPhase("quiz")}>Practice Questions →</button>
              : <button className="btn btn-gold" onClick={skip}>Next Concept →</button>
            }
            <button className="btn btn-ghost" onClick={skip}>Skip</button>
          </div>
        </div>
      )}

      {phase === "quiz" && q && (
        <div className="q-card">
          <div className="q-type">{q.type} · {q.difficulty}</div>
          <div className="q-prompt">{q.prompt}</div>
          {!feedback ? (
            <>
              <textarea className="q-input" value={answer} onChange={e=>setAnswer(e.target.value)}
                placeholder="Type your answer..." onKeyDown={e=>e.key==="Enter"&&e.ctrlKey&&submit()} />
              <div className="btn-row">
                <button className="btn btn-gold" onClick={submit}>Submit</button>
                <button className="btn btn-ghost" onClick={()=>{setFeedback({correct:false,answer:q.answer});setRewardText("Skipped")}}>Reveal</button>
              </div>
            </>
          ) : (
            <>
              <div className={`feedback ${feedback.correct?"correct":"wrong"}`}>
                {feedback.correct ? "✓ Correct!" : "✗ Not quite"}
                <div className="ans"><strong>Answer:</strong> {feedback.answer}</div>
              </div>
              {rewardText && <div className="reward-pop">⚡ {rewardText}</div>}
              <div className="btn-row">
                <button className="btn btn-gold" onClick={next}>
                  {qIdx+1 < questions.length ? "Next Question →" : "Next Concept →"}
                </button>
              </div>
            </>
          )}
          <div style={{marginTop:16,fontSize:10,color:"var(--text3)"}}>
            Question {qIdx+1} / {questions.length}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BOSS FIGHT ──────────────────────────────────────────────────────────────
function BossScreen({ awardXP, updateMastery, streak, companion, setScreen }) {
  const allQs = WORLD.levels.flatMap(l =>
    l.concepts.flatMap(c => c.questions.map(q => ({...q, conceptId:c.id, conceptName:c.name})))
  ).sort(() => Math.random() - 0.5);

  const [playerHP, setPlayerHP] = useState(100);
  const [bossHP, setBossHP] = useState(100);
  const [qIdx, setQIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [log, setLog] = useState("The Examiner awaits. Answer to fight!");
  const [bossShake, setBossShake] = useState(false);
  const [playerShake, setPlayerShake] = useState(false);
  const [localStreak, setLocalStreak] = useState(0);

  const q = allQs[qIdx % allQs.length];
  const form = getForm(companion.level);
  const hasFocus = companion.abilities?.includes("focus");

  const gameOver = playerHP <= 0 || bossHP <= 0;

  const submit = () => {
    if (!answer.trim() || feedback) return;
    const correct = answer.trim().length > 3;
    const newStreak = correct ? localStreak + 1 : 0;
    setLocalStreak(newStreak);

    let dmg = correct ? (10 + (newStreak >= 3 && hasFocus ? 5 : 0) + Math.floor(Math.random()*6)) : 0;
    let taken = correct ? 0 : 15 + Math.floor(Math.random()*10);

    if (correct) {
      setBossHP(h => Math.max(0, h - dmg));
      setBossShake(true); setTimeout(()=>setBossShake(false), 350);
      setLog(`⚔️ ${form.name} strikes for ${dmg} damage! ${newStreak>=3?"🔥 Combo!":""}`);
    } else {
      setPlayerHP(h => Math.max(0, h - taken));
      setPlayerShake(true); setTimeout(()=>setPlayerShake(false), 350);
      setLog(`💥 Wrong! The Examiner deals ${taken} damage.`);
    }

    setFeedback({ correct, answer: q.answer });
    awardXP(correct ? 10 : 0, correct);
    updateMastery(q.conceptId, correct);
  };

  const nextQ = () => {
    setFeedback(null); setAnswer("");
    setQIdx(i => i+1);
  };

  if (playerHP <= 0) return (
    <div className="boss-wrap">
      <div className="defeat">
        <div style={{fontSize:64}}>💀</div>
        <h2>Defeated</h2>
        <p style={{color:"var(--text2)",marginTop:12}}>The Examiner was too strong this time.</p>
        <div className="btn-row" style={{justifyContent:"center",marginTop:24}}>
          <button className="btn btn-gold" onClick={()=>setScreen("learn")}>Study First</button>
          <button className="btn btn-ghost" onClick={()=>setScreen("home")}>← Menu</button>
        </div>
      </div>
    </div>
  );

  if (bossHP <= 0) return (
    <div className="boss-wrap">
      <div className="victory">
        <div style={{fontSize:64}}>🏆</div>
        <h2>Victory!</h2>
        <p style={{color:"var(--text2)",marginTop:12}}>The Examiner has been defeated. +50 XP</p>
        <div className="btn-row" style={{justifyContent:"center",marginTop:24}}>
          <button className="btn btn-gold" onClick={()=>setScreen("home")}>← Menu</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="boss-wrap">
      <div className="boss-arena">
        {/* HP Bars */}
        <div className="hp-row">
          <span className="hp-label">You</span>
          <div className="hp-bar-bg"><div className="hp-bar-fill hp-player" style={{width:`${playerHP}%`}}/></div>
          <span className="hp-val">{playerHP}</span>
        </div>
        <div className="hp-row">
          <span className="hp-label">Examiner</span>
          <div className="hp-bar-bg"><div className="hp-bar-fill hp-boss" style={{width:`${bossHP}%`}}/></div>
          <span className="hp-val">{bossHP}</span>
        </div>

        {/* Arena */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0"}}>
          <div className={`companion-display ${playerShake?"player-hit":""}`}>
            <div className="companion-emoji">{form.emoji}</div>
            <div className="companion-name">{form.name}</div>
          </div>
          <div className="streak-bar">
            {[...Array(5)].map((_,i)=>(
              <div key={i} className={`streak-pip ${i < localStreak ? "active" : ""}`}/>
            ))}
          </div>
          <div className={`boss-display ${bossShake?"boss-hp-shake":""}`}>
            <div className="boss-emoji">🧙</div>
            <div className="boss-name">The Examiner</div>
          </div>
        </div>

        {/* Log */}
        <div className="combat-log">{log}</div>

        {/* Question */}
        <div className="q-card">
          <div className="q-type">{q.type} · {q.conceptName}</div>
          <div className="q-prompt">{q.prompt}</div>

          {!feedback ? (
            <>
              <textarea className="q-input" value={answer} onChange={e=>setAnswer(e.target.value)}
                placeholder='Type your answer... (or "menu" to exit)'
                onKeyDown={e=>{
                  if (e.key==="Enter"&&e.ctrlKey) submit();
                  if (e.target.value.trim()==="menu"||e.target.value.trim()==="exit") setScreen("home");
                }} />
              <div className="btn-row">
                <button className="btn btn-gold" onClick={submit}>Attack!</button>
                <button className="btn btn-ghost" onClick={()=>setScreen("home")}>Retreat</button>
              </div>
            </>
          ) : (
            <>
              <div className={`feedback ${feedback.correct?"correct":"wrong"}`}>
                {feedback.correct ? "✓ Correct!" : "✗ Wrong"}
                <div className="ans"><strong>Answer:</strong> {feedback.answer}</div>
              </div>
              <div className="btn-row">
                <button className="btn btn-gold" onClick={nextQ}>Next →</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PROGRESS ────────────────────────────────────────────────────────────────
function ProgressScreen({ mastery }) {
  return (
    <div className="progress-wrap">
      <div className="progress-title">Progress</div>
      {WORLD.levels.map(level => (
        <div key={level.id} className="mastery-level">
          <div className="mastery-level-name">{level.name}</div>
          {level.concepts.map(concept => {
            const val = mastery[concept.id] || 0;
            const color = val < 30 ? "var(--red)" : val < 60 ? "var(--gold)" : "var(--green)";
            return (
              <div key={concept.id} className="mastery-concept">
                <span className={`mastery-concept-name ${val<30?"mastery-critical":""}`}>{concept.name}</span>
                <div className="mastery-bg"><div className="mastery-fill" style={{width:`${val}%`,background:color}}/></div>
                <span className="mastery-val">{val}%</span>
              </div>
            );
          })}
        </div>
      ))}
      <div style={{marginTop:20,fontSize:11,color:"var(--text3)"}}>
        🔴 Critical (&lt;30) · 🟡 Needs Work (&lt;60) · 🟢 Strong (60+)
      </div>
    </div>
  );
}

// ─── COMPANION ────────────────────────────────────────────────────────────────
function CompanionScreen({ companion, form, xpPercent, streak }) {
  return (
    <div className="comp-wrap">
      <div className="comp-card">
        <div className="comp-form-emoji">{form.emoji}</div>
        <div className="comp-form-name">{form.name}</div>
        <div className="comp-level">Level {companion.level} · {companion.xp % 50}/50 XP to next level</div>
        <div className="xp-bar-bg"><div className="xp-bar-fill" style={{width:`${xpPercent}%`,height:"6px",borderRadius:"3px",background:"var(--gold)"}}/></div>

        <hr className="divider" />

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,fontSize:12}}>
          <div style={{background:"var(--bg)",padding:"10px 14px",borderRadius:8}}>
            <div style={{color:"var(--text3)",fontSize:10,marginBottom:4}}>TOTAL XP</div>
            <div style={{color:"var(--gold)",fontWeight:"bold"}}>{companion.xp}</div>
          </div>
          <div style={{background:"var(--bg)",padding:"10px 14px",borderRadius:8}}>
            <div style={{color:"var(--text3)",fontSize:10,marginBottom:4}}>STREAK</div>
            <div style={{color:"var(--gold)",fontWeight:"bold"}}>{streak} 🔥</div>
          </div>
        </div>

        <hr className="divider" />

        <div className="section-label">Abilities</div>
        <div className="ability-list">
          {ABILITIES.map(a => {
            const unlocked = companion.abilities?.includes(a.id);
            return (
              <div key={a.id} className={`ability-item ${unlocked?"":"ability-locked"}`}>
                <span className="ability-icon">{a.id==="focus"?"⚡":a.id==="recall"?"💡":"🔮"}</span>
                <div>
                  <div className="ability-name">{a.name} {!unlocked && "🔒"}</div>
                  <div className="ability-desc">{a.desc}</div>
                  {!unlocked && <div style={{fontSize:10,color:"var(--text3)",marginTop:2}}>
                    Requires: {a.req.streak ? `streak ×${a.req.streak}` : `all mastery ≥${a.req.mastery}`}
                  </div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
