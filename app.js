const cv = document.getElementById('c'), cx = cv.getContext('2d');
const MAX = 40;
let S, LW, LH, GY;
function fit() {
  const d = devicePixelRatio || 1;
  cv.width = innerWidth * d; cv.height = innerHeight * d;
  S = Math.min(innerWidth / 480, innerHeight / 320) * d;
  LW = cv.width / S; LH = cv.height / S; GY = LH * 0.72;
}
addEventListener('resize', fit); fit();

let world = 1;
try { world = Math.min(MAX, +localStorage.getItem('mundo') || 1); } catch (e) {}
function guardar() { try { localStorage.setItem('mundo', world); } catch (e) {} }

let st = 'menu', p, obs = [], len = 0, tcambio = 0;
function estado(s) { st = s; tcambio = performance.now(); }

function rnd(seed) { return () => (seed = seed * 16807 % 2147483647, (seed - 1) / 2147483646); }

function build(w) {
  const r = rnd(w * 977 + 13);
  obs = []; len = 2800 + w * 90;
  const gap = Math.max(420 - w * 8, 150);
  let x = 700;
  while (x < len) {
    const k = r(); let o;
    if (w >= 3 && k < Math.min(0.15 + w * 0.01, 0.4)) o = { t: 'p', x, w: 60 + Math.min(w * 2, 70) };
    else { const h = k < 0.6 ? 26 : (k < 0.85 || w < 5 ? 40 : 56); o = { t: 'b', x, w: h > 30 ? 30 : 24, h }; }
    obs.push(o);
    x += o.w + gap + r() * 120;
    if (o.t === 'b' && w > 12 && r() < (w - 12) * 0.012) { obs.push({ t: 'b', x: x - gap * 0.4, w: 24, h: 26 }); }
  }
}

function start() { build(world); p = { x: 0, y: 0, vy: 0, j: 0, fall: false }; estado('play'); }
function saltar() {
  if (p.fall || p.j >= 2) return;
  p.vy = 560; p.j++;
}

function tap() {
  if (st === 'play') return saltar();
  if (performance.now() - tcambio < 400) return;
  if (st === 'final') { world = 1; guardar(); return estado('menu'); }
  start();
}
cv.addEventListener('pointerdown', e => { e.preventDefault(); tap(); });
addEventListener('keydown', e => { if (e.code === 'Space' || e.code === 'ArrowUp') tap(); });

function update(dt) {
  if (st !== 'play') return;
  p.x += (190 + world * 6) * dt;
  p.vy -= 1500 * dt; p.y += p.vy * dt;
  const c = p.x + 10;
  if (!p.fall && p.y <= 0) {
    if (obs.some(o => o.t === 'p' && c > o.x + 4 && c < o.x + o.w - 4)) p.fall = true;
    else { p.y = 0; p.vy = 0; p.j = 0; }
  }
  if (p.fall && p.y < -90) return estado('dead');
  if (!p.fall && obs.some(o => o.t === 'b' && p.x + 18 > o.x && p.x + 2 < o.x + o.w && p.y < o.h)) return estado('dead');
  if (p.x > len) {
    if (world >= MAX) { guardar(); return estado('final'); }
    world++; guardar(); estado('win');
  }
}

function texto(t, y, s, col) {
  cx.fillStyle = col || '#fff'; cx.font = 'bold ' + s + 'px sans-serif'; cx.textAlign = 'center';
  cx.fillText(t, LW / 2, y);
}

function draw() {
  cx.setTransform(S, 0, 0, S, 0, 0);
  const hue = (world * 9) % 360;
  cx.fillStyle = 'hsl(' + hue + ',55%,68%)'; cx.fillRect(0, 0, LW, LH);
  cx.fillStyle = 'hsl(' + hue + ',40%,45%)';
  for (let i = 0; i < 6; i++) { const bx = ((i * 190 - (p ? p.x * 0.3 : 0)) % (LW + 190) + LW + 190) % (LW + 190) - 60; cx.fillRect(bx, GY - 60 - (i % 3) * 25, 70, 60 + (i % 3) * 25); }
  const cam = (p ? p.x : 0) - 70;
  cx.fillStyle = '#374151'; cx.fillRect(0, GY, LW, LH - GY);
  cx.fillStyle = '#111827';
  obs.forEach(o => {
    const x = o.x - cam; if (x > LW || x + o.w < 0) return;
    if (o.t === 'p') cx.fillRect(x, GY, o.w, LH - GY);
  });
  obs.forEach(o => {
    const x = o.x - cam; if (x > LW || x + o.w < 0 || o.t === 'p') return;
    cx.fillStyle = o.h > 30 ? '#b45309' : '#f97316'; cx.fillRect(x, GY - o.h, o.w, o.h);
    cx.fillStyle = '#fff'; cx.fillRect(x, GY - o.h + 5, o.w, 4);
  });
  const fx = len - cam;
  cx.fillStyle = '#fff'; cx.fillRect(fx, GY - 90, 4, 90);
  cx.fillStyle = '#ef4444'; cx.fillRect(fx + 4, GY - 90, 26, 16);
  if (p) {
    const x = p.x - cam, y = GY - p.y;
    cx.fillStyle = '#111'; cx.fillRect(x - 2, y - 8, 26, 3);
    cx.beginPath(); cx.arc(x + 2, y - 5, 5, 0, 7); cx.arc(x + 20, y - 5, 5, 0, 7); cx.fill();
    cx.fillRect(x + 19, y - 32, 2, 26);
    cx.fillStyle = '#2563eb'; cx.fillRect(x + 6, y - 32, 9, 22);
    cx.fillStyle = '#fcd34d'; cx.beginPath(); cx.arc(x + 11, y - 38, 6, 0, 7); cx.fill();
  }
  cx.textAlign = 'left'; cx.fillStyle = '#fff'; cx.font = 'bold 16px sans-serif';
  cx.fillText('Mundo ' + world + '/' + MAX, 12, 24);
  if (p) { cx.fillStyle = 'rgba(0,0,0,.35)'; cx.fillRect(12, 32, 120, 6); cx.fillStyle = '#fff'; cx.fillRect(12, 32, 120 * Math.min(p.x / len, 1), 6); }
  if (st !== 'play') {
    cx.fillStyle = 'rgba(0,0,0,.55)'; cx.fillRect(0, 0, LW, LH);
    const m = LH / 2;
    if (st === 'menu') { texto('PATÍN PARKOUR', m - 30, 32); texto('Toca para saltar (doble toque = doble salto)', m + 5, 14); texto(world > 1 ? 'Continuar: Mundo ' + world : 'Toca para empezar', m + 40, 20, '#fcd34d'); }
    if (st === 'dead') { texto('¡Te caíste!', m - 10, 30); texto('Toca para reintentar el Mundo ' + world, m + 30, 18, '#fcd34d'); }
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
