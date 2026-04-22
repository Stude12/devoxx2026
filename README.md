# 🎤 Speaker Slash — Devoxx 2026

Un jeu **Fruit Ninja** sur le thème de **Devoxx France 2026** ! Des fiches de speakers tombent du ciel et vous devez les trancher d'un geste de souris.

## 🎮 Jouer

👉 **[Jouer en ligne](https://stude12.github.io/devoxx2026/)**

Ou en local :

```bash
npm install
npm run dev
# → http://localhost:8080
```

## ✨ Fonctionnalités

- 🎴 **12 speakers Devoxx** en 3 tailles de cartes (small / medium / large)
- ⚔️ **Détection de slash par geste** — glissez la souris pour trancher
- 📏 **Taille = difficulté** — petites cartes = plus de points, plus rapides
- 🔥 **Système de combo** avec suivi du max combo
- ❤️ **3 vies** — ratez 3 cartes et c'est game over
- 🔊 **Sons synthétisés** via Web Audio API
- ✨ **Effets visuels** — particules, lignes de slash, texte flottant
- 🔄 **Boucle complète** — Menu → GET READY → Jeu → Game Over → Restart

## 🃏 Système de tailles

| Taille | Dimensions | Points | Vitesse | Difficulté |
|--------|-----------|--------|---------|------------|
| 🔴 Small | 100×130 | 150-220 | Rapide (×1.3) | Difficile |
| 🟡 Medium | 140×180 | 120-150 | Normale | Standard |
| 🟢 Large | 180×230 | 70-100 | Lente (×0.8) | Facile |

## 🛠️ Stack technique

- **[Phaser 3](https://phaser.io/)** (v4.0) — Moteur de jeu avec physique Arcade
- **[Vue 3](https://vuejs.org/)** — Shell applicatif
- **[TypeScript](https://www.typescriptlang.org/)** — Typage complet
- **[Vite](https://vitejs.dev/)** — Dev server et build
- **[Playwright](https://playwright.dev/)** — Tests E2E (13 tests)

## 📁 Structure du projet

```
src/game/
├── main.ts                    # Config Phaser + point d'entrée
├── EventBus.ts                # Communication Vue ↔ Phaser
├── types/
│   └── Speaker.ts             # Interface Speaker + données des 12 speakers
├── objects/
│   ├── SpeakerCard.ts         # Carte tombante (3 tailles)
│   ├── SpeakerSpawner.ts      # Système de spawn + difficulté progressive
│   ├── SlashDetector.ts       # Détection de geste (trail de segments)
│   ├── MicrophoneCursor.ts    # Curseur micro personnalisé
│   ├── AudioManager.ts        # Synthèse sonore Web Audio API
│   ├── SlashFeedbackRenderer.ts # Effets visuels (slash, trail)
│   └── UIManager.ts           # Score, combo, vies
└── scenes/
    ├── Boot.ts                # Chargement initial
    ├── Preloader.ts           # Préchargement assets
    ├── MainMenu.ts            # Menu principal
    ├── Game.ts                # Boucle de jeu principale
    └── GameOver.ts            # Écran de fin
```

## 🧪 Tests

```bash
npm run test:e2e        # Lancer les 13 tests Playwright
npm run test:e2e:ui     # Mode interactif avec UI
```

**Couverture :**
- Menu (5 tests) : chargement, canvas, instance Phaser, scène, transition
- Gameplay (5 tests) : état initial, countdown, slash, vies
- Game Over (3 tests) : transition, restart, retour menu

## 🚀 Déploiement

| Plateforme | Configuration |
|-----------|--------------|
| **GitHub Pages** | `.github/workflows/deploy-pages.yml` — auto-deploy sur push `main` |
| **GitLab Pages** | `.gitlab-ci.yml` — build + deploy `dist/` → `public/` |

## 📦 Commandes

| Commande | Description |
|----------|-------------|
| `npm install` | Installer les dépendances |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production dans `dist/` |
| `npm run test:e2e` | Tests E2E Playwright |

## 📝 Licence

MIT — Basé sur le template [Phaser Vue TypeScript](https://github.com/phaserjs/template-vue-ts) de Phaser Studio.
