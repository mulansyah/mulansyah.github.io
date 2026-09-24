# SOURCE ANALYSIS CONTRACT

## PURPOSE

Define the canonical structure and rules for reconstructing a publicly accessible YouTube Shorts video as source-faithful structured data.

This contract describes the SOURCE STATE only.

Generated images, videos, and generated continuity states must not be written back into the source analysis.

## INPUT

youtube_url

Accepted source URL forms:

- https://www.youtube.com/shorts/{VIDEO_ID}
- https://www.youtube.com/watch?v={VIDEO_ID}
- https://youtu.be/{VIDEO_ID}

Normalize the input to video_id and canonical_url.

## SOURCE ACCESS

Represent source accessibility explicitly:

- SOURCE_ACCESSIBLE
- SOURCE_PARTIALLY_ACCESSIBLE
- SOURCE_INACCESSIBLE
- SOURCE_INVALID
- SOURCE_UNAVAILABLE

If the source is inaccessible or only partially accessible:
- analyze only available evidence;
- identify the limitation;
- do not fabricate missing information;
- use UNKNOWN where evidence cannot be established.

## SOURCE METADATA

When available, extract:
- video_id
- canonical_url
- title
- channel
- published_at
- duration
- aspect_ratio
- orientation
- relevant source-identification metadata

Unavailable values must use UNKNOWN, NOT PRESENT, or NOT SPECIFIED.

## TIMELINE

Reconstruct the source chronologically.

Each important temporal segment should identify:
- start_timestamp
- end_timestamp
- scene_id
- event
- visual_state
- audio_state
- text_state
- evidence
- uncertainty

Do not fabricate timestamps. Scene boundaries must be supported by observable changes.

## VISUAL ANALYSIS

Analyze source-supported:
- subjects / characters
- identity and appearance
- clothing, pose, expression, position, interaction, action
- objects, state, position, interaction, movement
- environment, setting, spatial relationships
- composition and framing
- camera position, angle, shot type, movement, focus/depth when observable
- lighting, shadows, highlights, color
- subject, object, environmental and camera motion
- transitions

## AUDIO ANALYSIS

Separate available audio into:
- narration
- dialogue
- voice characteristics
- sound effects
- ambience
- music

Record transcript, speaker, timing, and relevant characteristics when reliably available.

Do not fabricate audio.

## TEXT ANALYSIS

Extract reliably observable:
- on-screen text
- subtitles
- captions
- labels
- signs
- logos or textual marks

Preserve wording and meaning. If text cannot be determined reliably, use UNKNOWN.

## EVIDENCE

Every extracted source element must use:
- OBSERVED
- INFERRED
- UNKNOWN
- NOT PRESENT

Rules:
- OBSERVED requires direct source support.
- INFERRED must be derived from observable evidence and remain explicitly marked.
- UNKNOWN means the value cannot be determined reliably.
- NOT PRESENT means the element was specifically checked and absent.
- Never silently convert UNKNOWN into INFERRED or OBSERVED.
- Inference must not override contradictory observed evidence.

## SOURCE STATE

The complete analysis represents the logical SOURCE STATE.

It may be consumed by:
- prompt_image.md
- prompt_image_to_video.md
- continuity planning
- quality control

Generated content must remain outside this source state.

## OUTPUT CONTRACT

The analysis output must be:
- structured
- chronological
- source-faithful
- evidence-aware
- timestamp-aware when possible
- internally consistent
- explicit about uncertainty
- reusable by downstream generation

No unresolved generic placeholders may remain in production output.
