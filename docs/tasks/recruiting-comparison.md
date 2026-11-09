# Recruiter application comparison

Add an employer-only comparison to the candidate record between the submitted materials and the recruiter note. Use the current approved offer description, submitted answer and saved CV snapshot.

- One explicit recruiter action requests OpenAI analysis for synthetic records. Keep credentials in the loopback Vite process. Static hosting and unconfigured local runs retain the original recruitment workflow.
- Separate requirements with quoted evidence from those that the materials cannot substantiate. Validate source excerpts against their named text and tie suggested questions to unconfirmed requirements. Aim for three distinct questions and show fewer if the materials leave fewer distinct gaps.
- Use the existing RecordSheet, C22 reading blocks, C01 Button and C19 status feedback. Keep one outlined surface, named headings, wrapping at narrow widths and the existing keyboard tabs and note editor.
- Exercise success, error and retry using a controlled response. Run the repository gate and review employer/candidate isolation and the local API boundary.

## Verification

- `./scripts/verify` passed formatting, reference checks, lint, types, 27 unit tests, baseline verification and static build. Its default browser step could not bind port 3106 under the sandbox. Playwright's managed Chromium was absent. The complete browser suite passed separately in installed Chrome with a temporary runner configuration (35 journeys).
- Ran the reference server and inspected the reading block and the comparison with a controlled answer at 1280, 390 and 320 CSS pixels. Captures are in the ignored `artifacts/recruiting-comparison/` directory. The new browser journey also checks keyboard retry, Axe, note preservation and omission in the candidate record.
- Exercised the local endpoint with no key (503) and separately with a stubbed provider. Checked cross-origin rejection, invalid request rejection, the Responses API request shape, acceptance of a valid quote and rejection of one attributed to the wrong source. No live provider request was made.
- Built and checked the baseline participant package with the local server source included and local credentials and instructor materials excluded.

## Review

Checked that the comparison receives only the current approved description and submitted material text after the existing employer route guard. Source validation checks the presence of excerpts and question references. The model still interprets whether a quote substantively supports a requirement and which details are missing, so the recruiter reviews the result. The key is read on server startup and the feature requires a local Vite server.

## Switch the comparison provider to Gemini

Use the existing Google credential as `GEMINI_API_KEY` and send the same synthetic materials to the Gemini API on explicit request. Keep the local endpoint and the shared result and source validation. Update the provider notice, setup and feature register. Verify the provider request with the built-in synthetic application, and exercise the existing regression suite.

The configured key authenticated with Gemini. A live request through the running preview using the built-in synthetic application returned two requirements with verified excerpts, three without confirmation, and three questions. Earlier live runs returned fewer questions. The prompt now calls out prose criteria and separate aspects of a requirement. Results still depend on the model's reading of the materials.

The verification gate passed through the static build. The sandbox blocked the default browser server bind, so the full suite ran in installed Chrome through the temporary runner configuration (35 journeys passed). Review confirmed that the credential remains Git-ignored and server-side and that the browser payload and source validation are preserved.

## Recover from invalid regeneration results

Two consecutive live requests with the built-in synthetic application both received HTTP 200 from Gemini. The second result failed source validation and the local API returned 502. Retry once within the existing request deadline when a completed provider response cannot be parsed or validated. Keep validation strict and preserve the last successful comparison in the record during regeneration and after failure. Verify recovery and the bounded retry with controlled responses.

A controlled endpoint test covered invalid-then-valid output, two invalid outputs, the shared deadline and no retry for HTTP 429. The browser regression confirmed that regeneration failure leaves the prior result visible and that the next click succeeds. Two consecutive live requests on the built-in application both returned HTTP 200 and three questions. Review confirmed that transport and incomplete-response errors remain outside the automatic retry. The verification gate passed through the build, and all 35 browser journeys passed separately in installed Chrome after the default sandbox blocked the local port bind.

## Explain the comparison action

Use the second approved wording under the section heading and remove the previous disclosure from this section. EMP-11 was reviewed. This copy update does not change the registered behavior.

## Add follow-up questions to the recruiter note

Require a question for every unconfirmed requirement and every identified inconsistency. Keep questions visible in the comparison and append them to the editable recruiter note after successful generation. Refresh the untouched generated block on regeneration and preserve recruiter edits. Keep the existing note length boundary and show a message if the full set will not fit. Failed generations leave the note intact.

The live Gemini check returned four requirement questions and one inconsistency question for the synthetic 25% versus 35% scenario. An earlier request returned 502, and the successful diagnostic request passed validation on its automatic retry. Review confirmed strict source and coverage checks, preservation of manual note text, and the existing history boundary. The gate passed through the build with 27 unit tests. The sandbox blocked its preview bind, so all 35 browser journeys ran separately in installed Chrome. The comparison journey covered invalid output, note insertion, regeneration, a recruiter edit, stage-history save, keyboard, mobile and Axe checks.

## Repair invalid comparison output on repeat requests

Browser reproduction confirmed the request still reaches the endpoint after reload. Gemini sometimes supplies an excerpt absent from the offer or links a question to the wrong requirement, and an uninformed retry can repeat both errors. Give the existing single retry the previous output and the failed field checks, preserve strict validation, and exercise the generation path after a browser reload.

A controlled local request verified that the retry receives the prior output and identifies the bad offer excerpt, wrong index and uncovered requirement. Three live Chrome generations succeeded on the built-in application, including two after reloading. Each displayed the result and copied questions into the note. Review confirmed that the retry uses the same deadline and the output must still pass source and coverage validation. The gate passed through the build. The default sandbox blocked the preview bind, and all 35 browser journeys passed separately in installed Chrome.

## Use a complete label for the operational-process requirement

Render the standalone operational-process excerpt as “Znajomość procesów operacyjnych” in the unconfirmed list. Keep the quoted input for validation and question references. EMP-11 was reviewed. The registered comparison behavior is unchanged by this label.
