# Prototype data boundary

The prototype has no real authentication. Role-specific UI and local transition checks organize the scenario; anyone using the browser can inspect all stored data. Use synthetic data only.

No API keys, credentials, real CVs or private material belong in frontend source, JSON, localStorage or exports. Exports include private-in-the-UI source/recruiter notes.

Render imported text through React text nodes, validate imports with shared Zod schemas, reject unsupported versions, duplicate IDs, broken references and oversized files. Never overwrite an unreadable save automatically.

The optional comparison endpoint runs in local Vite only. Keep its key in the server process or ignored `.env.local`. The endpoint checks the loopback connection and request origin and does not store or log application materials. Use it with synthetic records only.
