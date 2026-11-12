# Public demo release

This procedure publishes a fictional recruitment demo. Anyone with the URL can open it, pick a persona and explore the same local scenario. The demo is separate from the live DoRoboty.ai portal. It keeps the existing noindex directive to reduce confusion in search results.

## Prepare the files

1. Identify the reviewed source revision and run the checks below with Node.js 24 and npm. Keep the exact tested output together with the revision identifier.

   ```sh
   npm ci
   ./scripts/verify
   ```

2. Publish only the contents of `dist/` on a static host. Keep the repository, Git history, local environment files, instructor source material and participant source archive outside the web root. Do not run Vite or provide a Gemini key to the host. The release includes the two fictional CVs, demo imagery and the versioned Geist Serif license at `licenses/geist-serif-OFL.txt`. The baseline CSV is kept in the participant package. Confirm that neither `case/baseline.csv` nor `docs/case/baseline.csv` serves a file, and that the public artifact contains no baseline data. If a previous release exposed the CSV, remove the old asset from the host and purge its cached response.
3. Record the public URL, hosting release ID, source revision and the person who can publish and restore a release. Retain the previous approved artifact and its release ID. Check that it excludes the baseline CSV before making it a rollback candidate. If this is the first release, confirm how the host can withdraw it. Set a contact for problem reports and a recipient for availability alerts. Confirm the host’s bandwidth limits, what happens during abusive traffic and when the host sends a usage alert.

## Check the public URL

Use a fresh browser profile and fictional data. Stop sharing the link if any of the first three checks fail.

1. Open the HTTPS address and a copied direct link to an offer. Confirm the demo notice appears on the home page, direct offer and application form. Check the page at phone width.
2. Choose a candidate, submit a fictional application, switch to its employer, record a stage and reload. The application and stage should still be there in the same profile.
3. Confirm that the comparison explains that it requires local Gemini and that opening the recruiter record sends no application data. Confirm that the public asset list matches the approved files.
4. Export the scenario and restore it in a separate profile. Send a test alert and verify that the named person receives it. Record results with the exact URL and deployment ID.

## Restore service

1. Stop sharing the link while diagnosing an error that blocks the core journey or sends data unexpectedly. Ask affected visitors to export any work they can still access in their current tab before reloading. Keep the report free of CVs and application text.
2. Restore the previous approved static artifact at the same address after checking it excludes the baseline CSV. If no eligible version exists, withdraw the faulty release. Restore site files only. A browser stores scenarios under the site address, so moving to a different domain creates a separate store.
3. Repeat the HTTPS, direct link, application and reload checks using a separate profile. The source formats in this repair use the existing version 1 schema. For a future format change, test backward compatibility before relying on this recovery procedure.
4. Tell visitors when they can resume and link to the demo's data settings if they need to import a saved scenario.
