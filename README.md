# Govor

An offline speech board (AAC — augmentative and alternative communication) web app.
Tap a phrase and the device speaks it aloud using the built-in system voices.

Built for someone who cannot speak (tracheotomy) but has full touch control.

## Features

- Works fully offline once loaded (service worker, cache-first)
- Installable as an iOS home-screen app (PWA)
- Four languages: Croatian, English, Italian, German — UI and all built-in phrases
- Urgent + Common phrase categories, Recent row for quick repeats
- Custom phrases in any of the four languages; built-in phrases editable per language
- Free-text input with a per-message language picker
- Speech rate/volume settings and per-language voice selection
- All data stays in the browser's localStorage — no server, no accounts, no tracking

## Development

No build step. Serve the folder with any static server:

```
python3 -m http.server 4173
```

## Deploying changes

The site is served by GitHub Pages from the `main` branch. Push to `main` and the
live site updates in about a minute. **When changing any file, also bump the
`CACHE` version string in `sw.js`** (e.g. `govor-v1` → `govor-v2`) so installed
apps pick up the new files; they update on the next launch after that.
