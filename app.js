function main() {
const $ = id => document.getElementById(id), MAX = 40;
const R = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true });
R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(60, 1, 0.1, 400);
function fit() { R.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.fov = cam.aspect < 1 ? 80 : 60; cam.updateProjectionMatrix(); }
addEventListener('resize', fit); fit();
sc.add(new THREE.HemisphereLight(0xffffff, 0x445566, 0.95));
const sun = new THREE.DirectionalLight(0xffffff, 0.55); sun.position.set(5, 10, 6); sc.add(sun); sc.add(sun.target);
sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 80 }); sun.shadow.bias = -.001;
const BX = new THREE.BoxGeometry(1, 1, 1);
const lava = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
lava.rotation.x = -Math.PI / 2; sc.add(lava);
const disc = new THREE.Mesh(new THREE.CircleGeometry(0.5, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 }));
disc.rotation.x = -Math.PI / 2; sc.add(disc);
const clouds = [];
for (let i = 0; i < 14; i++) {
  const c = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }));
  c.scale.set(8 + (i % 4) * 3, 2, 4); c.position.set((i % 5 - 2) * 40, 30 + (i % 3) * 6, -i * 110 + 40); sc.add(c); clouds.push(c);
}
const mat = c => new THREE.MeshLambertMaterial({ color: c });
const H = new THREE.Group(); let deckM;
(function () {
  const a = (g, c, x, y, z, rz) => { const m = new THREE.Mesh(g, mat(c)); m.position.set(x, y, z); if (rz) m.rotation.z = rz; H.add(m); return m; };
  deckM = a(new THREE.BoxGeometry(.5, .08, 1.4), 0x222222, 0, .25, 0);
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

const TH = [
  { sky: 0x8fd3ff, a: 0x4caf50, b: 0x66bb6a, fl: 0x1e6fd9, fr: 10, dc: 0x2e7d32, g: [0, 3, 6] },
  { sky: 0xffd59a, a: 0xd9a05b, b: 0xe8b673, fl: 0xb7791f, fr: 10, dc: 0x3f8f3f, g: [1.2, 1.2, 8] },
  { sky: 0xcfe9ff, a: 0x9fdcf5, b: 0xc4ecff, fl: 0x1d4ed8, fr: 3, dc: 0xe0f2fe, g: [0, 2.2, 5] },
  { sky: 0x1b1040, a: 0x7c3aed, b: 0xdb2777, fl: 0x0f0f2e, fr: 9, dc: 0x22d3ee, g: [1, 1, 4] },
  { sky: 0x5a1a12, a: 0x57534e, b: 0x78716c, fl: 0xdc2626, fr: 10, dc: 0x44403c, g: [2, 3.5, 5] }
];
const NOM = ['Pradera', 'Desierto', 'Hielo', 'Noche neón', 'Volcán'];
let FR = 10, thN = '';
let G = 1; try { const gs = localStorage.getItem('graficos'); if (gs !== null && +gs >= 0 && +gs <= 2) G = +gs; } catch (e) {}
const DEC = [0, 40, 110];
function build(w) {
  if (W) sc.remove(W);
  W = new THREE.Group(); sc.add(W);
  const r = rnd(w * 977 + 13), ti = (w - 1) % 5, th = TH[ti], lay = (w * 3 + 1) % 4;
  FR = th.fr; thN = NOM[ti];
  const col = new THREE.Color(th.sky); sc.background = col; sc.fog = new THREE.Fog(col, 35, [80, 140, 220][G]);
  lava.material.color.setHex(th.fl);
  const mN = [mat(th.a), mat(th.b)], mM = mat(0x3b82f6), mR = mat(0xef4444), mF = mat(0x22c55e), mG = mat(0xf59e0b), mW = mat(0xffffff);
  const box = (x, y, z, w, h, d, m) => { const o = new THREE.Mesh(BX, m); o.scale.set(w, h, d); o.position.set(x, y, z); o.castShadow = o.receiveShadow = G === 2; W.add(o); return o; };
  const flag = (x, y, z, m, hgt) => { box(x, y + hgt / 2, z, .12, hgt, .12, mW); box(x + .5, y + hgt - .4, z, 1, .6, .08, m); };
  const add = (o, m) => { o.mesh = box(o.x, o.y - .5, o.z, o.w, 1, o.d, o.k === 'd' ? m.clone() : m); o.bx = o.x; o.dx = 0; o.tm = 0; o.hide = 0; P.push(o); return o; };
  P = [];
  const sz = Math.max(8 - w * .11, 3.8), n = 12 + Math.floor(w * .7), gmax = Math.min(2.3 + w * .09, 5.8);
  add({ x: 0, y: 0, z: 0, w: 10, d: 10, k: 'n', cp: 1 }, mN[0]);
  let prev = 'n';
  for (let i = 1; i <= n; i++) {
    const cpl = i % 6 === 0, q = r(); let k = 'n';
    if (!cpl && w >= 3 && q < Math.min(.12 + w * .01, .38)) k = 'm';
    else if (!cpl && w >= 7 && q < Math.min(.32 + w * .01, .58)) k = 'd';
    const d = sz + r() * 1.5, pz = P[P.length - 1];
    let gap = gmax * (.6 + .4 * r()); if (k === 'm') gap *= .6; if (prev === 'm') gap *= .75;
    const dy = Math.max(-1.5, Math.min(1.3, (r() - .5 + (lay === 2 ? .25 : lay === 3 ? -.1 : 0)) * 2.4));
    const x = lay === 1 ? (i % 2 ? 1 : -1) * sz * .8 : Math.max(-6, Math.min(6, pz.bx + (r() - .5) * sz * 1.2));
    const o = add({ x, y: pz.y + dy, z: pz.z - pz.d / 2 - gap - d / 2, w: sz + r() * 1.5, d, k, a: 2, sp: .8 + r() * .5 + w * .01, cp: cpl ? 1 : 0 }, k === 'm' ? mM : k === 'd' ? mG : mN[i % 2]);
    if (k === 'n' && !cpl && w >= 4 && r() < Math.min(.1 + w * .01, .4)) { o.lava = { w: o.w * .4 }; box(o.x, o.y + .35, o.z, o.lava.w, .7, 1.2, mR); }
    if (cpl) flag(o.x + o.w / 2 - .6, o.y, o.z, mF, 2.6);
    prev = k;
  }
  const l = P[P.length - 1];
  const e = add({ x: l.bx, y: l.y, z: l.z - l.d / 2 - gmax * .6 - 5, w: 12, d: 10, k: 'n', cp: 0, end: 1 }, mG);
  flag(e.x, e.y, e.z, mG, 5); endZ = e.z;
  for (let i = 0; i < DEC[G]; i++) {
    const h = 8 + r() * 14, g = th.g;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(g[0], g[1], h, g[2]), ti === 3 ? new THREE.MeshBasicMaterial({ color: th.dc }) : mat(th.dc));
    m.position.set((r() < .5 ? -1 : 1) * (14 + r() * 20), -9 + h / 2, endZ * r()); W.add(m);
  }
}

let coins = 0, owned = ['0'], eq = '0', done = 0, cy = 0, ST = { s: 1, a: 1, j: 1 };
try { coins = +localStorage.getItem('monedas') || 0; owned = JSON.parse(localStorage.getItem('patines') || '["0"]'); eq = localStorage.getItem('equipado') || '0'; done = +localStorage.getItem('hecho') || 0; } catch (e) {}
const sv = () => { try { localStorage.setItem('mundo', world); localStorage.setItem('monedas', coins); localStorage.setItem('patines', JSON.stringify(owned)); localStorage.setItem('equipado', eq); localStorage.setItem('hecho', done); } catch (e) {} };
const SC = [
  { id: '0', n: 'Clásico', pr: 0, s: 0, a: 0, j: 0, c: 0x222222 },
  { id: '1', n: 'Turbo Rojo', pr: 150, s: .08, a: .1, j: 0, c: 0xdc2626 },
  { id: '2', n: 'Rayo Azul', pr: 400, s: .12, a: .15, j: .06, c: 0x2563eb },
  { id: '3', n: 'Dorado Pro', pr: 800, s: .16, a: .2, j: .1, c: 0xfacc15 },
  { id: '4', n: 'Cohete Espacial', pr: 1400, s: .2, a: .3, j: .14, c: 0x7c3aed }
];
function aplicar() { const s = SC.find(x => x.id === eq) || SC[0]; ST = { s: 1 + s.s, a: 1 + s.a, j: 1 + s.j }; deckM.material.color.setHex(s.c); }
function ov(h) { const o = $('ov'); if (h === null) o.style.display = 'none'; else { o.innerHTML = '<div class="in">' + h + '</div>'; o.style.display = 'flex'; tc = performance.now(); } }
const bt = (a, t, c) => '<button class="' + (c || '') + '" data-a="' + a + '">' + t + '</button>';
function menu() { st = 'menu'; ov('<b>OBBY SCOOTER 3D</b><small>Joystick: moverte · Arrastra a la derecha: girar la cámara<br>SALTAR: saltar · Banderas verdes: checkpoint</small><span>🪙 ' + coins + '</span>' + bt('play', world > 1 ? 'Continuar: Mundo ' + world : 'Jugar') + bt('shop', 'Tienda') + bt('cfg', 'Configuración')); }
function tienda() {
  st = 'shop';
  ov('<b>TIENDA</b><span>🪙 ' + coins + '</span>' + SC.map(s => {
    const has = owned.includes(s.id), on = eq === s.id;
    return '<div class="row"><div>' + s.n + '<br><small>Vel +' + Math.round(s.s * 100) + '% · Acel +' + Math.round(s.a * 100) + '% · Salto +' + Math.round(s.j * 100) + '%</small></div>' + (on ? '<span>Equipado</span>' : has ? bt('e:' + s.id, 'Equipar') : bt('b:' + s.id, '🪙 ' + s.pr, coins < s.pr ? 'no' : '')) + '</div>';
  }).join('') + bt('menu', 'Volver'));
}
function comprar(id) { const s = SC.find(x => x.id === id); if (!s || owned.includes(id) || coins < s.pr) return; coins -= s.pr; owned.push(id); eq = id; sv(); aplicar(); tienda(); }
function equipar(id) { if (!owned.includes(id)) return; eq = id; sv(); aplicar(); tienda(); }
const ADMIN = 'admin123'; // <-- CAMBIA ESTA CLAVE por la tuya
function gfx(n) {
  G = n; try { localStorage.setItem('graficos', n); } catch (e) {}
  const d = devicePixelRatio || 1;
  R.setPixelRatio([Math.min(d, 1) * .75, Math.min(d, 1.25), Math.min(d, 2)][n]); fit();
  R.shadowMap.enabled = n === 2; sun.castShadow = n === 2;
  clouds.forEach(c => c.visible = n > 0);
  H.traverse(o => { if (o.isMesh) { o.castShadow = n === 2; if (o.material) o.material.needsUpdate = true; } });
}
function cambiarG(n) { gfx(n); build(world); p = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, on: P[0], coy: 0, yaw: 0 }; cp = { x: 0, y: 0, z: 0 }; config(); }
function config() {
  st = 'cfg';
  ov('<b>CONFIGURACIÓN</b><small>Gráficos</small><div class="seg">' + ['Suave', 'Estándar', 'Ultra'].map((n, i) => bt('g:' + i, n, G === i ? 'on' : '')).join('') + '</div><small>' + ['Más fluido y rápido, con menos detalle', 'Equilibrado', 'Sombras reales, más detalle y más distancia (gasta más batería)'][G] + '</small><small>Código</small><input id="cod" type="password" placeholder="Código" autocomplete="off">' + bt('adm', 'Entrar') + bt('menu', 'Volver'));
}
function entrar() { const i = $('cod'); if (i && i.value === ADMIN) admin(); else if (i) { i.value = ''; i.placeholder = 'Código incorrecto'; } }
function admin() {
  st = 'adm';
  ov('<b>ADMINISTRADOR</b><span>🪙 ' + coins + ' · Mundo ' + world + '</span>' + bt('a:coins', '+1000 monedas') + bt('a:all', 'Desbloquear todos los scooters') + '<input id="wn" type="number" min="1" max="40" placeholder="Mundo (1-40)">' + bt('a:go', 'Ir al mundo') + bt('a:reset', 'Borrar progreso') + bt('menu', 'Salir'));
}
function accion(x) {
  if (x === 'coins') coins += 1000;
  else if (x === 'all') owned = SC.map(s => s.id);
  else if (x === 'go') { const n = Math.floor(+$('wn').value || 0); if (n >= 1 && n <= MAX) { world = n; sv(); return menu(); } }
  else if (x === 'reset') { coins = 0; owned = ['0']; eq = '0'; done = 0; world = 1; aplicar(); }
  sv(); admin();
}
function start() {
  build(world); aplicar(); t = 0; caidas = 0; cy = 0;
  p = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, on: P[0], coy: 0, yaw: 0 };
  cp = { x: 0, y: 0, z: 0 }; cam.position.set(0, 6, 10); st = 'play'; ov(null);
}
function morir() { caidas++; p.x = cp.x; p.y = cp.y + .05; p.z = cp.z; p.vx = p.vy = p.vz = 0; p.on = null; p.coy = .1; }
function terminar() {
  const gan = world > done ? 20 + world * 3 + (caidas === 0 ? 5 : 0) : 5;
  if (world > done) done = world;
  coins += gan;
  if (world >= MAX) { sv(); st = 'final'; return ov('<b>¡GANASTE!</b><small>Completaste los 40 mundos<br>+' + gan + ' monedas</small>' + bt('shop', 'Tienda') + bt('play', 'Jugar de nuevo')); }
  world++; sv(); st = 'win';
  ov('<b>¡Mundo ' + (world - 1) + ' completado!</b><small>+' + gan + ' monedas · Total 🪙 ' + coins + '</small>' + bt('play', 'Siguiente: Mundo ' + world) + bt('shop', 'Tienda'));
}
$('ov').addEventListener('pointerdown', e => {
  const a = e.target.dataset && e.target.dataset.a;
  if (!a || performance.now() - tc < 300) return;
  if (a === 'play') { if (st === 'final') { world = 1; sv(); } start(); }
  else if (a === 'shop') tienda(); else if (a === 'menu') menu(); else if (a === 'cfg') config(); else if (a === 'adm') entrar(); else if (a[0] === 'g') cambiarG(+a.slice(2)); else if (a.startsWith('a:')) accion(a.slice(2));
  else if (a[0] === 'b') comprar(a.slice(2)); else if (a[0] === 'e') equipar(a.slice(2));
});

