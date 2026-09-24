# DOCS01 MAP

## PURPOSE

Define the relationship, dependency, execution order, authority boundaries, state transitions, and responsibility of every document inside `docs01`.

`map.md` is the architectural map of `docs01`.

It does not replace or duplicate the detailed contracts defined inside the individual documents.

---

# 1. DOCUMENT STRUCTURE

```text
docs01/
├── role.md
├── task.md
├── constraint.md
├── analysis.md
├── prompt_image.md
├── prompt_image_to_video.md
├── prompt_video_to_extend.md
├── final_state.md
├── quality_control.md
└── map.md
```

---

# 2. DOCUMENT RESPONSIBILITY

## role.md

Defines:

- AI identity
- AI responsibility
- source authority
- evidence model
- source vs generated state boundary
- downstream document relationship

Role:

```text
WHO
```

---

## task.md

Defines:

- primary task
- execution flow
- source analysis sequence
- generation sequence
- extension sequence
- continuity requirements
- generation boundaries

Role:

```text
WHAT
```

---

## constraint.md

Defines:

- global rules
- source fidelity
- evidence rules
- uncertainty handling
- temporal constraints
- visual constraints
- audio constraints
- text constraints
- variable rules
- source/generated separation
- generation boundaries

Role:

```text
RULES
```

---

## analysis.md

Defines the source analysis contract.

Responsible for:

- YouTube source identification
- source accessibility
- metadata
- timeline
- scenes
- visual analysis
- audio analysis
- text analysis
- evidence classification
- SOURCE STATE

Role:

```text
SOURCE ANALYSIS
```

Authority:

```text
YouTube source
```

Output:

```text
SOURCE STATE
```

---

## prompt_image.md

Defines the image-generation prompt contract.

Input:

```text
SOURCE STATE
```

Output:

```text
IMAGE
```

Role:

```text
SOURCE STATE → IMAGE
```

---

## prompt_image_to_video.md

Defines the IMAGE → VIDEO prompt contract.

Input:

```text
IMAGE
```

Variables:

```text
SUBJECT
ACTION
MOTION
CAMERA
ENVIRONMENT
STYLE
NARRATION
TEXT_OVERLAY
```

Output:

```text
VIDEO #1
```

Role:

```text
IMAGE → VIDEO
```

The image is the authoritative visual starting state.

---

## final_state.md

Defines the generated video's final-state contract.

Input:

```text
VIDEO #N
```

Output:

```text
FINAL STATE #N
```

Responsible for recording:

- subject
- objects
- environment
- camera
- lighting
- color
- style
- motion
- audio
- text
- narrative
- temporal position
- provenance

Role:

```text
VIDEO → FINAL STATE
```

Authority:

```text
latest generated video
```

---

## prompt_video_to_extend.md

Defines the VIDEO → EXTEND prompt contract.

Input:

```text
VIDEO #N
FINAL STATE #N
```

Variables:

```text
CONTINUATION
SUBJECT_MOTION
CAMERA
ENVIRONMENT
STYLE
AUDIO
NARRATION
TEXT_OVERLAY
```

Output:

```text
VIDEO #(N+1)
```

Role:

```text
FINAL STATE #N → VIDEO #(N+1)
```

The latest generated final state is the authoritative continuity starting state.

---

## quality_control.md

Defines validation and quality gates.

Responsible for validating:

- source analysis
- image prompt
- image → video
- final state
- video → extend
- variables
- evidence
- continuity
- hallucination
- unsupported content

Possible statuses:

```text
PASS
FAIL
UNKNOWN
NOT APPLICABLE
```

Role:

```text
VALIDATION / QUALITY GATE
```

---

## map.md

Defines:

- document relationships
- dependencies
- execution order
- state transitions
- authority boundaries
- document responsibilities
- quality-control gates
- variable mappings

Role:

```text
SYSTEM MAP
```

`map.md` does not generate source analysis, generation prompts, final states, or QC results.

---

# 3. EXECUTION FLOW

The canonical workflow is:

```text
YouTube Shorts URL
        │
        ▼
    role.md
        │
        ▼
    task.md
        │
        ▼
 constraint.md
        │
        ▼
   analysis.md
        │
        ▼
   SOURCE STATE
        │
        ▼
quality_control.md
        │
      PASS
        │
        ▼
 prompt_image.md
        │
        ▼
      IMAGE
        │
        ▼
quality_control.md
        │
      PASS
        │
        ▼
prompt_image_to_video.md
        │
        ▼
    VIDEO #1
        │
        ▼
  final_state.md
        │
        ▼
 FINAL STATE #1
        │
        ▼
quality_control.md
        │
      PASS
        │
        ▼
prompt_video_to_extend.md
        │
        ▼
    VIDEO #2
        │
        ▼
  final_state.md
        │
        ▼
 FINAL STATE #2
        │
        ▼
quality_control.md
        │
      PASS
        │
        ▼
prompt_video_to_extend.md
        │
        ▼
    VIDEO #3
        │
        ▼
      ...
```

---

# 4. STATE FLOW

## SOURCE STATE

