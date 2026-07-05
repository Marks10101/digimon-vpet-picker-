/**
 * ============================================================
 * DIGIMON VPET PICKER — DATA
 * ============================================================
 * ESQUEMA
 * -------
 * DIGIMON_LINES: agrupa los aparatos por "línea" (el equivalente
 * a una generación de juego Pokémon). Cada línea tiene 1+
 * `releases` (el Vpet específico: Ver.1, Pendulum 1.0, etc).
 *
 *   { id, label, sublabel, releases: [{ id, label, year }] }
 *
 * DIGIMON: el roster. Cada entrada declara en qué releases
 * apareció vía `appearsIn` (array de release ids).
 *
 *   { id, name, stage, type, sprite, appearsIn: [releaseId, ...] }
 *
 * Los sprites se buscan en assets/sprites/{id}.png — si no existe
 * el archivo, la UI cae en un placeholder (no hace falta romper
 * nada mientras no tengas los sprites reales cargados).
 *
 * ESTADO DE LOS DATOS
 * -------------------
 * - DIGIMON_LINES: lista completa de líneas que pude confirmar
 *   documentadas (Wikimon). Ajustala como quieras: fusionar,
 *   separar, sacar exclusivos de Asia, etc. — es solo el punto
 *   de partida.
 * - DIGIMON: roster a propósito INCOMPLETO. Solo cargué Ver.1
 *   con los mons más documentados para poder ver el grid andando.
 *   El resto de los releases están vacíos — los completamos con
 *   tu data en el próximo paso.
 * ============================================================
 */

