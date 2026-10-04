const cv = document.getElementById('c'), cx = cv.getContext('2d');
const MAX = 40;
let S, LW, LH;
function fit() {
  const d = devicePixelRatio || 1;
  cv.width = innerWidth * d; cv.height = innerHeight * d;
  cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
  S = Math.min(innerWidth / 480, innerHeight / 320) * d;
  LW = cv.width / S; LH = cv.height / S;
}
addEventListener('resize', fit); fit();

let world = 1;
try { world = Math.min(MAX, +localStorage.getItem('mundo') || 1); } catch (e) {}
const guardar = () => { try { localStorage.setItem('mundo', world); } catch (e) {} };

let st = 'menu', tc = 0, P = [], p, cp, t = 0, endX = 0, endY = 0, caidas = 0, camX = 0, camY = 0, jbuf = 0;
const keys = { l: 0, r: 0 };
const estado = s => { st = s; tc = performance.now(); };
const rnd = s => () => (s = s * 16807 % 2147483647, (s - 1) / 2147483646);

function build(w) {
  const r = rnd(w * 977 + 13);
  P = [{ x: -60, y: 380, w: 260, h: 30, k: 'n', cp: 1, bx: -60 }];
  let x = 200, y = 380, prev = 'n';
  const n = 10 + Math.floor(w * 0.6);
  const pw = Math.max(160 - w * 2, 90), gmax = Math.min(55 + w * 2, 125);
  for (let i = 1; i <= n; i++) {
    const dy = (r() - 0.5) * 80;
    y = Math.max(300, Math.min(460, y + dy));
    let gap = (dy < 0 ? gmax - 20 : gmax) * (0.6 + 0.4 * r());
    if (prev === 'm') gap *= 0.75;
    const q = r(), cpl = i % 6 === 0;
    let k = 'n';
    if (!cpl && w >= 4 && q < Math.min(0.1 + w * 0.01, 0.35)) k = 'm';
    else if (!cpl && w >= 8 && q < Math.min(0.3 + w * 0.01, 0.55)) k = 'd';
    if (k === 'm') gap *= 0.6;
    x += gap;
    const o = { x, bx: x, y, w: pw + r() * 30, h: 30, k, a: 25, sp: 1 + r() + w * 0.03, cp: cpl ? 1 : 0, tm: 0, hide: 0, dx: 0 };
    if (k === 'n' && !cpl && w >= 6 && r() < Math.min(0.1 + w * 0.01, 0.4)) o.lava = { x: o.w * 0.4, w: 22 };
    P.push(o); x += o.w; prev = k;
  }
  x += gmax * 0.6;
  P.push({ x, bx: x, y, w: 220, h: 30, k: 'n', cp: 0, end: 1, dx: 0 });
  endX = x + 100; endY = y;
}

function start() {
  build(world); t = 0; caidas = 0;
  p = { x: 60, y: 380, vx: 0, vy: 0, on: P[0], coy: 0, face: 1 };
  cp = { x: 60, y: 380 };
  camX = p.x - LW * 0.35; camY = p.y - LH * 0.62;
  estado('play');
}
function morir() {
  caidas++; p.x = cp.x; p.y = cp.y; p.vx = 0; p.vy = 0; p.on = null; p.coy = 0.1;
}
function tap() {
  if (st === 'play' || performance.now() - tc < 400) return;
  if (st === 'final') { world = 1; guardar(); return estado('menu'); }
  start();
}
cv.addEventListener('pointerdown', e => { e.preventDefault(); tap(); });

function bind(id, k) {
  const e = document.getElementById(id);
  e.addEventListener('pointerdown', ev => {
    ev.preventDefault(); e.setPointerCapture(ev.pointerId);
    if (st !== 'play') return tap();
    if (k === 'j') jbuf = 0.12; else keys[k] = 1;
  });
  const up = () => { if (k !== 'j') keys[k] = 0; };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => e.addEventListener(n, up));
}
bind('bl', 'l'); bind('br', 'r'); bind('bj', 'j');
addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.l = 1;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.r = 1;
  if (e.code === 'Space' || e.code === 'ArrowUp') { if (st === 'play') jbuf = 0.12; else tap(); }
});
addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.l = 0;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.r = 0;
});

function update(dt) {
  if (st !== 'play') return;
  t += dt;
  P.forEach(o => {
    if (o.k === 'm') { const a = o.x; o.x = o.bx + Math.sin(t * o.sp) * o.a; o.dx = o.x - a; }
    if (o.k === 'd') {
      if (o.tm > 0) { o.tm += dt; if (o.tm > 0.6) { o.hide = 1.6; o.tm = 0; } }
      if (o.hide > 0) o.hide -= dt;
      o.hidden = o.hide > 0;
    }
  });
  if (p.on && !p.on.hidden) p.x += p.on.dx;
  const max = 170 + world * 2;
  if (keys.l && !keys.r) { p.vx -= 900 * dt; p.face = -1; }
  else if (keys.r && !keys.l) { p.vx += 900 * dt; p.face = 1; }
  else p.vx -= Math.sign(p.vx) * Math.min(Math.abs(p.vx), 350 * dt);
  p.vx = Math.max(-max, Math.min(max, p.vx));
  jbuf -= dt; p.coy -= dt;
  if (jbuf > 0 && (p.on || p.coy > 0)) { p.vy = -520; p.on = null; p.coy = 0; jbuf = 0; }
  p.vy += 1400 * dt;
  const nx = p.x + p.vx * dt; let ny = p.y + p.vy * dt;
  let land = null;
  if (p.vy >= 0) {
    for (const o of P) {
      if (o.hidden) continue;
      if (p.y <= o.y + 8 && ny >= o.y && nx + 8 > o.x && nx - 8 < o.x + o.w) { land = o; ny = o.y; break; }
    }
  }
  p.x = nx; p.y = ny;
  if (land) {
    p.vy = 0; p.on = land; p.coy = 0.1;
    if (land.cp) cp = { x: land.x + land.w / 2, y: land.y };
    if (land.k === 'd' && land.tm === 0) land.tm = 0.001;
    if (land.end && p.x > endX - 60) {
      if (world >= MAX) { guardar(); return estado('final'); }
      world++; guardar(); return estado('win');
    }
  } else p.on = null;
  for (const o of P) {
    const l = o.lava;
    if (l && p.x + 8 > o.x + l.x && p.x - 8 < o.x + l.x + l.w && p.y > o.y - 14 && p.y - 36 < o.y) { morir(); break; }
  }
  if (p.y > 760) morir();
  camX = p.x - LW * 0.35;
  camY += (p.y - LH * 0.62 - camY) * Math.min(1, dt * 6);
}

