/**
 * DIGIMON VPET PICKER — LÓGICA
 * Renderiza líneas -> releases -> grid de Digimon, todo leído
 * desde data.js. Favoritos persistidos en localStorage (no hay
 * backend, así que es lo correcto para un sitio estático).
 */

const ALL_RELEASES_ID = "__all__";
const FAVORITES_KEY = "digimonVpetPicker:favorites";

let currentLineId = DIGIMON_LINES[0].id;
let currentReleaseId = DIGIMON_LINES[0].releases[0].id;

const lineNav = document.getElementById("lineNav");
const releaseNav = document.getElementById("releaseNav");
const grid = document.getElementById("grid");
const emptyState = document.getElementById("emptyState");
const lineTitle = document.getElementById("lineTitle");
const releaseMeta = document.getElementById("releaseMeta");
const favGrid = document.getElementById("favGrid");
const favCount = document.getElementById("favCount");
const favEmpty = document.getElementById("favEmpty");
const clearFavsBtn = document.getElementById("clearFavs");

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    console.warn("No se pudieron leer los favoritos guardados", e);
    return new Set();
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  } catch (e) {
    console.warn("No se pudieron guardar los favoritos", e);
  }
}

let favorites = loadFavorites();

function toggleFavorite(id) {
  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }
  saveFavorites();
  renderGrid();
  renderFavorites();
}

function getCurrentLine() {
  return DIGIMON_LINES.find((l) => l.id === currentLineId);
}

function digimonForCurrentSelection() {
  const line = getCurrentLine();
  if (currentReleaseId === ALL_RELEASES_ID) {
    const releaseIds = new Set(line.releases.map((r) => r.id));
    return DIGIMON.filter((d) => d.appearsIn.some((id) => releaseIds.has(id)));
  }
  return DIGIMON.filter((d) => d.appearsIn.includes(currentReleaseId));
}

function renderLineNav() {
  lineNav.innerHTML = "";
  DIGIMON_LINES.forEach((line) => {
    const btn = document.createElement("button");
    btn.className = "lines__btn" + (line.id === currentLineId ? " is-active" : "");
    btn.textContent = line.label;
    btn.title = line.sublabel;
    btn.addEventListener("click", () => {
      currentLineId = line.id;
      currentReleaseId = line.releases[0]?.id ?? null;
      renderAll();
    });
    lineNav.appendChild(btn);
  });
}

function renderReleaseNav() {
  const line = getCurrentLine();
  releaseNav.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.className =
    "releases__btn releases__btn--all" + (currentReleaseId === ALL_RELEASES_ID ? " is-active" : "");
  allBtn.textContent = "Ver todos";
  allBtn.title = "Roster combinado de todas las versiones de esta línea, incluidas actualizaciones";
  allBtn.addEventListener("click", () => {
    currentReleaseId = ALL_RELEASES_ID;
    renderAll();
  });
  releaseNav.appendChild(allBtn);

  line.releases.forEach((release) => {
    const btn = document.createElement("button");
    btn.className = "releases__btn" + (release.id === currentReleaseId ? " is-active" : "");
    btn.textContent = release.label;
    btn.addEventListener("click", () => {
      currentReleaseId = release.id;
      renderAll();
    });
    releaseNav.appendChild(btn);
  });
}

function renderScreenHeader() {
  const line = getCurrentLine();

  if (currentReleaseId === ALL_RELEASES_ID) {
    lineTitle.textContent = line.label;
    releaseMeta.textContent = `Ver todos · ${line.releases.length} versiones combinadas`;
    return;
  }

  const release = line.releases.find((r) => r.id === currentReleaseId);
  lineTitle.textContent = line.label;
  releaseMeta.textContent = release ? `${release.label} · ${release.year}` : "";
}

function createDigimonCard(d) {
  const isFav = favorites.has(d.id);

  const card = document.createElement("button");
  card.className = "card" + (isFav ? " is-favorite" : "");
  card.type = "button";
  card.setAttribute("aria-pressed", isFav ? "true" : "false");
  card.title = isFav ? "Quitar de favoritos" : "Agregar a favoritos";

  const spriteWrap = document.createElement("span");
  spriteWrap.className = "card__sprite-wrap";

  const img = document.createElement("img");
  img.className = "card__sprite";
  img.src = d.sprite;
  img.alt = d.name;
  img.loading = "lazy";
  img.addEventListener(
    "error",
    () => {
      spriteWrap.classList.add("no-sprite");
    },
    { once: true }
  );

  const star = document.createElement("span");
  star.className = "card__star";
  star.setAttribute("aria-hidden", "true");
  star.textContent = "★";

  const name = document.createElement("span");
  name.className = "card__name";
  name.textContent = d.name;

  const stage = document.createElement("span");
  stage.className = "card__stage";
  stage.textContent = d.stage;

  spriteWrap.appendChild(img);
  spriteWrap.appendChild(star);
  card.appendChild(spriteWrap);
  card.appendChild(name);
  card.appendChild(stage);

  card.addEventListener("click", () => toggleFavorite(d.id));

  return card;
}

function renderGrid() {
  const digimonInSelection = digimonForCurrentSelection();
  grid.innerHTML = "";

  if (digimonInSelection.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  digimonInSelection.forEach((d) => grid.appendChild(createDigimonCard(d)));
}

function renderFavorites() {
  const favDigimon = DIGIMON.filter((d) => favorites.has(d.id));

  favCount.textContent = `(${favDigimon.length})`;
  favGrid.innerHTML = "";
  favEmpty.hidden = favDigimon.length > 0;

  favDigimon.forEach((d) => favGrid.appendChild(createDigimonCard(d)));
}

clearFavsBtn.addEventListener("click", () => {
  if (favorites.size === 0) return;
  favorites.clear();
  saveFavorites();
  renderGrid();
  renderFavorites();
});

function renderAll() {
  renderLineNav();
  renderReleaseNav();
  renderScreenHeader();
  renderGrid();
  renderFavorites();
}

renderAll();
