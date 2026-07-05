# Digimon Vpet Picker

Picker de Digimon organizado por línea y versión de Vpet (en vez de por generación de juego, como el original de Pokémon en el que se basa la idea).

## Correr localmente

No hace falta build ni instalar nada. Alcanza con:

1. Abrir `index.html` directo en el navegador, **o**
2. Si tu navegador se queja de CORS al cargar `data.js`/`script.js` como `file://`, levantar un server local desde la carpeta:
   ```
   python3 -m http.server 8000
   ```
   y entrar a `http://localhost:8000`

## Subir a GitHub Pages

1. Este folder completo va a la raíz del repo (o a `/docs` si preferís).
2. Settings → Pages → elegís la branch/carpeta → listo.

## Estructura

```
index.html      → estructura de la página
style.css       → estilos (identidad visual "pantalla LCD de Vpet")
data.js         → DIGIMON_LINES (líneas + releases) y DIGIMON (roster)
script.js       → lógica de render (líneas → releases → grid)
assets/sprites/ → PNG por Digimon, nombrados {id}.png (ej: agumon.png)
```

## Cómo agregar un Digimon

En `data.js`, sumar un objeto al array `DIGIMON`:

```js
{
  id: "devimon",
  name: "Devimon",
  stage: "Champion",
  type: "Virus",
  sprite: "assets/sprites/devimon.png",
  appearsIn: ["ver2", "ver20th"] // ids de releases donde apareció
}
```

Si `assets/sprites/devimon.png` no existe todavía, no rompe nada: la UI muestra un placeholder genérico hasta que subas el sprite real.

## Cómo agregar o ajustar una línea/release

En `data.js`, array `DIGIMON_LINES`. Cada línea es un grupo (ej. "Pendulum") con su propio array `releases` (ej. Pendulum 1.0, 1.5, 2.0...). El id de cada release es lo que se usa en `appearsIn` de cada Digimon.

## Pendiente (próximos pasos)

- [ ] Completar roster real por release (arrancamos con Ver.1 nada más, a propósito)
- [ ] Sistema de favoritos / equipo (como el original)
- [ ] Búsqueda y filtro por tipo/stage
- [ ] Sprites reales en `assets/sprites/`
- [ ] Revisar si conviene separar/fusionar alguna línea (ej. D-3/D-Ark/D-Scanner son más "juguete de reconocimiento" que Vpet de crianza — ver si entran en el proyecto o no)
