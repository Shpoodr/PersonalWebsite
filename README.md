# Personal Website

A single-page linktree + portfolio built with vanilla HTML, CSS, and JavaScript.
No frameworks, no build step — the content (links and projects) lives in JSON
files and is rendered by a small script, so updating the site never requires
touching HTML.

## File structure

```
PersonalWebsite/
├── index.html          # Page skeleton: header, empty containers for links/projects
├── css/
│   └── style.css       # All styling — theme colors, layout, responsiveness
├── js/
│   └── main.js         # Fetches the JSON files and builds the page content
├── data/
│   ├── links.json      # Link buttons (GitHub, LinkedIn, email, resume, ...)
│   └── projects.json   # Project cards
├── assets/
│   ├── profile.svg     # Placeholder avatar — swap for your real photo
│   └── resume.pdf      # Add your resume here (the Resume button points to it)
└── README.md
```

The site auto-switches between light and dark theme based on the visitor's OS
setting (`prefers-color-scheme` in `css/style.css`).

## Previewing locally

`fetch()` can't read local files when you open `index.html` directly from disk
(browsers block `file://` requests for security), so run a tiny static server
from the project folder instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works (`npx serve`, VS Code's Live Server extension, etc.).
There is still no build step — the server just makes files available over HTTP.

## Adding a link

Append an object to the array in `data/links.json`:

```json
{
  "label": "Mastodon",
  "url": "https://mastodon.social/@you",
  "icon": "link"
}
```

- `label` — text shown on the button.
- `url` — where it goes. `https://` links open in a new tab; `mailto:` and
  relative paths (like `assets/resume.pdf`) open in place.
- `icon` — one of `github`, `linkedin`, `email`, `resume`, or `link` (a
  generic external-link icon, used as the fallback for unknown names). To add
  a new icon, add an entry to the `ICONS` map at the top of `js/main.js`.

## Adding a project

Append an object to the array in `data/projects.json`:

```json
{
  "title": "Ray Tracer",
  "description": "A CPU path tracer written in modern C++ with BVH acceleration.",
  "tags": ["C++17", "Multithreading"],
  "repo": "https://github.com/yourusername/ray-tracer",
  "demo": "https://yourusername.github.io/ray-tracer",
  "image": "assets/ray-tracer.png"
}
```

- `title`, `description`, `repo` — required in practice.
- `tags` — array of short technology names, rendered as pills.
- `demo` — optional. Set to `null` (or omit) and no "Live Demo" button renders.
- `image` — optional. Set to `null` and the card renders as text-only; to use
  one, drop the image into `assets/` and reference it by path. Images are
  cropped to 16:9, so roughly that shape looks best.

Watch the commas: JSON requires a comma **between** array entries but forbids
one after the last entry. If the page shows "Projects failed to load," paste
the file into a JSON validator — a stray comma is the usual culprit.

## Personalizing the header

Name, tagline, and photo are one-time content, so they live directly in
`index.html`: edit the `<h1>`, the `.tagline` paragraph, the `<title>`, the
meta description, and the footer name. To use a real photo, add
`assets/profile.jpg` and change the `<img class="avatar">` src (the CSS crops
any photo into a circle automatically).

## Deploying to GitHub Pages

1. Push this repository to GitHub (public repo, or private with GitHub Pro).
2. On GitHub, open the repo and go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to "Deploy from a branch".
4. Choose your default branch (e.g. `main`) and the `/ (root)` folder, then
   **Save**. `index.html` at the repo root is exactly what Pages serves.
5. Wait a minute or two, then visit `https://<username>.github.io/<repo-name>/`.
   The Pages settings screen shows the exact URL once it's live.

Every push to that branch redeploys automatically. Tip: if you name the repo
`<username>.github.io`, the site is served at that bare URL instead.
