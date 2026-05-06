# French Quarter Walkable World

A GitHub Pages ready Three.js walking world built from Ryan's older inline-world experiments, but split into real repo files so it can grow without turning into one huge laggy HTML block.

## What is included

- `index.html` with a clean import map for Three.js.
- `styles/world.css` with the retro Windows 95 HUD and mobile controls.
- `src/core/Engine.js` for rendering, first-person movement, collision, interaction, quality toggling, and metrics.
- `src/core/Input.js` for desktop pointer-lock controls plus mobile joystick and touch-look.
- `src/core/TextureFactory.js` for uploaded textures and procedural textures.
- `src/worlds/frenchQuarterWorld.js` for the actual walkable French Quarter scene.
- `assets/textures/` containing the uploaded floor, wall, sky, carpet, rug, brick, and wood textures.

## Controls

Desktop:

- WASD or arrow keys: move
- Mouse: look
- Shift: sprint
- E: inspect nearby objects
- M: metrics
- Esc: close dialog or release pointer lock

Mobile:

- Left joystick: move
- Right side drag: look
- ACTION: inspect nearby objects
- Fullscreen button: enter fullscreen

## Local testing

Because this uses JavaScript modules, open it through a small local server rather than double-clicking the file.

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Publish to GitHub Pages

From inside the folder:

```bash
git init
git add .
git commit -m "Add French Quarter walkable world"
git branch -M main
git remote add origin https://github.com/floydclaptonblues/ryanhall-horrorland-player.git
git push -u origin main
```

Then in GitHub:

1. Open the repository settings.
2. Go to Pages.
3. Deploy from branch.
4. Select `main` and `/root`.
5. Save.

## Next expansion pass

The next version should add a `src/worlds/registry.js` file so multiple worlds can be selected from the boot panel. New worlds can then be added as separate modules instead of copying and editing the whole app.
