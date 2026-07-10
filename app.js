// ============================================================
// Digimon Vpet Favorite Picker
// Pestañas por grupo -> sub-pestañas por vpet.
// Se muestra UN roster a la vez. Un favorito por vpet.
// La lista completa de favoritos va al final de la página.
// ============================================================

const STORAGE_KEY = "vpet-favoritos-v2";
const MODO_KEY = "vpet-modo-favoritos";

// { vpet: { vpetId: digimonId }, version: { seccionKey: digimonId } }
let favoritos = cargarFavoritos();
// "vpet" = un favorito por dispositivo | "version" = uno por versión
let modoFavoritos = localStorage.getItem(MODO_KEY) || "vpet";
let grupoActivo = GRUPOS[0].id;

// Recuerda qué vpet estabas viendo en cada grupo
const vpetActivoPorGrupo = {};
for (const g of GRUPOS) vpetActivoPorGrupo[g.id] = g.vpets[0]?.id;

function cargarFavoritos() {
  try {
    const v2 = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (v2 && v2.vpet) return v2;
    // migrar del formato viejo (solo por vpet)
    const v1 = JSON.parse(localStorage.getItem("vpet-favoritos")) || {};
    return { vpet: v1, version: {} };
  } catch { return { vpet: {}, version: {} }; }
}
function guardarFavoritos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos));
}

// ---------- Primera aparición (para detectar repetidos) ----------
// Recorre TODO el archivo en orden: la primera vez que aparece un id,
// ese vpet es su debut. Las siguientes apariciones son "repetidos".

// Un vpet puede tener digimon sueltos (vpet.digimon) o separados
// en versiones (vpet.versiones = [{nombre, digimon}]). Estas
// funciones normalizan ambos casos.

function secciones(vpet) {
  if (vpet.versiones)
    return vpet.versiones.map((v, i) => ({
      key: vpet.id + "/" + i,
      nombre: v.nombre,
      anio: v.anio,
      digimon: v.digimon || [],
    }));
  return [{ key: vpet.id, nombre: null, digimon: vpet.digimon || [] }];
}

function listaDigimon(vpet) {
  return secciones(vpet).flatMap((s) => s.digimon);
}

// La primera aparición se calcula por sección: si Agumon está en
// Ver.1 y Ver.2 del mismo vpet, el de Ver.2 también cuenta como
// repetido y el toggle lo oculta.
const primeraAparicion = {};
for (const g of GRUPOS)
  for (const v of g.vpets)
    for (const s of secciones(v))
      for (const d of s.digimon)
        if (!(d.id in primeraAparicion)) primeraAparicion[d.id] = s.key;

function esRepetido(seccionKey, d) {
  return primeraAparicion[d.id] !== seccionKey;
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
      chartIndex = 0;
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
    const tiene = modoFavoritos === "vpet"
      ? !!favoritos.vpet[vpet.id]
      : secciones(vpet).some((s) => favoritos.version[s.key]);
    btn.innerHTML = (tiene ? `<span class="dot"></span>` : "") + vpet.nombre;
    btn.addEventListener("click", () => {
      vpetActivoPorGrupo[grupoActivo] = vpet.id;
      chartIndex = 0;
      renderSubtabs();
      renderVpet();
      renderChart();
    });
    bar.appendChild(btn);
  }
}

// Flechas del carrusel de vpets
const tiraSubtabs = document.getElementById("subtabs");
document.getElementById("subtabs-prev").addEventListener("click", () =>
  tiraSubtabs.scrollBy({ left: -300, behavior: "smooth" }));
document.getElementById("subtabs-next").addEventListener("click", () =>
  tiraSubtabs.scrollBy({ left: 300, behavior: "smooth" }));

