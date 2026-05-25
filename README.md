# Product Quality Checklist (PQL)

A small static site for Commenda's pre-release Product Quality Checklist. PMs enter their name and project, walk through the 10 sections of the checklist, and submit — getting back a clean summary they can copy, download as Markdown, or print as a PDF.

**Live:** https://aryan-prod-guy.github.io/pql-checklist/

## Stack

- Plain HTML, CSS, and vanilla JS — no build step, no dependencies.
- Hosted on GitHub Pages directly from `main` / root.

## Files

- `index.html` — three screens: intro form, checklist, summary
- `styles.css` — all styling
- `app.js` — checklist content, screen routing, summary render, Markdown export
- `.nojekyll` — disables Jekyll processing on GitHub Pages

## Local dev

Just open `index.html` in a browser. Or, if you want a local server:

```sh
cd pql-checklist
python3 -m http.server 8000
# visit http://localhost:8000
```

## Editing the checklist

The 10 sections live as a single `SECTIONS` array at the top of `app.js`. Each entry has `title`, `objective`, `items[]`, and an optional `shipBlocker`. Edit there and reload — no other code changes needed.

## Deploying

The site is already deployed via GitHub Pages from `main` / root. Push to `main` and changes go live in ~1 minute.

To re-enable Pages from scratch (e.g. after a fork):

```sh
gh api -X POST repos/aryan-prod-guy/pql-checklist/pages -f 'source[branch]=main' -f 'source[path]=/'
```

## Why no backend

Submissions are intentionally client-side. The summary screen offers three ways to capture the filled-out checklist: copy as Markdown, download `.md`, or print/save as PDF. Paste the result into Linear, Slack, or your PR description — wherever the team tracks releases.
