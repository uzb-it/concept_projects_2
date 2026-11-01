/* =========================================================
   Concept Projects — variant B. Shared chrome + per-page logic.
   Pages set <body data-page="home|projects|project|studio|services|contacts">.
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const page = document.body.dataset.page;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tel = p => 'tel:' + p.replace(/[^\d+]/g, '');
  document.documentElement.classList.add('js');

  /* ---------------- logo sprite (six folded blades) ---------------- */
  document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="mark" viewBox="-56 -56 112 112">
    <path d="M51 -19.67L51 13.28L14 34.64L3 28.29L40 6.93L40 -35.8L42.53 -34.33Z"/><path d="M42.53 34.33L14 50.81L-23 29.44L-23 16.74L14 38.11L51 16.74L51 19.67Z"/>
    <path d="M-8.47 54L-37 37.53L-37 -5.2L-26 -11.55L-26 31.18L11 52.54L8.47 54Z"/><path d="M-51 19.67L-51 -13.28L-14 -34.64L-3 -28.29L-40 -6.93L-40 35.8L-42.53 34.33Z"/>
    <path d="M-42.53 -34.33L-14 -50.81L23 -29.44L23 -16.74L-14 -38.11L-51 -16.74L-51 -19.67Z"/><path d="M8.47 -54L37 -37.53L37 5.2L26 11.55L26 -31.18L-11 -52.54L-8.47 -54Z"/>
  </symbol></svg>`);

  /* ---------------- header, menu, footer ---------------- */
  const NAV = [['projects', 'projects.html', 'Проекты'], ['studio', 'studio.html', 'Студия'], ['services', 'services.html', 'Услуги и цены'], ['contacts', 'contacts.html', 'Контакты']];
  const navLinks = NAV.map(([k, href, t]) => `<a href="${href}"${k === page || (k === 'projects' && page === 'project') ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  $('[data-header]').outerHTML = `
    <header class="header">
      <a class="brand" href="index.html" aria-label="Concept Projects — на главную"><svg><use href="#mark"/></svg>Concept Projects</a>
      <nav class="nav" aria-label="Основное меню">${navLinks}</nav>
      <a class="btn header__cta" href="contacts.html">Обсудить проект</a>
      <button class="burger" aria-label="Меню" aria-expanded="false"><i></i><i></i></button>
    </header>
    <div class="menu" id="menu">
      <nav aria-label="Меню">${'<a href="index.html">Главная</a>' + navLinks}</nav>
      <div class="label">${SITE.phones.map(p => `<a href="${tel(p)}">${p}</a>`).join('<br>')}<br><a href="${SITE.telegram}" target="_blank" rel="noopener">Telegram</a> · <a href="${SITE.instagram}" target="_blank" rel="noopener">Instagram</a></div>
    </div>`;
  const burger = $('.burger');
  burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') document.body.classList.remove('menu-open'); });

  const foot = $('[data-footer]');
  if (foot) foot.outerHTML = `
    <footer class="footer">
      <div class="footer__brand"><a class="brand" href="index.html"><svg><use href="#mark"/></svg>Concept Projects</a>
        <p>Архитектура, дизайн интерьера, ремонт и авторский надзор. ${SITE.city}.</p></div>
      <div><h4>Разделы</h4><ul>${NAV.map(([, h, t]) => `<li><a href="${h}">${t}</a></li>`).join('')}</ul></div>
      <div><h4>Связаться</h4><ul>${SITE.phones.map(p => `<li><a href="${tel(p)}">${p}</a></li>`).join('')}<li><a href="${SITE.telegram}" target="_blank" rel="noopener">Telegram</a></li></ul></div>
      <div><h4>Соцсети</h4><ul><li><a href="${SITE.instagram}" target="_blank" rel="noopener">@concept_projects_</a></li><li><a href="${SITE.founderInstagram}" target="_blank" rel="noopener">@umar_concept_</a></li></ul></div>
      <div class="footer__bottom"><span>© ${new Date().getFullYear()} Concept Projects</span><span>${SITE.city}, Узбекистан</span></div>
    </footer>`;

  // header: hide on scroll down, show on scroll up
  const header = $('.header');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    header.classList.toggle('is-scrolled', y > 10);
    header.classList.toggle('is-hidden', y > 300 && y > lastY && !document.body.classList.contains('menu-open'));
    lastY = y;
  }, { passive: true });

  /* ---------------- shared bits ---------------- */
  const byslug = Object.fromEntries(PROJECTS.map(p => [p.slug, p]));
  const img = p => `assets/img/${p.img}.jpg`;
  const card = (p, ratio = '4x5') => `
    <a class="card" href="project.html?p=${p.slug}" data-cat="${esc(p.cat)}">
      <div class="ph ph--${ratio}" data-reveal style="view-transition-name:p-${p.slug}"><img src="${img(p)}" alt="${esc(p.name)}" loading="lazy"></div>
      <div class="card__cap"><span class="card__name">${esc(p.name)}</span><span class="card__meta">${esc(p.cat)} · ${p.year}</span></div>
    </a>`;
  const fill = (sel, html) => { const el = $(sel); if (el) el.innerHTML = html; return el; };

  /* ---------------- pages ---------------- */
  if (page === 'home') {
    fill('#featured', ['terracotta-master', 'grand-dining', 'bordeaux-room', 'verde-marble'].map(s => card(byslug[s])).join(''));
    $('#allCount').textContent = PROJECTS.length;
  }

  if (page === 'projects') {
    const wrap = $('.catalog-wrap');
    fill('#catalog', PROJECTS.map(p => card(p)).join(''));
    fill('#list', PROJECTS.map(p => `<a class="row" href="project.html?p=${p.slug}" data-cat="${esc(p.cat)}" data-img="${img(p)}">
      <b>${esc(p.name)}</b><span>${esc(p.mat.slice(0, 3).join(', '))}</span><span>${esc(p.cat)}</span><em>${p.year}</em></a>`).join(''));
    const cats = [...new Set(PROJECTS.map(p => p.cat))];
    const count = c => PROJECTS.filter(p => p.cat === c).length;
    fill('#chips', [`<button class="chip is-on" data-cat="">Все<sup>${PROJECTS.length}</sup></button>`]
      .concat(cats.map(c => `<button class="chip" data-cat="${esc(c)}">${esc(c)}<sup>${count(c)}</sup></button>`)).join(''));
    const apply = cat => {
      $$('.chip').forEach(b => b.classList.toggle('is-on', b.dataset.cat === cat));
      $$('.card, .row', wrap).forEach(el => el.classList.toggle('is-out', !!cat && el.dataset.cat !== cat));
      reveal(); // newly shown cards
    };
    $('#chips').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) apply(b.dataset.cat); });
    $$('.views button').forEach(b => b.addEventListener('click', () => {
      $$('.views button').forEach(x => x.classList.toggle('is-on', x === b));
      wrap.classList.toggle('is-list', b.dataset.view === 'list');
      try { localStorage.setItem('cp2-view', b.dataset.view); } catch (e) {}
    }));
    try { if (localStorage.getItem('cp2-view') === 'list') $('.views [data-view=list]').click(); } catch (e) {}
    // list view: photo follows the pointer
    const peek = $('#peek'), peekImg = $('img', peek);
    $$('.row').forEach(r => {
      r.addEventListener('pointerenter', () => { peekImg.src = r.dataset.img; peek.classList.add('is-on'); });
      r.addEventListener('pointerleave', () => peek.classList.remove('is-on'));
    });
    addEventListener('pointermove', e => { peek.style.left = e.clientX + 'px'; peek.style.top = e.clientY + 'px'; }, { passive: true });
  }

  if (page === 'project') {
    const slug = new URLSearchParams(location.search).get('p');
    const i = Math.max(0, PROJECTS.findIndex(p => p.slug === slug)), p = PROJECTS[i];
    const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length], next = PROJECTS[(i + 1) % PROJECTS.length];
    document.title = `${p.name} — Concept Projects`;
    $('#crumb').textContent = p.name;
    $('#title').textContent = p.name;
    $('#cat').textContent = `${p.cat}, ${p.year}`;
    const hero = $('#heroImg');
    hero.style.viewTransitionName = 'p-' + p.slug;
    hero.innerHTML = `<img src="${img(p)}" alt="${esc(p.name)}">`;
    const specs = [['Помещение', p.cat], ['Год', p.year], p.area && ['Площадь', p.area + ' м²'], p.term && ['Срок', p.term],
      ['Материалы', p.mat.length + ' позиций'], ['Проект', `${String(i + 1).padStart(2, '0')} из ${PROJECTS.length}`]].filter(Boolean);
    fill('#specs', specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join(''));
    $('#desc').textContent = p.desc;
    fill('#materials', p.mat.map(m => `<li>${esc(m)}</li>`).join(''));
    // close-ups: the same photo, zoomed into three points
    const CROPS = [['22% 30%', 2.1], ['78% 58%', 2.4], ['46% 90%', 2]];
    fill('#details', CROPS.map(([o, z], k) => `<figure><div class="ph ph--${k === 1 ? '3x4' : '1x1'}" data-reveal style="--o:${o};--z:${z}"><img src="${img(p)}" alt="${esc(p.name)} — деталь ${k + 1}" loading="lazy"></div>
      <figcaption>Деталь ${String(k + 1).padStart(2, '0')}</figcaption></figure>`).join(''));
    fill('#pager', `<a href="project.html?p=${prev.slug}"><span class="label">← Предыдущий</span><b>${esc(prev.name)}</b></a>
      <a href="project.html?p=${next.slug}"><span class="label">Следующий →</span><b>${esc(next.name)}</b></a>`);
    // lightbox
    const lb = $('#lightbox'), lbImg = $('img', lb);
    $$('#heroImg, #details .ph').forEach(el => el.addEventListener('click', () => { lbImg.src = img(p); lb.classList.add('is-on'); }));
    lb.addEventListener('click', () => lb.classList.remove('is-on'));
    addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('is-on'); });
  }

  if (page === 'studio') {
    fill('#strip', PROJECTS.map(p => card(p, '3x4')).join(''));
    $('#projCount').textContent = PROJECTS.length;
  }

  if (page === 'services') {
    const area = $('#area'), out = $('#areaOut');
    let pkg = 'full';
    const fmt = n => '$' + (Math.round(n / 100) * 100).toLocaleString('ru-RU');
    const calc = () => {
      const a = +area.value, r = RATES[pkg];
      out.textContent = a + ' м²';
      $('#sum').innerHTML = `<span style="white-space:nowrap">${fmt(a * r.min)}</span> – <span style="white-space:nowrap">${fmt(a * r.max)}</span>`;
      $('#sumName').textContent = r.name;
      $('#sumTerm').textContent = `Срок: ${r.months[0]}–${r.months[1]} мес.`;
      $('#sendCalc').href = `contacts.html?pkg=${pkg}&area=${a}`;
    };
    fill('#pkgSeg', Object.entries(RATES).map(([k, r]) => `<button type="button" class="chip${k === pkg ? ' is-on' : ''}" data-k="${k}">${r.name}</button>`).join(''));
    $('#pkgSeg').addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      pkg = b.dataset.k; $$('#pkgSeg .chip').forEach(x => x.classList.toggle('is-on', x === b)); calc();
    });
    area.addEventListener('input', calc);
    calc();
  }

  if (page === 'contacts') {
    fill('#phones', SITE.phones.map(p => `<a class="big" href="${tel(p)}">${p}</a>`).join(''));
    const form = $('#form'), q = new URLSearchParams(location.search);
    fill('#need', Object.entries(RATES).map(([k, r]) => `<button type="button" class="chip" data-k="${k}">${r.name}</button>`).join(''));
    let need = q.get('pkg') in RATES ? q.get('pkg') : '';
    const setNeed = k => { need = k; $$('#need .chip').forEach(b => b.classList.toggle('is-on', b.dataset.k === k)); };
    setNeed(need);
    if (q.get('area')) form.area.value = q.get('area');
    $('#need').addEventListener('click', e => { const b = e.target.closest('.chip'); if (b) setNeed(b.dataset.k === need ? '' : b.dataset.k); });
    $$('.input', form).forEach(i => i.addEventListener('input', () => { const e = $(`[data-err=${i.name}]`); if (e) e.textContent = ''; }));
    form.addEventListener('submit', async e => {
      e.preventDefault();
      let ok = true;
      const err = (n, t) => { $(`[data-err=${n}]`).textContent = t; ok = false; };
      if (!form.name.value.trim()) err('name', 'Как к вам обращаться?');
      if (form.phone.value.replace(/\D/g, '').length < 9) err('phone', 'Проверьте номер телефона');
      if (!ok) return;
      const text = [`Заявка с сайта`, `Имя: ${form.name.value.trim()}`, `Телефон: ${form.phone.value.trim()}`,
        need && `Услуга: ${RATES[need].name}`, form.area.value && `Площадь: ${form.area.value} м²`, form.msg.value.trim() && `Комментарий: ${form.msg.value.trim()}`].filter(Boolean).join('\n');
      // No backend yet: copy the request and open Telegram so it can be pasted into the chat.
      // Hook a Telegram bot here later (see README).
      let copied = false;
      try { await navigator.clipboard.writeText(text); copied = true; } catch (er) {}
      window.open(SITE.telegram, '_blank', 'noopener');
      $('#formMsg').textContent = copied ? 'Текст заявки скопирован. Вставьте его в открывшийся чат Telegram или позвоните нам.' : 'Откройте Telegram и напишите нам, или позвоните по номеру слева.';
    });
  }

  /* ---------------- reveal on scroll ---------------- */
  const io = 'IntersectionObserver' in window && new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  function reveal() { $$('[data-reveal]:not(.is-in), [data-fade]:not(.is-in)').forEach(el => io ? io.observe(el) : el.classList.add('is-in')); }
  reveal();
})();