// Flechas del carrusel de vpets: desplazan la tira de a un "paso"
const tiraVpets = document.getElementById("subtabs");
document.getElementById("subtabs-prev").addEventListener("click", () => {
  tiraVpets.scrollBy({ left: -tiraVpets.clientWidth * 0.7, behavior: "smooth" });
});
document.getElementById("subtabs-next").addEventListener("click", () => {
  tiraVpets.scrollBy({ left: tiraVpets.clientWidth * 0.7, behavior: "smooth" });
});

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
    `<h2>${vpet.nombre}${vpet.anio ? ` <span class="anio">(${vpet.anio})</span>` : ""}</h2>`;
  sec.appendChild(header);

  // Una sola grilla (una sola pantalla LCD); las versiones se
  // separan con una línea que ocupa el ancho completo de la grilla.
  const grid = document.createElement("div");
  grid.className = "vpet-grid";

  const secs = secciones(vpet);
  let vacio = true;

  for (const s of secs) {
    if (s.nombre) {
      const div = document.createElement("div");
      div.className = "version-divisor";
      div.innerHTML = `<span class="version-nombre">${s.nombre}${
        s.anio ? ` (${s.anio})` : ""
      }</span>`;
      grid.appendChild(div);
    }
    if (s.digimon.length === 0) {
      grid.insertAdjacentHTML(
        "beforeend",
        `<p class="grid-vacia">Roster pendiente</p>`
      );
    } else {
      vacio = false;
      for (const d of s.digimon) grid.appendChild(crearCelda(vpet, s, d));
    }
  }

  if (secs.length === 1 && vacio) grid.innerHTML = `<p class="grid-vacia">Roster pendiente</p>`;

  sec.appendChild(grid);
  cont.appendChild(sec);
  actualizarSeleccion();
}

function crearCelda(vpet, s, d) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "celda" + (esRepetido(s.key, d) ? " repetido" : "");
  btn.dataset.vpet = vpet.id;
  btn.dataset.seccion = s.key;
  btn.dataset.digimon = d.id;
  btn.title = d.nombre;

  // Imagen base: el arte. Si no hay arte (o falla), cae al sprite,
  // y si tampoco hay sprite, al placeholder con la inicial.
  const img = document.createElement("img");
  img.src = d.arte || d.img;
  if (d.arte) img.classList.add("es-arte");
  img.alt = d.nombre;
  img.loading = "lazy";
  img.onerror = () => {
    if (d.arte && img.src !== new URL(d.img, location).href) {
      img.classList.remove("es-arte");
      img.src = d.img; // arte falló -> probar el sprite
      return;
    }
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

  // Sprite (opcional si hay arte): aparece al pasar el mouse y en el
  // seleccionado. Se carga recién en ese momento.
  if (d.arte && d.img) {
    btn.dataset.alt = d.img;
    btn.addEventListener("mouseenter", () => cargarAlt(btn));
  }

  btn.addEventListener("click", () => {
    const mapa = favoritos[modoFavoritos];
    const clave = modoFavoritos === "vpet" ? vpet.id : s.key;
    if (mapa[clave] === d.id) delete mapa[clave];
    else mapa[clave] = d.id;
    guardarFavoritos();
    actualizarSeleccion();
    renderSubtabs(); // actualiza el puntito de "ya elegido"
    renderResumen();
  });

  return btn;
}

function cargarAlt(btn) {
  if (!btn.dataset.alt || btn.dataset.altLista || btn.dataset.altFallida) return;
  btn.dataset.altLista = "1";
  const a = document.createElement("img");
  a.className = "alt";
  a.src = btn.dataset.alt;
  a.alt = "";
  a.loading = "lazy";
  // Si el sprite no existe, se queda el arte sin romper nada
  a.onerror = () => {
    a.remove();
    btn.dataset.altFallida = "1";
  };
  btn.appendChild(a);
}

function actualizarSeleccion() {
  document.querySelectorAll(".celda").forEach((c) => {
    const clave = modoFavoritos === "vpet" ? c.dataset.vpet : c.dataset.seccion;
    const sel = favoritos[modoFavoritos][clave] === c.dataset.digimon;
    c.classList.toggle("seleccionado", sel);
    if (sel) cargarAlt(c); // el elegido muestra su sprite
  });
}

// ---------- Toggle repetidos / solo nuevos ----------

document.getElementById("toggle-repetidos").addEventListener("change", (e) => {
  document.body.classList.toggle("solo-nuevos", !e.target.checked);
});

// ---------- Lista completa de favoritos (al final) ----------

function recolectarFavoritos() {
  // Devuelve [{ nombre, img, arte, etiqueta }] según el modo activo
  const items = [];
  for (const g of GRUPOS) {
    for (const vpet of g.vpets) {
      if (modoFavoritos === "vpet") {
        const elegido = listaDigimon(vpet).find(
          (d) => d.id === favoritos.vpet[vpet.id]
        );
        if (elegido) items.push({ ...elegido, etiqueta: vpet.nombre });
      } else {
        for (const s of secciones(vpet)) {
          const elegido = s.digimon.find(
            (d) => d.id === favoritos.version[s.key]
          );
          if (elegido)
            items.push({ ...elegido, etiqueta: s.nombre || vpet.nombre });
        }
      }
    }
  }
  return items;
}

