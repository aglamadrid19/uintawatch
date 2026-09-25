# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Simulator QA

There is a headless simulator QA harness in `app/qa/` (idb + simctl, no cursor
automation). Before touching UI code or shipping changes, read
`app/qa/README.md` and use `./qa` to verify your changes on the simulator —
especially for anything visual or user-facing. Evidence screenshots go in
`app/qa/screenshots/`; findings and fix status live in `app/qa/QA-FINDINGS.md`.
