/* PINK — interactions: smooth scroll, hair wave (WebGL), reveal, tabs, menu */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* ---------- Smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { offset: -20, duration: 1.4 });
      else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  document.querySelectorAll('[data-reveal]').forEach(function (el) { io ? io.observe(el) : el.classList.add('is-in'); });

  /* ---------- Tabs ---------- */
  document.querySelectorAll('[data-tab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var t = btn.getAttribute('data-tab');
      document.querySelectorAll('[data-tab]').forEach(function (b) { var on = b === btn; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
      document.querySelectorAll('[data-pane]').forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-pane') === t); });
    });
  });

  /* ---------- Mobile menu ---------- */
  var mb = document.querySelector('.navbar_menu-button'), mm = document.querySelector('.navbar_menu');
  if (mb && mm) {
    mb.addEventListener('click', function () { var o = mm.classList.toggle('is-open'); mb.setAttribute('aria-expanded', o); });
    mm.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { mm.classList.remove('is-open'); mb.setAttribute('aria-expanded', false); }); });
  }

  /* ---------- Form (demo success state) ---------- */
  var form = document.querySelector('.booking_form');
  if (form && !form.closest('.w-form')) {
    form.addEventListener('submit', function (e) { e.preventDefault(); form.style.display = 'none'; var s = document.querySelector('.form_success'); if (s) s.style.display = 'block'; });
  }

  /* ---------- Hair wave (WebGL) ---------- */
  var wrap = document.querySelector('.hero_girl');
  if (!wrap) return;
  var img = wrap.querySelector('img');
  var canvas = document.createElement('canvas');
  canvas.className = 'hero_girl-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  var gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true, antialias: false });
  if (!gl || reduce) return;

  var PAD = 0.12; // extra canvas width each side, so hair can swing outside
  var vs = 'attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
  var fs = [
    'precision mediump float;',
    'uniform sampler2D t;uniform float time,pad;uniform vec2 force;varying vec2 v;',
    'float hair(vec4 c){float l=dot(c.rgb,vec3(.299,.587,.114));return smoothstep(.2,.36,l)*c.a;}',
    'vec4 tex(vec2 u){float inb=step(0.,u.x)*step(u.x,1.)*step(0.,u.y)*step(u.y,1.);return texture2D(t,clamp(u,0.,1.))*inb;}',
    'void main(){',
    ' vec2 iuv=vec2((v.x-pad)/(1.-2.*pad),v.y);',
    ' float w=pow(smoothstep(.06,1.,v.y),1.35);',
    ' float wave=sin(v.y*11.-time*1.7+iuv.x*3.)*.55+sin(v.y*5.5-time*.9)*.45;',
    ' vec2 off=vec2(force.x*w*(1.+.45*wave)+.003*w*sin(time*.7+v.y*4.),force.y*w*.35+.0015*w*sin(time*.6+iuv.x*4.));',
    ' vec4 o=tex(iuv);vec4 m=tex(iuv-off);',
    ' float hm=hair(m),ho=hair(o);',
    ' vec4 c=m*hm+o*(1.-ho)*(1.-hm);',
    ' gl_FragColor=c;}'
  ].join('');
  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  var pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var uT = gl.getUniformLocation(pr, 'time'), uF = gl.getUniformLocation(pr, 'force');
  gl.uniform1f(gl.getUniformLocation(pr, 'pad'), PAD);
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function start() {
    var tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texImg); } catch (e) { return; }
    wrap.appendChild(canvas); wrap.classList.add('is-gl');
    resize(); window.addEventListener('resize', resize);
    requestAnimationFrame(loop);
  }
  function resize() {
    var r = img.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    var W = r.width / (1 - 2 * PAD);
    canvas.style.width = W + 'px'; canvas.style.height = r.height + 'px';
    canvas.width = Math.round(W * d); canvas.height = Math.round(r.height * d);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  // soft spring physics: hair lags behind the mouse and settles slowly
  var lastX = null, lastY = null, target = { x: 0, y: 0 }, pos = { x: 0, y: 0 }, vel = { x: 0, y: 0 }, lean = 0, leanS = 0, prevT = 0;
  window.addEventListener('pointermove', function (e) {
    if (lastX !== null) {
      var dx = Math.max(-60, Math.min(60, e.clientX - lastX)), dy = Math.max(-60, Math.min(60, e.clientY - lastY));
      target.x += dx / window.innerWidth * 0.28;
      target.y += dy / window.innerHeight * 0.12;
    }
    lastX = e.clientX; lastY = e.clientY;
    lean = (e.clientX / window.innerWidth - 0.5) * 0.014;
  }, { passive: true });
  var visible = true;
  if (io) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(wrap);
  function loop(t) {
    requestAnimationFrame(loop);
    var dt = Math.min(3, prevT ? (t - prevT) / 16.67 : 1); prevT = t;
    if (!visible) return;
    var decay = Math.pow(0.965, dt), damp = Math.pow(0.93, dt);
    target.x = Math.max(-0.055, Math.min(0.055, target.x)) * decay;
    target.y = Math.max(-0.03, Math.min(0.03, target.y)) * decay;
    leanS += (lean - leanS) * 0.03 * dt;
    vel.x = (vel.x + (target.x + leanS - pos.x) * 0.018 * dt) * damp; pos.x += vel.x * dt;
    vel.y = (vel.y + (target.y - pos.y) * 0.018 * dt) * damp; pos.y += vel.y * dt;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uT, t / 1000); gl.uniform2f(uF, pos.x, pos.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  var texImg = new Image(); texImg.crossOrigin = 'anonymous';
  texImg.onload = function () { if (img.complete && img.naturalWidth) start(); else img.addEventListener('load', start); };
  texImg.src = img.currentSrc || img.src;
})();