Created by:

```text
analysis.md
```

Source authority:

```text
YouTube source
```

Used by:

```text
prompt_image.md
quality_control.md
```

The SOURCE STATE is immutable.

Generated changes must never modify the historical SOURCE STATE.

---

## IMAGE STATE

Created by:

```text
prompt_image.md
```

Input authority:

```text
SOURCE STATE
```

Used by:

```text
prompt_image_to_video.md
```

---

## GENERATED VIDEO STATE

Created by:

```text
prompt_image_to_video.md
```

or:

```text
prompt_video_to_extend.md
```

Used by:

```text
final_state.md
quality_control.md
```

---

## FINAL STATE

Created from:

```text
VIDEO #N
```

Defined by:

```text
final_state.md
```

Used by:

```text
prompt_video_to_extend.md
quality_control.md
```

The latest FINAL STATE is authoritative for the next extension.

---

# 5. AUTHORITY MODEL

## SOURCE AUTHORITY

For source facts:

```text
YouTube source
        ↓
   analysis.md
        ↓
   SOURCE STATE
```

The source has authority over:

- subject identity
- observable appearance
- source events
- source environment
- source objects
- source camera behavior
- source lighting
- source colors
- source motion
- source audio
- source narration
- source dialogue
- source text
- source timeline

---

## GENERATED AUTHORITY

For generated continuity:

```text
Generated VIDEO #N
        ↓
FINAL STATE #N
        ↓
VIDEO #(N+1)
```

The latest generated FINAL STATE has authority over the starting state of the next extension.

---

## EVIDENCE PRIORITY

For source evidence:

```text
OBSERVED
    >
INFERRED
    >
UNKNOWN
```

`INFERRED` must never override contradictory `OBSERVED` evidence.

---

# 6. SOURCE / GENERATED BOUNDARY

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
                         │
─────────────────────────┼─────────────────────────
                         │
                  GENERATION DOMAIN
                         │
                         ▼
                 prompt_image.md
                         │
                         ▼
                       IMAGE
                         │
                         ▼
          prompt_image_to_video.md
                         │
                         ▼
                     VIDEO #1
                         │
                         ▼
                  final_state.md
                         │
                         ▼
                  FINAL STATE #1
                         │
                         ▼
          prompt_video_to_extend.md
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

The source domain and generated domain must remain logically separate.

---

# 7. QUALITY CONTROL GATES

## GATE 1 — SOURCE

```text
analysis.md
     │
     ▼
quality_control.md
```

Validate:

```text
SOURCE ANALYSIS
```

`PASS` → continue.

`FAIL` → correct the source analysis before continuing.

---

## GATE 2 — IMAGE

```text
prompt_image.md
     │
     ▼
quality_control.md
```

Validate:

```text
IMAGE PROMPT
```

---

## GATE 3 — IMAGE → VIDEO

```text
prompt_image_to_video.md
     │
     ▼
quality_control.md
```

Validate:

```text
IMAGE → VIDEO
```

---

## GATE 4 — FINAL STATE

```text
VIDEO #N
     │
     ▼
final_state.md
     │
     ▼
quality_control.md
```

Validate:

```text
FINAL STATE
```

---

## GATE 5 — EXTENSION

```text
FINAL STATE #N
     │
     ▼
prompt_video_to_extend.md
     │
     ▼
VIDEO #(N+1)
     │
     ▼
quality_control.md
```

Validate:

```text
VIDEO → EXTEND
CONTINUITY
```

---

# 8. RESPONSIBILITY MATRIX

| File | Responsibility | Input | Output | Authority |
|---|---|---|---|---|
| `role.md` | AI identity | AI context | Role | Role definition |
| `task.md` | Workflow | Role + source | Task flow | Workflow definition |
| `constraint.md` | Rules | Workflow | Constraints | Global rules |
| `analysis.md` | Source analysis | YouTube URL | SOURCE STATE | YouTube source |
| `prompt_image.md` | Image generation | SOURCE STATE | IMAGE | SOURCE STATE |
| `prompt_image_to_video.md` | Animation | IMAGE | VIDEO #1 | IMAGE |
| `final_state.md` | Generated state | VIDEO #N | FINAL STATE #N | Latest generated video |
| `prompt_video_to_extend.md` | Extension | FINAL STATE + VIDEO | VIDEO #(N+1) | Latest FINAL STATE |
| `quality_control.md` | Validation | Workflow stage | QC result | Validation rules |
| `map.md` | Architecture | All docs | System map | Document relationship |

---

# 9. DEPENDENCY MAP

```text
role.md
   │
   ▼
task.md
   │
   ▼
constraint.md
   │
   ▼
analysis.md
   │
   ▼
SOURCE STATE
   │
   ├──────────────► quality_control.md
   │
   ▼
prompt_image.md
   │
   ▼
IMAGE
   │
   ├──────────────► quality_control.md
   │
   ▼
prompt_image_to_video.md
   │
   ▼
VIDEO #1
   │
   ▼
final_state.md
   │
   ▼
FINAL STATE #1
   │
   ├──────────────► quality_control.md
   │
   ▼
prompt_video_to_extend.md
   │
   ▼
VIDEO #2
   │
   ▼
final_state.md
   │
   ▼
FINAL STATE #2
   │
   ├──────────────► quality_control.md
   │
   ▼
prompt_video_to_extend.md
   │
   ▼
...
```

