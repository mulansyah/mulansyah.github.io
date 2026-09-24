# DOCS01 MAP

## PURPOSE

This file is the entry point for AI.

Before executing any task related to DOCS01, the AI MUST read and understand every document listed in this map.

Do not execute the workflow after reading only a subset of the documentation.

---

# DOCUMENTATION BASE URL

https://raw.githubusercontent.com/mulansyah/mulansyah.github.io/refs/heads/main/docs01/

---

# REQUIRED DOCUMENTS

The AI MUST read all documents below.

## 01 — ROLE

URL:

https://raw.githubusercontent.com/mulansyah/mulansyah.github.io/refs/heads/main/docs01/role.md

Purpose:

Defines the AI identity, responsibilities, source authority, evidence model, and source/generated state boundary.

---

## 02 — TASK

URL:

https://raw.githubusercontent.com/mulansyah/mulansyah.github.io/refs/heads/main/docs01/task.md

Purpose:

Defines the primary task and workflow from YouTube source analysis through image generation, video generation, and repeated extension.

---

## 03 — CONSTRAINT

URL:

https://raw.githubusercontent.com/mulansyah/mulansyah.github.io/refs/heads/main/docs01/constraint.md

Purpose:

Defines global rules for source fidelity, evidence, uncertainty, temporal behavior, visual/audio/text handling, variables, generation boundaries, and continuity.

---

## 04 — ANALYSIS

URL:

https://raw.githubusercontent.com/mulansyah/mulansyah.github.io/refs/heads/main/docs01/analysis.md

Purpose:

Defines the source-analysis contract and the structure and rules of the SOURCE STATE.

---

## 05 — PROMPT IMAGE

URL:

https://raw.githubusercontent.com/mulansyah/mulansyah.github.io/refs/heads/main/docs01/prompt_image.md

Purpose:

Defines the IMAGE generation prompt contract derived from the SOURCE STATE.

---

## 06 — PROMPT IMAGE TO VIDEO

URL:

https://raw.githubusercontent.com/mulansyah/mulansyah.github.io/refs/heads/main/docs01/prompt_image_to_video.md

Purpose:

Defines the IMAGE → VIDEO prompt contract and temporal transformation from the existing image.

---

## 07 — PROMPT VIDEO TO EXTEND

URL:

https://raw.githubusercontent.com/mulansyah/mulansyah.github.io/refs/heads/main/docs01/prompt_video_to_extend.md

Purpose:

Defines the VIDEO → EXTEND prompt contract and causal continuity from the latest generated final state.

---

## 08 — FINAL STATE

URL:

https://raw.githubusercontent.com/mulansyah/mulansyah.github.io/refs/heads/main/docs01/final_state.md

Purpose:

Defines the generated video's FINAL STATE and establishes the latest generated endpoint as the continuity authority for the next extension.

---

## 09 — QUALITY CONTROL

URL:

https://raw.githubusercontent.com/mulansyah/mulansyah.github.io/refs/heads/main/docs01/quality_control.md

Purpose:

Defines validation rules, QC statuses, quality gates, evidence checks, continuity checks, and hallucination/unsupported-content checks.

---

# REQUIRED READING PROTOCOL

The AI MUST:

1. Read `map.md` first.
2. Read every document listed under REQUIRED DOCUMENTS.
3. Read the documents in the numbered order.
4. Read the complete content of each document.
5. Build a unified understanding of the complete DOCS01 specification.
6. Respect the source-of-truth and authority boundaries defined by the documentation.
7. Complete the required reading before executing any generation or analysis task.

The AI MUST NOT:

- read only the document that appears relevant;
- skip `constraint.md`;
- skip `analysis.md`;
- skip any generation contract;
- skip `final_state.md`;
- skip `quality_control.md`;
- invent missing rules;
- treat `map.md` as a replacement for the individual contracts;
- execute the workflow before completing the required documentation reading.

---

# READING ORDER

```text
map.md
   ↓
01 role.md
   ↓
02 task.md
   ↓
03 constraint.md
   ↓
04 analysis.md
   ↓
05 prompt_image.md
   ↓
06 prompt_image_to_video.md
   ↓
07 prompt_video_to_extend.md
   ↓
08 final_state.md
   ↓
09 quality_control.md
```

---

# EXECUTION ORDER

After the complete documentation has been read:

```text
YouTube Shorts URL
        ↓
analysis.md
        ↓
SOURCE STATE
        ↓
quality_control.md
        ↓
PASS
        ↓
prompt_image.md
        ↓
IMAGE
        ↓
quality_control.md
        ↓
PASS
        ↓
prompt_image_to_video.md
        ↓
VIDEO #1
        ↓
final_state.md
        ↓
FINAL STATE #1
        ↓
quality_control.md
        ↓
PASS
        ↓
prompt_video_to_extend.md
        ↓
VIDEO #2
        ↓
final_state.md
        ↓
FINAL STATE #2
        ↓
quality_control.md
        ↓
PASS
        ↓
prompt_video_to_extend.md
        ↓
...
```

