const $ = id => document.getElementById(id), MAX = 40;
if (typeof THREE === 'undefined') { $('ov').innerHTML = '<b>Necesitas internet</b><small>La primera vez se descarga el motor 3D. Conéctate y vuelve a abrir.</small>'; throw 0; }
const R = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true });
R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(60, 1, 0.1, 400);
function fit() { R.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.fov = cam.aspect < 1 ? 80 : 60; cam.updateProjectionMatrix(); }
addEventListener('resize', fit); fit();
sc.add(new THREE.HemisphereLight(0xffffff, 0x445566, 0.95));
const sun = new THREE.DirectionalLight(0xffffff, 0.55); sun.position.set(5, 10, 6); sc.add(sun);
const BX = new THREE.BoxGeometry(1, 1, 1);
const lava = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
lava.rotation.x = -Math.PI / 2; sc.add(lava);
const disc = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }));
disc.rotation.x = -Math.PI / 2; sc.add(disc);
for (let i = 0; i < 14; i++) {
  const c = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }));
  c.scale.set(8 + (i % 4) * 3, 2, 4); c.position.set((i % 5 - 2) * 40, 30 + (i % 3) * 6, -i * 110 + 40); sc.add(c);
}
const mat = c => new THREE.MeshLambertMaterial({ color: c });
const H = new THREE.Group();
(function () {
  const a = (g, c, x, y, z, rz) => { const m = new THREE.Mesh(g, mat(c)); m.position.set(x, y, z); if (rz) m.rotation.z = rz; H.add(m); };
  a(new THREE.BoxGeometry(.5, .08, 1.4), 0x222222, 0, .25, 0);
  a(new THREE.CylinderGeometry(.2, .2, .12, 12), 0x111111, 0, .2, -.6, Math.PI / 2);
  a(new THREE.CylinderGeometry(.2, .2, .12, 12), 0x111111, 0, .2, .6, Math.PI / 2);
  a(new THREE.BoxGeometry(.06, 1.1, .06), 0xcccccc, 0, .8, -.6);
  a(new THREE.BoxGeometry(.7, .06, .06), 0xcccccc, 0, 1.35, -.6);
  a(new THREE.CylinderGeometry(.22, .26, .8, 10), 0x2563eb, 0, .75, .1);
  a(new THREE.SphereGeometry(.24, 12, 10), 0xfcd34d, 0, 1.45, .1);
  a(new THREE.SphereGeometry(.27, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xef4444, 0, 1.5, .1);
})();
sc.add(H);

let world = 1;
try { world = Math.min(MAX, +localStorage.getItem('mundo') || 1); } catch (e) {}
const guardar = () => { try { localStorage.setItem('mundo', world); } catch (e) {} };
const rnd = s => () => (s = s * 16807 % 2147483647, (s - 1) / 2147483646);

let st = 'menu', tc = 0, W, P = [], p, cp, t = 0, endZ = 0, caidas = 0, jb = 0, jx = 0, jz = 0, kx = 0, kz = 0;
const keys = { l: 0, r: 0, u: 0, d: 0 };

function build(w) {
  if (W) sc.remove(W);
  W = new THREE.Group(); sc.add(W);
  const r = rnd(w * 977 + 13), hue = (w * 9) % 360;
  const col = new THREE.Color().setHSL(hue / 360, .6, .72);
  sc.background = col; sc.fog = new THREE.Fog(col, 35, 140);
  const M = (h, s, l) => mat(new THREE.Color().setHSL(h / 360, s, l));
  const mN = [M((hue + 180) % 360, .5, .5), M((hue + 150) % 360, .5, .58)], mM = M(215, .8, .55), mR = M(0, .85, .5), mF = M(130, .7, .5), mG = M(48, .9, .55), mW = mat(0xffffff);
  const box = (x, y, z, w, h, d, m) => { const o = new THREE.Mesh(BX, m); o.scale.set(w, h, d); o.position.set(x, y, z); W.add(o); return o; };
  const flag = (x, y, z, m, hgt) => { box(x, y + hgt / 2, z, .12, hgt, .12, mW); box(x + .5, y + hgt - .4, z, 1, .6, .08, m); };
  const add = (o, m) => { o.mesh = box(o.x, o.y - .5, o.z, o.w, 1, o.d, o.k === 'd' ? m.clone() : m); o.bx = o.x; o.dx = 0; o.tm = 0; o.hide = 0; P.push(o); return o; };
  P = [];
  const sz = Math.max(8 - w * .1, 4), n = 10 + Math.floor(w * .6), gmax = Math.min(2 + w * .08, 5.2);
  add({ x: 0, y: 0, z: 0, w: 10, d: 10, k: 'n', cp: 1 }, mN[0]);
  let prev = 'n';
  for (let i = 1; i <= n; i++) {
    const cpl = i % 6 === 0, q = r(); let k = 'n';
    if (!cpl && w >= 4 && q < Math.min(.1 + w * .01, .35)) k = 'm';
    else if (!cpl && w >= 8 && q < Math.min(.3 + w * .01, .55)) k = 'd';
    const d = sz + r() * 1.5, pz = P[P.length - 1];
    let gap = gmax * (.6 + .4 * r()); if (k === 'm') gap *= .6; if (prev === 'm') gap *= .75;
    const dy = Math.max(-1.5, Math.min(1.3, (r() - .4) * 2.4));
    const x = Math.max(-6, Math.min(6, pz.bx + (r() - .5) * sz * 1.2));
    const o = add({ x, y: pz.y + dy, z: pz.z - pz.d / 2 - gap - d / 2, w: sz + r() * 1.5, d, k, a: 2, sp: .8 + r() * .5 + w * .01, cp: cpl ? 1 : 0 }, k === 'm' ? mM : k === 'd' ? mG : mN[i % 2]);
    if (k === 'n' && !cpl && w >= 6 && r() < Math.min(.1 + w * .01, .4)) { o.lava = { w: o.w * .4 }; box(o.x, o.y + .35, o.z, o.lava.w, .7, 1.2, mR); }
    if (cpl) flag(o.x + o.w / 2 - .6, o.y, o.z, mF, 2.6);
    prev = k;
  }
  const l = P[P.length - 1];
  const e = add({ x: l.bx, y: l.y, z: l.z - l.d / 2 - gmax * .6 - 5, w: 12, d: 10, k: 'n', cp: 0, end: 1 }, mG);
  flag(e.x, e.y, e.z, mG, 5); endZ = e.z;
}

function ov(h) { const o = $('ov'); if (h === null) o.style.display = 'none'; else { o.innerHTML = h; o.style.display = 'flex'; tc = performance.now(); } }
function menu() { st = 'menu'; ov('<b>OBBY SCOOTER 3D</b><small>Joystick a la izquierda: moverte (el scooter se desliza)<br>Botón SALTAR: saltar<br>Llega a la bandera dorada. Las banderas verdes guardan tu avance.</small><span>' + (world > 1 ? 'Toca para continuar: Mundo ' + world : 'Toca para empezar') + '</span>'); }
function start() {
  build(world); t = 0; caidas = 0;
  p = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, on: P[0], coy: 0, yaw: 0 };
  cp = { x: 0, y: 0, z: 0 }; cam.position.set(0, 6, 10); st = 'play'; ov(null);
}
function morir() { caidas++; p.x = cp.x; p.y = cp.y + .05; p.z = cp.z; p.vx = p.vy = p.vz = 0; p.on = null; p.coy = .1; }
$('ov').addEventListener('pointerdown', () => {
  if (performance.now() - tc < 400) return;
  if (st === 'final') { world = 1; guardar(); menu(); } else start();
});

