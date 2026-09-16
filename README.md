# WaterlooWorks Job Eligibility Scanner

A Chrome extension that reduces repetitive manual screening during co-op applications by automatically checking WaterlooWorks job postings for citizenship, permanent-residency, work-authorization, and security-clearance requirements.

## Why I Built It

WaterlooWorks often places eligibility requirements inside each job-detail view rather than in the main search-results table. This means students may need to open postings one by one just to determine whether they are eligible to apply.

This extension automates that process by scanning the postings on the current results page and displaying an eligibility label directly beside each job title.

## Features

- Scans up to **50 WaterlooWorks job postings per page**
- Automatically opens and reads each job-detail view
- Detects common eligibility-related requirements, including:
  - Canadian citizenship
  - Permanent residency
  - Work authorization
  - Security clearance
  - Controlled Goods / export-control requirements
- Classifies postings as:
  - **Clear** — no obvious restriction detected
  - **Review** — eligibility-related wording requires manual review
  - **Restricted** — an explicit citizenship, residency, or similar restriction is detected
- Displays labels directly in the WaterlooWorks search-results interface
- Shows scan progress and a final results summary

## How It Works

1. Identifies job rows and job-title links in the WaterlooWorks results table.
2. Processes postings sequentially.
3. Opens each job-detail view and extracts its visible text.
4. Uses rule-based keyword classification to detect eligibility restrictions.
5. Writes the result back beside the corresponding job title.

## Technologies

- JavaScript
- HTML/CSS
- Chrome Extension Manifest V3
- DOM Parsing and Automation
- Asynchronous Processing
- Rule-Based Text Classification

## Installation

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the project folder.
6. Sign in to WaterlooWorks normally.
7. Open a job-search results page.
8. Open the extension and click **Scan All Jobs**.

## Note

This extension is a screening aid, not a legal or immigration-eligibility checker. A **Clear** result means only that no obvious restriction was detected by the current classification rules. Always verify the original job posting before applying.
