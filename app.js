// ============================================================
// Digimon Vpet Favorite Picker
// Pestañas por grupo -> sub-pestañas por vpet.
// Se muestra UN roster a la vez. Un favorito por vpet.
// La lista completa de favoritos va al final de la página.
// ============================================================

const STORAGE_KEY = "vpet-favoritos";

let favoritos = cargarFavoritos(); // { vpetId: digimonId }
let grupoActivo = GRUPOS[0].id;

// Recuerda qué vpet estabas viendo en cada grupo
const vpetActivoPorGrupo = {};
for (const g of GRUPOS) vpetActivoPorGrupo[g.id] = g.vpets[0]?.id;

function cargarFavoritos() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function guardarFavoritos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos));
}

// ---------- Primera aparición (para detectar repetidos) ----------
// Recorre TODO el archivo en orden: la primera vez que aparece un id,
// ese vpet es su debut. Las siguientes apariciones son "repetidos".

const primeraAparicion = {};
for (const g of GRUPOS)
  for (const v of g.vpets)
    for (const d of v.digimon)
      if (!(d.id in primeraAparicion)) primeraAparicion[d.id] = v.id;

function esRepetido(vpet, d) {
  return primeraAparicion[d.id] !== vpet.id;
}

// ---------- Pestañas de grupo ----------

function renderTabs() {
  const bar = document.getElementById("tabs");
  bar.innerHTML = "";
  for (const g of GRUPOS) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tab" + (g.id === grupoActivo ? " activa" : "");
    btn.textContent = g.nombre;
    btn.addEventListener("click", () => {
      grupoActivo = g.id;
      renderTabs();
      renderSubtabs();
      renderVpet();
      renderChart();
    });
    bar.appendChild(btn);
  }
}

// ---------- Sub-pestañas: qué vpet ver dentro del grupo ----------

function renderSubtabs() {
  const bar = document.getElementById("subtabs");
  bar.innerHTML = "";
  const grupo = GRUPOS.find((g) => g.id === grupoActivo);

  for (const vpet of grupo.vpets) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "subtab" + (vpet.id === vpetActivoPorGrupo[grupoActivo] ? " activa" : "");
    // Puntito si ese vpet ya tiene favorito elegido
    btn.innerHTML =
      (favoritos[vpet.id] ? `<span class="dot"></span>` : "") + vpet.nombre;
    btn.addEventListener("click", () => {
      vpetActivoPorGrupo[grupoActivo] = vpet.id;
      renderSubtabs();
      renderVpet();
      renderChart();
    });
    bar.appendChild(btn);
  }
}

// ---------- Roster del vpet activo (uno solo) ----------

function renderVpet() {
  const cont = document.getElementById("vpets");
  cont.innerHTML = "";
  const grupo = GRUPOS.find((g) => g.id === grupoActivo);
  const vpet = grupo.vpets.find((v) => v.id === vpetActivoPorGrupo[grupoActivo]);
  if (!vpet) return;

  const sec = document.createElement("section");
  sec.className = "vpet";

  const header = document.createElement("div");
  header.className = "vpet-header";
  header.innerHTML =
    `<h2>${vpet.nombre}</h2><span class="vpet-anio">${vpet.anio ?? ""}</span>`;
  sec.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "vpet-grid";

  if (vpet.digimon.length === 0) {
    grid.innerHTML = `<p class="grid-vacia">Roster pendiente</p>`;
  } else {
    for (const d of vpet.digimon) grid.appendChild(crearCelda(vpet, d));
  }

  sec.appendChild(grid);
  cont.appendChild(sec);
  actualizarSeleccion();
}

