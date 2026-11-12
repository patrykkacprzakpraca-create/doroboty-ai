# Public demo readiness

## Goal

Prepare the AIPH3 prototype for a public link using fictional scenarios. Keep the current browser-local recruitment journey and the optional loopback-only Gemini workflow.

## Acceptance criteria

- The public home, offer list, direct offer, profile editor and application form identify the demo and explain the fictional-data boundary before entry.
- A publicly hosted page never sends comparison materials. A local static preview without the comparison service displays an explanation before any materials can be sent. Configured local Vite retains the existing human-reviewed workflow.
- Edits from a stale tab preserve the current stored scenario and remain available for export in the editing tab. Existing recovery, import and reset work with version 1 files.
- Verify the static output and its redistribution notices, prepare the release and rollback procedure, update the behavior register, and run the repository checks.

## Design reference

Use the existing Poster People entry copy (C16), offer conditions and action panel (C21), reading and form sections (C22), and existing status and recovery compositions (C19). These changes use host typography and existing controls without adding a component family. Check desktop and mobile reading order, keyboard access and long content.

## Release handoff

The static build and rollback procedure is in [Public demo release](../public-demo-release.md). Keep the baseline teaching data in the existing build until the course owner decides whether the CSV may be shared at the public address.

## Verification and review

- Formatting, immutable design kit, lint, types, 28 unit tests, baseline verifier, participant packaging and the static build passed. The standard `./scripts/verify` entry point exited 127 because npm was unavailable in the task environment. Its checks ran individually with Node.js 24 and existing tools. The installed Chrome ran all 38 Playwright journeys using a temporary configuration with Gemini disabled.
- Opened the reference catalog, listing and offer on port 8952. Inspected the prototype home, listing, direct offer and application at 1280, 390 and 320 CSS pixels. Browser tests covered existing keyboard and responsive behavior, including the application form.
- The public-host simulation made no comparison request. The local static rehearsal saw one empty availability request, restored an exported scenario in another browser profile, rejected an oversized import and served the previous and current static artifacts in succession without losing the draft at the same origin.
- Compared the saved snapshot immediately before each write. The first implementation deferred writes and broke immediate reload, so the final store preserves synchronous persistence. The two-tab test confirms the stale save is blocked and can be exported. Simultaneous compare-and-write across separate documents is not atomic in localStorage.
- Reviewed the public artifact inventory, font license, fixture boundary, same-origin server checks and key exclusion. The CSV is already included in the project’s static build. Public redistribution approval and provider-side publication and rollback are pending.
