/**
 * DIGIMON VPET PICKER — LÓGICA
 * Capa 0: renderiza líneas -> releases -> grid de Digimon,
 * todo leído desde data.js. Todavía no hay favoritos/equipo
 * ni búsqueda/filtro por tipo — eso viene después.
 */

let currentLineId = DIGIMON_LINES[0].id;
let currentReleaseId = DIGIMON_LINES[0].releases[0].id;

const lineNav = document.getElementById("lineNav");
const releaseNav = document.getElementById("releaseNav");
const grid = document.getElementById("grid");
const emptyState = document.getElementById("emptyState");
const lineTitle = document.getElementById("lineTitle");
const releaseMeta = document.getElementById("releaseMeta");

function getCurrentLine() {
  return DIGIMON_LINES.find((l) => l.id === currentLineId);
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
  const release = line.releases.find((r) => r.id === currentReleaseId);
  lineTitle.textContent = line.label;
  releaseMeta.textContent = release ? `${release.label} · ${release.year}` : "";
}

function renderGrid() {
  const digimonInRelease = DIGIMON.filter((d) => d.appearsIn.includes(currentReleaseId));
  grid.innerHTML = "";

  if (digimonInRelease.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  digimonInRelease.forEach((d) => {
    const card = document.createElement("button");
    card.className = "card";
    card.type = "button";

    const spriteWrap = document.createElement("span");
    spriteWrap.className = "card__sprite-wrap";

    const img = document.createElement("img");
    img.className = "card__sprite";
    img.src = d.sprite;
    img.alt = d.name;
    img.loading = "lazy";
    img.addEventListener("error", () => {
      spriteWrap.classList.add("no-sprite");
    }, { once: true });

    const name = document.createElement("span");
    name.className = "card__name";
    name.textContent = d.name;

    const stage = document.createElement("span");
    stage.className = "card__stage";
    stage.textContent = d.stage;

    spriteWrap.appendChild(img);
    card.appendChild(spriteWrap);
    card.appendChild(name);
    card.appendChild(stage);
    grid.appendChild(card);
  });
}

function renderAll() {
  renderLineNav();
  renderReleaseNav();
  renderScreenHeader();
  renderGrid();
}

renderAll();
