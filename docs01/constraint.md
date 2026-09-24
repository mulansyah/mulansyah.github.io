# CONSTRAINT

## SOURCE

- The provided YouTube Shorts URL is the source input.
- The YouTube source is the authority for source-video facts.
- Do not invent, fabricate, or silently complete missing source information.
- Do not treat assumptions as observed facts.
- Generated content must never be presented as source content.

## EVIDENCE

Every extracted source element must be classified as:

- `OBSERVED`
- `INFERRED`
- `UNKNOWN`
- `NOT PRESENT`

Rules:

- `OBSERVED` is directly supported by the source.
- `INFERRED` must be derived from observable evidence and remain explicitly identified as inference.
- `UNKNOWN` means the value cannot be determined reliably.
- `NOT PRESENT` means the element was specifically checked and is absent.
- Never convert `UNKNOWN` into an assumption.
- Inference must never override contradictory observed evidence.

## SOURCE FIDELITY

- Preserve original subject identity, appearance, environment, objects, composition, camera behavior, lighting, color, motion, audio, narration, dialogue, and on-screen text whenever observable.
- Do not rewrite source events into different events.
- Do not add characters, objects, actions, locations, dialogue, or visual details without supporting evidence.
- Do not remove relevant source details merely to simplify the analysis.

## TEMPORAL

- Preserve chronological order.
- Use source timestamps whenever available.
- Do not fabricate timestamps.
- Scene boundaries must be supported by observable changes.
- Generated continuity must follow the latest generated final state, not reset to the source beginning.

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

## SOURCE STATE VS GENERATED STATE

Keep these strictly separate:

- `SOURCE STATE` — facts and states reconstructed from the YouTube source.
- `GENERATED STATE` — state produced by image/video generation.
- A generated change must not modify the historical source state.
- Each extension must use the latest generated final state as its continuity authority.

## DOWNSTREAM PROMPTS

- `prompt_image.md` defines the visual starting state.
- `prompt_image_to_video.md` animates the existing image.
- `prompt_video_to_extend.md` continues the latest generated video.
- Do not introduce unsupported source facts into downstream prompts.
- Do not restart VIDEO → EXTEND from the original YouTube source.
- Do not restart VIDEO → EXTEND from a new image unless explicitly requested.
- Preserve subject identity, environment, camera, style, lighting/color continuity, and relevant audio continuity.

## VARIABLES

- Resolve all variables before final output.
- Do not leave unresolved generic placeholders in production-ready prompts.
- Use `UNKNOWN`, `NOT PRESENT`, or `NOT SPECIFIED` where appropriate.
- Preserve the semantic meaning of every variable when mapping between documents.
- Do not silently change variable scope between source analysis and generation.

## UNCERTAINTY

When evidence is incomplete or ambiguous:

1. preserve the ambiguity;
2. identify the uncertainty;
3. use the appropriate evidence state;
4. do not force a definitive interpretation.

## GENERATION BOUNDARIES

### IMAGE

- Represents a selected source-faithful visual starting state.
- Must not introduce unsupported source facts.

### IMAGE → VIDEO

- The image is the starting visual state.
- Focus on supported temporal transformation, action, and motion.
- Do not unnecessarily recreate the entire image description.
- Do not create an unrelated scene.

### VIDEO → EXTEND

- The previous generated video's final state is the authoritative starting state.
- Continue the current scene causally.
- Preserve continuity across subject, object, environment, camera, style, lighting/color, audio, narration, and text where applicable.
- Do not reset the scene.
- Do not treat an extension as a new independent generation.

## OUTPUT

The final output must be:

- source-faithful;
- chronological;
- internally consistent;
- evidence-aware;
- explicit about uncertainty;
- reusable by downstream generation and continuity workflows.
