# Paladeno Architecture

## 1. Project type
- Static multi page website.
- No build step, no framework, no package manager in this repo.
- Files are served as-is by the hosting provider.

## 2. Entry points
- `/index.html`: English landing page.
- `/de/index.html`: German landing page.
- `/impressum.html`: English legal page.
- `/de/impressum.html`: German legal page.

## 3. Shared assets
- `/styles.css`: Global styling for all pages.
- `/script.js`: Shared interaction logic for both landing pages.
- `/images/*`: Logos and favicon assets.
- `/fonts/inter-latin-var.woff2`: Local Inter variable font file.
- Navbar logo image uses `/images/logo.webp` converted from `logo.svg`.

## 4. Rendering model
- Each page links to `styles.css` in the `<head>`.
- Landing pages preload the local Inter font file, then load `styles.css`.
- `styles.css` defines `@font-face` with `font-display: swap`.
- CSS, JS and font URLs use a `?v=20260226` suffix for cache busting.
- IDE preview layout note: `.ide-editor` is a vertical flex container and `.code-area` uses `min-height: 0` so mobile can shrink code content without clipping the terminal.
- Mobile terminal layout note: `.term-content[data-term="terminal"]` uses compact vertical spacing and clears inline top margins so the last prompt line stays visible inside the fixed-height terminal.
- Terminal cursor note: `.term-cursor` uses `em` sizing so cursor height follows terminal font size on mobile and desktop.
- Legal page layout note: `.legal-doc main` centers `.legal-page` vertically via flex alignment, while `.legal-page` uses compact symmetric padding.
- Result: first paint can happen with fallback font, then Inter swaps in when ready.

## 5. Behavior layer
- `script.js` handles:
  - mobile menu toggle
  - reveal animations via `IntersectionObserver`
  - IDE panel tab switching
  - typewriter effect in code panels
  - terminal tab switching
  - contact modal open and close
  - simple contact form validation
  - dynamic footer year
- Landing pages include `script.js` at the end of `<body>`.
- `/impressum.html` also includes `script.js` to support the navbar `Let's Talk` contact modal.
- `/de/impressum.html` currently stays static and does not load `script.js`.

## 6. i18n structure
- Language split is path based:
  - root path for English
  - `/de/` path for German
- Relative links are used between localized pages.
- Shared styling and script are reused across locales.

## 7. Performance model
- Critical resources are local first party files.
- Google Fonts CDN dependency was removed from landing pages.
- Font loading now uses:
  - local `woff2`
  - preload on landing pages
  - `font-display: swap`
- Logo asset strategy:
  - source artwork remains in `images/logo.svg`
  - runtime navbar image uses `images/logo.webp` (smaller transfer than SVG)
  - conversion path: `rsvg-convert` plus `cwebp`
- Remaining cache policy for CSS, JS, SVG and font files is controlled by hosting headers.

## 8. Deployment and caching responsibility
- This repo contains static files only.
- Cache headers are configured in:
  - `/_headers` for hosts that support this format.
  - `/.htaccess` for Apache hosts.
- Header strategy:
  - HTML: `max-age=0, must-revalidate`.
  - Static assets (`css`, `js`, `woff2`, `webp`, `svg`, `ico`): `max-age=31536000, immutable`.

## 9. Change principles
- Keep edits small and local to affected files.
- Prefer shared assets over duplicated page specific logic.
- Validate performance changes with Lighthouse after each small change.
