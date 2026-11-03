/* Accessibility refinements for the retained Publii mobile navigation. */
(() => {
  const toggle = document.querySelector('.js-toggle');
  const sidebar = document.querySelector('.navbar_mobile_sidebar');
  if (!toggle || !sidebar) return;
  sidebar.id = 'mobile-navigation';
  sidebar.setAttribute('role', 'navigation');
  sidebar.setAttribute('aria-label', 'Mobile navigation');
  toggle.setAttribute('aria-controls', sidebar.id);
  let wasOpen = false;
  const sync = () => {
    const open = toggle.classList.contains('is-active');
    toggle.setAttribute('aria-expanded', String(open));
    sidebar.setAttribute('aria-hidden', String(!open));
    sidebar.inert = !open;
    if (open && !wasOpen) sidebar.querySelector('a[href]')?.focus({ preventScroll: true });
    wasOpen = open;
  };
  new MutationObserver(sync).observe(toggle, { attributes: true, attributeFilter: ['class'] });
  sync();
  document.addEventListener('keydown', event => {
    if (!toggle.classList.contains('is-active')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      toggle.click();
      toggle.focus();
    } else if (event.key === 'Tab') {
      const controls = [toggle, ...sidebar.querySelectorAll('a[href]')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!controls.includes(document.activeElement)) {
        event.preventDefault(); (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });
})();
