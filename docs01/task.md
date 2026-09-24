# TASK

## PRIMARY TASK

Analyze the YouTube video provided through `{{youtube_url}}` and produce a source-faithful structured understanding of the video.

## TASK FLOW

1. Validate the YouTube URL.
2. Identify the source video.
3. Analyze the complete available video content.
4. Reconstruct the temporal sequence of scenes and events.
5. Extract observable visual, audio, textual, and narrative information.
6. Identify subjects, characters, objects, environment, composition, camera, lighting, motion, and transitions.
7. Extract narration, dialogue, sound effects, ambience, music, and on-screen text when available.
8. Record timestamps for important events whenever available.
9. Classify information using the evidence states defined in `role.md`.
10. Preserve source fidelity and explicitly mark uncertainty.
11. Produce structured output suitable for downstream image-generation, image-to-video, video-extension, continuity, and quality-control workflows.

## SOURCE FIDELITY

The source video is authoritative.

Do not:
- invent unseen content;
- infer unsupported identities or actions;
- fabricate dialogue, narration, text, or timestamps;
- replace source details with creative alternatives;
- present inference as observation.

## OUTPUT REQUIREMENT

The result must be complete, internally consistent, traceable to the source, and ready for downstream processing.

Every unresolved value must be explicitly represented as:

- `UNKNOWN`
- `NOT PRESENT`
- `NOT SPECIFIED`

Do not leave unresolved generic placeholders in the final analysis.