function texto(s, y, sz, col) {
  cx.fillStyle = col || '#fff'; cx.font = 'bold ' + sz + 'px sans-serif'; cx.textAlign = 'center';
  cx.fillText(s, LW / 2, y);
}

function draw() {
  cx.setTransform(S, 0, 0, S, 0, 0);
  const hue = (world * 9) % 360;
  cx.fillStyle = 'hsl(' + hue + ',55%,68%)'; cx.fillRect(0, 0, LW, LH);
  cx.fillStyle = '#dc2626'; cx.fillRect(0, 640 - camY, LW, LH + 400);
  P.forEach(o => {
    if (o.hidden) return;
    const x = o.x - camX, y = o.y - camY;
    if (x > LW || x + o.w < 0) return;
    cx.fillStyle = o.k === 'm' ? '#3b82f6' : o.k === 'd' ? (o.tm > 0 && Math.floor(o.tm * 20) % 2 ? '#fde68a' : '#f59e0b') : 'hsl(' + ((hue + 180) % 360) + ',45%,40%)';
    cx.fillRect(x, y, o.w, o.h);
    cx.fillStyle = 'rgba(255,255,255,.35)'; cx.fillRect(x, y, o.w, 5);
    if (o.cp) { cx.fillStyle = '#fff'; cx.fillRect(x + o.w - 14, y - 34, 3, 34); cx.fillStyle = '#22c55e'; cx.fillRect(x + o.w - 11, y - 34, 16, 11); }
    if (o.lava) { cx.fillStyle = '#ef4444'; cx.fillRect(x + o.lava.x, y - 14, o.lava.w, 14); cx.fillStyle = '#fca5a5'; cx.fillRect(x + o.lava.x, y - 14, o.lava.w, 3); }
  });
  const ex = endX - camX, ey = endY - camY;
  cx.fillStyle = '#fff'; cx.fillRect(ex, ey - 90, 4, 90);
  cx.fillStyle = '#facc15'; cx.fillRect(ex + 4, ey - 90, 30, 18);
  if (p) {
    cx.save(); cx.translate(p.x - camX, p.y - camY); cx.scale(p.face, 1);
    cx.fillStyle = '#111'; cx.fillRect(-13, -9, 26, 3);
    cx.beginPath(); cx.arc(-10, -5, 5, 0, 7); cx.arc(10, -5, 5, 0, 7); cx.fill();
    cx.fillRect(9, -34, 2, 28);
    cx.fillStyle = '#2563eb'; cx.fillRect(-4, -34, 9, 24);
    cx.fillStyle = '#fcd34d'; cx.beginPath(); cx.arc(0, -40, 6, 0, 7); cx.fill();
    cx.restore();
    cx.textAlign = 'left'; cx.fillStyle = '#fff'; cx.font = 'bold 16px sans-serif';
    cx.fillText('Mundo ' + world + '/' + MAX + '   Caídas: ' + caidas, 12, 24);
    cx.fillStyle = 'rgba(0,0,0,.35)'; cx.fillRect(12, 32, 120, 6);
    cx.fillStyle = '#fff'; cx.fillRect(12, 32, 120 * Math.max(0, Math.min(p.x / endX, 1)), 6);
  }
  if (st !== 'play') {
    cx.fillStyle = 'rgba(0,0,0,.6)'; cx.fillRect(0, 0, LW, LH);
    const m = LH / 2;
    if (st === 'menu') { texto('OBBY SCOOTER', m - 40, 32); texto('◀ ▶ para moverte (el scooter se desliza)', m - 5, 14); texto('Llega a la bandera. Las banderas verdes guardan tu avance', m + 15, 13); texto(world > 1 ? 'Toca para continuar: Mundo ' + world : 'Toca para empezar', m + 50, 20, '#fcd34d'); }
    if (st === 'win') { texto('¡Mundo ' + (world - 1) + ' completado!', m - 10, 30); texto('Toca para ir al Mundo ' + world, m + 30, 18, '#fcd34d'); }
    if (st === 'final') { texto('¡GANASTE!', m - 10, 36); texto('Completaste los 40 mundos. Toca para jugar de nuevo', m + 30, 15, '#fcd34d'); }
  }
}

let ult = performance.now();
function loop(n) {
  const dt = Math.min((n - ult) / 1000, 0.033); ult = n;
  update(dt); draw(); requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
