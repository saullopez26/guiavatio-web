/* Guía Vatio — interacción mínima: menú móvil, índice activo y preferencias de cookies */
(function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('menu');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Resalta en el índice lateral la sección que se está leyendo
  var links = document.querySelectorAll('.toc-side a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          links.forEach(function (l) { l.classList.remove('active'); });
          map[e.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px' });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  }

  // Cierra el índice móvil al pulsar un enlace
  document.querySelectorAll('.toc-mobile a').forEach(function (a) {
    a.addEventListener('click', function () { a.closest('details').removeAttribute('open'); });
  });


  // Barra flotante con el resultado de la calculadora (solo en movil).
  // El formulario es largo: sin esto cambias un dato y el numero queda fuera
  // de pantalla. La barra repite la cifra principal y lleva al detalle.
  var calc = document.querySelector('.calc');
  var res = calc && calc.querySelector('.calc-result');
  var form = calc && calc.querySelector('.calc-form');
  var hl = res && res.querySelector('.stat.hl');
  if (res && form && hl) {
    var valor = hl.querySelector('.v');
    var clave = hl.querySelector('.k');
    var bar = document.createElement('div');
    bar.className = 'calc-mini';
    bar.setAttribute('aria-hidden', 'true');
    bar.innerHTML = '<span class="mini-txt"><span class="mini-v"></span>' +
                    '<span class="mini-k"></span></span>' +
                    '<button type="button">Ver resultado</button>';
    document.body.appendChild(bar);

    var mv = bar.querySelector('.mini-v');
    bar.querySelector('.mini-k').textContent = clave ? clave.textContent : '';
    var sincroniza = function () { mv.textContent = valor.textContent; };
    sincroniza();
    if ('MutationObserver' in window) {
      new MutationObserver(sincroniza).observe(hl, {
        childList: true, subtree: true, characterData: true
      });
    }

    bar.querySelector('button').addEventListener('click', function () {
      res.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Se muestra mientras estas en el formulario y la cifra queda fuera de pantalla.
    var estrecho = window.matchMedia('(max-width:900px)');
    var visible = function (el) {
      var r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < (window.innerHeight || 0);
    };
    var pintando = false;
    var pinta = function () {
      pintando = false;
      var ver = estrecho.matches && visible(form) && !visible(hl);
      if (ver === bar.classList.contains('show')) return;
      bar.classList.toggle('show', ver);
      bar.setAttribute('aria-hidden', ver ? 'false' : 'true');
      document.body.classList.toggle('con-mini', ver);
    };
    var pide = function () {
      if (pintando) return;
      pintando = true;
      window.requestAnimationFrame(pinta);
    };
    window.addEventListener('scroll', pide, { passive: true });
    window.addEventListener('resize', pide);
    form.addEventListener('input', pide);
    pinta();
  }

  // Reabre el mensaje de consentimiento de Google (CMP de AdSense)
  document.querySelectorAll('[data-cookie-prefs]').forEach(function (b) {
    b.addEventListener('click', function () {
      window.googlefc = window.googlefc || {};
      window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
      window.googlefc.callbackQueue.push(function () {
        if (window.googlefc.showRevocationMessage) window.googlefc.showRevocationMessage();
      });
    });
  });
})();
