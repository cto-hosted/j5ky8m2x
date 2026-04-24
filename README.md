# MCTools

A full static replica of [mc-tools.net](https://mc-tools.net/) — a dark, pixel-art themed Minecraft tools hub with 14 functional client-side tool pages.

## Overview

- **Landing page** with hero, CREATE / TOOLS card sections, gallery, changelog, and footer
- **14 tool pages** running entirely in the browser (no backend):
  - Skin Editor (2D paint + 3D preview via skinview3d)
  - Avatar Maker
  - Skin Pack Maker (Bedrock .mcpack)
  - Texture Pack Merger
  - Pack Converter (Java ↔ Bedrock)
  - Custom Paintings
  - Music Disc Maker (with ffmpeg.wasm audio conversion)
  - Armor Stand Skins
  - Cape Pack Builder
  - Cape Editor
  - Totem Generator
  - Coordinate Calculator
  - HUD Customizer
- Static pages: About, Privacy, Gallery, Changelog

## Tech Stack

- Vanilla HTML / CSS / JS (ES modules)
- No build step required — serve the folder with any static server
- Third-party libraries loaded via CDN:
  - JSZip & FileSaver for ZIP generation
  - skinview3d for 3D skin preview
  - ffmpeg.wasm (lazy-loaded) for audio conversion

## Local Development

```bash
# Using Python
python3 -m http.server 8080

# Using Node
npx serve .
```

Then open http://localhost:8080
