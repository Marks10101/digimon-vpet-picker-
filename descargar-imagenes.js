// ============================================================
// descargar-imagenes.js
// Descarga todas las imágenes con URL (http/https) de data.js
// a las carpetas locales y reescribe data.js con las rutas locales.
//
// Uso (desde la carpeta del proyecto, Node 18+):
//   node descargar-imagenes.js          -> descarga y reescribe
//   node descargar-imagenes.js --dry    -> solo muestra qué haría
//
// - img   -> img/digimon/<id>.<ext>
// - arte  -> img/arte/<id>.<ext>
// - evoChart -> img/charts/<vpetId>.<ext>  (o <vpetId>-1, -2... si es array)
// - Hace backup en data.backup.js antes de reescribir
// - Si una descarga falla, deja la URL como estaba y sigue
// - Archivos ya descargados se saltean (podés re-correrlo tranquilo)
// ============================================================

const fs = require("fs");
const path = require("path");

const DRY = process.argv.includes("--dry");
const DATA = path.join(__dirname, "data.js");
const PAUSA_MS = 400; // pausa entre descargas para no castigar al servidor

// Cargar GRUPOS desde data.js sin imports
const fuente = fs.readFileSync(DATA, "utf8");
const GRUPOS = new Function(fuente + "; return GRUPOS;")();

const esURL = (v) => typeof v === "string" && /^https?:\/\//i.test(v);

function extension(url) {
  const limpio = url.split(/[?#]/)[0];
  const ext = path.extname(limpio).toLowerCase();
  return [".png", ".gif", ".jpg", ".jpeg", ".webp", ".svg"].includes(ext)
    ? ext
    : ".png";
}

// Armar la lista de trabajos: { url, destino local }
const trabajos = [];
function agregar(url, destino) {
  if (esURL(url)) trabajos.push({ url, destino });
}

for (const g of GRUPOS) {
  for (const v of g.vpets) {
    // Charts (string o array)
    const charts = [].concat(v.evoChart || []).map((c) =>
      typeof c === "object" ? c.img : c
    );
    charts.forEach((c, i) => {
      const sufijo = charts.length > 1 ? `-${i + 1}` : "";
      agregar(c, `img/charts/${v.id}${sufijo}${esURL(c) ? extension(c) : ""}`);
    });

    // Digimon (con o sin versiones)
    const listas = v.versiones ? v.versiones.map((x) => x.digimon || []) : [v.digimon || []];
    for (const lista of listas) {
      for (const d of lista) {
        agregar(d.img, `img/digimon/${d.id}${esURL(d.img) ? extension(d.img) : ""}`);
        agregar(d.arte, `img/arte/${d.id}${esURL(d.arte) ? extension(d.arte) : ""}`);
      }
    }
  }
}

// Deduplicar por URL (repetidos comparten archivo)
const porURL = new Map();
for (const t of trabajos) if (!porURL.has(t.url)) porURL.set(t.url, t.destino);

console.log(`Imágenes con URL encontradas: ${porURL.size}${DRY ? " (dry run)" : ""}`);

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function descargar(url, destino) {
  const abs = path.join(__dirname, destino);
  if (fs.existsSync(abs)) return "ya existía";

  const res = await fetch(url, {
    headers: { "User-Agent": "digimon-vpet-picker (proyecto fan, descarga única)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, Buffer.from(await res.arrayBuffer()));
  return "descargada";
}

(async () => {
  let ok = 0, fallas = 0;
  let nuevoData = fuente;

  for (const [url, destino] of porURL) {
    if (DRY) {
      console.log(`[dry] ${url} -> ${destino}`);
      continue;
    }
    try {
      const estado = await descargar(url, destino);
      // Reemplazar la URL por la ruta local en data.js
      nuevoData = nuevoData.split(`"${url}"`).join(`"${destino}"`);
      console.log(`✓ ${destino} (${estado})`);
      ok++;
      if (estado === "descargada") await dormir(PAUSA_MS);
    } catch (e) {
      console.log(`✗ ${url} -> ${e.message} (se deja la URL)`);
      fallas++;
    }
  }

  if (!DRY && ok > 0) {
    fs.writeFileSync(path.join(__dirname, "data.backup.js"), fuente);
    fs.writeFileSync(DATA, nuevoData);
    console.log(`\nListo: ${ok} imágenes locales, ${fallas} fallas.`);
    console.log("data.js reescrito (backup en data.backup.js).");
  } else if (!DRY) {
    console.log(`\nNada para hacer (${fallas} fallas).`);
  }
})();
