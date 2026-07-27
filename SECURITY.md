# Security

## Reporting secrets

If you find an API key, token, or credential in this repository or a results file:

1. **Do not open a public issue containing the secret**
2. Email **hello@vibecoderslife.com** with subject `VibeBench security`
3. We will rotate credentials and scrub history as needed

## Maintainer incident response

1. Revoke the exposed key at the provider  
2. Replace `OPENROUTER_API_KEY` in GitHub Actions secrets (if used)  
3. Remove the secret from git history if committed  
4. Note the incident privately (without the secret); mention rotation in the next GitHub Release notes if the repo is public  

## CI

Paid evals use `workflow_dispatch` only. Fork pull requests must not receive repository secrets.

## BYOK

Local runs use **your** OpenRouter key in `.env` (never commit it). This project does not collect API keys on vibecoderslife.com.
