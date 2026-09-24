## IMAGE → VIDEO

```text
{{SUBJECT}}
{{ACTION}}
{{MOTION}}
{{CAMERA}}
{{ENVIRONMENT}}
{{STYLE}}
{{NARRATION}}
{{TEXT_OVERLAY}}
```

## CONTRACT

- The input IMAGE is the starting visual state.
- Transform the existing image into video through supported action and motion.
- Preserve subject identity and relevant visual continuity.
- Do not unnecessarily recreate or replace the starting image.
- Do not introduce unsupported source facts.
- `ACTION` and `MOTION` describe temporal change from the starting state.
- Resolve every variable before final prompt output.
