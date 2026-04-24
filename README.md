# MCTools - Minecraft Toolbox

A static replica of https://mc-tools.net/ — a Minecraft-themed tools hub.

## Structure
- `index.html` — Homepage
- `about.html`, `privacy.html`, `gallery.html`, `changelog.html` — Static pages
- `css/main.css` — Global theme
- `css/tools.css` — Shared tool-page styles
- `js/shared.js` — Common utilities
- `js/zip-utils.js` — JSZip wrappers
- `js/pack-utils.js` — Pack detection & path mapping
- `js/skin-utils.js` — Skin image helpers
- `tools/*.html` + `tools/*.js` — Individual tool pages
- `assets/` — Icons, gallery images, pack icon

All processing is client-side. No backend required.
