/*
 * main.js — loads data/links.json and data/projects.json and renders them.
 *
 * The flow: fetch() requests a file over HTTP, .json() parses it into plain
 * JS objects/arrays, then we build DOM elements and append them to the
 * containers that index.html left empty. Because we set text via textContent
 * (never innerHTML for data), JSON content can't inject HTML into the page.
 */

/* Small inline SVG icons, keyed by the "icon" field in links.json.
   Inline SVG keeps the site dependency-free and lets icons inherit the
   button's text color via fill/stroke = "currentColor". */
const ICONS = {
  github:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.11-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12v3.14c0 .3.21.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>',
  linkedin:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>',
  email:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  resume:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
  link:
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>',
};

/* Helper: create an element, set attributes, append children.
   Cuts down on repetitive document.createElement / setAttribute calls. */
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value != null) node.setAttribute(key, value);
  }
  for (const child of children) {
    // Strings become text nodes (safe); elements are appended as-is.
    node.append(child);
  }
  return node;
}

/* Fetch a JSON file, throwing a readable error if it fails.
   async/await works like C#'s: the function returns a Promise (≈ Task)
   and await unwraps it without blocking the browser's UI thread. */
async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: HTTP ${response.status}`);
  }
  return response.json();
}

function renderLinks(links) {
  const list = document.getElementById('links');
  list.replaceChildren();

  for (const link of links) {
    const anchor = el('a', { class: 'link-button', href: link.url }, link.label);

    // Icons come from our own trusted ICONS map above (not from JSON),
    // so insertAdjacentHTML is safe here.
    const iconSvg = ICONS[link.icon] || ICONS.link;
    anchor.insertAdjacentHTML('afterbegin', iconSvg);

    // Open external links in a new tab; keep mailto: and same-site links in place.
    // rel="noopener noreferrer" stops the new tab from accessing this page.
    if (link.url.startsWith('http')) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    }

    list.append(el('li', {}, anchor));
  }
}

function renderProjects(projects) {
  const grid = document.getElementById('project-grid');
  grid.replaceChildren();

  // Empty state: keep the section friendly instead of showing a blank area.
  if (!projects.length) {
    grid.append(el('p', { class: 'empty-state' }, 'Projects coming soon — check back later!'));
    return;
  }

  for (const project of projects) {
    // <article> = a self-contained piece of content, ideal for cards.
    const card = el('article', { class: 'project-card' });

    if (project.image) {
      card.append(
        el('img', {
          class: 'project-image',
          src: project.image,
          alt: `Screenshot of ${project.title}`,
          loading: 'lazy',
        })
      );
    }

    const body = el('div', { class: 'project-body' });
    body.append(el('h3', {}, project.title));
    body.append(el('p', { class: 'project-description' }, project.description));

    if (project.tags && project.tags.length) {
      const tagList = el('ul', { class: 'tag-list', 'aria-label': 'Technologies used' });
      for (const tag of project.tags) {
        tagList.append(el('li', { class: 'tag' }, tag));
      }
      body.append(tagList);
    }

    // Optional fields: buttons only render when the JSON provides a URL.
    const actions = el('div', { class: 'project-actions' });
    if (project.repo) {
      actions.append(
        el('a', {
          class: 'button button-primary',
          href: project.repo,
          target: '_blank',
          rel: 'noopener noreferrer',
          'aria-label': `View source code for ${project.title}`,
        }, 'View Code')
      );
    }
    if (project.demo) {
      actions.append(
        el('a', {
          class: 'button button-secondary',
          href: project.demo,
          target: '_blank',
          rel: 'noopener noreferrer',
          'aria-label': `Open live demo of ${project.title}`,
        }, 'Live Demo')
      );
    }
    if (actions.childElementCount) body.append(actions);

    card.append(body);
    grid.append(card);
  }
}

function showError(containerId, message) {
  document
    .getElementById(containerId)
    .replaceChildren(el('p', { class: 'notice' }, message));
}

async function init() {
  document.getElementById('year').textContent = new Date().getFullYear();

  // Load both files in parallel; render whichever succeeds even if the
  // other fails (Promise.allSettled never throws).
  const [linksResult, projectsResult] = await Promise.allSettled([
    loadJSON('data/links.json'),
    loadJSON('data/projects.json'),
  ]);

  if (linksResult.status === 'fulfilled') {
    renderLinks(linksResult.value);
  } else {
    console.error(linksResult.reason);
    showError('links', 'Links failed to load.');
  }

  if (projectsResult.status === 'fulfilled') {
    renderProjects(projectsResult.value);
  } else {
    console.error(projectsResult.reason);
    showError(
      'project-grid',
      'Projects failed to load. If you opened this file directly from disk, serve it with a local web server instead (see README).'
    );
  }
}

init();
