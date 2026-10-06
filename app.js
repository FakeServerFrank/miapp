function main() {
const $ = id => document.getElementById(id), MAX = 60;
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
const CL = [];
for (let i = 0; i < 18; i++) { const x0 = Math.random() * 100, y0 = 35 + Math.random() * 25, z0 = 60 - i * 85, np = 4 + (i % 3); for (let q = 0; q < np; q++) CL.push([x0 + (q - np / 2) * 5 + Math.random() * 3, y0 + Math.random() * 2, z0 + Math.random() * 4, 4 + Math.random() * 4]); }
const cloudM = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x8896ad, fog: false }), CL.length * 6);
{ const d = new THREE.Object3D(); let k = 0; for (let c = -3; c < 3; c++) CL.forEach(q => { d.position.set(q[0] + c * 100, q[1], q[2]); d.scale.set(q[3] * 1.6, q[3] * .6, q[3]); d.updateMatrix(); cloudM.setMatrixAt(k++, d.matrix); }); }
cloudM.frustumCulled = false; sc.add(cloudM);
const clouds = [cloudM];
const skyU = { top: { value: new THREE.Color(0x1e6fe0) }, bot: { value: new THREE.Color(0xcfe8ff) }, sunCol: { value: new THREE.Color(0xfff1c4) }, sunDir: { value: new THREE.Vector3(.25, .4, -1) } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 24, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false,
  vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
  fragmentShader: 'varying vec3 vP; uniform vec3 top; uniform vec3 bot; uniform vec3 sunCol; uniform vec3 sunDir; void main(){ vec3 d = normalize(vP); float h = clamp(d.y * 1.3 + .05, 0., 1.); vec3 c = mix(bot, top, pow(h, .55)); float s = max(dot(d, normalize(sunDir)), 0.); c += sunCol * (pow(s, 600.) * 2. + pow(s, 14.) * .35); gl_FragColor = vec4(c, 1.); }'
}));
sky.frustumCulled = false; sky.renderOrder = -1; sc.add(sky);
const mat = c => new THREE.MeshLambertMaterial({ color: c });
const mkT = (fn, r) => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 64); fn(g); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(r, r); return t; };
const TXT = {
  stripe: mkT(g => { g.fillStyle = 'rgba(0,0,0,.28)'; for (let i = 0; i < 64; i += 16) g.fillRect(0, i, 64, 8); }, 2),
  check: mkT(g => { g.fillStyle = 'rgba(0,0,0,.3)'; for (let y = 0; y < 64; y += 16) for (let x = 0; x < 64; x += 16) if (((x + y) / 16) % 2) g.fillRect(x, y, 16, 16); }, 2),
  dots: mkT(g => { g.fillStyle = 'rgba(0,0,0,.3)'; for (let y = 8; y < 64; y += 16) for (let x = 8; x < 64; x += 16) { g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); } }, 2),
  camo: mkT(g => { g.fillStyle = 'rgba(0,0,0,.25)'; [[10, 12, 9], [40, 10, 11], [22, 38, 12], [52, 44, 10], [8, 54, 8]].forEach(a => { g.beginPath(); g.arc(a[0], a[1], a[2], 0, 7); g.fill(); }); }, 2),
  flame: mkT(g => { const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, 'rgba(255,200,0,.55)'); gr.addColorStop(1, 'rgba(255,60,0,.55)'); g.fillStyle = gr; for (let i = 0; i < 64; i += 16) g.fillRect(i, 0, 8, 64); }, 2)
};
const TXS = { t1: 'stripe', t2: 'camo', t3: 'dots', t5: 'check', t6: 'stripe', t7: 'check', l1: 'stripe', l2: 'dots', l3: 'camo', l5: 'check', h1: 'stripe', h3: 'dots', h5: 'check', f1: 'stripe', f4: 'check', f5: 'dots', e1: 'check', e3: 'stripe', e4: 'dots', e5: 'check', n1: 'stripe', n2: 'check', n3: 'dots' };
const SCTX = { '1': 'stripe', '2': 'check', '3': 'dots', '4': 'stripe', '5': 'dots', '6': 'check', '7': 'flame' };
const CHK = mkT(g => { g.fillStyle = 'rgba(0,0,0,.17)'; g.fillRect(0, 0, 32, 32); g.fillRect(32, 32, 32, 32); }, 1);
const STR = mkT(g => { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, 0, 64, 32); }, 1);
const BWT = mkT(g => { g.fillStyle = '#000'; g.fillRect(0, 0, 32, 32); g.fillRect(32, 32, 32, 32); }, 1);
const mt = (c, t, rw, rd) => { const q = t.clone(); q.needsUpdate = true; q.repeat.set(rw, rd); return new THREE.MeshLambertMaterial({ color: c, map: q }); };
const H = new THREE.Group(); let deckM, wheelA, wheelB, stemM, barM;
(function () {
  const a = (g, c, x, y, z, rz) => { const m = new THREE.Mesh(g, mat(c)); m.position.set(x, y, z); if (rz) m.rotation.z = rz; H.add(m); return m; };
  deckM = a(new THREE.BoxGeometry(.5, .08, 1.4), 0x222222, 0, .25, 0);
  wheelA = a(new THREE.CylinderGeometry(.2, .2, .12, 12), 0x111111, 0, .2, -.6, Math.PI / 2);
  wheelB = a(new THREE.CylinderGeometry(.2, .2, .12, 12), 0x111111, 0, .2, .6, Math.PI / 2);
  stemM = a(new THREE.BoxGeometry(.06, 1.1, .06), 0xcccccc, 0, .8, -.6);
  barM = a(new THREE.BoxGeometry(.7, .06, .06), 0xcccccc, 0, 1.35, -.6);
})();
sc.add(H);
const wings = new THREE.Group(), wingMats = [], wingSides = [];
[-1, 1].forEach(sx => {
  const sd = new THREE.Group(); sd.position.set(sx * .2, 1.05, .3);
  [0, 1, 2].forEach(q => { const wm = mat(0xffffff); wingMats.push(wm); const f = new THREE.Mesh(BX, wm), L = .5 + q * .28; f.scale.set(L, .05, .22); f.position.set(sx * L / 2, q * .1, 0); f.rotation.z = sx * (.2 + q * .25); sd.add(f); });
  wings.add(sd); wingSides.push(sd);
});
wings.visible = false; H.add(wings);
const fin = new THREE.Mesh(BX, mat(0xdc2626)); fin.scale.set(.06, .45, .5); fin.position.set(0, .5, .62); fin.visible = false; H.add(fin);
H.rotation.order = 'YXZ';
const RD = {};
(function () {
  const ad = (k, g, c, x, y, z) => { const o = new THREE.Mesh(g, mat(c)); o.position.set(x, y, z); H.add(o); RD[k] = o; };
  ad('skinL', new THREE.CylinderGeometry(.08, .08, .5, 8), 0xfcd34d, -.14, .5, .1); ad('skinR', new THREE.CylinderGeometry(.08, .08, .5, 8), 0xfcd34d, .14, .5, .1);
  ad('legL', new THREE.CylinderGeometry(.1, .1, .5, 8), 0x1e3a8a, -.14, .5, .1); ad('legR', new THREE.CylinderGeometry(.1, .1, .5, 8), 0x1e3a8a, .14, .5, .1);
  ad('shoeL', new THREE.BoxGeometry(.18, .1, .3), 0xffffff, -.14, .27, .05); ad('shoeR', new THREE.BoxGeometry(.18, .1, .3), 0xffffff, .14, .27, .05);
  ad('torso', new THREE.CylinderGeometry(.2, .24, .6, 10), 0x2563eb, 0, .95, .1);
  ad('armL', new THREE.BoxGeometry(.08, .08, .7), 0x2563eb, -.22, 1.27, -.25); ad('armR', new THREE.BoxGeometry(.08, .08, .7), 0x2563eb, .22, 1.27, -.25);
  ad('head', new THREE.SphereGeometry(.22, 12, 10), 0xfcd34d, 0, 1.48, .1);
  ad('hel', new THREE.SphereGeometry(.26, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xef4444, 0, 1.52, .1);
  ad('visor', new THREE.BoxGeometry(.3, .04, .22), 0x1d4ed8, 0, 1.5, -.14);
  ad('pom', new THREE.SphereGeometry(.09, 8, 6), 0xffffff, 0, 1.82, .1);
  ad('crown', new THREE.CylinderGeometry(.24, .2, .18, 8), 0xfacc15, 0, 1.68, .1);
  ad('brim', new THREE.CylinderGeometry(.42, .42, .03, 14), 0x8b5a2b, 0, 1.58, .1); ad('topH', new THREE.CylinderGeometry(.2, .22, .22, 10), 0x8b5a2b, 0, 1.7, .1);
  ad('glasses', new THREE.BoxGeometry(.34, .08, .06), 0x111111, 0, 1.5, -.12);
  ad('belt', new THREE.CylinderGeometry(.245, .245, .06, 10), 0x111827, 0, .72, .1); ad('padL', new THREE.SphereGeometry(.12, 8, 6), 0x9ca3af, -.22, 1.2, .1); ad('padR', new THREE.SphereGeometry(.12, 8, 6), 0x9ca3af, .22, 1.2, .1);
  ad('spk1', new THREE.ConeGeometry(.05, .14, 4), 0xfacc15, -.15, 1.82, .1); ad('spk2', new THREE.ConeGeometry(.05, .16, 4), 0xfacc15, 0, 1.85, .1); ad('spk3', new THREE.ConeGeometry(.05, .14, 4), 0xfacc15, .15, 1.82, .1);
  ad('gloveL', new THREE.BoxGeometry(.11, .11, .14), 0x111111, -.22, 1.3, -.6); ad('gloveR', new THREE.BoxGeometry(.11, .11, .14), 0x111111, .22, 1.3, -.6);
  ad('cape', new THREE.BoxGeometry(.5, .8, .04), 0xdc2626, 0, 1, .4); ad('pack', new THREE.BoxGeometry(.32, .4, .16), 0x16a34a, 0, 1, .34); ad('scarf', new THREE.CylinderGeometry(.24, .24, .1, 10), 0xf97316, 0, 1.25, .1);
})();
const TN = 48, tg = new THREE.BufferGeometry(), ta = new Float32Array(TN * 3), tl = new Float32Array(TN);
for (let i = 0; i < TN; i++) ta[i * 3 + 1] = -999;
tg.setAttribute('position', new THREE.BufferAttribute(ta, 3));
const trail = new THREE.Points(tg, new THREE.PointsMaterial({ size: .4, transparent: true, opacity: .9, depthWrite: false })); trail.frustumCulled = false; sc.add(trail);
let TS = { c: 0xffffff, rise: 0, spr: .2, rate: 0, acc: 0 }, tni = 0;

let world = 1;
try { world = Math.min(MAX, +localStorage.getItem('mundo') || 1); } catch (e) {}
const guardar = () => { try { localStorage.setItem('mundo', world); } catch (e) {} };
const rnd = s => () => (s = s * 16807 % 2147483647, (s - 1) / 2147483646);

let st = 'menu', tc = 0, W, P = [], p, cp, t = 0, endZ = 0, caidas = 0, jb = 0, jx = 0, jz = 0, kx = 0, kz = 0;
const keys = { l: 0, r: 0, u: 0, d: 0 };

const PN = 140, pg = new THREE.BufferGeometry(), pa = new Float32Array(PN * 3);
for (let i = 0; i < PN * 3; i += 3) { pa[i] = (Math.random() - .5) * 40; pa[i + 1] = (Math.random() - .5) * 20; pa[i + 2] = (Math.random() - .5) * 40; }
pg.setAttribute('position', new THREE.BufferAttribute(pa, 3));
const parts = new THREE.Points(pg, new THREE.PointsMaterial({ size: .22, transparent: true, opacity: .85 })); parts.frustumCulled = false; sc.add(parts);
let PV = 0;
const TH = [
  { sky: 0x8fd3ff, a: 0x4caf50, b: 0x66bb6a, fl: 0x1e6fd9, fr: 10, dc: 0x2e7d32, g: [0, 3, 6], cap: 0x5fd35f, tf: 0x2fa84f, gr: 0x5fd13a, st: 0x0a84ff, sb: 0xa6efff, su: 0xfff1c4, sd: [.25, .4, -1], pv: 0, pcl: 0xfff59d, hs: 'sph', hl: 0x7fd44a, sc: { tg: 'cyl', tc: 0x6b4423, tw: .5, h: [2.5, 4.5], pg: 'cone', pc: 0x2e7d32, ph: 5, pw: 2.2, po: .42, rk: 0x8d8d8d, fl: 0xff5ea8 } },
  { sky: 0xffd59a, a: 0xd9a05b, b: 0xe8b673, fl: 0xb7791f, fr: 10, dc: 0x3f8f3f, g: [1.2, 1.2, 8], cap: 0xf2d08a, tf: 0xb08d57, gr: 0xd9a65a, st: 0x3f95e0, sb: 0xffe0b0, su: 0xffc36b, sd: [-.3, .3, -1], pv: .2, pcl: 0xe9c98f, hs: 'sph', hl: 0xc98f4a, sc: { tg: 'cyl', tc: 0x3f8f3f, tw: .55, h: [3, 6], pg: 'sph', pc: 0x3f8f3f, ph: 1.3, pw: .7, po: .35, rk: 0xb5651d, fl: 0xff4d6d } },
  { sky: 0xcfe9ff, a: 0x9fdcf5, b: 0xc4ecff, fl: 0x1d4ed8, fr: 3, dc: 0xe0f2fe, g: [0, 2.2, 5], cap: 0xffffff, tf: 0xbfe9ff, gr: 0xeaf5ff, st: 0x6aa7e8, sb: 0xeaf5ff, su: 0xdff1ff, sd: [.1, .3, -1], pv: -2.2, pcl: 0xffffff, hs: 'cone', hl: 0xdbeafe, sc: { tg: 'cyl', tc: 0x5b4636, tw: .4, h: [2, 3.5], pg: 'cone', pc: 0xe8f4ff, ph: 6, pw: 2.2, po: .42, rk: 0xb8c6d9, fl: 0xffffff } },
  { sky: 0x1b1040, a: 0x7c3aed, b: 0xdb2777, fl: 0x0f0f2e, fr: 9, dc: 0x22d3ee, g: [1, 1, 4], cap: 0xf472b6, tf: 0x22d3ee, gr: 0x24184a, st: 0x03040f, sb: 0x2b1d63, su: 0xbcd0ff, sd: [.3, .45, -1], pv: .3, pcl: 0x22d3ee, hs: 'cone', hl: 0x312e81, sc: { tg: 'box', tc: 0x1f1a3d, tw: 2.2, h: [8, 26], pg: 'box', pc: 0x22d3ee, ph: 1, pw: 2.6, po: .5, bt: 1, rk: 0x3b2f6b, fl: 0xf472b6, bf: 1 } },
  { sky: 0x5a1a12, a: 0x57534e, b: 0x78716c, fl: 0xdc2626, fr: 10, dc: 0x44403c, g: [2, 3.5, 5], cap: 0x3f3a37, tf: 0xf97316, gr: 0x2b2523, st: 0x2a0805, sb: 0xc2461f, su: 0xff6a2a, sd: [-.2, .25, -1], pv: 2.4, pcl: 0xff7a1a, hs: 'cone', hl: 0x2d1b16, sc: { tg: 'cyl', tc: 0x3a2f2a, tw: 1.1, h: [2, 7], pg: 'cone', pc: 0x1f1b1a, ph: 4, pw: 1.6, po: .4, rk: 0x57534e, fl: 0xf97316, bf: 1 } },
  { sky: 0, a: 0x6b4f2a, b: 0x8a6d3b, fl: 0x1f5f3f, fr: 10, dc: 0, g: [0, 1, 4], cap: 0x2e7d32, tf: 0x1b5e20, gr: 0x2f5d2f, st: 0x2d7f5e, sb: 0xcdeac0, su: 0xfff3b0, sd: [.2, .5, -1], pv: .15, pcl: 0xb9f6ca, hs: 'sph', hl: 0x2f6b3a, sc: { tg: 'cyl', tc: 0x5d4037, tw: .6, h: [5, 10], pg: 'sph', pc: 0x1b8a3a, ph: 3.2, pw: 2.4, po: .45, rk: 0x6d6d5a, fl: 0xff7043 } },
  { sky: 0, a: 0xe9c88a, b: 0xf4d9a1, fl: 0x00a8cc, fr: 10, dc: 0, g: [0, 1, 4], cap: 0xfbe6b0, tf: 0x9ccc65, gr: 0xf0d9a0, st: 0x38a8f5, sb: 0xdff6ff, su: 0xfff4c2, sd: [.35, .35, -1], pv: 0, pcl: 0xffffff, hs: 'sph', hl: 0x4fc3d9, sc: { tg: 'cyl', tc: 0x8d6e63, tw: .35, h: [4, 8], pg: 'sph', pc: 0x2e9e4f, ph: 1.6, pw: 2.2, po: .3, rk: 0xd7ccc8, fl: 0xff6f91 } },
  { sky: 0, a: 0x5b6b8a, b: 0x7a8ab0, fl: 0x12012b, fr: 6, dc: 0, g: [0, 1, 4], cap: 0x93c5fd, tf: 0xa78bfa, gr: 0x1a1a3a, st: 0x000005, sb: 0x0b0b2a, su: 0xffffff, sd: [.4, .5, -1], pv: .2, pcl: 0xffffff, hs: 'sph', hl: 0x3b2f6b, sc: { tg: 'box', tc: 0x374151, tw: 1.6, h: [5, 18], pg: 'box', pc: 0x60a5fa, ph: .8, pw: 2, po: .5, bt: 1, rk: 0x6b7280, fl: 0xfde68a, bf: 1 } }
];
const NOM = ['Pradera', 'Desierto', 'Hielo', 'Noche neón', 'Volcán', 'Selva', 'Playa', 'Espacio'];
let FR = 10, thN = '', AN = [], GEMS = [], bst = 0, hcd = 0;
let G = 1; try { const gs = localStorage.getItem('graficos'); if (gs !== null && +gs >= 0 && +gs <= 2) G = +gs; } catch (e) {}
const DEC = [10, 40, 100];
function build(w) {
  if (W) { sc.remove(W); W.traverse(o => { if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } if (o.geometry && o.geometry !== BX) o.geometry.dispose(); }); }
  W = new THREE.Group(); sc.add(W); AN = []; GEMS = [];
  const r = rnd(w * 977 + 13), ti = (w - 1) % TH.length, th = TH[ti], lay = (w * 3 + 1) % 4;
  FR = th.fr; thN = NOM[ti]; const HO = [0, 30, -20, 60, -40, 20, -10, 90][ti];
  const col = new THREE.Color(th.sb); skyU.top.value.setHex(th.st); skyU.bot.value.setHex(th.sb); skyU.sunCol.value.setHex(th.su); skyU.sunDir.value.set(th.sd[0], th.sd[1], th.sd[2]);
  cloudM.material.color.setHex(ti === 3 || ti === 7 ? 0x6a6aa8 : ti === 4 ? 0x7a4a3a : 0xffffff); cloudM.material.emissive.setHex(ti === 3 || ti === 7 ? 0x202040 : ti === 4 ? 0x2a1008 : 0x8896ad); sc.background = col; sc.fog = new THREE.Fog(col, 35, [80, 140, 220][G]);
  lava.material.color.setHex(th.fl); parts.material.color.setHex(th.pcl); PV = th.pv;
  const mN = [mat(th.a), mat(th.b)], mM = mat(0x3b82f6), mR = mat(0xef4444), mF = mat(0x22c55e), mG = mat(0xf59e0b), mW = mat(0xffffff), capM = mat(th.cap);
  const box = (x, y, z, w, h, d, m) => { const o = new THREE.Mesh(BX, m); o.scale.set(w, h, d); o.position.set(x, y, z); o.castShadow = o.receiveShadow = G === 2; W.add(o); return o; };
  const flag = (x, y, z, m, hgt) => { box(x, y + hgt / 2, z, .12, hgt, .12, mW); AN.push({ m: box(x + .5, y + hgt - .4, z, 1, .6, .08, m), t: 'wave', ph: x }); };
  const add = (o, m) => { const pr = Math.min(P.length / (n + 2), 1), col = o.k === 'm' ? 0x3b82f6 : o.k === 'd' ? 0xf59e0b : new THREE.Color().setHSL(((220 + pr * 140 + HO) % 360) / 360, .72, .55);
    o.mesh = box(o.x, o.y - .5, o.z, o.w, 1, o.d, mt(col, CHK, o.w / 1.4, o.d / 1.4)); if (false) { const c = new THREE.Mesh(BX, capM); c.scale.set(1.02, .17, 1.02); c.position.set(0, .43, 0); o.mesh.add(c); } o.bx = o.x; o.dx = 0; o.tm = 0; o.hide = 0; P.push(o); return o; };
  P = [];
  const sz = Math.max(8 - w * .12, 3.5), n = Math.min(12 + Math.floor(w * .7), 60), gmax = Math.min((2.4 + w * .1) * (1 + Math.floor((w - 1) / 6) * .02), 6.9);
  add({ x: 0, y: 0, z: 0, w: 10, d: 10, k: 'n', cp: 1 }, mN[0]);
  let prev = 'n';
  for (let i = 1; i <= n; i++) {
    const cpl = i % (w < 30 ? 6 : w < 60 ? 7 : 9) === 0, q = r(); let k = 'n';
    if (!cpl && w >= 3 && q < Math.min(.12 + w * .01, .38)) k = 'm';
    else if (!cpl && w >= 7 && q < Math.min(.32 + w * .01, .58)) k = 'd';
    const d = sz + r() * 1.5, pz = P[P.length - 1];
    let gap = gmax * (.6 + .4 * r()); if (k === 'm') gap *= .6; if (prev === 'm') gap *= .75;
    const dy = Math.max(-1.5, Math.min(1.3, (r() - .5 + (lay === 2 ? .25 : lay === 3 ? -.1 : 0)) * 2.4));
    const x = lay === 1 ? (i % 2 ? 1 : -1) * sz * .8 : Math.max(-6, Math.min(6, pz.bx + (r() - .5) * sz * 1.2));
    const o = add({ x, y: pz.y + dy, z: pz.z - pz.d / 2 - gap - d / 2, w: sz + r() * 1.5, d, k, a: 2 + Math.min(w * .03, 1.5), sp: (.8 + r() * .5 + w * .015) * (1 + Math.min(Math.floor((w - 1) / 6), 14) * .04), cp: cpl ? 1 : 0 }, k === 'm' ? mM : k === 'd' ? mG : mN[i % 2]);
    if (k === 'n' && !cpl) {
      const s = r(), pl = Math.min(.12 + w * .01, .3);
      if (w >= 2 && s < .12) { o.tr = 1; const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, .3, 16), mat(0xec4899)); m.position.set(o.x, o.y + .15, o.z); W.add(m); }
      else if (w >= 3 && s < .22) { o.ramp = 1; const m = new THREE.Mesh(BX, mat(0xfb923c)); m.scale.set(2.4, .25, 2.4); m.position.set(o.x, o.y + .35, o.z - o.d * .25); m.rotation.x = .3; W.add(m); }
      else if (w >= 4 && s < .22 + pl) { o.lava = { w: o.w * .4 }; box(o.x, o.y + .35, o.z, o.lava.w, .7, 1.2, mR); }
      else if (w >= 5 && s < .22 + pl + Math.min(.06 + w * .008, .28)) {
        const g = new THREE.Group(); g.position.set(o.x, o.y + 4, o.z);
        const part = (x, y, z, a, c, d, m) => { const q = new THREE.Mesh(BX, m); q.scale.set(a, c, d); q.position.set(x, y, z); g.add(q); };
        part(0, -1.5, 0, .15, 3, .15, mW); part(0, -3, 0, 1, .8, 1.2, mR); part(0, 0, 0, .5, .5, .5, mW);
        W.add(g); o.ham = { g, sp: 1.2 + r() * .8 + w * .01, ph: r() * 6 };
      }
    }
    if (k === 'n' && !cpl && !o.tr && !o.ramp && !o.lava && !o.ham) {
      const s2 = r(), kk = r();
      if (w >= 3 && s2 < Math.min(.35 + w * .01, .85)) {
        if (kk < .2) {
          o.tun = 1; const fm = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
          for (let q = -1; q <= 1; q++) { const zz = o.z + q * 1.8; box(o.x - 1.9, o.y + 1.4, zz, .25, 2.8, .25, fm); box(o.x + 1.9, o.y + 1.4, zz, .25, 2.8, .25, fm); box(o.x, o.y + 2.8, zz, 4.05, .25, .25, fm); }
          box(o.x, o.y + .03, o.z, 3.4, .06, 5.4, new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: .55 }));
        } else if (kk < .4 && w >= 6) {
          const g = new THREE.Group(); g.position.set(o.x, o.y + .7, o.z);
          const q1 = new THREE.Mesh(BX, mR); q1.scale.set(4.2, .25, .3); g.add(q1);
          const q2 = new THREE.Mesh(BX, mW); q2.scale.set(.5, 1.4, .5); q2.position.y = -.35; g.add(q2);
          W.add(g); o.spin = { g, sp: 1.6 + w * .03, ph: r() * 6, L: 4.2 };
        } else if (kk < .55 && w >= 4) { o.wall = { w: o.w * .7 }; box(o.x, o.y + .65, o.z, o.wall.w, 1.3, .5, mG); }
        else if (kk < .7 && w >= 3) {
          const vx = (r() < .5 ? -1 : 1) * 3.5; o.conv = { vx };
          box(o.x, o.y + .06, o.z, o.w * .9, .12, o.d * .9, mat(0x374151));
          for (let q = -1; q <= 1; q++) box(o.x + q * o.w * .28, o.y + .13, o.z, .25, .02, o.d * .8, mat(0xfacc15));
          const ar = new THREE.Mesh(new THREE.ConeGeometry(.35, .7, 4), mat(0xffffff)); ar.position.set(o.x, o.y + .3, o.z); ar.rotation.z = vx > 0 ? -Math.PI / 2 : Math.PI / 2; W.add(ar);
        } else if (kk < .82 && w >= 5) { const m = box(o.x, o.y + .7, o.z, 1, 1.4, .6, mR); o.mh = { m, a: Math.max(o.w / 2 - 1, .8), sp: 1 + r() + w * .02, ph: r() * 6, r: .9, hz: .6, h: 1.4 }; }
        else if (kk < .92 && w >= 4) { const m = new THREE.Mesh(new THREE.SphereGeometry(.6, 10, 8), mat(0xf97316)); m.position.set(o.x, o.y + .6, o.z); W.add(m); o.mh = { m, a: o.w / 2 + .6, sp: 1.2 + r() + w * .02, ph: r() * 6, r: .95, hz: .9, h: 1.3, ball: 1 }; }
        else if (w >= 7) { const m = box(o.x, o.y + .5, o.z, o.w + 1, .06, .06, new THREE.MeshBasicMaterial({ color: 0xff2d2d })); o.las = { m, sp: 1.5 + r(), ph: r() * 6, on: true }; box(o.x - o.w / 2 - .5, o.y + .4, o.z, .15, .9, .15, mW); box(o.x + o.w / 2 + .5, o.y + .4, o.z, .15, .9, .15, mW); }
      }
    }
    if (cpl) flag(o.x + o.w / 2 - .6, o.y, o.z, mF, 2.6);
    prev = k;
  }
  const l = P[P.length - 1];
  const e = add({ x: l.bx, y: l.y, z: l.z - l.d / 2 - gmax * .6 - 5, w: 12, d: 10, k: 'n', cp: 0, end: 1 }, mG);
  box(e.x - 5, e.y + 3, e.z, .3, 6, .3, mW); box(e.x + 5, e.y + 3, e.z, .3, 6, .3, mW);
  const bq = BWT.clone(); bq.needsUpdate = true; bq.repeat.set(10, 2);
  box(e.x, e.y + 5.6, e.z, 10.3, 1.4, .3, new THREE.MeshBasicMaterial({ map: bq })); endZ = e.z;
  if (G > 0) {
    const gg = new THREE.OctahedronGeometry(.35), gmt = new THREE.MeshBasicMaterial({ color: 0xfff176 });
    P.filter(o => o.k === 'n' && !o.cp && !o.end).forEach((o, i) => { if (i % 3) return; const m = new THREE.Mesh(gg, gmt); m.position.set(o.x, o.y + 1.9, o.z); W.add(m); AN.push({ m, t: 'gem', ph: i, y0: m.position.y }); GEMS.push({ m, x: o.x, y: o.y + 1.9, z: o.z }); });
  }
  if (false) {
    const per = G === 2 ? 10 : 5, ok = o => o.k === 'n' && !o.lava && !o.tr && !o.ramp && !o.ham;
    const im = new THREE.InstancedMesh(new THREE.ConeGeometry(.12, .55, 4), mat(th.tf), P.filter(ok).length * per);
    im.frustumCulled = false; const dm = new THREE.Object3D(); let ix = 0;
    P.forEach(o => { if (ok(o)) for (let j = 0; j < per; j++) { dm.position.set(o.x + (r() - .5) * o.w * .9, o.y + .27, o.z + (r() - .5) * o.d * .9); dm.rotation.set(0, r() * 3, 0); dm.scale.setScalar(.7 + r() * .8); dm.updateMatrix(); im.setMatrixAt(ix++, dm.matrix); } });
    W.add(im);
  }
  const L0 = 40, zl = L0 - (endZ - 60), zc = L0 - zl / 2, S2 = th.sc, nd = DEC[G], dm = new THREE.Object3D();
  const bankM = mt(th.gr, STR, 1, zl / 10);
  [-1, 1].forEach(sd => box(sd * 38, -7.5, zc, 50, 9, zl, bankM));
  const gm = t => t === 'cone' ? new THREE.ConeGeometry(1, 1, 7) : t === 'sph' ? new THREE.SphereGeometry(1, 8, 6) : t === 'box' ? BX : new THREE.CylinderGeometry(.6, 1, 1, 6);
  const mb = (c, basic) => basic ? new THREE.MeshBasicMaterial({ color: c }) : mat(c);
  const trunk = new THREE.InstancedMesh(gm(S2.tg), mat(S2.tc), nd), top = new THREE.InstancedMesh(gm(S2.pg), mb(S2.pc, S2.bt), nd);
  const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), mat(S2.rk), nd), fl = new THREE.InstancedMesh(new THREE.SphereGeometry(.18, 5, 4), mb(S2.fl, S2.bf), nd * 3);
  [trunk, top, rocks, fl].forEach(m => { m.frustumCulled = false; W.add(m); });
  const pos = () => [(r() < .5 ? -1 : 1) * (14 + r() * 32), L0 - r() * zl];
  for (let i = 0; i < nd; i++) {
    const [x, z] = pos(), h = S2.h[0] + r() * (S2.h[1] - S2.h[0]), tw = S2.tw * (.8 + r() * .5);
    dm.rotation.set(0, r() * 3, 0); dm.position.set(x, -3 + h / 2, z); dm.scale.set(tw, h, tw); dm.updateMatrix(); trunk.setMatrixAt(i, dm.matrix);
    const ph = S2.ph * (.8 + r() * .5), pw = S2.pw * (.8 + r() * .5);
    dm.position.set(x, -3 + h + ph * S2.po, z); dm.scale.set(pw, ph, pw); dm.updateMatrix(); top.setMatrixAt(i, dm.matrix);
    const [rx, rz] = pos(), rs = .5 + r() * 1.6;
    dm.rotation.set(r() * 3, r() * 3, 0); dm.position.set(rx, -3 + rs * .4, rz); dm.scale.set(rs, rs * .7, rs); dm.updateMatrix(); rocks.setMatrixAt(i, dm.matrix);
    for (let j = 0; j < 3; j++) { const [fx, fz] = pos(); dm.rotation.set(0, 0, 0); dm.position.set(fx, -2.85, fz); dm.scale.setScalar(.6 + r() * .8); dm.updateMatrix(); fl.setMatrixAt(i * 3 + j, dm.matrix); }
  }
  for (let i = 0; i < 6; i++) {
    const cone = th.hs === 'cone', m = new THREE.Mesh(cone ? new THREE.ConeGeometry(30, 40, 6) : new THREE.SphereGeometry(30, 10, 6), mat(th.hl));
    if (!cone) m.scale.y = .6;
    m.position.set((i % 2 ? 1 : -1) * (85 + r() * 25), cone ? 6 : -5, zc + (r() - .5) * zl); W.add(m);
    if (ti === 4 && i < 2) { const g = new THREE.Mesh(new THREE.ConeGeometry(8, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff4500 })); g.position.set(m.position.x, 23, m.position.z); W.add(g); }
  }
  if (ti === 3 || ti === 7) {
    const sp = new Float32Array(600);
    for (let i = 0; i < 600; i += 3) { sp[i] = (r() - .5) * 300; sp[i + 1] = 40 + r() * 80; sp[i + 2] = zc + (r() - .5) * (zl + 200); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, fog: false })); stars.frustumCulled = false; W.add(stars);
  }
}

