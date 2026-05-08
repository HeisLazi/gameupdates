# StudyBuddy Module JSON Schema

This document describes the JSON shape StudyBuddy expects for a module. Use it
when authoring a module by hand, generating one with another AI, or writing a
script that produces them. The build script (`build_html.py`) auto-fills any
missing optional fields, so you only **must** provide the items marked
**REQUIRED**.

The full module set lives in `modules_all.json` at the project root and looks
like this:

```json
{
  "modules": [ /* one Module object per subject */ ]
}
```

---

## Module

```json
{
  "id": "ARI711S",                    // REQUIRED. Stable string. Used as a key everywhere.
  "name": "Artificial Intelligence",  // REQUIRED. Human-readable. Shown in UI.
  "description": "Optional one-line summary",
  "examTemplate": {                   // Optional. Auto-generated if missing.
    "durationMin": 90,
    "totalMarks": 50,
    "composition": [
      { "type": "mcq",         "count": 6, "marks": 2 },
      { "type": "tf",          "count": 4, "marks": 1 },
      { "type": "define",      "count": 4, "marks": 2 },
      { "type": "explain",     "count": 3, "marks": 4 },
      { "type": "short_essay", "count": 2, "marks": 6 }
    ]
  },
  "levels": [ /* REQUIRED. One Level per topic. At least one. */ ]
}
```

### Rules
- `id` must be unique across all modules. Recommended: course code (e.g. `CTE711S`).
- `examTemplate.composition[i].type` must be one of the question types listed
  below. The exam picker draws `count` questions of that type.
- The build script auto-fills `examTemplate` if absent.

---

## Level

```json
{
  "id": "l1",                                 // REQUIRED. Unique within the module.
  "name": "Search Algorithms",                // REQUIRED. Topic title.
  "summary": "One-line topic summary",        // Optional. Auto-built from concepts if missing.
  "notes": "Markdown-lite topic overview",    // Optional. Auto-built from concept names if missing.
  "concepts": [ /* REQUIRED. One Concept per teachable unit. */ ]
}
```

### Rules
- `id` must be unique within the module's `levels` array.
- `notes` accepts markdown-lite (see "Notes formatting" below).
- The Arena uses the level structure for **Elite** fights — one Elite per level.

---

## Concept

```json
{
  "id": "c1",                                 // REQUIRED. Unique within the module.
  "name": "Breadth-First Search",             // REQUIRED. Concept title.
  "summary": "Quick recall summary",          // Optional. Auto-built from definition if missing.
  "notes": "Full markdown-lite concept notes",// Optional but strongly recommended.
  "definition": "One-sentence definition",    // Optional. Used in summary fallback.
  "analogy": "An everyday analogy",           // Optional.
  "breakdown": [ "point 1", "point 2" ],      // Optional. Bullet points shown in concept teach.
  "questions": [ /* REQUIRED. At least one Question. */ ]
}
```

### Rules
- `id` must be unique across the entire module (used as a key in spaced-rep tracking).
- A concept reaches **mastery** when at least one of its `questions` reaches a
  spaced-rep interval ≥ 7 days. Mastery gates Arena Elite fights.

---

## Question

The `type` field determines which other fields are read.

### Common fields (all types)

```json
{
  "id": "q1",                       // REQUIRED. Unique within the module.
  "type": "mcq",                    // REQUIRED. See list below.
  "marks": 2,                       // REQUIRED for exam mode. Defaults to 1 if missing.
  "difficulty": "easy",             // Optional: "easy" | "medium" | "hard".
  "prompt": "What is BFS?",         // REQUIRED. Question text.
  "answer": ...,                    // REQUIRED. Type depends on question type (see below).
  "explanation": "...",             // Optional. Shown after the question is answered.
  "keywords": ["bfs","queue"],      // Optional. Used for keyword-coverage grading
                                    // on free-text answers, and for hint generation.
  "note": "Focused study note ..."  // Optional. Auto-built from explanation+answer if missing.
                                    // Shown BEFORE the question in study mode (read-then-recall).
}
```

### Question types

