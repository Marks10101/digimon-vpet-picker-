// ============================================================
// ROSTER POR GRUPO -> VPET
// GRUPOS = pestañas. Cada grupo tiene vpets (subgrupos 1.1, 1.2...).
// Cada vpet: id único, nombre, anio, evoChart, digimon: [{id, nombre, img}]
//
// IMPORTANTE — repetidos:
// Si un Digimon aparece en varios vpets, usá EL MISMO id en todos
// (ej: "agumon"). La página detecta automáticamente la primera
// aparición según el orden de este archivo, y marca el resto
// como repetidos (para el toggle "solo nuevos").
//
// Si el sprite o el chart todavía no existen, la página muestra
// un placeholder, así podés cargar los nombres primero.
// ============================================================

const GRUPOS = [
  {
    id: "electronic-pets",
    nombre: "Electronic Pets",
    vpets: [
      {
        id: "digital-monster",
        nombre: "Digital Monster",
        anio: 1997,
        // Un chart por versión del dispositivo (string o array)
        evoChart: [
          "img/charts/digital-monster-v1.png",
          "img/charts/digital-monster-v2.png",
          "img/charts/digital-monster-v3.png",
          "img/charts/digital-monster-v4.png",
          "img/charts/digital-monster-v5.png",
        ],
        digimon: [
          // Ejemplos de formato — reemplazar por el roster real
          { id: "agumon",  nombre: "Agumon",  img: "img/digimon/agumon.png" },
          { id: "betamon", nombre: "Betamon", img: "img/digimon/betamon.png" },
          { id: "greymon", nombre: "Greymon", img: "img/digimon/greymon.png" },
        ],
      },
      {
        id: "pendulum",
        nombre: "Pendulum",
        anio: 1998,
        evoChart: "img/charts/pendulum.png",
        digimon: [
          // Ejemplo de repetido: mismo id que en Digital Monster
          { id: "agumon",   nombre: "Agumon",   img: "img/digimon/agumon.png" },
          { id: "gomamon",  nombre: "Gomamon",  img: "img/digimon/gomamon.png" },
        ],
      },
      { id: "pendulum-progress", nombre: "Pendulum Progress", anio: 2002, evoChart: "img/charts/pendulum-progress.png", digimon: [] },
      { id: "pendulum-x",        nombre: "Pendulum X",        anio: 2003, evoChart: "img/charts/pendulum-x.png",        digimon: [] },
      { id: "accelerator",       nombre: "Digimon Accelerator", anio: 2005, evoChart: "img/charts/accelerator.png",    digimon: [] },
      { id: "mini",              nombre: "Digimon Mini",      anio: 2005, evoChart: "img/charts/mini.png",              digimon: [] },
      { id: "twin",              nombre: "Digimon Twin",      anio: 2007, evoChart: "img/charts/twin.png",              digimon: [] },
      { id: "mini-xros-wars",    nombre: "Digimon Mini Xros Wars Series", anio: 2010, evoChart: "img/charts/mini-xros-wars.png", digimon: [] },
      { id: "catch-monitamon",   nombre: "Digimon Catch Ganbare Monitamon!", anio: 2011, evoChart: "img/charts/catch-monitamon.png", digimon: [] },
      { id: "digital-monster-x", nombre: "Digital Monster X", anio: 2019, evoChart: "img/charts/digital-monster-x.png", digimon: [] },
      { id: "pendulum-z",        nombre: "Digimon Pendulum Z", anio: 2020, evoChart: "img/charts/pendulum-z.png",       digimon: [] },
      { id: "vital-bracelet",    nombre: "Vital Bracelet Digital Monster", anio: 2021, evoChart: "img/charts/vital-bracelet.png", digimon: [] },
      { id: "vital-bracelet-be", nombre: "Vital Bracelet BE", anio: 2023, evoChart: "img/charts/vital-bracelet-be.png", digimon: [] },
    ],
  },
  {
    id: "digivices",
    nombre: "Digivices",
    vpets: [
      { id: "digivice",       nombre: "Digivice",        anio: 1999, evoChart: "img/charts/digivice.png",       digimon: [] },
      { id: "d3",             nombre: "D-3",             anio: 2000, evoChart: "img/charts/d3.png",             digimon: [] },
      { id: "d-ark",          nombre: "D-Ark",           anio: 2001, evoChart: "img/charts/d-ark.png",          digimon: [] },
      { id: "d-scanner",      nombre: "D-Scanner",       anio: 2002, evoChart: "img/charts/d-scanner.png",      digimon: [] },
      { id: "digivice-ic",    nombre: "Digivice iC",     anio: 2006, evoChart: "img/charts/digivice-ic.png",    digimon: [] },
      { id: "digivice-burst", nombre: "Digivice Burst",  anio: 2006, evoChart: "img/charts/digivice-burst.png", digimon: [] },
      { id: "xros-loader",    nombre: "Digimon Xros Loader", anio: 2010, evoChart: "img/charts/xros-loader.png", digimon: [] },
      { id: "appli-drive",    nombre: "Appli Drive",     anio: 2016, evoChart: "img/charts/appli-drive.png",    digimon: [] },
      { id: "appli-drive-duo",nombre: "Appli Drive DUO", anio: 2017, evoChart: "img/charts/appli-drive-duo.png",digimon: [] },
      { id: "digivice-colon", nombre: "Digivice:",       anio: 2021, evoChart: "img/charts/digivice-colon.png", digimon: [] },
      { id: "vb-digivice-v",  nombre: "Vital Bracelet Digivice -V-",    anio: 2022, evoChart: "img/charts/vb-digivice-v.png",  digimon: [] },
      { id: "vb-be-digivice-vv", nombre: "Vital Bracelet BE Digivice -VV-", anio: 2023, evoChart: "img/charts/vb-be-digivice-vv.png", digimon: [] },
    ],
  },
  {
    id: "bandai-asia",
    nombre: "Bandai Asia Exclusives",
    vpets: [
      { id: "pendulum-cycle", nombre: "Digimon Pendulum Cycle",  anio: 2004, evoChart: "img/charts/pendulum-cycle.png", digimon: [] },
      { id: "d-cyber",        nombre: "Digital Monster D-Cyber", anio: 2005, evoChart: "img/charts/d-cyber.png",        digimon: [] },
      { id: "digimon-neo",    nombre: "Digimon Neo",             anio: 2008, evoChart: "img/charts/digimon-neo.png",    digimon: [] },
      { id: "fusion-loader",  nombre: "Digimon Fusion Loader",   anio: 2013, evoChart: "img/charts/fusion-loader.png",  digimon: [] },
    ],
  },
  // Si querés una 4ta pestaña, copiá un bloque de grupo acá.
];