let coins = 0, owned = ['0'], eq = '0', done = 0, cy = 0, ST = { s: 1, a: 1, j: 1, dj: false }, tj = 0, tjs = 0, racha = 0, dia = '', rec = [], ropa = ['h0', 'c0', 't0', 'l0', 'f0', 'g0', 'e0', 'n0'], viste = { h: 'h0', c: 'c0', t: 't0', l: 'l0', f: 'f0', g: 'g0', e: 'e0', n: 'n0' }, rsl = 't', rkc = 0, rp = 0, net = { on: false, host: false, id: Math.random().toString(36).slice(2, 6), code: '', peer: null, conn: null, conns: [], states: {}, ls: 0, keep: null }, nick = 'Jugador' + Math.floor(Math.random() * 90 + 10);
try { coins = +localStorage.getItem('monedas') || 0; owned = JSON.parse(localStorage.getItem('patines') || '["0"]'); eq = localStorage.getItem('equipado') || '0'; done = +localStorage.getItem('hecho') || 0; rkc = +localStorage.getItem('rkc') || 0; { const q = localStorage.getItem('rp'); rp = q === null ? done * 6 : +q; } tj = +localStorage.getItem('tjug') || 0; racha = +localStorage.getItem('racha') || 0; dia = localStorage.getItem('dia') || ''; rec = JSON.parse(localStorage.getItem('rec') || '[]'); ropa = JSON.parse(localStorage.getItem('ropa') || JSON.stringify(ropa)); viste = JSON.parse(localStorage.getItem('viste') || JSON.stringify(viste)); ropa = migra(ropa); viste = migraV(viste); nick = localStorage.getItem('nick') || nick; } catch (e) {}
const sv = () => { try { localStorage.setItem('mundo', net.keep != null ? net.keep : world); localStorage.setItem('nick', nick); localStorage.setItem('monedas', coins); localStorage.setItem('patines', JSON.stringify(owned)); localStorage.setItem('equipado', eq); localStorage.setItem('hecho', done); localStorage.setItem('rkc', rkc); localStorage.setItem('rp', rp); localStorage.setItem('tjug', Math.floor(tj)); localStorage.setItem('racha', racha); localStorage.setItem('dia', dia); localStorage.setItem('rec', JSON.stringify(rec)); localStorage.setItem('ropa', JSON.stringify(ropa)); localStorage.setItem('viste', JSON.stringify(viste)); } catch (e) {} };
const SC = [
  { id: '0', n: 'Clásico', pr: 0, s: 0, a: 0, j: 0, c: 0x222222, dk: [1, 1], wr: 1, tr: { c: 0xbbbbbb, rise: .3, spr: .3, rate: 6 } },
  { id: '1', n: 'Turbo Rojo', pr: 150, s: .08, a: .1, j: 0, c: 0xdc2626, dk: [1, 1.05], wr: 1.1, bar: 0xdc2626, tr: { c: 0xff3b1f, rise: 1.5, spr: .15, rate: 40 } },
  { id: '2', n: 'Rayo Azul', pr: 400, s: .12, a: .15, j: .06, c: 0x2563eb, dk: [.9, 1.15], wr: 1, fin: 0x3da5ff, tr: { c: 0x3da5ff, rise: 0, spr: .6, rate: 45 } },
  { id: '3', n: 'Dorado Pro', pr: 800, s: .16, a: .2, j: .1, c: 0xfacc15, dk: [1.15, 1.1], wr: 1.2, bar: 0xfacc15, tr: { c: 0xffd700, rise: .5, spr: .4, rate: 35 } },
  { id: '4', n: 'Cohete Espacial', pr: 1400, s: .2, a: .3, j: .14, c: 0x7c3aed, dk: [.8, 1.25], wr: 1, fin: 0xef4444, bar: 0xcccccc, tr: { c: 0xb14dff, rise: 1, spr: .2, rate: 55 } },
  { id: '5', n: 'Alas Doradas', pr: 1800, s: .18, a: .24, j: .08, c: 0xfbbf24, dk: [1.1, 1.15], wr: 1.15, dj: 1, wc: 0xffd54a, tr: { c: 0xffe08a, rise: -.8, spr: .5, rate: 28 } },
  { id: '6', n: 'Cometa Neón', pr: 0, s: .2, a: .3, j: .1, c: 0x22d3ee, dk: [.85, 1.3], wr: .95, dj: 1, fin: 0x22d3ee, wc: 0x22f0ff, tr: { c: 0x22f0ff, rise: 0, spr: .1, rate: 60 }, ex: 'Juega 60 min en total' },
  { id: '7', n: 'Fénix Legendario', pr: 0, s: .24, a: .35, j: .16, c: 0xff6b00, dk: [1, 1.3], wr: 1.25, dj: 1, fin: 0xff6b00, wc: 0xff7a00, tr: { c: 0xff7a00, rise: 2, spr: .3, rate: 60 }, ex: 'Completa los ' + MAX + ' mundos' }
];
function aplicar() { const s = SC.find(x => x.id === eq) || SC[0]; ST = { s: 1 + s.s, a: 1 + s.a, j: 1 + s.j, dj: !!s.dj }; wings.visible = !!s.dj; wingMats.forEach(m => m.color.setHex(s.wc || 0xffffff));
  deckM.scale.set(s.dk[0], 1, s.dk[1]); { const nt = TXT[SCTX[s.id]] || null; if (deckM.material.map !== nt) { deckM.material.map = nt; deckM.material.needsUpdate = true; } } wheelA.scale.setScalar(s.wr); wheelB.scale.setScalar(s.wr);
  barM.material.color.setHex(s.bar || 0xcccccc); stemM.material.color.setHex(s.bar || 0xcccccc);
  fin.visible = !!s.fin; if (s.fin) fin.material.color.setHex(s.fin);
  trail.material.color.setHex(s.tr.c); TS = Object.assign({ acc: 0 }, s.tr); vestir(); deckM.material.color.setHex(s.c); }
