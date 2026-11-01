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

  /* ---------------- intro (home, once per visit): the six blades assemble, then open ---------------- */
  let seen = true;
  try { seen = !!sessionStorage.getItem('cp2-intro'); sessionStorage.setItem('cp2-intro', 1); } catch (e) {}
  if (page === 'home' && !seen && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const blades = $$('#mark path').map((p, i) => {
      const a = (i * 60 + 30) * Math.PI / 180; // each blade flies in from its own side
      return `<path d="${p.getAttribute('d')}" style="--i:${i};--dx:${Math.round(Math.cos(a) * 60)}px;--dy:${Math.round(Math.sin(a) * 60)}px"/>`;
    }).join('');
    document.body.insertAdjacentHTML('beforeend', `<div class="splash" aria-hidden="true"><svg viewBox="-56 -56 112 112">${blades}</svg><div class="splash__word">Concept Projects</div></div>`);
    // the sequence is pure CSS; when the aperture finishes, drop the overlay and start the reveals
    const intro = $('.splash');
    const done = () => { if (!intro.isConnected) return; intro.remove(); reveal(); };
    intro.addEventListener('animationend', e => { if (e.animationName === 'intro-open') done(); });
    setTimeout(done, 3200); // backup
  }

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
    <a class="wordmark" href="index.html" aria-label="Concept Projects"><svg><use href="#mark"/></svg><span>Concept Projects</span></a>
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
  const setHH = () => document.documentElement.style.setProperty('--hh', header.offsetHeight + 'px');
  setHH(); addEventListener('resize', setHH);
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    header.classList.toggle('is-scrolled', y > 10);
    const hide = y > 300 && y > lastY && !document.body.classList.contains('menu-open');
    header.classList.toggle('is-hidden', hide);
    document.body.classList.toggle('header-hidden', hide);
    lastY = y;
  }, { passive: true });

  /* ---------------- shared bits ---------------- */
  const byslug = Object.fromEntries(PROJECTS.map(p => [p.slug, p]));
  const img = p => `assets/img/${p.img}.jpg`;
  const card = (p, ratio = '4x5') => `
    <a class="card" href="project.html?p=${p.slug}" data-cat="${esc(p.cat)}" data-mat="${esc(p.mat.join('|'))}">
      <div class="ph ph--${ratio}" data-reveal data-parallax><img src="${img(p)}" alt="${esc(p.name)}" loading="lazy"></div>
      <div class="card__cap"><span class="card__name">${esc(p.name)}</span><span class="card__meta">${esc(p.cat)} · ${p.year}</span></div>
    </a>`;
  const fill = (sel, html) => { const el = $(sel); if (el) el.innerHTML = html; return el; };
  const pad2 = n => String(n).padStart(2, '0');
  // floating photo preview that follows the pointer (lists on home and projects)
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let peekBound = false;
  function bindPeek(items) {
    const peek = $('#peek'); if (!peek || !finePointer) return;
    const peekImg = $('img', peek);
    items.forEach(r => {
      r.addEventListener('pointerenter', () => { peekImg.src = r.dataset.img; peek.classList.add('is-on'); });
      r.addEventListener('pointerleave', () => peek.classList.remove('is-on'));
    });
    if (peekBound) return;
    peekBound = true;
    addEventListener('pointermove', e => { peek.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0) translate(-50%,-50%)`; }, { passive: true });
  }
  // how many projects use each material, most used first
  const matCount = {};
  PROJECTS.forEach(p => p.mat.forEach(m => { matCount[m] = (matCount[m] || 0) + 1; }));
  const MATS = Object.keys(matCount).sort((a, b) => matCount[b] - matCount[a] || a.localeCompare(b, 'ru'));

  /* ---------------- pages ---------------- */
  if (page === 'home') {
    // slideshow hero
    const SHOW = ['silk-road-lounge', 'terracotta-master', 'grand-dining', 'travertine-suite', 'inomarka-hayda'].map(s => byslug[s]);
    const slides = $('#slides'), progress = $('#slideProgress');
    slides.innerHTML = SHOW.map((p, k) => `<div class="slide${k ? '' : ' is-on'}"><img src="${img(p)}" alt="${esc(p.name)}"${k ? ' loading="lazy"' : ''}></div>`).join('');
    fill('#thumbs', SHOW.map((p, k) => `<button type="button" role="tab" aria-label="${esc(p.name)}" style="background-image:url(${img(p)})"${k ? '' : ' class="is-on"'}></button>`).join(''));
    $('#slideTotal').textContent = pad2(SHOW.length);
    const DUR = 6000;
    let cur = 0, t0 = performance.now();
    const go = k => {
      const els = $$('.slide', slides);
      els.forEach(e => e.classList.remove('was-on'));
      els[cur].classList.replace('is-on', 'was-on');
      cur = (k + SHOW.length) % SHOW.length;
      els[cur].classList.add('is-on');
      $$('#thumbs button').forEach((b, j) => b.classList.toggle('is-on', j === cur));
      $('#slideIdx').textContent = pad2(cur + 1);
      $('#slideName').textContent = `${SHOW[cur].name} — ${SHOW[cur].cat.toLowerCase()}, ${SHOW[cur].year}`;
      slides.href = `project.html?p=${SHOW[cur].slug}`;
      t0 = performance.now();
    };
    $('#slideName').textContent = `${SHOW[0].name} — ${SHOW[0].cat.toLowerCase()}, ${SHOW[0].year}`;
    slides.href = `project.html?p=${SHOW[0].slug}`;
    $('#thumbs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) goAndReset($$('#thumbs button').indexOf(b)); });
    // timer: pauses while a mouse hovers the photo, while the tab is hidden and while the hero is off screen
    let hover = false, heroOn = true, elapsed = 0, last = performance.now();
    const heroMain = $('.hero'), ctrl = $('.hero__ctrl');
    ctrl.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
    ctrl.addEventListener('pointerleave', () => { hover = false; });
    const goAndReset = k => { go(k); elapsed = 0; };
    $('#slidePrev').onclick = () => goAndReset(cur - 1);
    $('#slideNext').onclick = () => goAndReset(cur + 1);
    (function tick(now) {
      requestAnimationFrame(tick);
      const dt = Math.min(100, now - last); last = now;
      if (hover || !heroOn || document.hidden) return;
      elapsed += dt;
      const p = Math.min(1, elapsed / DUR);
      progress.style.transform = `scaleX(${p})`;
      if (p >= 1) goAndReset(cur + 1);
    })(last);
    new IntersectionObserver(([e]) => { heroOn = e.isIntersecting; }).observe(heroMain);

    // marquee of materials: runs only while visible, speeds up with scrolling
    const mq = $('#marquee'), mqBox = $('.marquee');
    const run = MATS.slice(0, 10).map(m => `<span>${esc(m)}</span><svg><use href="#mark"/></svg>`).join('');
    mq.innerHTML = run + run;
    let mx = 0, boost = 0, lastSY = scrollY, half = 0, mqOn = false, mLast = performance.now();
    const measure = () => { half = mq.scrollWidth / 2; };
    measure(); addEventListener('resize', measure);
    if (document.fonts) document.fonts.ready.then(measure);
    new IntersectionObserver(([e]) => { mqOn = e.isIntersecting; }).observe(mqBox);
    (function loop(now) {
      requestAnimationFrame(loop);
      const dt = Math.min(64, now - mLast) / 16.67; mLast = now;
      if (!mqOn) return;
      const dy = scrollY - lastSY; lastSY = scrollY;
      boost += (Math.min(30, Math.abs(dy)) - boost) * .08;
      mx -= (.6 + boost * .5) * dt;
      if (half && -mx > half) mx += half;
      mq.style.transform = `translate3d(${mx.toFixed(1)}px,0,0)`;
    })(mLast);

    fill('#featured', ['terracotta-master', 'grand-dining', 'bordeaux-room', 'verde-marble'].map(s => card(byslug[s])).join(''));
    $('#allCount').textContent = `Все проекты (${PROJECTS.length})`;

    // dark index of every project
    $('#indexMeta').textContent = `${PROJECTS.length} проектов · ${new Set(PROJECTS.map(p => p.cat)).size} типов помещений`;
    fill('#index', PROJECTS.map((p, k) => `<a class="idx" href="project.html?p=${p.slug}" data-img="${img(p)}">
      <em>${pad2(k + 1)}</em><b>${esc(p.name)}</b><span>${esc(p.cat)}</span><i>${p.year}</i></a>`).join(''));
    bindPeek($$('.idx'));

    // materials library: real counts from the projects; hover shows where it is used
    fill('#mats', MATS.map(m => {
      const first = PROJECTS.find(p => p.mat.includes(m));
      return `<a class="mat" href="projects.html?mat=${encodeURIComponent(m)}" data-img="${img(first)}">${esc(m)}<sup>${matCount[m]}</sup></a>`;
    }).join(''));
    bindPeek($$('.mat'));
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
      const mc = $('[data-mat-chip]'); if (mc) mc.remove();
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
    bindPeek($$('.row'));
    // ?mat=… (from the materials library on the home page)
    const mat = new URLSearchParams(location.search).get('mat');
    if (mat && matCount[mat]) {
      $('#chips').insertAdjacentHTML('beforeend', `<button class="chip is-on" data-mat-chip>${esc(mat)} ×</button>`);
      $$('.chip:not([data-mat-chip])').forEach(b => b.classList.remove('is-on'));
      $$('.card, .row', wrap).forEach(el => el.classList.toggle('is-out', !PROJECTS.find(p => el.getAttribute('href').endsWith('=' + p.slug)).mat.includes(mat)));
      $('[data-mat-chip]').addEventListener('click', e => { e.stopPropagation(); history.replaceState(null, '', 'projects.html'); e.target.remove(); apply(''); });
    }
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
    fill('#bandImg', `<img src="${img(p)}" alt="" loading="lazy" style="object-position:50% 40%">`);
    // palette: k-means on a small copy of the photo, darkest to lightest
    const pi = new Image();
    pi.onload = () => {
      const c = document.createElement('canvas'), w = 48, h = 60; c.width = w; c.height = h;
      const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(pi, 0, 0, w, h);
      const d = x.getImageData(0, 0, w, h).data, px = [];
      for (let k = 0; k < d.length; k += 4) px.push([d[k], d[k + 1], d[k + 2]]);
      let cents = Array.from({ length: 6 }, (_, k) => px[Math.floor((k + .5) / 6 * px.length)].slice()), counts = [];
      for (let it = 0; it < 10; it++) {
        const sum = cents.map(() => [0, 0, 0]); counts = cents.map(() => 0);
        for (const q of px) {
          let best = 0, bd = Infinity;
          cents.forEach((cc, j) => { const dd = (q[0] - cc[0]) ** 2 + (q[1] - cc[1]) ** 2 + (q[2] - cc[2]) ** 2; if (dd < bd) { bd = dd; best = j; } });
          sum[best][0] += q[0]; sum[best][1] += q[1]; sum[best][2] += q[2]; counts[best]++;
        }
        cents = cents.map((cc, j) => counts[j] ? sum[j].map(v => v / counts[j]) : cc);
      }
      const hex = rgb => '#' + rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
      fill('#palette', cents.map((cc, j) => ({ cc, share: counts[j] / px.length })).filter(s => s.share > .02)
        .sort((a, b) => (a.cc[0] + a.cc[1] + a.cc[2]) - (b.cc[0] + b.cc[1] + b.cc[2]))
        .map(s => `<div class="swatch${(s.cc[0] * .299 + s.cc[1] * .587 + s.cc[2] * .114) > 150 ? ' light' : ''}" style="--c:${hex(s.cc)};flex-grow:${(s.share * 100).toFixed(1)}">
          <span>${hex(s.cc)}</span><small>${Math.round(s.share * 100)}%</small></div>`).join(''));
    };
    pi.src = img(p);
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

  /* ---------------- reveal on scroll ----------------
     Elements start hidden only for the first viewing. IntersectionObserver plays them in;
     a scroll check backs it up (bottom of the page, fast flicks, filters), so nothing stays hidden. */
  const pending = new Set();
  const show = el => { el.classList.add('is-in'); pending.delete(el); if (io) io.unobserve(el); };
  const io = 'IntersectionObserver' in window && new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) show(e.target); }), { rootMargin: '0px 0px -4% 0px' });
  function sweep() {
    const H = innerHeight, atEnd = scrollY + H >= document.documentElement.scrollHeight - 4;
    pending.forEach(el => {
      const r = el.getBoundingClientRect();
      if (atEnd || r.top < H) show(el); // anything already on or above the screen
    });
  }
  function reveal() {
    $$('[data-reveal]:not(.is-in), [data-fade]:not(.is-in), [data-lines]:not(.is-in)').forEach(el => {
      if (pending.has(el)) return;
      pending.add(el);
      if (io) io.observe(el);
    });
    sweep();
  }
  // cheap while anything is pending, free once everything has been shown
  addEventListener('scroll', () => { if (pending.size) sweep(); }, { passive: true });
  addEventListener('resize', () => pending.size && sweep());

  // headings: wrap each word so lines can rise from below (keeps inner <span class="it">)
  let wi = 0;
  const splitWords = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.append(part); return; }
        const w = document.createElement('span'); w.className = 'w';
        w.innerHTML = `<span style="--i:${wi++}"></span>`; w.firstChild.textContent = part;
        frag.append(w);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1 && !n.classList.contains('w')) splitWords(n);
  });
  $$('[data-lines]').forEach(h => { wi = 0; splitWords(h); });

  // parallax: desktop with a mouse only (on touch screens it fights native scrolling); visible photos only
  const par = $$('[data-parallax]');
  if (par.length && finePointer && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const live = new Set();
    const pio = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? live.add(e.target) : live.delete(e.target)));
    par.forEach(el => pio.observe(el));
    const upd = () => {
      const H = innerHeight;
      live.forEach(el => {
        const r = el.getBoundingClientRect();
        const k = ((r.top + r.height / 2) - H / 2) / (H / 2 + r.height / 2); // -1 … 1
        el.style.setProperty('--py', (-k * r.height * .07).toFixed(1) + 'px');
      });
    };
    let raf = 0;
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; upd(); }); }, { passive: true });
    addEventListener('resize', upd);
  } else {
    par.forEach(el => el.removeAttribute('data-parallax')); // full-size photo, no extra crop
  }

  window.CP_READY = true;
  // run right away (timers can be throttled in background tabs); with the intro, wait until it opens
  if (!$('.splash')) reveal();
})();
