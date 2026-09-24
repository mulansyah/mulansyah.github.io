# CONSTRAINT

## SOURCE

- The provided YouTube URL is the only source of truth for source-video analysis.
- Do not invent, fabricate, or silently complete missing source information.
- Do not treat assumptions as observed facts.

## EVIDENCE

Every extracted element must be classified as:

- `OBSERVED`
- `INFERRED`
- `UNKNOWN`
- `NOT PRESENT`

Inference must never be presented as observation.

## FIDELITY

- Preserve the original subject identity, appearance, environment, objects, composition, camera behavior, lighting, motion, audio, narration, dialogue, and on-screen text whenever they are observable.
- Do not rewrite source events into different events.
- Do not add characters, objects, actions, locations, dialogue, or visual details without supporting evidence.
- Do not remove relevant source details merely to simplify the analysis.

## TEMPORAL

- Preserve the chronological order of events.
- Use source timestamps whenever available.
- Do not fabricate timestamps.
- Scene boundaries must be supported by observable changes in the source.

## VISUAL

Analyze only source-supported information for:

- subjects and characters;
- identity and appearance;
- objects;
- environment;
- composition;
- camera;
- lighting;
- color;
- motion;
- transitions;
- visible text.

## AUDIO

Separate and preserve, when available:

- narration;
- dialogue;
- voice characteristics;
- sound effects;
- ambience;
- music.

Do not fabricate audio that cannot be established from the source.

## TEXT

- Transcribe visible or audible text only when reliably available.
- Preserve wording and meaning.
- If text cannot be determined reliably, use `UNKNOWN`.
- Do not invent subtitles, labels, captions, or dialogue.

## DOWNSTREAM PROMPTS

- Analysis is the source for downstream image and video prompts.
- Downstream prompts must not introduce unsupported source facts.
- Persistent identity and environment information must remain consistent across generated assets.
- Dynamic state must reflect the latest known source or generated state.
- Image-to-video prompts should describe supported motion rather than unnecessarily replacing the source image description.
- Video extension prompts must continue from the previous final state rather than restart the scene.

## VARIABLES

- Resolve all variables before final output.
- Do not leave unresolved generic placeholders in production-ready output.
- Use `UNKNOWN`, `NOT PRESENT`, or `NOT SPECIFIED` where appropriate.
- Preserve the semantic meaning of every variable when mapping between documents.

## UNCERTAINTY

When evidence is incomplete or ambiguous:

1. preserve the ambiguity;
2. identify the uncertainty;
3. use the appropriate evidence state;
4. do not force a definitive interpretation.

## OUTPUT

The final output must be:

- source-faithful;
- chronological;
- internally consistent;
- evidence-aware;
- explicit about uncertainty;
- reusable by downstream generation and continuity workflows.