function ov(h) { lobbyShow(st === 'menu'); document.body.classList.toggle('ctl', st === 'ctl'); const o = $('ov'); o.style.setProperty('--ac', ACC[st] || '#facc15'); if (h === null) o.style.display = 'none'; else { o.innerHTML = '<div class="in">' + h + '</div>'; o.style.display = 'flex'; tc = performance.now(); } }
const bt = (a, t, c) => '<button class="' + (c || '') + '" data-a="' + a + '">' + t + '</button>';
function lobbyShow(on) { $('lobby').style.display = on ? 'block' : 'none'; document.body.classList.toggle('lobby', on); }
function refrescarLobby() {
  const r = rangoDe(rp), top = r >= 9, pc = top ? 100 : Math.floor((rp - CUM[r]) / (CUM[r + 1] - CUM[r]) * 100);
  $('lb-ic').textContent = RK[r][1]; $('lb-nick').textContent = nick; $('lb-rk').textContent = RK[r][0] + ' · ' + (top ? rp + ' pts' : pc + '%');
  $('lb-bar').style.width = pc + '%'; $('lb-coins').textContent = '🪙 ' + coins; $('lb-w').textContent = 'Mundo ' + world + ' · ' + NOM[(world - 1) % NOM.length];
  $('lb-prof').style.setProperty('--ac', RKC[r]); $('bw').classList.toggle('dot', dia !== new Date().toDateString());
}
function menu() {
  st = 'menu'; build(world);
  p = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, on: P[0], coy: 0, yaw: 0, dj: true }; cp = { x: 0, y: 0, z: 0 }; yaw = 0;
  refrescarLobby(); ov(null);
}
$('lobby').addEventListener('pointerdown', e => {
  const el = e.target.closest ? e.target.closest('[data-l]') : null, a = el && el.dataset.l;
  if (!a || st !== 'menu') return; e.preventDefault();
  if (a === 'play') start(); else if (a === 'on') onlineUI(); else if (a === 'rk') rangoUI();
});
function tienda() {
  st = 'shop';
  ov('<b>TIENDA</b><span>🪙 ' + coins + '</span>' + SC.map(s => {
    const has = owned.includes(s.id), on = eq === s.id;
    return '<div class="row"><div>' + s.n + '<br><small>Vel +' + Math.round(s.s * 100) + '% · Acel +' + Math.round(s.a * 100) + '% · Salto +' + Math.round(s.j * 100) + '%' + (s.dj ? ' · ⇈ Doble salto' : '') + '</small></div>' + (on ? '<span>Equipado</span>' : has ? bt('e:' + s.id, 'Equipar') : s.ex ? '<span class="lk">🔒 ' + s.ex + '</span>' : bt('b:' + s.id, '🪙 ' + s.pr, coins < s.pr ? 'no' : '')) + '</div>';
  }).join('') + bt('menu', 'Volver'));
}
function comprar(id) { const s = SC.find(x => x.id === id); if (!s || owned.includes(id) || coins < s.pr) return; coins -= s.pr; owned.push(id); eq = id; sv(); aplicar(); tienda(); }
function equipar(id) { if (!owned.includes(id)) return; eq = id; sv(); aplicar(); tienda(); }
const ADMIN = ['administracion', 'administrador', 'admin']; // claves válidas (sin tildes, da igual mayúsculas)
let CT = { js: 110, bj: 100, op: 100, cs: 9, sw: 0, inv: 0, jp: 0, bp: 0 };
try { CT = Object.assign(CT, JSON.parse(localStorage.getItem('ctl') || '{}')); } catch (e) {}
function aplicarCT(ns) {
  const s = document.documentElement.style, W2 = innerWidth, H2 = innerHeight;
  s.setProperty('--js', CT.js + 'px'); s.setProperty('--bj', CT.bj + 'px'); s.setProperty('--op', CT.op / 100);
  document.body.classList.toggle('sw', !!CT.sw);
  const pos = (id, k, sz) => { const e = $(id); if (CT[k]) { e.style.left = CT[k][0] * W2 - sz / 2 + 'px'; e.style.top = CT[k][1] * H2 - sz / 2 + 'px'; e.style.right = e.style.bottom = 'auto'; } else e.style.left = e.style.top = e.style.right = e.style.bottom = ''; };
  pos('base', 'jp', CT.js); pos('bj', 'bp', CT.bj);
  const zl2 = $('zl'), zr2 = $('zr');
  if (CT.jp) { const cx = CT.jp[0] * W2, zw = W2 * .45; zl2.style.left = Math.max(0, Math.min(W2 - zw, cx - zw / 2)) + 'px'; zl2.style.right = 'auto'; zl2.style.width = zw + 'px'; zl2.style.top = H2 * .35 + 'px'; zl2.style.bottom = '0'; zl2.style.height = 'auto'; zr2.style.left = cx < W2 / 2 ? '50%' : '0'; zr2.style.right = cx < W2 / 2 ? '0' : '50%'; }
  else { zl2.style.cssText = ''; zr2.style.cssText = ''; }
  if (!ns) { try { localStorage.setItem('ctl', JSON.stringify(CT)); } catch (e) {} }
}
addEventListener('resize', () => aplicarCT(true));
const CTL = [['js', 'Tamaño del joystick', 80, 170, 10], ['bj', 'Tamaño del botón SALTAR', 70, 150, 10], ['op', 'Opacidad de los botones', 20, 100, 10], ['cs', 'Sensibilidad de la cámara', 3, 20, 1]];
function controlesUI() {
  st = 'ctl';
  ov('<b>🎮 CONTROLES</b><small>Arrastra el joystick y el botón SALTAR para moverlos.<br>Todo se guarda solo.</small>' + CTL.map(x => '<div class="row"><div>' + x[1] + '</div><div class="stp">' + bt('o:' + x[0] + '-', '−') + '<b>' + CT[x[0]] + '</b>' + bt('o:' + x[0] + '+', '+') + '</div></div>').join('') + '<div class="seg">' + bt('o:sw', 'Intercambiar lados' + (CT.sw ? ' ✔' : ''), CT.sw ? 'on' : '') + bt('o:inv', 'Invertir cámara' + (CT.inv ? ' ✔' : ''), CT.inv ? 'on' : '') + '</div>' + bt('o:reset', 'Restablecer') + bt('cfg', 'Volver'));
}
function ctlAct(x) {
  if (x === 'reset') CT = { js: 110, bj: 100, op: 100, cs: 9, sw: 0, inv: 0, jp: 0, bp: 0 };
  else if (x === 'sw' || x === 'inv') CT[x] = CT[x] ? 0 : 1;
  else { const d = CTL.find(c => c[0] === x.slice(0, -1)); if (d) CT[d[0]] = Math.max(d[2], Math.min(d[3], CT[d[0]] + (x.slice(-1) === '+' ? d[4] : -d[4]))); }
  aplicarCT(); controlesUI();
}
let adm = { on: false, open: true, tab: 'j', cf: false, god: false, spd: false, inf: false, fly: false };
const ATABS = [['j', 'Jugador'], ['m', 'Mundo'], ['t', 'Tienda'], ['s', 'Sistema']];
function admPanel() {
  const a = $('am'); a.style.display = adm.on ? 'block' : 'none'; if (!adm.on) return;
  const tgl = (k, t) => '<button data-d="' + k + '" class="' + (adm[k] ? 'on' : '') + '">' + t + (adm[k] ? ' ✔' : '') + '</button>', bn = (k, t) => '<button data-d="' + k + '">' + t + '</button>';
  const body = {
    j: tgl('god', '🛡 Invencible') + tgl('spd', '⚡ Velocidad x2') + tgl('inf', '⇈ Saltos infinitos') + tgl('fly', '🕊 Volar') + bn('cp', '📍 Al checkpoint'),
    m: bn('rp', '🏆 +50 puntos') + bn('ant10', '◀◀ Mundo −10') + bn('sig10', 'Mundo +10 ▶▶') + bn('ant', '◀ Mundo −1') + bn('sig', 'Mundo +1 ▶') + bn('skip', '🏁 Completar') + bn('meta', '🚩 Ir a la meta') + bn('rein', '↻ Reiniciar'),
    t: bn('mon', '🪙 +1000') + bn('mon10', '🪙 +10000') + bn('monopatines', '🛴 Todos los monopatines') + bn('ropas', '👕 Toda la ropa') + bn('cero', '🪙 Poner en 0'),
    s: bn('off', '⏻ Desactivar admin') + bn('reset', adm.cf ? '⚠ ¿Seguro? Toca otra vez' : '⚠ Borrar progreso')
  }[adm.tab];
  a.innerHTML = '<button data-d="abrir" class="ah">🛠 Admin ' + (adm.open ? '▾' : '▸') + '</button>' + (adm.open ? '<div class="at">' + ATABS.map(x => '<button data-d="tab:' + x[0] + '" class="' + (adm.tab === x[0] ? 'on' : '') + '">' + x[1] + '</button>').join('') + '</div><div class="ab">' + body + '</div>' : '');
}
function admAct(k) {
  const cf = adm.cf; adm.cf = false;
  if (k === 'abrir') adm.open = !adm.open;
  else if (k.startsWith('tab:')) adm.tab = k.slice(4);
  else if (k === 'rp') { rp += 50; cobrarRango(); sv(); } else if (k === 'mon') { coins += 1000; sv(); } else if (k === 'mon10') { coins += 10000; sv(); } else if (k === 'cero') { coins = 0; sv(); }
  else if (k === 'monopatines') { owned = SC.map(s => s.id); sv(); }
  else if (k === 'ropas') { ropa = Object.values(CLO).flat().map(x => x.id); sv(); }
  else if (k === 'skip') { if (st === 'play') terminar(); }
  else if (k === 'sig' || k === 'ant' || k === 'sig10' || k === 'ant10') { world = Math.max(1, world + ({ sig: 1, ant: -1, sig10: 10, ant10: -10 })[k]); sv(); if (st === 'play') start(); }
  else if (k === 'rein') { if (st === 'play') start(); }
  else if (k === 'cp') { if (st === 'play') { p.x = cp.x; p.y = cp.y + .05; p.z = cp.z; p.vx = p.vy = p.vz = 0; } }
  else if (k === 'meta') { if (st === 'play') { const e = P[P.length - 1]; p.x = e.x; p.y = e.y + .05; p.z = e.z + 2; p.vx = p.vy = p.vz = 0; } }
  else if (k === 'off') adm = { on: false, open: true, tab: 'j', cf: false, god: false, spd: false, inf: false, fly: false };
  else if (k === 'reset') { if (!cf) adm.cf = true; else { coins = 0; owned = ['0']; eq = '0'; done = 0; rkc = 0; rp = 0; world = 1; rec = []; tj = 0; racha = 0; dia = ''; ropa = migra([]); viste = migraV({}); aplicar(); sv(); } }
  else adm[k] = !adm[k];
  admPanel();
}
function activarAdm() { adm.on = true; adm.open = true; admPanel(); if (pausa) { pausa = false; jx = jz = 0; st = 'play'; ov(null); } else menu(); }
$('am').addEventListener('pointerdown', e => { const k = e.target.dataset && e.target.dataset.d; if (k) { e.preventDefault(); admAct(k); } });
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
let pausa = false;
const abrir = f => e => { e.preventDefault(); if (st === 'play') pausa = true; f(); };
$('bs').addEventListener('pointerdown', abrir(tienda)); $('hud').addEventListener('pointerdown', abrir(rangoUI)); $('bw').addEventListener('pointerdown', abrir(recompensas)); $('bk').addEventListener('pointerdown', abrir(() => ropaUI())); $('bc').addEventListener('pointerdown', abrir(config));
let lk = 0;
addEventListener('pointerdown', () => { if (lk) return; lk = 1; try { (document.documentElement.requestFullscreen ? document.documentElement.requestFullscreen() : Promise.resolve()).then(() => screen.orientation && screen.orientation.lock('landscape')).catch(() => {}); } catch (e) {} });
function gfx(n) {
  G = n; try { localStorage.setItem('graficos', n); } catch (e) {}
  const d = devicePixelRatio || 1;
  R.setPixelRatio([Math.min(d, 1) * .75, Math.min(d, 1.25), Math.min(d, 2)][n]); fit();
  R.shadowMap.enabled = n === 2; sun.castShadow = n === 2;
  clouds.forEach(c => c.visible = n > 0); parts.visible = n > 0; trail.visible = n > 0;
  R.toneMapping = n === 2 ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping; R.toneMappingExposure = 1.15;
  [lava, disc, cloudM].forEach(m => { m.material.needsUpdate = true; });
  H.traverse(o => { if (o.isMesh) { o.castShadow = n === 2; if (o.material) o.material.needsUpdate = true; } });
}
function cambiarG(n) { gfx(n); build(world); p = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, on: P[0], coy: 0, yaw: 0, dj: true }; cp = { x: 0, y: 0, z: 0 }; config(); }
function config() {
  st = 'cfg';
  ov('<b>CONFIGURACIÓN</b><small>Gráficos</small><div class="seg">' + ['Suave', 'Estándar', 'Ultra'].map((n, i) => bt('g:' + i, n, G === i ? 'on' : '')).join('') + '</div><small>' + ['Más fluido y rápido, con menos detalle', 'Equilibrado', 'Sombras reales, más detalle y más distancia (gasta más batería)'][G] + '</small>' + bt('ctl', '🎮 Controles') + '<small>Código</small><input id="cod" type="password" placeholder="Código" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">' + bt('adm', 'Entrar') + bt('menu', 'Volver'));
}
function entrar() { const i = $('cod'); if (i && ADMIN.includes(norm(i.value))) activarAdm(); else if (i) { i.value = ''; i.placeholder = 'Código incorrecto'; } }
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
const SL = [['h', '🧢', 'Cabeza'], ['c', '😎', 'Cara'], ['t', '👕', 'Camiseta'], ['l', '👖', 'Pantalón'], ['f', '👟', 'Zapatos'], ['g', '🧤', 'Guantes'], ['e', '🎒', 'Espalda'], ['n', '🧣', 'Cuello']];
const C = (id, n, pr, c, ty, sh) => ({ id, n, pr, c, ty, sh });
const CLO = {
  h: [C('h0', 'Casco rojo', 0, 0xef4444, 'helmet'), C('h1', 'Gorra azul', 80, 0x2563eb, 'cap'), C('h2', 'Gorro con pompón', 120, 0x22c55e, 'beanie'), C('h3', 'Sombrero vaquero', 200, 0x8b5a2b, 'cowboy'), C('h4', 'Casco neón', 250, 0x22d3ee, 'helmet'), C('h5', 'Casco dorado', 300, 0xfacc15, 'helmet'), C('h6', 'Corona real', 450, 0xfacc15, 'crown')],
  c: [C('c0', 'Sin gafas', 0, 0, 'none'), C('c1', 'Gafas oscuras', 100, 0x111111, 'glasses'), C('c2', 'Gafas neón', 150, 0x22d3ee, 'glasses'), C('c3', 'Gafas doradas', 250, 0xfacc15, 'glasses')],
  t: [C('t0', 'Camiseta azul', 0, 0x2563eb), C('t1', 'Camiseta roja', 60, 0xdc2626), C('t2', 'Camiseta verde', 60, 0x16a34a), C('t3', 'Camiseta amarilla', 60, 0xeab308), C('t4', 'Hoodie negro', 150, 0x1f2937), C('t5', 'Camiseta neón', 200, 0x22d3ee), C('t6', 'Armadura plateada', 350, 0x9ca3af), C('t7', 'Traje dorado', 500, 0xfacc15)],
  l: [C('l0', 'Jean azul', 0, 0x1e3a8a), C('l1', 'Pantalón negro', 50, 0x111827), C('l2', 'Pantalón rojo', 60, 0xb91c1c), C('l3', 'Verde militar', 80, 0x4d7c0f), C('l4', 'Shorts naranja', 100, 0xf97316, 0, 1), C('l5', 'Pantalón dorado', 300, 0xfacc15)],
  f: [C('f0', 'Zapatillas blancas', 0, 0xffffff), C('f1', 'Zapatillas rojas', 40, 0xdc2626), C('f2', 'Zapatillas negras', 40, 0x111111), C('f3', 'Botas marrones', 120, 0x7c4a21), C('f4', 'Zapatillas neón', 200, 0x22d3ee), C('f5', 'Zapatillas doradas', 300, 0xfacc15)],
  g: [C('g0', 'Sin guantes', 0, 0, 'none'), C('g1', 'Guantes negros', 80, 0x111111, 'g'), C('g2', 'Guantes rojos', 80, 0xdc2626, 'g'), C('g3', 'Guantes dorados', 250, 0xfacc15, 'g')],
  e: [C('e0', 'Sin espalda', 0, 0, 'none'), C('e1', 'Mochila verde', 150, 0x16a34a, 'pack'), C('e2', 'Mochila roja', 150, 0xdc2626, 'pack'), C('e3', 'Capa roja', 250, 0xdc2626, 'cape'), C('e4', 'Capa real morada', 400, 0x7c3aed, 'cape'), C('e5', 'Capa neón', 350, 0x22d3ee, 'cape')],
  n: [C('n0', 'Sin bufanda', 0, 0, 'none'), C('n1', 'Bufanda naranja', 120, 0xf97316, 'scarf'), C('n2', 'Bufanda azul', 120, 0x2563eb, 'scarf'), C('n3', 'Bufanda dorada', 300, 0xfacc15, 'scarf')]
};
function migra(l) {
  const m = { a1: 'c1', a2: 'e1', a3: 'n1', a4: 'e3', a5: 'e4' }, o = l.map(x => m[x] || x).filter(x => x !== 'a0');
  ['h0', 'c0', 't0', 'l0', 'f0', 'g0', 'e0', 'n0'].forEach(x => { if (!o.includes(x)) o.push(x); });
  return o.filter((x, i) => o.indexOf(x) === i);
}
function migraV(v) {
  const m = { a1: 'c1', a2: 'e1', a3: 'n1', a4: 'e3', a5: 'e4' }, o = { h: 'h0', c: 'c0', t: 't0', l: 'l0', f: 'f0', g: 'g0', e: 'e0', n: 'n0' };
  for (const k in v) { const id = m[v[k]] || v[k]; if (id !== 'a0') o[id[0]] = id; }
  return o;
}
function vestir() {
  const g = k => CLO[k].find(x => x.id === viste[k]) || CLO[k][0], h = g('h'), t = g('t'), l = g('l'), f = g('f');
  ['hel', 'visor', 'pom', 'crown', 'brim', 'topH', 'glasses', 'pack', 'scarf', 'cape', 'gloveL', 'gloveR', 'padL', 'padR', 'spk1', 'spk2', 'spk3'].forEach(k => { RD[k].visible = false; });
  ({ helmet: ['hel'], cap: ['hel', 'visor'], beanie: ['hel', 'pom'], cowboy: ['brim', 'topH'], crown: ['crown'] }[h.ty] || ['hel']).forEach(k => { RD[k].visible = true; RD[k].material.color.setHex(h.c); });
  if (h.ty === 'beanie') RD.pom.material.color.setHex(0xffffff);
  if (h.ty === 'crown') ['spk1', 'spk2', 'spk3'].forEach(k => { RD[k].visible = true; RD[k].material.color.setHex(h.c); });
  if (t.id === 't6' || t.id === 't7') ['padL', 'padR'].forEach(k => { RD[k].visible = true; RD[k].material.color.setHex(t.c); });
  ['torso', 'armL', 'armR'].forEach(k => RD[k].material.color.setHex(t.c));
  ['legL', 'legR'].forEach(k => { RD[k].material.color.setHex(l.c); RD[k].scale.y = l.sh ? .6 : 1; RD[k].position.y = l.sh ? .6 : .5; });
  ['shoeL', 'shoeR'].forEach(k => RD[k].material.color.setHex(f.c));
  [g('c'), g('e'), g('n')].forEach(x => { if (x.ty !== 'none') { RD[x.ty].visible = true; RD[x.ty].material.color.setHex(x.c); } });
  const sm = (k, id) => { const m = RD[k].material, nt = TXT[TXS[id]] || null; if (m.map !== nt) { m.map = nt; m.needsUpdate = true; } };
  ['torso', 'armL', 'armR'].forEach(k => sm(k, t.id)); ['legL', 'legR'].forEach(k => sm(k, l.id)); ['shoeL', 'shoeR'].forEach(k => sm(k, f.id));
  ['hel', 'crown', 'brim', 'topH'].forEach(k => sm(k, h.id)); [g('c'), g('e'), g('n')].forEach(x => { if (x.ty !== 'none') sm(x.ty, x.id); });
  const gl = g('g'); if (gl.ty !== 'none') ['gloveL', 'gloveR'].forEach(k => { RD[k].visible = true; RD[k].material.color.setHex(gl.c); });
}
function ropaUI(sl) {
  if (sl) rsl = sl; st = 'clo';
  const sh = SL.find(x => x[0] === rsl);
  ov('<div class="ff"><div class="sl">' + SL.map(x => bt('c:' + x[0], x[1] + '<small>' + x[2] + '</small>', rsl === x[0] ? 'on' : '')).join('') + '</div><div class="gr2"><div class="gh"><b>' + sh[1] + ' ' + sh[2] + '</b><span>🪙 ' + coins + '</span></div><div class="gr">' + CLO[rsl].map(x => {
    const has = ropa.includes(x.id), on = viste[rsl] === x.id;
    return '<div class="it ' + (on ? 'puesto' : '') + '"><i style="background:#' + (x.c ? x.c.toString(16).padStart(6, '0') : '444444') + '"></i><span>' + x.n + '</span>' + (on ? '<em>Puesto</em>' : has ? bt('p:' + x.id, 'Ponerse') : bt('k:' + x.id, '🪙 ' + x.pr, coins < x.pr ? 'no' : '')) + '</div>';
  }).join('') + '</div>' + bt('menu', 'Volver') + '</div></div>');
}
function comprarRopa(id) { const it = Object.values(CLO).flat().find(x => x.id === id); if (!it || ropa.includes(id) || coins < it.pr) return; coins -= it.pr; ropa.push(id); viste[id[0]] = id; sv(); vestir(); ropaUI(); }
function ponerRopa(id) { if (!ropa.includes(id)) return; viste[id[0]] = id; sv(); vestir(); ropaUI(); }
const TIERS = [{ id: 't3', m: 3, c: 25 }, { id: 't10', m: 10, c: 60 }, { id: 't25', m: 25, c: 120 }, { id: 't60', m: 60, sc: '6' }];
const RACHA = [30, 35, 40, 45, 50, 60, 100];
const ayer = () => new Date(Date.now() - 864e5).toDateString();
function recompensas() {
  st = 'rew';
  const hoy = new Date().toDateString(), ns = dia === hoy ? racha : dia === ayer() ? racha + 1 : 1, min = tj / 60;
  ov('<b>RECOMPENSAS</b><span>🪙 ' + coins + '</span><div class="row"><div>Recompensa diaria<br><small>Día ' + ns + ' de racha · 🪙 ' + RACHA[Math.min(ns, 7) - 1] + '</small></div>' + (dia === hoy ? '<span>✔ Reclamada</span>' : bt('r:dia', 'Reclamar')) + '</div>' + TIERS.map(x => {
    const ok = rec.includes(x.id);
    return '<div class="row"><div>Juega ' + x.m + ' min<br><small>' + (x.sc ? '🛴 Monopatín exclusivo' : '🪙 ' + x.c) + ' · ' + Math.min(Math.floor(min), x.m) + '/' + x.m + ' min</small></div>' + (ok ? '<span>✔ Reclamada</span>' : bt('r:' + x.id, 'Reclamar', min >= x.m ? '' : 'no')) + '</div>';
  }).join('') + bt('menu', 'Volver'));
}
function reclamar(x) {
  const hoy = new Date().toDateString();
  if (x === 'dia') { if (dia === hoy) return; racha = dia === ayer() ? racha + 1 : 1; dia = hoy; coins += RACHA[Math.min(racha, 7) - 1]; }
  else { const t = TIERS.find(y => y.id === x); if (!t || rec.includes(x) || tj / 60 < t.m) return; rec.push(x); if (t.sc) { if (!owned.includes(t.sc)) owned.push(t.sc); } else coins += t.c; }
  sv(); recompensas();
}
const AV = {};
function toast(t, ms) { const e = $('toast'); e.textContent = t; e.style.display = 'block'; clearTimeout(toast.h); toast.h = setTimeout(() => { e.style.display = 'none'; }, ms || 4000); }
function peerJS(cb) {
  if (navigator.onLine === false) return onlineUI('Sin internet: el modo online necesita conexión.');
  if (typeof Peer !== 'undefined') return cb();
  onlineUI('Conectando…');
  const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.2/peerjs.min.js';
  s.onload = cb; s.onerror = () => onlineUI('No se pudo cargar el modo online. Revisa tu internet.'); document.body.appendChild(s);
}
function myState() { const s = SC.find(x => x.id === eq) || SC[0], t = CLO.t.find(x => x.id === viste.t) || CLO.t[0]; return { t: 's', id: net.id, n: nick, x: p.x, y: p.y, z: p.z, yw: yaw, c: s.c, tc: t.c, w: world }; }
function mkAv(s) {
  const g = new THREE.Group(), pt = (geo, c, y) => { const m = new THREE.Mesh(geo, mat(c)); m.position.y = y; g.add(m); return m; };
  pt(BX, s.c, .25).scale.set(.5, .08, 1.4); pt(new THREE.CylinderGeometry(.2, .24, .6, 8), s.tc, .95); pt(new THREE.SphereGeometry(.22, 10, 8), 0xfcd34d, 1.48);
  const cv2 = document.createElement('canvas'); cv2.width = 256; cv2.height = 64; const c2 = cv2.getContext('2d');
  c2.font = 'bold 36px sans-serif'; c2.textAlign = 'center'; c2.lineWidth = 6; c2.strokeStyle = '#000'; c2.fillStyle = '#fff'; c2.strokeText(s.n, 128, 44); c2.fillText(s.n, 128, 44);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv2), depthTest: false })); sp.scale.set(2.4, .6, 1); sp.position.y = 2.3; g.add(sp);
  g.position.set(s.x, s.y, s.z); sc.add(g); return g;
}
function setAv(s) { let a = AV[s.id]; if (!a) a = AV[s.id] = { g: mkAv(s) }; a.tx = s.x; a.ty0 = s.y; a.tz = s.z; a.yw = s.yw; a.w = s.w; }
function delAv(id) { if (AV[id]) { sc.remove(AV[id].g); delete AV[id]; } }
function netOff() {
  try { net.conns.forEach(c => c.close()); if (net.conn) net.conn.close(); if (net.peer) net.peer.destroy(); } catch (e) {}
  Object.keys(AV).forEach(delAv);
  if (net.keep != null) world = net.keep;
  net = { on: false, host: false, id: net.id, code: '', peer: null, conn: null, conns: [], states: {}, ls: 0, keep: null };
}
function onlineUI(m) {
  st = 'onl';
  const n = Object.keys(AV).length + 1;
  ov('<b>🌐 ONLINE</b><small>Todos corren el mismo mundo. Gana quien llegue primero.</small>' + (!net.on
    ? '<input id="nk" maxlength="10" placeholder="Tu nombre" value="' + nick + '">' + bt('n:crear', 'Crear sala') + '<input id="cd" maxlength="4" placeholder="Código de sala" autocapitalize="characters">' + bt('n:unir', 'Unirse')
    : net.host ? '<span>Sala: ' + net.code + '</span><small>Jugadores: ' + n + ' · Mundo ' + world + '</small>' + bt('n:ir', 'Iniciar carrera') + bt('n:salir', 'Cerrar sala')
    : '<span>Sala: ' + net.code + '</span><small>Conectado · ' + n + ' jugadores<br>Esperando que el anfitrión inicie…</small>' + bt('n:salir', 'Salir')) + (m ? '<small>' + m + '</small>' : '') + bt('menu', 'Volver'));
}
function crear() {
  net.code = Math.random().toString(36).slice(2, 6).toUpperCase(); net.host = true; net.states = {};
  const pr = new Peer('obbyscooter-' + net.code);
  pr.on('open', () => { net.on = true; net.peer = pr; onlineUI(); });
  pr.on('error', e => { if (e.type === 'unavailable-id') crear(); else { netOff(); onlineUI('Error: ' + e.type); } });
  pr.on('connection', c => {
    if (net.conns.length >= 5) return c.close();
    net.conns.push(c); c.on('open', () => { c.send({ t: 'hi', w: world }); onlineUI(); }); c.on('data', m => netRecv(m, c));
    c.on('close', () => { net.conns = net.conns.filter(x => x !== c); onlineUI(); });
  });
}
function unir(code) {
  net.code = code; net.host = false;
  const pr = new Peer(); net.peer = pr;
  setTimeout(() => { if (!net.on && net.peer === pr) { netOff(); onlineUI('No se pudo conectar. ¿El código es correcto?'); } }, 12000);
  pr.on('open', () => {
    const c = pr.connect('obbyscooter-' + code, { reliable: true }); net.conn = c;
    c.on('open', () => { net.on = true; onlineUI(); }); c.on('data', m => netRecv(m, c)); c.on('close', () => { netOff(); onlineUI('Se cerró la sala'); });
  });
  pr.on('error', e => { netOff(); onlineUI(e.type === 'peer-unavailable' ? 'No existe esa sala' : 'Error: ' + e.type); });
}
function netRecv(m, c) {
  if (m.t === 's' && net.host) { m.ts = performance.now(); net.states[m.id] = m; setAv(m); }
  else if (m.t === 'all') m.l.forEach(s => { if (s.id !== net.id) setAv(s); });
  else if (m.t === 'go') { if (net.keep == null) net.keep = world; world = m.w; pausa = false; jx = jz = 0; start(); }
  else if (m.t === 'fin') { toast('🏁 ' + m.n + ' llegó en ' + (m.ms / 1000).toFixed(1) + ' s'); if (net.host) net.conns.forEach(x => { if (x !== c && x.open) x.send(m); }); }
}
function netFin() {
  const m = { t: 'fin', n: nick, ms: Math.round(t * 1000) };
  if (net.host) net.conns.forEach(c => { if (c.open) c.send(m); }); else if (net.conn && net.conn.open) net.conn.send(m);
}
function netAct(x) {
  if (x === 'crear') { nick = (($('nk') || {}).value || nick).trim().slice(0, 10) || nick; sv(); peerJS(crear); }
  else if (x === 'unir') { const cd = ((($('cd') || {}).value) || '').toUpperCase().trim(); nick = (($('nk') || {}).value || nick).trim().slice(0, 10) || nick; sv(); if (cd.length === 4) peerJS(() => unir(cd)); else onlineUI('Escribe el código de 4 letras'); }
  else if (x === 'ir') { net.conns.forEach(c => { if (c.open) c.send({ t: 'go', w: world }); }); pausa = false; start(); }
  else if (x === 'salir') { netOff(); onlineUI(); }
}
function netStep(dt) {
  for (const k in AV) { const a = AV[k], g = a.g; g.visible = st === 'play' && a.w === world; const f = Math.min(1, dt * 10); g.position.x += (a.tx - g.position.x) * f; g.position.y += (a.ty0 - g.position.y) * f; g.position.z += (a.tz - g.position.z) * f; g.rotation.y = a.yw; }
  if (!net.on) return;
  const now = performance.now(); if (now - net.ls < 100) return; net.ls = now;
  const s = myState();
  if (net.host) { for (const k in net.states) if (now - net.states[k].ts > 4000) { delete net.states[k]; delAv(k); } net.conns.forEach(c => { if (c.open) c.send({ t: 'all', l: Object.values(net.states).concat([s]) }); }); }
  else if (net.conn && net.conn.open) net.conn.send(s);
}
const RK = [['Bronce', '🥉', 0, 0], ['Plata', '🥈', 80, .06], ['Oro', '🥇', 150, .12], ['Platino', '💠', 250, .18], ['Esmeralda', '💚', 350, .24], ['Diamante', '💎', 500, .3], ['Maestro', '🔮', 700, .36], ['Gran Maestro', '👑', 900, .42], ['Élite', '🔥', 1200, .48], ['Leyenda', '🏆', 1600, .55]];
const CUM = [0]; for (let i = 0; i < 9; i++) CUM.push(CUM[i] + 40 + i * 10);
const RKC = ['#cd7f32', '#cbd5e1', '#facc15', '#67e8f9', '#34d399', '#60a5fa', '#c084fc', '#f472b6', '#fb923c', '#f43f5e'];
const ACC = { menu: '#facc15', shop: '#60a5fa', rew: '#fb923c', clo: '#c084fc', cfg: '#94a3b8', ctl: '#2dd4bf', onl: '#4ade80', rk: '#fbbf24', win: '#4ade80', adm: '#a78bfa' };
const rangoDe = p2 => { let r = 0; while (r < 9 && p2 >= CUM[r + 1]) r++; return r; };
function cobrarRango() { const r = rangoDe(rp); let g = 0; while (rkc < r) { rkc++; g += RK[rkc][2]; } if (g) { coins += g; sv(); } return g; }
function rangoUI() {
  st = 'rk';
  const r = rangoDe(rp), top = r >= 9, nd = top ? 1 : CUM[r + 1] - CUM[r], pc = top ? 100 : Math.floor((rp - CUM[r]) / nd * 100);
  ov('<div class="card"><div class="big">' + RK[r][1] + '</div><b class="rn">' + RK[r][0] + '</b><div class="pb big"><i style="width:' + pc + '%"></i></div><div class="pct">' + (top ? '¡Rango máximo!' : pc + '%') + '</div><small>' + (top ? rp + ' puntos acumulados' : (rp - CUM[r]) + ' / ' + nd + ' puntos · siguiente: ' + RK[r + 1][1] + ' ' + RK[r + 1][0]) + '</small><small>Cada mundo pasado da <b>10</b> puntos si te caes 2 veces o menos, y <b>3</b> si te caes más.</small></div>' + bt('menu', 'Volver'));
  $('ov').style.setProperty('--ac', RKC[r]);
}
function start() {
  build(world); aplicar(); t = 0; caidas = 0; cy = 0; bst = 0; hcd = 0; pausa = false;
  p = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, on: P[0], coy: 0, yaw: 0, dj: true };
  cp = { x: 0, y: 0, z: 0 }; cam.position.set(0, 6, 10); st = 'play'; ov(null);
}
function morir() { caidas++; p.x = cp.x; p.y = cp.y + .05; p.z = cp.z; p.vx = p.vy = p.vz = 0; p.on = null; p.coy = .1; }
function terminar() {
  if (net.on) { netFin(); coins += 10; sv(); toast('🏁 ¡Llegaste en ' + t.toFixed(1) + ' s!  +10 🪙', 4500); return onlineUI(); }
  const nuevo = world > done, pts = nuevo ? (caidas <= 2 ? 10 : 3) : 0, est = caidas === 0 ? 3 : caidas <= 3 ? 2 : 1;
  const gan = Math.round((nuevo ? 20 + world * 3 + (caidas === 0 ? 5 : 0) : 5) * (1 + RK[rangoDe(rp)][3]));
  if (nuevo) done = world;
  rp += pts; coins += gan; const gr = cobrarRango();
  let fx = false; if (world === MAX && !owned.includes('7')) { owned.push('7'); fx = true; }
  const r = rangoDe(rp), top = r >= 9, pc = top ? 100 : Math.floor((rp - CUM[r]) / (CUM[r + 1] - CUM[r]) * 100);
  world++; sv();
  toast('🎉 Mundo ' + (world - 1) + ' completado  ' + '⭐'.repeat(est) + '☆'.repeat(3 - est) + '\n🪙 +' + gan + '   🏆 +' + pts + ' pts   💥 ' + caidas + (gr ? '\n⬆ ¡Subiste a ' + RK[rkc][1] + ' ' + RK[rkc][0] + '! +' + gr + ' 🪙' : '') + (fx ? '\n🛴 ¡Desbloqueaste el Fénix Legendario!' : ''), 5500);
  menu();
}
$('ov').addEventListener('pointerdown', e => {
  const a = e.target.dataset && e.target.dataset.a;
  if (!a || performance.now() - tc < 300) return;
  if (a === 'play') { if (st === 'final') { world = 1; sv(); } start(); }
  else if (a === 'shop') tienda(); else if (a === 'menu') { if (pausa) { pausa = false; jx = jz = 0; st = 'play'; ov(null); } else menu(); } else if (a === 'cfg') config(); else if (a === 'rk') rangoUI(); else if (a === 'ctl') controlesUI(); else if (a.startsWith('o:')) ctlAct(a.slice(2)); else if (a === 'on') onlineUI(); else if (a.startsWith('n:')) netAct(a.slice(2)); else if (a.startsWith('c:')) ropaUI(a.slice(2)); else if (a.startsWith('p:')) ponerRopa(a.slice(2)); else if (a.startsWith('k:')) comprarRopa(a.slice(2)); else if (a === 'adm') entrar(); else if (a[0] === 'g') cambiarG(+a.slice(2)); else if (a.startsWith('a:')) accion(a.slice(2));
  else if (a[0] === 'r') reclamar(a.slice(2)); else if (a[0] === 'b') comprar(a.slice(2)); else if (a[0] === 'e') equipar(a.slice(2));
});

