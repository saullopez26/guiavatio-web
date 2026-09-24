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



  // Los campos de las calculadoras vienen rellenos con un ejemplo para que el
  // resultado se vea nada mas entrar. Se pintan en gris para que se note que no
  // son datos del usuario, y al pulsar en uno se selecciona todo: asi se escribe
  // encima en vez de anadir digitos detras.
  var forms = document.querySelectorAll('.calc-form');
  if (forms.length) {
    var marca = function (c) {
      if (c.dataset.ejemploVisto) { return; }
      c.dataset.ejemploVisto = '1';
      var vacio = (c.tagName === 'INPUT' && c.value === '');
      if (!vacio && c.type !== 'checkbox') { c.classList.add('ejemplo'); }
    };
    var mios = function (c) { c.classList.remove('ejemplo'); c.dataset.ejemploVisto = '1'; };

    var repasa = function () {
      forms.forEach(function (f) {
        f.querySelectorAll('input, select').forEach(marca);
      });
    };
    repasa();
    // La calculadora de consumo crea sus filas por JS: se repasa al terminar.
    window.setTimeout(repasa, 0);

    forms.forEach(function (f) {
      // select() no es fiable en <input type=number> ni en movil, asi que
      // ademas se vacia el campo al primer caracter: se escribe encima.
      var seleccionable = function (c) {
        return c.classList && c.classList.contains('ejemplo') && c.tagName === 'INPUT' &&
               (c.type === 'number' || c.type === 'text');
      };
      var seleccionaTodo = function (e) {
        var c = e.target;
        if (!seleccionable(c)) { return; }
        window.setTimeout(function () { try { c.select(); } catch (err) {} }, 0);
      };
      f.addEventListener('focusin', seleccionaTodo);
      f.addEventListener('click', seleccionaTodo);
      f.addEventListener('keydown', function (e) {
        var c = e.target;
        if (!seleccionable(c)) { return; }
        if (e.ctrlKey || e.metaKey || e.altKey) { return; }
        if (e.key && e.key.length === 1) { c.value = ''; }
      });
      f.addEventListener('input', function (e) { if (e.target.classList) { mios(e.target); } });
      f.addEventListener('change', function (e) { if (e.target.classList) { mios(e.target); } });
      f.addEventListener('click', function (e) {
        // los botones de ejemplo rapido rellenan varios campos a la vez
        if (e.target.closest && e.target.closest('.presets, .btn-small')) {
          window.setTimeout(repasa, 0);
        }
      });
    });
  }

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
