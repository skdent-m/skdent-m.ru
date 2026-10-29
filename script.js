// Версия для слабовидящих (ГОСТ Р 52872-2019)
(function(){
  const btn = document.getElementById('a11yToggle');
  if (!btn) return;
  const KEY = 'a11y_mode';

  function apply(on){
    document.body.classList.toggle('accessible', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.textContent = on ? 'Обычная версия' : 'Для слабовидящих';
  }

  let saved = false;
  try { saved = localStorage.getItem(KEY) === '1'; } catch(e){}
  apply(saved);

  btn.addEventListener('click', function(){
    const on = !document.body.classList.contains('accessible');
    apply(on);
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch(e){}
  });
})();
// ===== Лайтбокс для галереи =====
(function(){
  const links = Array.from(document.querySelectorAll('.gallery-item[href]'));
  if (!links.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = `
    <button class="lightbox-btn" aria-label="Закрыть">×</button>
    <button class="lightbox-nav lightbox-prev" aria-label="Предыдущее фото">‹</button>
    <button class="lightbox-nav lightbox-next" aria-label="Следующее фото">›</button>
    <figure>
      <img src="" alt="">
      <figcaption></figcaption>
    </figure>`;
  document.body.appendChild(overlay);

  const img = overlay.querySelector('img');
  const caption = overlay.querySelector('figcaption');
  const btnClose = overlay.querySelector('.lightbox-btn');
  const btnPrev = overlay.querySelector('.lightbox-prev');
  const btnNext = overlay.querySelector('.lightbox-next');

  let current = 0;

  function open(i){
    current = (i + links.length) % links.length;
    const link = links[current];
    const source = link.querySelector('img');
    img.src = link.getAttribute('href');
    img.alt = source ? source.alt : '';
    caption.textContent = source ? source.alt : '';
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }
  function close(){
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function next(){ open(current + 1); }
  function prev(){ open(current - 1); }

  links.forEach((link, i) => {
    link.addEventListener('click', function(e){
      // не мешаем открытию в новой вкладке средней кнопкой / ctrl+клик
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      open(i);
    });
  });

  btnClose.addEventListener('click', close);
  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);

  overlay.addEventListener('click', function(e){
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', function(e){
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });
})();
// ===== Карусель врачей (стрелки + точки + свайп) =====
(function(){
  const carousel = document.getElementById('doctorsCarousel');
  const track = document.getElementById('doctorsTrack');
  const dotsWrap = document.getElementById('doctorsDots');
  if (!carousel || !track || !dotsWrap) return;

  const slides = Array.from(track.children);
  if (slides.length < 2) {
    // один врач — стрелки/точки не нужны
    carousel.querySelectorAll('.carousel-arrow').forEach(b => b.style.display = 'none');
    return;
  }

  let index = 0;

  function buildDots(){
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Врач ' + (i + 1));
      b.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(b);
    });
  }

  function update(){
    track.style.transform = 'translateX(' + (-index * 100) + '%)';
    Array.from(dotsWrap.children).forEach((d, i) => {
      d.classList.toggle('is-active', i === index);
    });
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === slides.length - 1;
  }

  function goTo(i){
    index = Math.max(0, Math.min(slides.length - 1, i));
    update();
  }
  function next(){ goTo(index + 1); }
  function prev(){ goTo(index - 1); }

  carousel.querySelector('.carousel-next').addEventListener('click', next);
  carousel.querySelector('.carousel-prev').addEventListener('click', prev);

  // Стрелки клавиатуры
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // Свайп
  let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false;
  const wrap = track.parentElement;
  wrap.addEventListener('touchstart', e => {
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY; dx = 0; dy = 0; dragging = true;
  }, {passive:true});
  wrap.addEventListener('touchmove', e => {
    if (!dragging) return;
    const t = e.touches[0];
    dx = t.clientX - startX; dy = t.clientY - startY;
  }, {passive:true});
  wrap.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next(); else prev();
    }
    dx = 0; dy = 0;
  });

  buildDots();
  update();
})();