const DIGIMON_LINES = [
  {
    id: "original",
    label: "Original",
    sublabel: "Ver.1 – Ver.6 / Ver.20th / COLOR",
    releases: [
      { id: "ver1", label: "Ver.1", year: 1997 },
      { id: "ver2", label: "Ver.2", year: 1997 },
      { id: "ver3", label: "Ver.3", year: 1998 },
      { id: "ver4", label: "Ver.4", year: 1998 },
      { id: "ver5", label: "Ver.5", year: 1999 },
      { id: "ver6_au", label: "Ver.6 (Australia)", year: 1999 },
      { id: "ver20th", label: "Ver.20th", year: 2017 },
      { id: "dm_color", label: "Digital Monster COLOR", year: 2023 },
    ],
  },
  {
    id: "pendulum",
    label: "Pendulum",
    sublabel: "1.0–5.5 / Progress / X / Z / COLOR",
    releases: [
      { id: "pen1", label: "Pendulum 1.0 (Nature Spirits)", year: 1998 },
      { id: "pen1_5", label: "Pendulum 1.5 (Nature Spirits)", year: 1998 },
      { id: "pen2", label: "Pendulum 2.0 (Deep Savers)", year: 1998 },
      { id: "pen2_5", label: "Pendulum 2.5 (Deep Savers)", year: 1998 },
      { id: "pen3", label: "Pendulum 3.0 (Nightmare Soldiers)", year: 1999 },
      { id: "pen3_5", label: "Pendulum 3.5 (Nightmare Soldiers)", year: 1999 },
      { id: "pen4", label: "Pendulum 4.0 (Wind Guardians)", year: 1999 },
      { id: "pen4_5", label: "Pendulum 4.5 (Wind Guardians)", year: 1999 },
      { id: "pen5", label: "Pendulum 5.0 (Metal Empire)", year: 1999 },
      { id: "pen5_5", label: "Pendulum 5.5 (Metal Empire)", year: 1999 },
      { id: "pen_zero", label: "Pendulum ZERO (Virus Busters)", year: 2000 },
      { id: "pen_progress1", label: "Progress 1.0 (Dragon's Roar)", year: 2001 },
      { id: "pen_progress2", label: "Progress 2.0 (Armageddon's Army)", year: 2001 },
      { id: "pen_progress3", label: "Progress 3.0 (Animal Colosseum)", year: 2002 },
      { id: "pen_x1", label: "Pendulum X 1.0", year: 2003 },
      { id: "pen_x1_5", label: "Pendulum X 1.5", year: 2003 },
      { id: "pen_x2", label: "Pendulum X 2.0", year: 2003 },
      { id: "pen_x3", label: "Pendulum X 3.0", year: 2004 },
      { id: "pen_z1", label: "Pendulum Z (Wave 1)", year: 2020 },
      { id: "pen_z2", label: "Pendulum Z II (Wave 2)", year: 2020 },
      { id: "pen_20th", label: "Pendulum Ver.20th", year: 2018 },
      { id: "pen_color", label: "Pendulum COLOR", year: 2022 },
    ],
  },
  {
    id: "tamers_props",
    label: "D-3 / D-Ark / D-Scanner",
    sublabel: "Réplicas de digivice (Tamers → Frontier)",
    releases: [
      { id: "d3", label: "D-3", year: 2000 },
      { id: "d_ark", label: "D-Ark", year: 2001 },
      { id: "d_scanner", label: "D-Scanner", year: 2002 },
    ],
  },
  {
    id: "data_squad",
    label: "Digivice iC / Burst",
    sublabel: "Era Data Squad",
    releases: [
      { id: "ic_10x", label: "Digivice iC Ver.10x", year: 2006 },
      { id: "ic_20x", label: "Digivice iC Ver.20x", year: 2007 },
      { id: "burst", label: "Digivice Burst", year: 2007 },
    ],
  },
  {
    id: "xros_wars",
    label: "Xros Loader / Mini",
    sublabel: "Era Xros Wars",
    releases: [
      { id: "xros_loader", label: "Digimon Xros Loader", year: 2010 },
      { id: "mini_xw_shoutmon", label: "Mini Xros Wars (Shoutmon Red)", year: 2011 },
      { id: "mini_xw_greymon", label: "Mini Xros Wars (Greymon Blue)", year: 2011 },
      { id: "mini_xw_knightmon", label: "Mini Xros Wars (Knightmon Black)", year: 2011 },
    ],
  },
  {
    id: "appmon",
    label: "Appli Drive",
    sublabel: "Era Appmon",
    releases: [
      { id: "appli_drive", label: "Appli Drive", year: 2016 },
      { id: "appli_duo_offmon", label: "Appli Drive DUO (Offmon)", year: 2017 },
      { id: "appli_duo_gatchmon", label: "Appli Drive DUO (Gatchmon)", year: 2017 },
    ],
  },
  {
    id: "vital_bracelet",
    label: "Vital Bracelet",
    sublabel: "Era moderna",
    releases: [
      { id: "vb_dm", label: "Vital Bracelet Digital Monster", year: 2021 },
      { id: "vb_v", label: "Vital Bracelet Digivice -V-", year: 2021 },
      { id: "vb_be", label: "Vital Bracelet BE", year: 2022 },
    ],
  },
  {
    id: "asia_exclusive",
    label: "Exclusivos de Asia",
    sublabel: "D-Cyber / Neo / Pendulum Cycle",
    releases: [
      { id: "d_cyber1", label: "D-Cyber Ver.1.0", year: 2000 },
      { id: "d_cyber2", label: "D-Cyber Ver.2.0", year: 2001 },
      { id: "neo1", label: "Digimon Neo Ver.1", year: 2004 },
      { id: "neo2", label: "Digimon Neo Ver.2", year: 2005 },
      { id: "pen_cycle7", label: "Pendulum Cycle Ver.7", year: 2003 },
      { id: "pen_cycle8", label: "Pendulum Cycle Ver.8", year: 2003 },
      { id: "pen_cycle9", label: "Pendulum Cycle Ver.9", year: 2003 },
      { id: "pen_cycle10", label: "Pendulum Cycle Ver.10", year: 2003 },
    ],
  },
];

// --- SEED ROSTER (a propósito incompleto, ver nota arriba) ---
const DIGIMON = [
  { id: "botamon", name: "Botamon", stage: "Baby I", type: "Free", sprite: "assets/sprites/botamon.png", appearsIn: ["ver1"] },
  { id: "punimon", name: "Punimon", stage: "Baby I", type: "Free", sprite: "assets/sprites/punimon.png", appearsIn: ["ver1"] },
  { id: "koromon", name: "Koromon", stage: "Baby II", type: "Free", sprite: "assets/sprites/koromon.png", appearsIn: ["ver1"] },
  { id: "tsunomon", name: "Tsunomon", stage: "Baby II", type: "Vaccine", sprite: "assets/sprites/tsunomon.png", appearsIn: ["ver1"] },
  { id: "agumon", name: "Agumon", stage: "Rookie", type: "Vaccine", sprite: "assets/sprites/agumon.png", appearsIn: ["ver1"] },
  { id: "gabumon", name: "Gabumon", stage: "Rookie", type: "Data", sprite: "assets/sprites/gabumon.png", appearsIn: ["ver1"] },
  { id: "greymon", name: "Greymon", stage: "Champion", type: "Vaccine", sprite: "assets/sprites/greymon.png", appearsIn: ["ver1"] },
  { id: "garurumon", name: "Garurumon", stage: "Champion", type: "Data", sprite: "assets/sprites/garurumon.png", appearsIn: ["ver1"] },
];
