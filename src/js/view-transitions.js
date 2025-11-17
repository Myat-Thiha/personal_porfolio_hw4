(function () {
  'use strict';

  const supportsViewTransition = typeof document.startViewTransition === 'function';

  // Helper: fetch and parse HTML into a Document
  async function fetchDocument(url) {
    const resp = await fetch(url, { credentials: 'same-origin' });
    if (!resp.ok) throw new Error('Failed to fetch: ' + resp.status);
    const text = await resp.text();
    return new DOMParser().parseFromString(text, 'text/html');
  }

  // Replace children while preserving the container element identity
  function replaceChildrenPreserve(container, newNode) {
    if (!container || !newNode) return;
    const children = Array.from(newNode.children).map(n => document.importNode(n, true));
    container.replaceChildren(...children);
  }

  // Reattach any inline scripts or external scripts from the new document that are needed
  function reattachScriptsFrom(newDoc) {
    // If new page expects form-validation.js (or any other script), re-add it if missing
    const scripts = Array.from(newDoc.querySelectorAll('script[src]'));
    scripts.forEach(s => {
      const src = s.getAttribute('src');
      if (!src) return;
      // If a script with same src is already present, skip
      if (document.querySelector(`script[src="${src}"]`)) return;
      const scriptEl = document.createElement('script');
      scriptEl.src = src;
      // defer so it doesn't block and executes after parsing
      scriptEl.defer = true;
      document.body.appendChild(scriptEl);
    });
  }

  async function navigateWithTransition(url, push = true) {
    // For cross-origin or absolute external links, just do a full navigation
    try {
      const targetUrl = new URL(url, location.href);
      if (targetUrl.origin !== location.origin) {
        window.location.href = url;
        return;
      }
    } catch (err) {
      // If URL constructor fails, fallback to full navigation
      window.location.href = url;
      return;
    }

    if (!supportsViewTransition) {
      // Graceful fallback: do a normal navigation
      window.location.href = url;
      return;
    }

    let newDoc;
    try {
      newDoc = await fetchDocument(url);
    } catch (err) {
      console.error('Failed to fetch page for transition', err);
      window.location.href = url;
      return;
    }

    const newMain = newDoc.querySelector('main');
    const newHeader = newDoc.querySelector('header');
    const newFooter = newDoc.querySelector('footer');

    if (!newMain) {
      // If there's no main in the fetched page, do a normal navigation
      window.location.href = url;
      return;
    }

    // Preserve the theme toggle element (if present) so we don't lose user's theme control
    const oldThemeToggle = document.getElementById('theme-toggle');

    const transition = document.startViewTransition(() => {
      // synchronous DOM updates inside update callback
      document.title = newDoc.title || document.title;

      // main
      const main = document.querySelector('main');
      replaceChildrenPreserve(main, newMain);

      // header
      const header = document.querySelector('header');
      if (newHeader && header) {
        replaceChildrenPreserve(header, newHeader);
      }

      // footer
      const footer = document.querySelector('footer');
      if (newFooter && footer) {
        replaceChildrenPreserve(footer, newFooter);
      }

      // restore theme toggle into the new header if it existed before
      if (oldThemeToggle) {
        const headerNow = document.querySelector('header');
        if (headerNow && !document.getElementById('theme-toggle')) {
          headerNow.appendChild(oldThemeToggle);
        }
      }
    });

    // Update history after starting the transition
    if (push) history.pushState({}, '', url);

    transition.finished.then(() => {
      // After transition finishes, reattach any scripts present in the fetched page
      reattachScriptsFrom(newDoc);
      // Re-bind navigation listeners for new links in header/nav
      initNavigationListeners();
    }).catch(err => {
      console.warn('View transition finished with error', err);
      reattachScriptsFrom(newDoc);
      initNavigationListeners();
    });
  }

  function handleNavClick(e) {
    // Only handle left-clicks without modifier keys
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.currentTarget;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    e.preventDefault();
    navigateWithTransition(href);
  }

  function initNavigationListeners() {
    const navLinks = document.querySelectorAll('header nav a');
    navLinks.forEach(a => {
      a.removeEventListener('click', handleNavClick);
      a.addEventListener('click', handleNavClick);
    });
  }

  // Handle back/forward
  window.addEventListener('popstate', () => {
    navigateWithTransition(location.pathname + location.search + location.hash, false);
  });

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    initNavigationListeners();
  });

  // Expose for debugging/testing
  window.__navigateWithTransition = navigateWithTransition;
})();