---

# DOCUMENT RESPONSIBILITY

| Order | File | Responsibility |
|---|---|---|
| 01 | `role.md` | AI role and authority |
| 02 | `task.md` | Task and workflow |
| 03 | `constraint.md` | Global constraints |
| 04 | `analysis.md` | Source analysis and SOURCE STATE |
| 05 | `prompt_image.md` | IMAGE generation |
| 06 | `prompt_image_to_video.md` | IMAGE → VIDEO |
| 07 | `prompt_video_to_extend.md` | VIDEO → EXTEND |
| 08 | `final_state.md` | Generated FINAL STATE |
| 09 | `quality_control.md` | Validation and quality gates |

---

# STATE FLOW

```text
YouTube Source
     ↓
SOURCE STATE
     ↓
IMAGE
     ↓
VIDEO #1
     ↓
FINAL STATE #1
     ↓
VIDEO #2
     ↓
FINAL STATE #2
     ↓
VIDEO #3
     ↓
FINAL STATE #3
     ↓
...
```

The SOURCE STATE is derived from the YouTube source and remains historically immutable.

The latest generated FINAL STATE is the operational continuity authority for the next VIDEO → EXTEND operation.

---

# SOURCE OF TRUTH

Each document owns its domain:

```text
role.md
→ AI role semantics

task.md
→ task and workflow semantics

constraint.md
→ global constraint semantics

analysis.md
→ source-analysis semantics

prompt_image.md
→ image-generation semantics

prompt_image_to_video.md
→ image-to-video semantics

prompt_video_to_extend.md
→ video-extension semantics

final_state.md
→ generated-state semantics

quality_control.md
→ validation semantics

map.md
→ documentation discovery, reading order,
  dependencies, and orchestration
```

If documents overlap:

1. `constraint.md` defines global constraints.
2. The applicable domain document defines domain-specific behavior.
3. `map.md` defines documentation discovery, relationships, reading order, and orchestration.
4. `map.md` MUST NOT silently redefine another document's domain contract.

---

# SOURCE / GENERATED BOUNDARY

```text
SOURCE DOMAIN
    │
    ▼
YouTube Shorts
    │
    ▼
analysis.md
    │
    ▼
SOURCE STATE
    │
    ├───────────────┐
    │               │
    ▼               ▼
IMAGE GENERATION   QUALITY CONTROL
    │
    ▼
IMAGE
    │
    ▼
IMAGE → VIDEO
    │
    ▼
VIDEO #1
    │
    ▼
FINAL STATE #1
    │
    ▼
VIDEO → EXTEND
    │
    ▼
VIDEO #2
    │
    ▼
FINAL STATE #2
    │
    ▼
...
```

Source facts and generated states MUST remain logically separate.

The original source remains authoritative for source facts.

The latest generated FINAL STATE becomes authoritative for subsequent generated continuity.

---

# QUALITY CONTROL GATES

```text
SOURCE STATE
    ↓
QC
    ↓
PASS
    ↓
IMAGE
    ↓
QC
    ↓
PASS
    ↓
VIDEO #1
    ↓
FINAL STATE
    ↓
QC
    ↓
PASS
    ↓
VIDEO → EXTEND
    ↓
VIDEO #N
    ↓
FINAL STATE #N
    ↓
QC
    ↓
PASS
    ↓
REPEAT
```

A mandatory QC failure blocks the affected downstream stage until corrected or explicitly handled according to `quality_control.md`.

---

# CONTINUITY RULE

For every extension:

```text
LATEST VIDEO
    ↓
LATEST FINAL STATE
    ↓
NEXT CAUSAL EVENT
    ↓
VIDEO → EXTEND
    ↓
NEW VIDEO
    ↓
NEW FINAL STATE
```

Never:

- restart from the original YouTube beginning;
- restart from the original IMAGE;
- discard the latest FINAL STATE;
- silently contradict the latest generated state;
- treat an extension as an unrelated new generation.

---

# ERROR RULE

Missing or unavailable information MUST remain explicit.

Use:

```text
UNKNOWN
NOT PRESENT
NOT SPECIFIED
```

Do not fabricate:

- subjects
- objects
- actions
- locations
- dialogue
- narration
- text
- timestamps
- audio
- visual details

---

# COMPLETION CONDITION

Documentation loading is complete only when:

```text
map.md
+
role.md
+
task.md
+
constraint.md
+
analysis.md
+
prompt_image.md
+
prompt_image_to_video.md
+
prompt_video_to_extend.md
+
final_state.md
+
quality_control.md
```

have all been read and understood.

Only then may the AI execute the DOCS01 workflow.

---

# MAP PRINCIPLE

`map.md` is the DOCS01 entry point.

Its primary function is:

```text
DISCOVER
   ↓
READ ALL
   ↓
UNDERSTAND
   ↓
EXECUTE
```

The complete DOCS01 specification is the combination of all documents listed in this map.