| `type`        | `answer` shape | Purpose |
|---------------|----------------|---------|
| `mcq`         | string (must equal one of `choices`) | Multiple choice. Add `"choices": ["a","b","c"]`. |
| `tf`          | boolean (`true` / `false`) | True / false. |
| `define`      | string | Short free-text definition. Graded by exact match OR keyword coverage. |
| `explain`     | string | Longer free-text explanation. Graded by keyword coverage. |
| `short_essay` | string | 1–2 paragraph free-text. Graded by keyword coverage. |
| `long_essay`  | string | Multi-paragraph free-text. Graded by keyword coverage. |
| `code_output` | string | "What does this print?" Add `"code": "print(2**4)"`. Graded by exact match against `answer`. |
| `code_write`  | string | "Write a function that..." Add `"language"`, `"starter"`, optionally `"expectedOutput"`. |
| `code_bug`    | string | "What's wrong?" Add `"code": "..."`. Graded by keyword coverage. |
| `code_fill`   | string | "Fill the blanks" — use `___` in `code`. `answer` is the comma-separated fills. |
| `code_trace`  | string | "Walk through this code." Show `code`, accept free-text trace. |

### Code-question extras

```json
{
  "language": "python",          // for syntax label only — runner uses Pyodide for python, eval for JS
  "starter": "def f(): pass",    // pre-filled editor body
  "code": "print(2**4)",         // shown as a code block above the answer
  "expectedOutput": "16"         // for code_write — graded by output match
}
```

---

## Notes formatting (markdown-lite)

The renderer supports a small subset:

- `**bold**`
- `` `inline code` ``
- Triple-backtick code blocks (no language specifier needed)
- `- item` for bullet lists (any line starting with `- `)
- Blank line = paragraph break
- Single newline within a paragraph = soft line break

Anything else renders as plain text. Don't use full markdown features (tables,
images, links) — they won't render.

---

## Validation rules to satisfy

To avoid breaking the app, every Module must satisfy:

1. `id` is a non-empty string and unique across the file.
2. `levels` is a non-empty array.
3. Every Level's `id` is unique within its module.
4. Every Concept's `id` is unique within its module.
5. Every Question's `id` is unique within its module.
6. Every Question has `type`, `prompt`, and `answer`.
7. `mcq` questions have a `choices` array containing the `answer`.
8. `tf` questions have `answer` of type boolean.
9. `code_output` and `code_fill` questions have a `code` string.
10. `keywords` (if present) is an array of non-empty strings.

If any of these fail, the app will still load but that question/level/concept
may render incorrectly or be silently skipped.

---

## Minimal viable module example

Smallest module that loads cleanly, useful as a starter template:

```json
{
  "id": "DEMO101",
  "name": "Demo Module",
  "levels": [
    {
      "id": "l1",
      "name": "Intro Topic",
      "concepts": [
        {
          "id": "c1",
          "name": "Hello Concept",
          "definition": "The first concept of any course is hello.",
          "notes": "**Hello** is the canonical greeting. Use it freely.",
          "questions": [
            {
              "id": "q1",
              "type": "mcq",
              "marks": 1,
              "prompt": "Which is a greeting?",
              "choices": ["Hello", "Goodbye"],
              "answer": "Hello",
              "explanation": "Hello is a greeting; goodbye is a farewell.",
              "keywords": ["hello","greeting"]
            },
            {
              "id": "q2",
              "type": "tf",
              "marks": 1,
              "prompt": "Hello is a farewell.",
              "answer": false,
              "explanation": "It's a greeting, not a farewell."
            }
          ]
        }
      ]
    }
  ]
}
```

Add this object inside the `"modules": [ ... ]` array of `modules_all.json`,
re-run `python3 build_html.py`, and the new module appears in the topbar
dropdown.

---

## Tips when generating modules with another AI

Give the generating AI:

1. This schema document (paste it as context).
2. The course's syllabus / topic list.
3. A small example module from the existing `modules_all.json` for tone.
4. Strict instructions: **return only valid JSON**, no surrounding markdown
   fences, no commentary, and validate IDs are unique.

Common breakage to watch for:
- Smart quotes (`"` instead of `"`) — replace before saving.
- Trailing commas — JSON disallows them.
- `answer` for `tf` typed as the string `"true"` instead of the boolean `true`.
- `mcq` `answer` not exactly matching one of `choices` (extra spaces, casing).

Run `python3 -c "import json,sys; json.load(open('modules_all.json'))"` to
sanity-check before building.
