# TASK

## PRIMARY TASK

Analyze the YouTube Shorts video provided through `{{youtube_url}}` and produce a source-faithful understanding that can be transformed into an image, animated into a video, and continuously extended.

## TASK FLOW

1. Validate the YouTube URL.
2. Identify and normalize the source `VIDEO_ID` and canonical URL when possible.
3. Determine source accessibility.
4. Analyze the complete accessible source video.
5. Reconstruct the chronological sequence of scenes and events.
6. Extract observable visual, audio, textual, and narrative information.
7. Identify subjects, characters, objects, environment, composition, camera, lighting, color, motion, and transitions.
8. Extract narration, dialogue, voice characteristics, sound effects, ambience, music, and on-screen text when available.
9. Record timestamps for important events whenever available.
10. Classify extracted information using `OBSERVED`, `INFERRED`, `UNKNOWN`, or `NOT PRESENT`.
11. Preserve source fidelity and explicitly mark uncertainty.
12. Build the source state required by downstream generation.
13. Generate the image prompt using `prompt_image.md`.
14. Use the resulting image as the visual starting state for `prompt_image_to_video.md`.
15. Generate VIDEO #1 from IMAGE.
16. Use the latest generated video's final state as the authority for `prompt_video_to_extend.md`.
17. Generate VIDEO #2 by extending VIDEO #1.
18. Repeat VIDEO → EXTEND using the latest generated final state for every subsequent video.
19. Never restart an extension from the original YouTube source or a newly generated starting image unless a new generation sequence is explicitly requested.

## SOURCE FIDELITY

The source video is authoritative for source analysis.

Do not:

- invent unseen content;
- infer unsupported identities, intent, locations, or actions;
- fabricate dialogue, narration, text, timestamps, or audio;
- replace source details with creative alternatives;
- present inference as observation;
- treat generated content as source content.

## SOURCE ACCESS

If the source cannot be accessed or only part of it can be analyzed:

- identify the access limitation;
- analyze only the available evidence;
- do not fabricate missing content;
- use `UNKNOWN` where evidence cannot be established.

Suggested source states:

- `SOURCE_ACCESSIBLE`
- `SOURCE_PARTIALLY_ACCESSIBLE`
- `SOURCE_INACCESSIBLE`
- `SOURCE_INVALID`
- `SOURCE_UNAVAILABLE`

## OUTPUT REQUIREMENT

The result must be complete, internally consistent, chronological, traceable to the source, and ready for downstream processing.

Every unresolved value must be explicitly represented as:

- `UNKNOWN`
- `NOT PRESENT`
- `NOT SPECIFIED`

Do not leave unresolved generic placeholders in final generated prompts.

## GENERATION BOUNDARIES

### IMAGE

`prompt_image.md` defines the visual starting state.

### IMAGE → VIDEO

`prompt_image_to_video.md` transforms the existing image into motion. It must not unnecessarily recreate or replace the starting visual state.

### VIDEO → EXTEND

`prompt_video_to_extend.md` continues the latest generated video. It must begin from the previous final state and continue causally rather than restart the scene.

## CONTINUITY

For every extension:

`Previous Video → Final State → Next Causal Event → Extend → New Video → New Final State`

The latest generated final state is authoritative for the next extension.