function crearCelda(vpet, d) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "celda" + (esRepetido(vpet, d) ? " repetido" : "");
  btn.dataset.vpet = vpet.id;
  btn.dataset.digimon = d.id;
  btn.title = d.nombre;

  const img = document.createElement("img");
  img.src = d.img;
  img.alt = d.nombre;
  img.loading = "lazy";
  img.onerror = () => {
    img.remove();
    const ph = document.createElement("div");
    ph.className = "placeholder";
    ph.textContent = d.nombre[0].toUpperCase();
    btn.prepend(ph);
  };

  const nombre = document.createElement("span");
  nombre.className = "celda-nombre";
  nombre.textContent = d.nombre;

  btn.append(img, nombre);

  btn.addEventListener("click", () => {
    if (favoritos[vpet.id] === d.id) delete favoritos[vpet.id];
    else favoritos[vpet.id] = d.id;
    guardarFavoritos();
    actualizarSeleccion();
    renderSubtabs(); // actualiza el puntito de "ya elegido"
    renderResumen();
  });

  return btn;
}

function actualizarSeleccion() {
  document.querySelectorAll(".celda").forEach((c) => {
    c.classList.toggle(
      "seleccionado",
      favoritos[c.dataset.vpet] === c.dataset.digimon
    );
  });
}

// ---------- Toggle repetidos / solo nuevos ----------

document.getElementById("toggle-repetidos").addEventListener("change", (e) => {
  document.body.classList.toggle("solo-nuevos", !e.target.checked);
});

// ---------- Lista completa de favoritos (al final) ----------

function renderResumen() {
  const grid = document.getElementById("resumen-grid");
  grid.innerHTML = "";
  let hay = false;

  for (const g of GRUPOS) {
    for (const vpet of g.vpets) {
      const elegido = vpet.digimon.find((d) => d.id === favoritos[vpet.id]);
      if (!elegido) continue;
      hay = true;

      const slot = document.createElement("div");
      slot.className = "slot";

      const img = document.createElement("img");
      img.src = elegido.img;
      img.alt = elegido.nombre;
      img.onerror = () => {
        img.remove();
        const ph = document.createElement("div");
        ph.className = "placeholder";
        ph.textContent = elegido.nombre[0].toUpperCase();
        slot.prepend(ph);
      };
      slot.appendChild(img);
      slot.insertAdjacentHTML(
        "beforeend",
        `<span class="slot-nombre">${elegido.nombre}</span>
         <span class="slot-vpet">${vpet.nombre}</span>`
      );
      grid.appendChild(slot);
    }
  }

  if (!hay) grid.innerHTML = `<p class="resumen-vacio">Todavía no elegiste ninguno</p>`;
}

// ---------- Líneas evolutivas ----------
// Sincronizadas con la selección de arriba: muestran los charts
// del vpet activo. "Digital Monster" puede tener varios charts
// (Ver.1, Ver.2...) usando un array en evoChart.

function renderChart() {
  const cont = document.getElementById("chart-view");
  cont.innerHTML = "";
  const grupo = GRUPOS.find((g) => g.id === grupoActivo);
  const vpet = grupo.vpets.find((v) => v.id === vpetActivoPorGrupo[grupoActivo]);
  if (!vpet) return;

  const header = document.createElement("div");
  header.className = "vpet-header";
  header.innerHTML =
    `<h2>${vpet.nombre}</h2><span class="vpet-anio">${vpet.anio ?? ""}</span>`;
  cont.appendChild(header);

  // evoChart puede ser un string o un array de rutas
  const charts = [].concat(vpet.evoChart || []);

  if (charts.length === 0) {
    cont.insertAdjacentHTML(
      "beforeend",
      `<p class="chart-pendiente">Este vpet no tiene chart cargado en data.js</p>`
    );
    return;
  }

  for (const ruta of charts) {
    const img = document.createElement("img");
    img.src = ruta;
    img.alt = "Línea evolutiva de " + vpet.nombre;
    img.loading = "lazy";
    img.onerror = () => {
      img.replaceWith(
        Object.assign(document.createElement("p"), {
          className: "chart-pendiente",
          textContent: "Imagen pendiente: " + ruta,
        })
      );
    };
    cont.appendChild(img);
  }
}

// ---------- Reset ----------

document.getElementById("btn-reset").addEventListener("click", () => {
  favoritos = {};
  guardarFavoritos();
  actualizarSeleccion();
  renderSubtabs();
  renderResumen();
});

// ---------- Init ----------

renderTabs();
renderSubtabs();
renderVpet();
renderChart();
renderResumen();
