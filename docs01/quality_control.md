# QUALITY CONTROL CONTRACT

## PURPOSE

Validate source analysis, prompt construction, generated states, and video continuity before allowing the workflow to proceed.

Quality control is a validation layer, not a generation prompt.

## RESULT

Each check must return:
- PASS
- FAIL
- UNKNOWN
- NOT APPLICABLE

A failed mandatory check blocks downstream continuation until resolved or explicitly handled.

## SOURCE ANALYSIS QC

Validate:
- source URL validity
- video identification
- source accessibility
- chronological ordering
- timestamp integrity
- scene boundary support
- source fidelity
- evidence classification
- uncertainty handling
- absence of fabricated source facts

## IMAGE PROMPT QC

Validate:
- all required variables are resolved
- source-supported subject is preserved
- environment is consistent with source
- objects are supported
- composition is coherent
- lighting is supported
- camera is coherent
- visible text is preserved when required
- unsupported source facts are not introduced

## IMAGE → VIDEO QC

Validate:
- IMAGE is the actual starting state
- subject identity is preserved
- action is consistent with the starting state
- motion is temporally coherent
- camera movement is coherent
- environment remains consistent
- style and visual characteristics remain consistent
- narration and text are not fabricated
- no unrelated scene is introduced

## FINAL STATE QC

Validate:
- final state represents the actual generated endpoint
- subject state is explicit
- object state is explicit
- environment state is explicit
- camera state is explicit
- lighting/color/style state is explicit
- motion state is explicit
- relevant audio state is explicit
- text state is explicit
- narrative position is explicit
- temporal position is not fabricated
- generated state is separated from source state

## VIDEO → EXTEND QC

Validate:
- input is the latest generated video
- starting state is the latest authoritative final state
- continuation is causally connected
- subject continuity is preserved
- object continuity is preserved
- environment continuity is preserved
- camera continuity is preserved
- lighting/color continuity is preserved
- style continuity is preserved
- audio continuity is preserved where applicable
- narration continuity is preserved where applicable
- text continuity is preserved where applicable
- extension does not restart the scene
- extension does not revert to the source beginning
- extension does not silently introduce unsupported source facts

## VARIABLE QC

For every downstream prompt:
- no unresolved generic placeholders remain
- required variables are present
- variable meaning is preserved
- variable scope is correct
- UNKNOWN, NOT PRESENT, or NOT SPECIFIED is used where appropriate

## EVIDENCE QC

Check that:
- OBSERVED is source-supported
- INFERRED is explicitly marked
- UNKNOWN remains unresolved
- NOT PRESENT was actually checked
- generated content is not mislabeled as source observation

## CONTINUITY QC

Compare the previous authoritative final state against the new generated result.

Check:
- subject identity
- subject appearance
- object identity/state
- environment
- camera
- lighting
- color
- style
- motion
- audio
- narration
- text
- narrative progression

Any intentional change must have a causal transition or explicit generation instruction.

## HALLUCINATION / UNSUPPORTED CONTENT QC

Flag:
- invented characters
- invented objects
- invented locations
- invented actions
- invented dialogue
- invented narration
- invented text
- invented timestamps
- unsupported visual details
- unsupported audio details

## DECISION

PASS → continue workflow.

FAIL → block or correct the affected stage.

UNKNOWN → do not invent missing evidence; continue only where the unknown does not invalidate the next operation.

NOT APPLICABLE → check is not relevant to the current stage.

## OUTPUT

Return a structured QC result containing:
- stage
- check
- status
- evidence/reason
- affected field or state
- corrective action when status is FAIL

The QC result must be traceable to the stage being validated.
