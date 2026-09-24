# GENERATED VIDEO FINAL STATE CONTRACT

## PURPOSE

Define the authoritative state at the end of each generated video.

FINAL STATE represents the latest generated endpoint and is the continuity authority for the next VIDEO → EXTEND operation.

It is distinct from SOURCE STATE.

## AUTHORITY

VIDEO #N → FINAL STATE #N → NEXT CAUSAL EVENT → VIDEO #(N+1)

The latest generated final state has priority over the original source for visual continuation.

The original YouTube source remains authoritative only for source facts and source-derived intent.

## STATE

Record the latest known state of:

### SUBJECT
- identity
- appearance
- pose
- expression
- position
- orientation
- current action
- current motion
- relevant physical state

### OBJECTS
- identity
- appearance
- position
- orientation
- state
- interaction
- current motion

### ENVIRONMENT
- location/state
- spatial arrangement
- background
- foreground
- relevant environmental conditions

### CAMERA
- shot type
- position
- angle
- framing
- movement
- focus/depth state when relevant

### LIGHTING
- direction
- quality
- intensity
- shadows
- highlights

### COLOR / STYLE
- dominant color state
- color continuity
- visual style
- persistent visual characteristics

### MOTION
- current subject motion
- object motion
- environmental motion
- camera momentum
- movement direction
- movement phase

### AUDIO
- current narration
- current dialogue
- voice continuity
- sound effects
- ambience
- music
- relevant audio state

### TEXT
- visible text
- text position
- text state
- subtitle/caption state when relevant

### NARRATIVE
- current event
- current action
- current narrative position
- unresolved action
- next causal opportunity

## TEMPORAL POSITION

Record:
- video identifier
- sequence number
- final timestamp or duration when available
- final event
- final frame/state description

Do not fabricate timing information.

## PROVENANCE

Final state values describe generated output and are not source observations.

Use provenance where needed:
- SOURCE_DERIVED
- GENERATED
- INFERRED_FROM_GENERATED
- UNKNOWN

## EXTENSION RULES

The final state must:
- represent the latest generated endpoint;
- preserve continuity-relevant information;
- provide the starting state for the next extension;
- support a causal next event.

The next extension must not:
- restart the scene;
- return to the source video's beginning;
- use a new image as its starting state unless explicitly requested;
- contradict the latest generated state without a defined transition.

## STATE UPDATE

Previous FINAL STATE → New VIDEO → New FINAL STATE

The new final state replaces the previous final state as the authoritative continuity state for the next extension.

Historical final states may be retained for traceability, but only the latest state is authoritative.

## OUTPUT CONTRACT

A final state must be:
- explicit
- continuity-ready
- temporally grounded when possible
- internally consistent
- sufficient to construct the next extension prompt
- separate from immutable source analysis