const zl = $('zl'), base = $('base'), knob = $('knob'); let oid = null, ox = 0, oy = 0;
zl.addEventListener('pointerdown', e => { if (st !== 'play') return; oid = e.pointerId; zl.setPointerCapture(oid); ox = e.clientX; oy = e.clientY; base.style.left = ox + 'px'; base.style.top = oy + 'px'; base.style.display = 'block'; });
zl.addEventListener('pointermove', e => {
  if (e.pointerId !== oid) return;
  let dx = (e.clientX - ox) / 50, dz = (e.clientY - oy) / 50; const m = Math.hypot(dx, dz);
  if (m > 1) { dx /= m; dz /= m; } jx = dx; jz = dz; knob.style.transform = 'translate(' + dx * 35 + 'px,' + dz * 35 + 'px)';
});
const jup = e => { if (e.pointerId !== oid) return; oid = null; jx = jz = 0; base.style.display = 'none'; knob.style.transform = ''; };
['pointerup', 'pointercancel'].forEach(n => zl.addEventListener(n, jup));
$('bj').addEventListener('pointerdown', e => { e.preventDefault(); if (st === 'play') jb = .12; });
const K = { ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd' };
addEventListener('keydown', e => { if (K[e.code]) keys[K[e.code]] = 1; if (e.code === 'Space') { if (st === 'play') jb = .12; else $('ov').dispatchEvent(new Event('pointerdown')); } });
addEventListener('keyup', e => { if (K[e.code]) keys[K[e.code]] = 0; });

function update(dt) {
  if (st !== 'play') return;
  t += dt;
  P.forEach(o => {
    if (o.k === 'm') { const a = o.x; o.x = o.bx + Math.sin(t * o.sp) * o.a; o.dx = o.x - a; o.mesh.position.x = o.x; }
    if (o.k === 'd') {
      if (o.tm > 0) { o.tm += dt; o.mesh.material.emissive.setHex(Math.floor(o.tm * 15) % 2 ? 0x884400 : 0); if (o.tm > .7) { o.hide = 1.8; o.tm = 0; } }
      if (o.hide > 0) { o.hide -= dt; if (o.hide <= 0) o.mesh.material.emissive.setHex(0); }
      o.hidden = o.hide > 0; o.mesh.visible = !o.hidden;
    }
  });
  if (p.on && !p.on.hidden) p.x += p.on.dx;
  let ix = jx + keys.r - keys.l, iz = jz + keys.d - keys.u; const m = Math.hypot(ix, iz);
  if (m > 1) { ix /= m; iz /= m; }
  const max = 8 + world * .08;
  if (m > .05) { const c = p.on ? 1 : .5; p.vx += ix * 28 * c * dt; p.vz += iz * 28 * c * dt; }
  else if (p.on) { const sp = Math.hypot(p.vx, p.vz), f = Math.min(sp, 10 * dt); if (sp > 0) { p.vx -= p.vx / sp * f; p.vz -= p.vz / sp * f; } }
  const sp2 = Math.hypot(p.vx, p.vz); if (sp2 > max) { p.vx *= max / sp2; p.vz *= max / sp2; }
  jb -= dt; p.coy -= dt;
  if (jb > 0 && (p.on || p.coy > 0)) { p.vy = 9.5; p.on = null; p.coy = 0; jb = 0; }
  p.vy -= 24 * dt;
  const nx = p.x + p.vx * dt, nz = p.z + p.vz * dt; let ny = p.y + p.vy * dt, land = null;
  if (p.vy <= 0) for (const o of P) {
    if (o.hidden) continue;
    if (p.y >= o.y - .4 && ny <= o.y && Math.abs(nx - o.x) < o.w / 2 + .25 && Math.abs(nz - o.z) < o.d / 2 + .25) { land = o; ny = o.y; break; }
  }
  p.x = nx; p.y = ny; p.z = nz;
  if (land) {
    p.vy = 0; p.on = land; p.coy = .12;
    if (land.cp) cp = { x: land.x, y: land.y, z: land.z };
    if (land.k === 'd' && land.tm === 0) land.tm = .001;
    if (land.end) { if (world >= MAX) { guardar(); st = 'final'; return ov('<b>¡GANASTE!</b><small>Completaste los 40 mundos</small><span>Toca para jugar de nuevo</span>'); } world++; guardar(); st = 'win'; return ov('<b>¡Mundo ' + (world - 1) + ' completado!</b><span>Toca para ir al Mundo ' + world + '</span>'); }
  } else p.on = null;
  for (const o of P) if (o.lava && Math.abs(p.x - o.x) < o.lava.w / 2 + .2 && Math.abs(p.z - o.z) < .8 && p.y < o.y + .7) { morir(); break; }
  if (p.y < -10) morir();
}

let yaw = 0, hudT = '';
function render(dt) {
  H.position.set(p.x, p.y, p.z);
  if (Math.hypot(p.vx, p.vz) > 1) { const tg = Math.atan2(-p.vx, -p.vz); let d = tg - yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); yaw += d * Math.min(1, dt * 10); }
  H.rotation.y = yaw;
  let top = null;
  for (const o of P) if (!o.hidden && o.y <= p.y + .3 && Math.abs(p.x - o.x) < o.w / 2 && Math.abs(p.z - o.z) < o.d / 2 && (top === null || o.y > top)) top = o.y;
  disc.visible = top !== null;
  if (top !== null) { disc.position.set(p.x, top + .03, p.z); disc.scale.setScalar(Math.max(.4, 1.5 - (p.y - top) * .2)); }
  lava.position.set(p.x, -9, p.z);
  const por = cam.aspect < 1;
  cam.position.lerp(new THREE.Vector3(p.x * .7, p.y + (por ? 7 : 5.2), p.z + (por ? 12 : 8.5)), Math.min(1, dt * 5));
  cam.lookAt(p.x * .85, p.y + 1.2, p.z - 5);
  const h = 'Mundo ' + world + '/' + MAX + '   Caídas: ' + caidas;
  if (h !== hudT) { $('hud').textContent = h; hudT = h; }
  $('fill').style.width = Math.max(0, Math.min(p.z / endZ, 1)) * 100 + '%';
  R.render(sc, cam);
}

build(world);
p = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, on: P[0], coy: 0, yaw: 0 }; cp = { x: 0, y: 0, z: 0 };
menu();
let ult = performance.now();
function loop(n) { const dt = Math.min((n - ult) / 1000, .033); ult = n; update(dt); render(dt); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
