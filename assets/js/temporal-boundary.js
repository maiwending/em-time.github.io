/* EM-Time hero: live 1-D FDTD of a pulse meeting a temporal boundary.
   Normalized Yee scheme (dx = 1, dt = 0.5, mu = 1). The permittivity of the
   whole line switches from eps1 to eps2 at t0; D and B stay continuous, so the
   wavenumber is conserved while the frequency changes and the pulse splits
   into forward and backward waves. */
(function () {
  var canvas = document.getElementById('tb-sim');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var state = document.getElementById('tb-state');

  var N = 1200, DT = 0.5;
  var EPS1 = 4, EPS2 = 1;
  var X0 = 200, W = 42, LAMBDA = 34;
  var T_SWITCH = 1000;          // steps: pulse centre reaches x ~ 450
  var T_END = 2700, T_HOLD = 60; // frames to hold the final picture
  var STEPS_PER_FRAME = 10;

  var E, D, H, eps, step, hold, e0Prev, e1Prev, eNPrev, eN1Prev, switched;

  function pulse(x) {
    var u = (x - X0) / W;
    return Math.exp(-u * u) * Math.sin(2 * Math.PI * (x - X0) / LAMBDA);
  }

  function reset() {
    E = new Float64Array(N); D = new Float64Array(N); H = new Float64Array(N);
    eps = EPS1; step = 0; hold = 0; switched = false;
    var c = 1 / Math.sqrt(EPS1), eta = 1 / Math.sqrt(EPS1); // wave impedance (mu = 1)
    for (var i = 0; i < N; i++) {
      E[i] = pulse(i);
      D[i] = eps * E[i];
      // right-going wave: H = -E / eta, sampled half a cell and half a step later
      H[i] = -pulse(i + 0.5 - c * DT / 2) / eta;
    }
    e0Prev = E[0]; e1Prev = E[1]; eNPrev = E[N - 1]; eN1Prev = E[N - 2];
  }

  function advance() {
    var i;
    for (i = 0; i < N - 1; i++) H[i] += DT * (E[i + 1] - E[i]);
    for (i = 1; i < N; i++) { D[i] += DT * (H[i] - H[i - 1]); E[i] = D[i] / eps; }
    // first-order Mur absorbing boundaries for the current wave speed
    var c = 1 / Math.sqrt(eps), k = (c * DT - 1) / (c * DT + 1);
    E[0] = e1Prev + k * (E[1] - e0Prev);
    E[N - 1] = eN1Prev + k * (E[N - 2] - eNPrev);
    D[0] = eps * E[0]; D[N - 1] = eps * E[N - 1];
    e0Prev = E[0]; e1Prev = E[1]; eNPrev = E[N - 1]; eN1Prev = E[N - 2];
    step++;
    if (step === T_SWITCH) { eps = EPS2; switched = true; } // D is continuous: E jumps
  }

  var w = 0, h = 0;
  function resize() {
    var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  var css = getComputedStyle(document.documentElement);
  var GREEN = (css.getPropertyValue('--signal') || '#a8ee62').trim();
  var GRID = 'rgba(255,255,255,0.07)';

  function draw() {
    ctx.clearRect(0, 0, w, h);
    var mid = h * 0.5, amp = h * 0.13; // initial pulse = 0.13 h; forward wave ~3x after switch
    ctx.strokeStyle = GRID; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(w, mid); ctx.stroke();

    ctx.strokeStyle = GREEN; ctx.lineWidth = 1.6; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (var px = 0; px <= w; px++) {
      var x = (px / w) * (N - 1), i = Math.floor(x), f = x - i;
      var v = i < N - 1 ? E[i] * (1 - f) + E[i + 1] * f : E[N - 1];
      var y = mid - Math.max(-3.6, Math.min(3.6, v)) * amp;
      if (px === 0) ctx.moveTo(px, y); else ctx.lineTo(px, y);
    }
    ctx.stroke();
    if (state) {
      var s = switched ? 'after' : 'before';
      if (state.getAttribute('data-phase') !== s) {
        state.setAttribute('data-phase', s);
        state.textContent = switched ? 'After t₀: ε = ε₀' : 'Before t₀: ε = 4ε₀';
      }
    }
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var running = false, visible = true;

  function frame() {
    if (!running) return;
    if (step < T_END) { for (var k = 0; k < STEPS_PER_FRAME; k++) advance(); }
    else if (++hold > T_HOLD) reset();
    draw();
    requestAnimationFrame(frame);
  }
  function start() { if (!running && visible && !reduce) { running = true; requestAnimationFrame(frame); } }
  function stop() { running = false; }

  resize(); reset();
  if (reduce) { while (step < 1900) advance(); draw(); }
  else { draw(); start(); }

  window.addEventListener('resize', function () { resize(); draw(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; visible ? start() : stop(); }).observe(canvas);
  }
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
})();
