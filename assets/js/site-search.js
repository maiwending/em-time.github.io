(() => {
  const form = document.querySelector('.site-search-form');
  const data = document.getElementById('site-search-index');
  if (!form || !data) return;
  const pages = JSON.parse(data.textContent);
  const input = document.getElementById('site-query');
  const results = document.getElementById('site-search-results');
  const status = document.getElementById('site-search-status');
  const empty = document.getElementById('site-search-empty');
  const normalize = text => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  input.value = new URLSearchParams(window.__EM_PREVIEW_QUERY ?? location.search).get('q') || '';
  function render() {
    const words = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
    const found = pages.filter(page => words.every(word => normalize(page.title + ' ' + page.text).includes(word)));
    results.replaceChildren();
    found.forEach(page => {
      const card = document.createElement('article'); card.className = 'library-card';
      const h2 = document.createElement('h2'); h2.className = 'library-title';
      const link = document.createElement('a'); link.href = page.url; link.textContent = page.title;
      h2.append(link);
      const excerpt = document.createElement('p'); excerpt.className = 'library-excerpt'; excerpt.textContent = page.excerpt;
      const read = document.createElement('a'); read.className = 'text-link'; read.href = page.url; read.textContent = 'Read more →';
      card.append(h2, excerpt, read); results.append(card);
    });
    status.textContent = words.length ? `${found.length} matching ${found.length === 1 ? 'page' : 'pages'}` : `Browse all ${pages.length} pages`;
    empty.hidden = found.length !== 0;
  }
  form.addEventListener('submit', event => { event.preventDefault(); render(); });
  input.addEventListener('input', render);
  render();
})();
