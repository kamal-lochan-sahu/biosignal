# Security policy

BioSignal is a research / demo project, not a medical device. Do not enter real patient data.

## Supported version

Only the latest commit on `main` is maintained.

## Reporting a vulnerability

Please report security problems privately through GitHub: open the **Security** tab of this repository and choose
**Report a vulnerability** (private vulnerability reporting). If that option is not available, open an issue that
describes the area affected **without** exploit details, and a private channel will be arranged.

This is a personal project, so responses are best effort. Reports about the demo API's availability (it runs on a
free tier and is rate limited on purpose) are out of scope.

## What is in place

- Input validation, per-IP and global rate limiting and a request size limit on the API
- Security headers on the API and the web app; Content-Security-Policy in report-only mode
- Weekly dependency update pull requests (Dependabot) and automated tests in CI