---

# 10. VARIABLE MAPPING

## SOURCE STATE → IMAGE

```text
analysis.subject
        ↓
SUBJECT

analysis.environment
        ↓
ENVIRONMENT

analysis.objects
        ↓
OBJECTS

analysis.composition
        ↓
COMPOSITION

analysis.lighting
        ↓
LIGHTING

analysis.style
        ↓
STYLE

analysis.camera
        ↓
CAMERA

analysis.visual_state
        ↓
IMAGE

analysis.text
        ↓
TEXT
```

Additional generation controls:

```text
QUALITY
NEGATIVE
INSTRUCTION
```

must be resolved from the applicable generation requirements and constraints.

---

## IMAGE → VIDEO

```text
IMAGE
        ↓
SUBJECT

SOURCE / IMAGE STATE
        ↓
ACTION

SOURCE / IMAGE TEMPORAL STATE
        ↓
MOTION

IMAGE / SOURCE CAMERA STATE
        ↓
CAMERA

IMAGE / SOURCE ENVIRONMENT
        ↓
ENVIRONMENT

IMAGE / SOURCE STYLE
        ↓
STYLE

SOURCE AUDIO
        ↓
NARRATION

SOURCE TEXT STATE
        ↓
TEXT_OVERLAY
```

`ACTION` and `MOTION` describe temporal change from the existing IMAGE.

---

## FINAL STATE → VIDEO EXTEND

```text
FINAL STATE
        │
        ├── narrative.current_event
        ├── narrative.current_position
        ├── narrative.unresolved_action
        └── narrative.next_causal_opportunity
                         ↓
                  CONTINUATION
```

```text
FINAL STATE
        │
        ├── subject.current_motion
        ├── subject.orientation
        ├── objects.current_motion
        ├── motion.direction
        ├── motion.phase
        └── motion.momentum
                         ↓
                  SUBJECT_MOTION
```

```text
FINAL STATE.camera
        ↓
CAMERA
```

```text
FINAL STATE.environment
        ↓
ENVIRONMENT
```

```text
FINAL STATE.style
        ├── color
        ├── lighting
        └── visual characteristics
                         ↓
                      STYLE
```

```text
FINAL STATE.audio
        ↓
AUDIO
```

```text
FINAL STATE.narration
        ↓
NARRATION
```

```text
FINAL STATE.text
        ↓
TEXT_OVERLAY
```

The mapping must preserve the semantic meaning of each state.

---

# 11. CONTINUITY PRINCIPLE

The continuity authority always moves forward.

```text
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

The source remains historically authoritative.

The latest generated final state becomes operationally authoritative for subsequent generation.

---

# 12. ERROR PRINCIPLE

When information is unavailable:

```text
UNKNOWN
```

When an element was checked and is absent:

```text
NOT PRESENT
```

When a value is not provided by the applicable specification:

```text
NOT SPECIFIED
```

Do not replace missing information with assumptions.

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

# 13. SOURCE-OF-TRUTH PRINCIPLE

Each document owns its domain.

```text
role.md
→ role semantics

task.md
→ workflow semantics

constraint.md
→ global constraint semantics

analysis.md
→ source-analysis semantics

prompt_image.md
→ image-generation semantics

prompt_image_to_video.md
→ image-to-video semantics

prompt_video_to_extend.md
→ extension semantics

final_state.md
→ generated-state semantics

quality_control.md
→ validation semantics

map.md
→ document relationship and orchestration semantics
```

If documents overlap:

1. `constraint.md` controls global constraints.
2. The applicable domain contract controls domain-specific behavior.
3. `map.md` controls document relationship and execution order only.

`map.md` must not silently redefine another document's contract.

---

# 14. READ / EXECUTION ORDER

For an orchestrator consuming `docs01`, use:

```text
1. role.md
2. task.md
3. constraint.md
4. map.md
5. analysis.md
6. quality_control.md
7. prompt_image.md
8. quality_control.md
9. prompt_image_to_video.md
10. quality_control.md
11. final_state.md
12. quality_control.md
13. prompt_video_to_extend.md
14. quality_control.md
15. final_state.md
16. repeat 13–15
```

`map.md` is read before execution because it defines how the contracts connect.

The individual domain files remain authoritative for their respective stages.

---

# 15. MAP PRINCIPLE

`map.md` answers:

- What does each file do?
- Which file depends on which?
- What is the execution order?
- What state moves between stages?
- Which state is authoritative?
- Where are QC gates applied?
- How are variables mapped?
- Where is the source/generated boundary?

It does not answer the detailed domain rules already defined in the other documents.

Therefore:

```text
map.md
    ↓
WHERE / HOW DOCUMENTS CONNECT

individual contracts
    ↓
WHAT EACH STAGE DOES
```