const zl = $('zl'), zr = $('zr'), base = $('base'), knob = $('knob'); let oid = null, rid = null, rx = 0;
function jpos(e) {
  const q = base.getBoundingClientRect(), R0 = q.width / 2 * .9;
  let dx = (e.clientX - q.left - q.width / 2) / R0, dz = (e.clientY - q.top - q.height / 2) / R0; const m = Math.hypot(dx, dz);
  if (m > 1) { dx /= m; dz /= m; } jx = dx; jz = dz; knob.style.transform = 'translate(' + dx * q.width * .32 + 'px,' + dz * q.width * .32 + 'px)';
}
zl.addEventListener('pointerdown', e => { if (st !== 'play') return; oid = e.pointerId; zl.setPointerCapture(oid); jpos(e); });
zl.addEventListener('pointermove', e => { if (e.pointerId === oid) jpos(e); });
const jup = e => { if (e.pointerId !== oid) return; oid = null; jx = jz = 0; knob.style.transform = ''; };
['pointerup', 'pointercancel'].forEach(n => zl.addEventListener(n, jup));
zr.addEventListener('pointerdown', e => { rid = e.pointerId; zr.setPointerCapture(rid); rx = e.clientX; });
zr.addEventListener('pointermove', e => { if (e.pointerId === rid) { cy -= (e.clientX - rx) * CT.cs * .001 * (CT.inv ? -1 : 1); rx = e.clientX; } });
['pointerup', 'pointercancel'].forEach(n => zr.addEventListener(n, e => { if (e.pointerId === rid) rid = null; }));
$('bj').addEventListener('pointerdown', e => { e.preventDefault(); if (st === 'play') jb = .12; });
function dragEl(el, key) {
  let id = null;
  el.addEventListener('pointerdown', e => { if (st !== 'ctl') return; id = e.pointerId; el.setPointerCapture(id); e.preventDefault(); });
  el.addEventListener('pointermove', e => { if (e.pointerId !== id) return; CT[key] = [Math.max(.05, Math.min(.95, e.clientX / innerWidth)), Math.max(.1, Math.min(.95, e.clientY / innerHeight))]; aplicarCT(true); });
  ['pointerup', 'pointercancel'].forEach(n => el.addEventListener(n, () => { if (id !== null) { id = null; aplicarCT(); } }));
}
dragEl(base, 'jp'); dragEl($('bj'), 'bp');
const K = { ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd' };
addEventListener('keydown', e => { if (K[e.code]) keys[K[e.code]] = 1; if (e.code === 'Space' && st === 'play') jb = .12; });
addEventListener('keyup', e => { if (K[e.code]) keys[K[e.code]] = 0; });

function update(dt) {
  if (st !== 'play' || innerHeight > innerWidth) return;
  t += dt; bst -= dt; hcd -= dt; tj += dt; if (tj - tjs > 15) { tjs = tj; sv(); }
  P.forEach(o => {
    if (o.mh) { o.mh.m.position.x = o.x + Math.sin(t * o.mh.sp + o.mh.ph) * o.mh.a; if (o.mh.ball) o.mh.m.rotation.z = -t * o.mh.sp * 3; }
    if (o.las) { o.las.on = Math.sin(t * o.las.sp + o.las.ph) > -.2; o.las.m.visible = o.las.on; }
    if (o.spin) o.spin.g.rotation.y = -(t * o.spin.sp + o.spin.ph);
    if (o.ham) { const a = Math.sin(t * o.ham.sp + o.ham.ph) * 1.2; o.ham.g.rotation.z = a; o.ham.hx = o.x + 3 * Math.sin(a); o.ham.hy = o.y + 4 - 3 * Math.cos(a); }
    if (o.k === 'm') { const a = o.x; o.x = o.bx + Math.sin(t * o.sp) * o.a; o.dx = o.x - a; o.mesh.position.x = o.x; }
    if (o.k === 'd') {
      if (o.tm > 0) { o.tm += dt; o.mesh.material.emissive.setHex(Math.floor(o.tm * 15) % 2 ? 0x884400 : 0); if (o.tm > Math.max(.7 - world * .005, .4)) { o.hide = 1.8; o.tm = 0; } }
      if (o.hide > 0) { o.hide -= dt; if (o.hide <= 0) o.mesh.material.emissive.setHex(0); }
      o.hidden = o.hide > 0; o.mesh.visible = !o.hidden;
    }
  });
  if (p.on && !p.on.hidden) p.x += p.on.dx;
  if (p.on && p.on.conv) p.x += p.on.conv.vx * dt;
  let ix = jx + keys.r - keys.l, iz = jz + keys.d - keys.u; const m = Math.hypot(ix, iz);
  if (m > 1) { ix /= m; iz /= m; }
  const max = Math.min(8 + world * .08, 13.2) * ST.s * (bst > 0 ? 1.35 : 1) * (adm.spd ? 1.8 : 1), cs = Math.cos(cy), sn = Math.sin(cy);
  const wx = ix * cs + iz * sn, wz = -ix * sn + iz * cs;
  if (m > .05) {
    const c = p.on ? 1 : .7, sp0 = Math.hypot(p.vx, p.vz);
    p.vx += wx * 34 * ST.a * c * dt * (adm.spd ? 2 : 1); p.vz += wz * 34 * ST.a * c * dt * (adm.spd ? 2 : 1);
    if (sp0 > .5) { const k = Math.min(1, dt * (p.on ? 14 : 7) * FR / 10) * m; p.vx += (wx / m * sp0 - p.vx) * k; p.vz += (wz / m * sp0 - p.vz) * k; }
  }
  else if (p.on) { const sp = Math.hypot(p.vx, p.vz), f = Math.min(sp, FR * dt); if (sp > 0) { p.vx -= p.vx / sp * f; p.vz -= p.vz / sp * f; } }
  const sp2 = Math.hypot(p.vx, p.vz); if (sp2 > max) { p.vx *= max / sp2; p.vz *= max / sp2; }
  jb -= dt; p.coy -= dt;
  if (jb > 0 && (p.on || p.coy > 0)) { p.vy = 9.5 * ST.j; p.on = null; p.coy = 0; jb = 0; }
  else if (jb > 0 && (ST.dj || adm.inf) && (p.dj || adm.inf)) { p.vy = 9.5 * ST.j * .95; p.dj = false; jb = 0; }
  if (adm.fly) { p.vy = Math.max(p.vy - 3 * dt, -1.5); if (jb > 0) { p.vy = 8; jb = 0; } } else p.vy -= 24 * dt;
  const nx = p.x + p.vx * dt, nz = p.z + p.vz * dt; let ny = p.y + p.vy * dt, land = null;
  if (p.vy <= 0) for (const o of P) {
    if (o.hidden) continue;
    if (p.y >= o.y - .4 && ny <= o.y && Math.abs(nx - o.x) < o.w / 2 + .25 && Math.abs(nz - o.z) < o.d / 2 + .25) { land = o; ny = o.y; break; }
  }
  p.x = nx; p.y = ny; p.z = nz;
  if (land) {
    p.vy = 0; p.on = land; p.coy = .12; p.dj = true;
    if (land.cp) {
      cp = { x: land.x, y: land.y, z: land.z };
      if (land !== P[0] && !land.got && !net.on) { land.got = 1; const g = Math.round((world > done ? 5 + Math.floor(world / 6) : 1) * (1 + RK[rangoDe(rp)][3])); coins += g; toast('📍 Checkpoint · +' + g + ' 🪙'); }
    }
    if (land.k === 'd' && land.tm === 0) land.tm = .001;
    if (land.tr && Math.hypot(p.x - land.x, p.z - land.z) < 1.3) { p.vy = 15; p.on = null; p.coy = 0; }
    if (land.end) return terminar();
  } else p.on = null;
  if (p.on && p.on.tun && Math.abs(p.x - p.on.x) < 1.7 && Math.abs(p.z - p.on.z) < 2.7) { bst = Math.max(bst, .3); p.vz -= 22 * dt; }
  if (p.on && p.on.ramp) { const rz = p.on.z - p.on.d * .25; if (p.vz < -2 && Math.abs(p.x - p.on.x) < 1.3 && p.z < rz - .5 && p.z > rz - 1.4) { p.vy = 8 + Math.hypot(p.vx, p.vz) * .35; p.on = null; p.coy = 0; bst = .9; } }
  for (const o of P) { const h = o.ham; if (h && hcd <= 0 && !adm.god && Math.abs(p.x - h.hx) < 1 && Math.abs(p.z - o.z) < 1.2 && p.y < h.hy + .5 && p.y + 1.6 > h.hy - .5) { p.vx = Math.cos(t * h.sp + h.ph) >= 0 ? 13 : -13; p.vy = 6; p.on = null; hcd = .7; } }
  for (const o of P) {
    const s = o.spin;
    if (s && hcd <= 0 && !adm.god && p.y < o.y + 1 && p.y + 1.6 > o.y + .45) {
      const a2 = t * s.sp + s.ph, c2 = Math.cos(a2), n2 = Math.sin(a2), dx = p.x - o.x, dz = p.z - o.z, pr = Math.max(-s.L / 2, Math.min(s.L / 2, dx * c2 + dz * n2)), ex = dx - pr * c2, ez = dz - pr * n2;
      if (ex * ex + ez * ez < .5) { const d = Math.hypot(ex, ez) || 1; p.vx = ex / d * 12; p.vz = ez / d * 12; p.vy = 5; p.on = null; hcd = .7; }
    }
    if (o.mh && hcd <= 0 && !adm.god && Math.abs(p.x - o.mh.m.position.x) < o.mh.r && Math.abs(p.z - o.z) < o.mh.hz && p.y < o.y + o.mh.h) { p.vx = (p.x >= o.mh.m.position.x ? 1 : -1) * 10; p.vy = 5; p.on = null; hcd = .7; }
    if (o.las && o.las.on && hcd <= 0 && !adm.god && Math.abs(p.z - o.z) < .35 && Math.abs(p.x - o.x) < o.w / 2 + .5 && p.y < o.y + .9) { p.vz = 9; p.vy = 4; p.on = null; hcd = .7; }
    if (o.wall && Math.abs(p.x - o.x) < o.wall.w / 2 + .25 && Math.abs(p.z - o.z) < .75 && p.y < o.y + 1.2 && p.y > o.y - 1) { p.z = p.z > o.z ? o.z + .75 : o.z - .75; p.vz = 0; }
  }
  for (const o of P) if (o.lava && Math.abs(p.x - o.x) < o.lava.w / 2 + .2 && Math.abs(p.z - o.z) < .8 && p.y < o.y + .7) { if (!adm.god) morir(); break; }
  for (const q of GEMS) if (!q.got && Math.abs(p.x - q.x) < 1 && Math.abs(p.z - q.z) < 1 && Math.abs(p.y + .8 - q.y) < 1.5) { q.got = 1; q.m.visible = false; if (world > done && !net.on) coins += 1; }
  if (p.y < -10) morir();
}

let yaw = 0, hudT = '';
function trailStep(dt, tm) {
  const sp = Math.hypot(p.vx, p.vz), a = tg.attributes.position.array;
  if (!trail.visible) return;
  TS.acc += TS.rate * dt * (sp > 1.5 ? 1 : .2);
  while (TS.acc >= 1) { TS.acc -= 1; const i = tni++ % TN; a[i * 3] = p.x + Math.sin(yaw) * .8 + (Math.random() - .5) * .2; a[i * 3 + 1] = p.y + .3 + Math.random() * .2; a[i * 3 + 2] = p.z + Math.cos(yaw) * .8 + (Math.random() - .5) * .2; tl[i] = .7; }
  for (let i = 0; i < TN; i++) if (tl[i] > 0) { tl[i] -= dt; a[i * 3 + 1] += TS.rise * dt; a[i * 3] += (Math.random() - .5) * TS.spr * dt * 4; if (tl[i] <= 0) a[i * 3 + 1] = -999; }
  tg.attributes.position.needsUpdate = true;
  wingSides.forEach((s, i) => { s.rotation.z = (i ? 1 : -1) * (.25 + Math.sin(tm * 9) * .22 * (p.on ? .3 : 1)); });
}
let sq = 0, lastOn = false, lastYaw = 0;
function animar(dt, tm) {
  const sp = Math.hypot(p.vx, p.vz), on = !!p.on, k = Math.min(1, dt * 8);
  if (on && !lastOn) sq = .18; lastOn = on; sq = Math.max(0, sq - dt * .9);
  H.scale.set(1 + sq * .5, 1 - sq, 1 + sq * .5);
  const dy = Math.atan2(Math.sin(yaw - lastYaw), Math.cos(yaw - lastYaw)) / Math.max(dt, .001); lastYaw = yaw;
  H.rotation.z += (Math.max(-.35, Math.min(.35, -dy * .04)) - H.rotation.z) * k;
  H.rotation.x += (Math.max(-.3, Math.min(.3, -p.vy * .02)) - H.rotation.x) * k;
  wheelA.rotation.x += sp * dt * 5 * (on ? 1 : .3); wheelB.rotation.x = wheelA.rotation.x;
  const push = on && sp > 1.5 ? Math.sin(tm * 9) : 0, fl = Math.min(1, sp / 6);
  RD.legR.rotation.x = on ? push * .5 : .45; RD.shoeR.position.z = .05 + (on ? push * .12 : -.1); RD.legL.rotation.x = on ? 0 : .45;
  RD.torso.rotation.x = -Math.min(.15, sp * .012); RD.head.position.y = 1.48 + (on && sp > 1 ? Math.sin(tm * 8) * .012 : 0);
  RD.cape.rotation.x = .12 + Math.sin(tm * 9) * .08 * fl + (on ? 0 : .25); RD.scarf.rotation.z = Math.sin(tm * 7) * .08 * fl;
}
function render(dt) {
  const tm = performance.now() / 1000;
  H.position.set(p.x, p.y, p.z);
  if (Math.hypot(p.vx, p.vz) > 1) { const tg = Math.atan2(-p.vx, -p.vz); let d = tg - yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); yaw += d * Math.min(1, dt * 10); }
  H.rotation.y = yaw;
  let top = null;
  for (const o of P) if (!o.hidden && o.y <= p.y + .3 && Math.abs(p.x - o.x) < o.w / 2 && Math.abs(p.z - o.z) < o.d / 2 && (top === null || o.y > top)) top = o.y;
  disc.visible = top !== null && G < 2;
  if (top !== null) { disc.position.set(p.x, top + .03, p.z); disc.scale.setScalar(Math.max(.4, 1.5 - (p.y - top) * .2)); }
  lava.position.set(p.x, -9 + Math.sin(tm * 1.5) * .25, p.z);
  AN.forEach(a => { const m = a.m; if (a.t === 'sway') m.rotation.z = Math.sin(tm * 1.4 + a.ph) * .06; else if (a.t === 'spin') m.rotation.y += dt * .8; else if (a.t === 'wave') m.rotation.y = Math.sin(tm * 4 + a.ph) * .35; else if (a.t === 'gem') { m.rotation.y += dt * 2; m.position.y = a.y0 + Math.sin(tm * 2 + a.ph) * .25; } else m.position.y = a.y0 + Math.sin(tm * 1.2 + a.ph) * 1.2; });
  cloudM.position.x = (tm * 1.5) % 100;
  if (parts.visible) {
    for (let i = 0; i < PN; i++) {
      const j = i * 3; pa[j] += Math.sin(tm + i) * dt * .6; pa[j + 1] += PV * dt; pa[j + 2] += Math.cos(tm * .8 + i) * dt * .6;
      if (Math.abs(pa[j] - p.x) > 22 || Math.abs(pa[j + 2] - p.z) > 22 || Math.abs(pa[j + 1] - p.y) > 13) { pa[j] = p.x + (Math.random() - .5) * 40; pa[j + 2] = p.z + (Math.random() - .5) * 40; pa[j + 1] = p.y + (PV < 0 ? 12 : PV > 1 ? -12 : (Math.random() - .5) * 20); }
    }
    pg.attributes.position.needsUpdate = true;
  }
  if (G === 2) { sun.position.set(p.x + 8, p.y + 22, p.z + 10); sun.target.position.set(p.x, p.y, p.z); sun.target.updateMatrixWorld(); }
  if (st === 'menu') { const a = tm * .35; cam.position.set(p.x + Math.sin(a) * 4.4, p.y + 1.9, p.z + Math.cos(a) * 4.4); cam.lookAt(p.x, p.y + 1.1, p.z); cam.translateX(1.6); }
  else {
  const por = cam.aspect < 1, bk = por ? 12 : 8.5, hh = por ? 7 : 5.2, sn = Math.sin(cy), cs = Math.cos(cy);
  cam.position.lerp(new THREE.Vector3(p.x + sn * bk, p.y + hh, p.z + cs * bk), Math.min(1, dt * 5));
  cam.lookAt(p.x - sn * 5, p.y + 1.2, p.z - cs * 5);
  }
  const h = RK[rangoDe(rp)][1] + ' ' + RK[rangoDe(rp)][0] + ' · Mundo ' + world + ' · ' + thN + '   🪙 ' + coins + '   Caídas: ' + caidas + (net.on ? '   🌐 ' + (Object.keys(AV).length + 1) : '');
  if (h !== hudT) { $('hud').textContent = h; hudT = h; }
  $('fill').style.width = Math.max(0, Math.min(p.z / endZ, 1)) * 100 + '%';
  sky.position.copy(cam.position); trailStep(dt, tm); animar(dt, tm); netStep(dt);
  R.render(sc, cam);
}

gfx(G); build(world);
p = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, on: P[0], coy: 0, yaw: 0, dj: true }; cp = { x: 0, y: 0, z: 0 };
aplicarCT(); aplicar(); { const g0 = cobrarRango(); if (g0) toast('🏆 Recompensas de rango: +' + g0 + ' 🪙'); } menu();
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
