# Murder Concept — prototype 3D (Three.js)

Prototype jouable en vue FPS du GDD *Murder Concept* : manoir 3D à 2 étages, structure 10 → 7 → 5 objectifs
et 5 → 3 → 2 sorties, meurtrier asymétrique, 15 personnages du GDD, mode bots et mode multijoueur hébergé.

- `index.html` : page autonome (HTML5 + JS + Three.js r128 via CDN), publiée comme Artifact.
- `src/` : sources découpées (`src/build.sh` les concatène dans `index.html`).

Multijoueur : l'hôte simule la partie et diffuse l'état via la salle partagée de l'artifact (capacité `room`) ;
les bots complètent l'effectif. Votes au salon : camp préféré (innocent / indifférent / meurtrier) et catégorie de personnage.

Rendu pixel-art (touche P pour basculer), ventilations à passer accroupi, fusibles / portes coincées / leviers à réparer, meubles déplaçables, trappe et monte-charge.
Sources : `src/`, assemblées par `src/build.sh`.
