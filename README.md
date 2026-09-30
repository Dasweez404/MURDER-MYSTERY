# Murder Concept — prototype 3D (Three.js)

Prototype jouable en vue FPS du GDD *Murder Concept* : manoir 3D à 2 étages, structure 10 → 7 → 5 objectifs
et 5 → 3 → 2 sorties, meurtrier asymétrique, 15 personnages du GDD, mode bots et mode multijoueur hébergé.

- `index.html` : page autonome (HTML5 + JS + Three.js r128 via CDN), publiée comme Artifact.
- `src/` : sources découpées (`src/build.sh` les concatène dans `index.html`).

Multijoueur : l'hôte simule la partie et diffuse l'état via la salle partagée de l'artifact (capacité `room`) ;
les bots complètent l'effectif. Votes au salon : camp préféré (innocent / indifférent / meurtrier) et catégorie de personnage.

Rendu pixel-art (touche P pour basculer), ventilations à passer accroupi, fusibles / portes coincées / leviers à réparer, meubles déplaçables, trappe et monte-charge.
Sources : `src/`, assemblées par `src/build.sh`.

Carte interactive (touche M) : onglets par niveau, survol = infos de la pièce, clic = marqueur (danger / suspect / sûr / note), clic droit = retirer, molette + glisser = zoom, calques (objectifs, sorties, escaliers, portes, électricité, corps, ma trace).

Sabotages temporaires (coupure de courant ~7 s, portes/leviers ~14 s, objectifs ~16 s), musique douce procédurale (N pour couper), saut plus haut, interrupteurs bruyants (et étourdissants pour un innocent), grab du meurtrier avec aide à la visée et faisceau visible.
