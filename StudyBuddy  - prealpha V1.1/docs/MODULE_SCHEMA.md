# Module Schema

> **Pointer file.** The canonical `MODULE_SCHEMA.md` currently lives at the project root: `../MODULE_SCHEMA.md`. After `migrate.bat` runs, this file will become the canonical copy and the root copy will be deleted.

The module schema describes the JSON shape StudyBuddy expects for a module. Use it when authoring a module by hand, generating one with another AI, or writing a script that produces them.

For now, read `../MODULE_SCHEMA.md`.

## Quick reference

A module file (`src/modules_all.json`) looks like:

```json
{
  "modules": [
    {
      "id": "DEMO101",
      "name": "Demo Module",
      "examTemplate": { "durationMin": 60, "totalMarks": 50, "composition": [...] },
      "levels": [{
        "id": "l1", "name": "Topic Name",
        "concepts": [{
          "id": "c1", "name": "Concept Name",
          "definition": "...", "notes": "...",
          "questions": [{
            "id": "q1", "type": "mcq", "marks": 2,
            "prompt": "?", "answer": "...",
            "choices": [...], "explanation": "...", "keywords": [...]
          }]
        }]
      }]
    }
  ]
}
```

11 question types: `mcq`, `tf`, `define`, `explain`, `short_essay`, `long_essay`, `code_output`, `code_write`, `code_bug`, `code_fill`, `code_trace`.

After editing, re-build:

```
cd src
python build_html.py
```

Or just double-click `build.bat` from the project root.
