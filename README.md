# WaterlooWorks Eligibility Scanner

Manifest V3 Chrome extension that scans WaterlooWorks job listings and labels potential citizenship / work authorization restrictions.

## What changed in v0.2
- Extracted eligibility classification into a separately testable pure JavaScript function (`eligibility.js`).
- Added automated tests for restrictions, negation, ambiguity and missing data.
- Preserved a short source excerpt (`evidence`) for flagged findings.
- Retained the original popup and DOM-scanning workflow.

## Run automated tests
Install Node.js 18+ and run from this folder:

```bash
npm test
```

No third-party packages are required.

## Install in Chrome
1. Go to `chrome://extensions` and enable Developer mode.
2. Select **Load unpacked** and choose this folder.
3. Open a WaterlooWorks listing and use **Scan All Jobs**.

## Important limits
The rules are heuristic and **do not determine legal eligibility**. Green means no obvious keyword restriction was found, not that the student definitely qualifies. Yellow means manual review is required. The browser scanning flow requires live testing on WaterlooWorks; the included Node tests cover the isolated classification logic only. Use synthetic/sample job text in public demonstrations rather than sharing private posting data.
