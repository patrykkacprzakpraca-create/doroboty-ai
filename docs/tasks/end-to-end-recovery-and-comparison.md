# End-to-end recovery and comparison

## Goal

Make two earlier manual checks repeatable in the existing Playwright suite.

## Acceptance criteria

- Download an actual scenario after a submission, import it in a separate browser context and verify the recovered application after reload.
- Drive the real local comparison middleware from the built app. Replace only Gemini, exercise the concurrent and per-minute limits, and verify that excess requests leave the last result and recruiter note available.
- Use synthetic data, a throwaway loopback port and no live provider credentials. Run the complete suite and record the verification result. Review the feature register for behavior changes.

## Verification and review

- Both new tests passed as part of all 42 Playwright journeys in installed Chrome. The comparison test started the real middleware on a temporary loopback port and replaced Gemini with controlled responses. The recovery test imported the actual download in a fresh browser context and read the submitted answer after reload.
- Formatting, lint, types, 31 unit tests, reference checks, participant packaging and the static build passed. `./scripts/verify` exited 127 because npm is unavailable in this environment, so its checks ran individually. The participant package includes both test files.
- Reviewed the feature register. Only test coverage changed. No behavior entry needed updating.