function renderResumen() {
  const grid = document.getElementById("resumen-grid");
  grid.innerHTML = "";

  // Botones de modo
  document.getElementById("modo-vpet").classList.toggle("activa", modoFavoritos === "vpet");
  document.getElementById("modo-version").classList.toggle("activa", modoFavoritos === "version");

  const items = recolectarFavoritos();
  if (items.length === 0) {
    grid.innerHTML = `<p class="resumen-vacio">Todavía no elegiste ninguno</p>`;
    return;
  }

  for (const it of items) {
    const slot = document.createElement("div");
    slot.className = "slot";

    const img = document.createElement("img");
    img.src = it.arte || it.img;
    if (it.arte) img.classList.add("es-arte");
    img.alt = it.nombre;
    img.loading = "lazy";
    img.onerror = () => {
      if (it.arte && img.src !== new URL(it.img, location).href) {
        img.classList.remove("es-arte");
        img.src = it.img;
        return;
      }
      img.remove();
      const ph = document.createElement("div");
      ph.className = "placeholder";
      ph.textContent = it.nombre[0].toUpperCase();
      slot.prepend(ph);
    };
    slot.appendChild(img);
    slot.insertAdjacentHTML(
      "beforeend",
      `<span class="slot-nombre">${it.nombre}</span>
       <span class="slot-vpet">${it.etiqueta}</span>`
    );
    grid.appendChild(slot);
  }
}

// ---------- Cambiar de modo ----------

for (const modo of ["vpet", "version"]) {
  document.getElementById("modo-" + modo).addEventListener("click", () => {
    modoFavoritos = modo;
    localStorage.setItem(MODO_KEY, modo);
    actualizarSeleccion();
    renderSubtabs();
    renderResumen();
  });
}

// ---------- Descargar la lista como una sola imagen ----------

function intentarImagen(src) {
  return new Promise((res) => {
    const i = new Image();
    i.crossOrigin = "anonymous"; // necesario para poder exportar el canvas
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = src;
  });
}

async function cargarImagen(src) {
  // 1) Directo. Funciona con imágenes locales (mismo origen) o
  //    con servidores que permiten CORS.
  let im = await intentarImagen(src);
  if (im) return im;

  // 2) Wikimon no manda headers CORS, así que las remotas fallan.
  //    Fallback: proxy de imágenes wsrv.nl, que las re-sirve con CORS.
  if (/^https?:\/\//i.test(src)) {
    const proxied =
      "https://wsrv.nl/?url=" + encodeURIComponent(src.replace(/^https?:\/\//, ""));
    im = await intentarImagen(proxied);
    if (im) return im;
  }
  return null;
}

document.getElementById("btn-descargar").addEventListener("click", async () => {
  const items = recolectarFavoritos();
  if (items.length === 0) return alert("Todavía no elegiste ningún favorito.");

  const btn = document.getElementById("btn-descargar");
  btn.disabled = true;
  btn.textContent = "Generando...";

  const size = 150, pad = 18, textoH = 46;
  const cols = Math.min(5, items.length);
  const filas = Math.ceil(items.length / cols);
  const cardW = size + pad, cardH = size + textoH + pad;

  const canvas = document.createElement("canvas");
  canvas.width = pad + cols * cardW;
  canvas.height = 80 + filas * cardH;
  const ctx = canvas.getContext("2d");

  // Fondo y título con la estética de la página
  ctx.fillStyle = "#050c18";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#5dffa9";
  ctx.font = "bold 28px 'VT323', monospace";
  ctx.textAlign = "center";
  ctx.fillText("MIS FAVORITOS DIGIMON", canvas.width / 2, 44);

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const x = pad + (i % cols) * cardW;
    const y = 80 + Math.floor(i / cols) * cardH;

    const im = (await cargarImagen(it.arte || it.img)) || (await cargarImagen(it.img));
    if (im) {
      // dibujar contenida en el cuadro sin deformar
      const esc = Math.min(size / im.width, size / im.height);
      const w = im.width * esc, h = im.height * esc;
      // sprites pixelados sin suavizar; artes con suavizado
      ctx.imageSmoothingEnabled = !im.src.endsWith(".gif");
      ctx.drawImage(im, x + (size - w) / 2, y + (size - h) / 2, w, h);
    }

    ctx.fillStyle = "#d9f4ff";
    ctx.font = "bold 15px Inter, sans-serif";
    ctx.fillText(recortar(ctx, it.nombre, size), x + size / 2, y + size + 20);
    ctx.fillStyle = "#38e1ff";
    ctx.font = "12px Inter, sans-serif";
    ctx.fillText(recortar(ctx, it.etiqueta, size), x + size / 2, y + size + 38);
  }

  try {
    canvas.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "mis-favoritos-digimon.png";
      a.click();
      URL.revokeObjectURL(a.href);
    });
  } catch (e) {
    // Canvas "tainted": el servidor de las imágenes no permite CORS
    alert(
      "No se pudo exportar: las imágenes remotas no permiten CORS.\n" +
      "Solución: descargá las imágenes a local con descargar-imagenes.js " +
      "y la exportación va a funcionar."
    );
  }

  btn.disabled = false;
  btn.textContent = "Descargar imagen";
});

