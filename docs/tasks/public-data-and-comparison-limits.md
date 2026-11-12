# Public data and comparison limits

## Goal

Keep the baseline CSV in the course package and outside the public static release. Bound the optional local Gemini comparison so repeated clicks and parallel requests cannot create an unlimited burst of provider calls.

## Acceptance criteria

- The former CSV address and source-file path serve no CSV in the public build. The participant archive retains the unchanged CSV and its verifier. The instructor view describes where to find the file in the public demo and links to it in local development.
- A configured local Vite server starts at most one comparison at a time, five in any minute and 30 in any hour. Over-limit requests return HTTP 429 with a wait hint before contacting Gemini. Availability checks and rejected input consume no comparison slots.
- Reuse the existing Poster People C19 feedback and C22 reading sections for the message and course-material copy. Preserve the recruiter note, last valid result and focus on a rejected request.
- Run the project checks and verify the public artifact, the participant package and the local server using synthetic materials and a stubbed provider.

## Verification and review

- Compared the course CSV byte for byte with the original. The participant package verifier passed with 120 rows. A static inventory of all 35 release files found neither baseline data nor the CSV. Both CSV paths returned 404 on a file server, and local Vite development served the original CSV.
- The controlled local middleware test rejected a foreign origin and malformed input before calling the provider. It rejected a parallel comparison and the sixth start in a minute with HTTP 429. A simulated upstream failure released the active slot. Unit tests exercised the rolling minute and hour boundaries. The browser test verified the wait message and retained the recruiter note and focus.
- Formatting, reference integrity, lint, types, 31 unit tests, participant packaging and build passed. All 40 Playwright journeys passed in installed Chrome with Gemini disabled and controlled responses. The standard entry point exited 127 because npm is unavailable in this environment.
- Reviewed the static packaging boundary and confirmed that both quota checks execute before starting provider work. The limiter is local to one Vite process and resets on restart. Public traffic controls depend on the selected hosting provider. The release instructions require a rollback artifact to exclude the course CSV.
