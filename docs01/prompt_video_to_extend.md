## VIDEO → EXTEND

```text
{{CONTINUATION}}
{{SUBJECT_MOTION}}
{{CAMERA}}
{{ENVIRONMENT}}
{{STYLE}}
{{AUDIO}}
{{NARRATION}}
{{TEXT_OVERLAY}}
```

## CONTRACT

- The input VIDEO is the latest generated video.
- The previous video's final state is the authoritative starting state.
- `CONTINUATION` must describe the next causal event from that final state.
- `SUBJECT_MOTION` must continue current subject/object motion and momentum.
- `CAMERA` must continue from the previous camera state unless a supported transition requires change.
- `ENVIRONMENT` and `STYLE` must preserve relevant continuity.
- `AUDIO`, `NARRATION`, and `TEXT_OVERLAY` must continue only when supported or explicitly specified.
- Do not restart the scene.
- Do not return to the original YouTube source as the visual starting state.
- Do not use a new image as the starting state for an extension unless explicitly requested.
- After generation, the new video's final state becomes the authoritative input for the next extension.
- The same contract may be repeated indefinitely:

`VIDEO #N → FINAL STATE #N → EXTEND → VIDEO #(N+1) → FINAL STATE #(N+1)`

- Resolve every variable before final prompt output.