function recortar(ctx, texto, maxW) {
  if (ctx.measureText(texto).width <= maxW) return texto;
  while (texto.length > 3 && ctx.measureText(texto + "…").width > maxW)
    texto = texto.slice(0, -1);
  return texto + "…";
}

// ---------- Líneas evolutivas ----------
// Sincronizadas con la selección de arriba: muestran los charts
// del vpet activo. "Digital Monster" puede tener varios charts
// (Ver.1, Ver.2...) usando un array en evoChart.

let chartsVisibles = false;
let chartIndex = 0;
let chartVpetAnterior = null;

document.getElementById("btn-charts").addEventListener("click", () => {
  chartsVisibles = !chartsVisibles;
  document.getElementById("btn-charts").textContent =
    chartsVisibles ? "Ocultar imágenes" : "Mostrar imágenes";
  renderChart();
});

// Normaliza evoChart: acepta string, array de strings, o array de
// objetos { titulo, img }. Sin titulo usa el nombre del vpet.
function chartsDe(vpet) {
  return [].concat(vpet.evoChart || []).map((c) =>
    typeof c === "string" ? { titulo: vpet.nombre, img: c } : c
  );
}

function renderChart() {
  const cont = document.getElementById("chart-view");
  cont.innerHTML = "";
  cont.classList.toggle("oculto", !chartsVisibles);
  if (!chartsVisibles) return;

  const grupo = GRUPOS.find((g) => g.id === grupoActivo);
  const vpet = grupo.vpets.find((v) => v.id === vpetActivoPorGrupo[grupoActivo]);
  if (!vpet) return;

  // Al cambiar de vpet, el carrusel arranca desde el primero
  if (chartVpetAnterior !== vpet.id) {
    chartIndex = 0;
    chartVpetAnterior = vpet.id;
  }

  const charts = chartsDe(vpet);

  if (charts.length === 0) {
    cont.insertAdjacentHTML(
      "beforeend",
      `<p class="chart-pendiente">Este vpet no tiene chart cargado en data.js</p>`
    );
    return;
  }

  chartIndex = Math.min(chartIndex, charts.length - 1);
  const actual = charts[chartIndex];

  // Barra del carrusel: ◀ título (n/total) ▶
  const barra = document.createElement("div");
  barra.className = "carrusel-barra";

  const prev = document.createElement("button");
  prev.type = "button";
  prev.className = "carrusel-btn";
  prev.textContent = "◀";
  prev.disabled = charts.length <= 1;
  prev.addEventListener("click", () => {
    chartIndex = (chartIndex - 1 + charts.length) % charts.length;
    renderChart();
  });

  const titulo = document.createElement("div");
  titulo.className = "carrusel-titulo";
  titulo.innerHTML =
    `<h3>${actual.titulo}</h3>` +
    (charts.length > 1
      ? `<span class="carrusel-contador">${chartIndex + 1} / ${charts.length}</span>`
      : "");

  const next = document.createElement("button");
  next.type = "button";
  next.className = "carrusel-btn";
  next.textContent = "▶";
  next.disabled = charts.length <= 1;
  next.addEventListener("click", () => {
    chartIndex = (chartIndex + 1) % charts.length;
    renderChart();
  });

  barra.append(prev, titulo, next);
  cont.appendChild(barra);

  const img = document.createElement("img");
  img.src = actual.img;
  img.alt = "Línea evolutiva: " + actual.titulo;
  img.loading = "lazy";
  img.onerror = () => {
    img.replaceWith(
      Object.assign(document.createElement("p"), {
        className: "chart-pendiente",
        textContent: "Imagen pendiente: " + actual.img,
      })
    );
  };
  cont.appendChild(img);
}

// ---------- Reset ----------

document.getElementById("btn-reset").addEventListener("click", () => {
  // Borra solo la lista del modo activo (Por Vpet o Por Versión);
  // la del otro modo queda intacta.
  favoritos[modoFavoritos] = {};
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