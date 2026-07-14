// Reveal on scroll, con effetto cascata per elementi vicini
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.setProperty('--d', `${(i % 4) * .12}s`);
  io.observe(el);
});

// Scroll: ombra nav + barra avanzamento, in un unico handler con rAF (leggero su mobile)
const nav = document.querySelector('nav');
const progress = document.querySelector('.scroll-progress');
let maxScroll = 0;
const recalcMax = () => { maxScroll = document.documentElement.scrollHeight - innerHeight; };
recalcMax();
addEventListener('resize', recalcMax, { passive: true });
addEventListener('load', recalcMax);
let scrollTicking = false;
addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    if (progress) progress.style.transform = `scaleX(${maxScroll > 0 ? y / maxScroll : 0})`;
    scrollTicking = false;
  });
}, { passive: true });

const isTouch = matchMedia('(hover: none)').matches;

// HOME — card "flip": tocco per girare la foto
document.querySelectorAll('.card-img--flip').forEach(box => {
  box.addEventListener('click', () => box.classList.toggle('show-alt'));
});
// HOME — la 2ª foto si rivela da sola quando la card è al centro dello schermo scorrendo
if (isTouch) {
  const flipIO = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('show-alt', e.isIntersecting));
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
  document.querySelectorAll('.card-img--flip').forEach(c => flipIO.observe(c));
}

// COLLEZIONE — carosello nativo scroll-snap: fluido, con puntini sincronizzati
document.querySelectorAll('.card-img--carousel').forEach(box => {
  const car = box.querySelector('.carousel');
  const dots = [...box.querySelectorAll('.dot-btn')];
  if (!car || dots.length < 2) return;
  // aggiorna i puntini in base alla posizione dello scroll
  let raf = false;
  car.addEventListener('scroll', () => {
    if (raf) return;
    raf = true;
    requestAnimationFrame(() => {
      const i = Math.round(car.scrollLeft / car.clientWidth);
      dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
      raf = false;
    });
  }, { passive: true });
  // click su un puntino: scorre alla foto
  dots.forEach((d, i) => d.addEventListener('click', e => {
    e.preventDefault(); e.stopPropagation();
    car.scrollTo({ left: i * car.clientWidth, behavior: 'smooth' });
  }));
  // se ho trascinato il carosello, non aprire il link della card
  let sx = 0, moved = false;
  car.addEventListener('touchstart', e => { sx = e.touches[0].clientX; moved = false; }, { passive: true });
  car.addEventListener('touchmove', e => { if (Math.abs(e.touches[0].clientX - sx) > 8) moved = true; }, { passive: true });
  const link = box.closest('a');
  if (link) link.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } });
});

// Pagina prodotto: scambio tra foto grande e miniatura
document.querySelectorAll('.product-gallery').forEach(g => {
  const main = g.querySelector('.pg-main');
  const thumbImg = g.querySelector('.pg-thumb img');
  const btn = g.querySelector('.pg-thumb');
  if (!main || !thumbImg || !btn) return;
  btn.addEventListener('click', () => {
    const tmp = main.getAttribute('src');
    main.setAttribute('src', thumbImg.getAttribute('src'));
    thumbImg.setAttribute('src', tmp);
  });
});

// Form contatto (solo pagina contatti)
const form = document.getElementById('contact-form');
if (form) {
  const status = document.getElementById('form-status');
  const submitBtn = document.getElementById('contact-submit');

  // Precompila il messaggio se arrivo da una pagina prodotto (?b=Nome)
  const borsa = new URLSearchParams(location.search).get('b');
  if (borsa) {
    const ta = form.querySelector('textarea[name="messaggio"]');
    if (ta && !ta.value) ta.value = `Ciao! Mi interessa la borsa "${borsa}". `;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    submitBtn.disabled = true;
    status.textContent = 'Invio in corso…';
    status.className = 'form-status';
    // indirizzo spezzato per non esporlo agli spam-bot che leggono il sorgente
    const dest = ['dxve', '97', '@gm', 'ail.com'].join('');
    try {
      const data = Object.fromEntries(new FormData(form));
      const res = await fetch(`https://formsubmit.co/ajax/${dest}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          ...data,
          _subject: `Nuovo messaggio dal sito — ${data.nome}`,
          _captcha: 'false',
          _template: 'table'
        })
      });
      if (!res.ok) throw new Error();
      status.textContent = 'Messaggio inviato! Ti risponderò al più presto ♥';
      status.className = 'form-status ok';
      form.reset();
    } catch {
      status.textContent = 'Ops, qualcosa è andato storto. Riprova tra poco.';
      status.className = 'form-status err';
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// Tilt 3D sulla card al movimento del mouse (solo desktop)
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Particelle fluttuanti nella hero (meno su mobile per non appesantire)
if (!reduceMotion) {
  const hero = document.querySelector('header');
  const dots = isTouch ? 7 : 16;
  for (let i = 0; i < dots; i++) {
    const d = document.createElement('span');
    d.className = 'dot';
    const size = 3 + Math.random() * 5;
    d.style.width = d.style.height = `${size}px`;
    d.style.left = `${Math.random() * 100}%`;
    d.style.bottom = `-${5 + Math.random() * 10}vh`;
    d.style.animationDuration = `${14 + Math.random() * 18}s`;
    d.style.animationDelay = `-${Math.random() * 20}s`;
    hero.appendChild(d);
  }
}

if (!reduceMotion && !isTouch) {
  // Bottoni magnetici: seguono leggermente il mouse
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * .18}px, ${y * .3}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform =
        `translateY(-6px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Parallax leggero sulla hero
  const heroInner = document.querySelector('.hero-inner');
  if (heroInner) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < innerHeight) {
        heroInner.style.transform = `translateY(${y * .25}px)`;
        heroInner.style.opacity = 1 - y / (innerHeight * .9);
      }
    }, { passive: true });
  }
}