const zl = $('zl'), zr = $('zr'), base = $('base'), knob = $('knob'); let oid = null, rid = null, rx = 0;
function jpos(e) {
  const q = base.getBoundingClientRect();
  let dx = (e.clientX - q.left - q.width / 2) / 50, dz = (e.clientY - q.top - q.height / 2) / 50; const m = Math.hypot(dx, dz);
  if (m > 1) { dx /= m; dz /= m; } jx = dx; jz = dz; knob.style.transform = 'translate(' + dx * 35 + 'px,' + dz * 35 + 'px)';
}
zl.addEventListener('pointerdown', e => { if (st !== 'play') return; oid = e.pointerId; zl.setPointerCapture(oid); jpos(e); });
zl.addEventListener('pointermove', e => { if (e.pointerId === oid) jpos(e); });
const jup = e => { if (e.pointerId !== oid) return; oid = null; jx = jz = 0; knob.style.transform = ''; };
['pointerup', 'pointercancel'].forEach(n => zl.addEventListener(n, jup));
zr.addEventListener('pointerdown', e => { rid = e.pointerId; zr.setPointerCapture(rid); rx = e.clientX; });
zr.addEventListener('pointermove', e => { if (e.pointerId === rid) { cy -= (e.clientX - rx) * .009; rx = e.clientX; } });
['pointerup', 'pointercancel'].forEach(n => zr.addEventListener(n, e => { if (e.pointerId === rid) rid = null; }));
$('bj').addEventListener('pointerdown', e => { e.preventDefault(); if (st === 'play') jb = .12; });
const K = { ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd' };
addEventListener('keydown', e => { if (K[e.code]) keys[K[e.code]] = 1; if (e.code === 'Space' && st === 'play') jb = .12; });
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
  const max = (8 + world * .08) * ST.s, cs = Math.cos(cy), sn = Math.sin(cy);
  const wx = ix * cs + iz * sn, wz = -ix * sn + iz * cs;
  if (m > .05) {
    const c = p.on ? 1 : .7, sp0 = Math.hypot(p.vx, p.vz);
    p.vx += wx * 34 * ST.a * c * dt; p.vz += wz * 34 * ST.a * c * dt;
    if (sp0 > .5) { const k = Math.min(1, dt * (p.on ? 14 : 7) * FR / 10) * m; p.vx += (wx / m * sp0 - p.vx) * k; p.vz += (wz / m * sp0 - p.vz) * k; }
  }
  else if (p.on) { const sp = Math.hypot(p.vx, p.vz), f = Math.min(sp, FR * dt); if (sp > 0) { p.vx -= p.vx / sp * f; p.vz -= p.vz / sp * f; } }
  const sp2 = Math.hypot(p.vx, p.vz); if (sp2 > max) { p.vx *= max / sp2; p.vz *= max / sp2; }
  jb -= dt; p.coy -= dt;
  if (jb > 0 && (p.on || p.coy > 0)) { p.vy = 9.5 * ST.j; p.on = null; p.coy = 0; jb = 0; }
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
    if (land.end) return terminar();
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
  disc.visible = top !== null && G < 2;
  if (top !== null) { disc.position.set(p.x, top + .03, p.z); disc.scale.setScalar(Math.max(.4, 1.5 - (p.y - top) * .2)); }
  lava.position.set(p.x, -9, p.z);
  if (G === 2) { sun.position.set(p.x + 8, p.y + 22, p.z + 10); sun.target.position.set(p.x, p.y, p.z); sun.target.updateMatrixWorld(); }
  const por = cam.aspect < 1, bk = por ? 12 : 8.5, hh = por ? 7 : 5.2, sn = Math.sin(cy), cs = Math.cos(cy);
  cam.position.lerp(new THREE.Vector3(p.x + sn * bk, p.y + hh, p.z + cs * bk), Math.min(1, dt * 5));
  cam.lookAt(p.x - sn * 5, p.y + 1.2, p.z - cs * 5);
  const h = 'Mundo ' + world + '/' + MAX + ' · ' + thN + '   🪙 ' + coins + '   Caídas: ' + caidas;
  if (h !== hudT) { $('hud').textContent = h; hudT = h; }
  $('fill').style.width = Math.max(0, Math.min(p.z / endZ, 1)) * 100 + '%';
  R.render(sc, cam);
}

gfx(G); build(world);
p = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, on: P[0], coy: 0, yaw: 0 }; cp = { x: 0, y: 0, z: 0 };
aplicar(); menu();
let ult = performance.now();
function loop(n) { const dt = Math.min((n - ult) / 1000, .033); ult = n; update(dt); render(dt); requestAnimationFrame(loop); }
requestAnimationFrame(loop);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');

}

function msg(t) { const o = document.getElementById('ov'); o.style.display = 'flex'; o.innerHTML = '<b>Error</b><small>' + t + '</small>'; }
addEventListener('error', e => msg(String(e.message)));
function go() { try { main(); } catch (e) { msg('No se pudo iniciar el 3D: ' + (e && e.message || e)); } }
if (typeof THREE !== 'undefined') go();
else {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js';
  s.onload = go;
  s.onerror = () => msg('No se pudo descargar el motor 3D. Revisa tu internet y vuelve a abrir.');
  document.body.appendChild(s);
}
