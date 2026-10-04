let tareas = JSON.parse(localStorage.getItem('tareas') || '[]');
const lista = document.getElementById('lista');
const entrada = document.getElementById('entrada');
const vacio = document.getElementById('vacio');

function guardar() { localStorage.setItem('tareas', JSON.stringify(tareas)); }

function dibujar() {
  lista.innerHTML = '';
  tareas.forEach((t, i) => {
    const li = document.createElement('li');
    if (t.hecha) li.className = 'hecha';
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = t.hecha;
    chk.onchange = () => { t.hecha = chk.checked; guardar(); dibujar(); };
    const txt = document.createElement('span');
    txt.textContent = t.texto;
    const del = document.createElement('button');
    del.textContent = 'X';
    del.onclick = () => { tareas.splice(i, 1); guardar(); dibujar(); };
    li.append(chk, txt, del);
    lista.append(li);
  });
  vacio.style.display = tareas.length ? 'none' : 'block';
}

function agregar() {
  const texto = entrada.value.trim();
  if (!texto) return;
  tareas.push({ texto, hecha: false });
  entrada.value = '';
  guardar();
  dibujar();
}

document.getElementById('agregar').onclick = agregar;
entrada.addEventListener('keydown', e => { if (e.key === 'Enter') agregar(); });
dibujar();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
