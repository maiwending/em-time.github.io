/* Progressive enhancement: the complete bibliography remains visible without JavaScript. */
(() => {
  'use strict';
  const root = document.getElementById('publications');
  const form = document.getElementById('publication-filter');
  if (!root || !form) return;

  const query = document.getElementById('publication-query');
  const year = document.getElementById('publication-year');
  const status = document.getElementById('publication-status');
  const empty = document.getElementById('publication-empty');
  const entries = Array.from(root.querySelectorAll('[data-publication]'));
  const groups = Array.from(root.querySelectorAll('[data-publication-group]'));
  if (!query || !year || !status || !empty || !entries.length) return;

  const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const searchIndex = new Map(entries.map(entry => [entry, normalize(entry.textContent)]));

  function filter() {
    const words = normalize(query.value.trim()).split(/\s+/).filter(Boolean);
    let count = 0;
    entries.forEach(entry => {
      const matchesYear = !year.value || entry.dataset.year === year.value;
      const matchesQuery = words.every(word => searchIndex.get(entry).includes(word));
      entry.hidden = !(matchesYear && matchesQuery);
      if (!entry.hidden) count += 1;
    });
    groups.forEach(group => {
      group.hidden = !Array.from(group.querySelectorAll('[data-publication]')).some(entry => !entry.hidden);
    });
    empty.hidden = count !== 0;
    status.textContent = !words.length && !year.value
      ? `${entries.length} references`
      : `${count} of ${entries.length} references shown`;
  }

  form.addEventListener('submit', event => event.preventDefault());
  query.addEventListener('input', filter);
  year.addEventListener('change', filter);
  form.addEventListener('reset', event => {
    event.preventDefault();
    query.value = '';
    year.value = '';
    filter();
    query.focus();
  });
  filter();
  form.hidden = false;
})();
