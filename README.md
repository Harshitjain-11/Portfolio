# Harshit Jain — Interactive Particle Portfolio

A responsive React + Three.js portfolio starter. The portrait effect is generated live in the browser: the app samples `public/portrait.jpg`, creates thousands of small square meshes, and animates them from a scattered 3D arrangement into the image. It is not a generated still image.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

1. Extract this project folder.
2. The uploaded portrait is already included at `public/portrait.jpg`.
3. Open a terminal in the project folder.
4. Install dependencies:

   ```bash
   npm install
   ```

5. Start the local development server:

   ```bash
   npm run dev
   ```

6. Open the local URL printed by Vite (usually `http://localhost:5173`).

## Personalize before publishing

Open `src/App.jsx` and edit these constants near the top:

```js
const NAME = "Harshit Jain";
const ROLE = "B.Tech AI & Machine Learning Student";
const CONTACT_EMAIL = "your.email@example.com";
```

Replace `CONTACT_EMAIL` with your real email address so the contact button opens the correct email draft.

The project list is the `projects` array in `src/App.jsx`. Current entries use details from the projects previously discussed:
- **DINEaus** — repository link included.
- **CampusAssist** — no repository URL is assumed.
- **FaceVault** — repository link included.

Edit any descriptions or remove a project if you want the portfolio to reflect a different current state.

## Replace the portrait

Replace `public/portrait.jpg` with your own image, keeping the exact filename `portrait.jpg`. A clear, front-facing photo with the face and shoulders visible works best. The particle component crops some of the image's blank margins in-browser; adjust `cropX`, `cropY`, `cropW`, and `cropH` in `src/ParticlePortrait.jsx` if your replacement photo is framed differently.

The code does not alter facial features. The portrait is sampled directly from the photo you provide. This project does not digitally replace the shirt.

## Production build

```bash
npm run build
npm run preview
```

The deployable static site is created in `dist/`. Deploy that folder to any static host that supports Vite-built sites.

## Notes

- The animation uses WebGL via Three.js. If WebGL is unavailable, the source photo is shown as a fallback.
- The particle movement and intro animations respect `prefers-reduced-motion`.
- External Google Fonts are used for typography; the page still renders if they cannot load.
- This is a frontend portfolio only; it does not include a backend or contact form service.
