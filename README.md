# CyberIsrael — Community Website

Israel's premier cybersecurity community website, built with React + TypeScript + Vite.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, CSS custom properties |
| Animations | Framer Motion |
| Routing | React Router v6 |
| i18n | react-i18next (EN + HE, RTL) |
| Serving | Nginx (production) |
| Containerisation | Docker + Docker Compose |

---

## 📁 Project Structure

```
cyberisrael/
├── public/
│   └── logo.svg                  # ← Replace this to update the logo
├── src/
│   ├── components/
│   │   ├── layout/               # Navbar, Footer, RootLayout
│   │   ├── sections/             # Hero, About, Values, Events, Social, Join
│   │   ├── ui/                   # Logo, reusable UI atoms
│   │   └── particles/            # Canvas particle background
│   ├── context/
│   │   ├── ThemeContext.tsx       # Dark/Light theme provider
│   │   └── LangContext.tsx       # i18n + RTL provider
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ArticlesPage.tsx
│   │   ├── ImpactPage.tsx
│   │   ├── CollaboratePage.tsx
│   │   └── NotFoundPage.tsx
│   ├── services/
│   │   └── articlesData.ts       # Mock article data (swap for API later)
│   ├── translations/
│   │   ├── en/index.ts
│   │   └── he/index.ts
│   ├── App.tsx                   # Router + providers
│   ├── i18n.ts                   # i18next configuration
│   └── index.css                 # Global styles + Tailwind layers
├── nginx/
│   └── nginx.conf                # Production nginx config
├── Dockerfile                    # Multi-stage build
├── docker-compose.yml            # App + future backend/db
└── README.md
```

---

## 🛠️ Local Development

### Prerequisites
- Node.js 20+
- npm 10+

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🐳 Docker Deployment

> The live site is **not** deployed this way — see [Deployment](#-deployment) above.
> The Docker setup is for running the site standalone (local or self-hosted).

### Quick start

```bash
# Build & run with Docker Compose
docker compose up --build -d

# View logs
docker compose logs -f frontend

# Stop
docker compose down
```

### Single container

```bash
docker build -t cyberisrael:latest .
docker run -d -p 80:80 --name cyberisrael cyberisrael:latest
```

The app will be available at **localhost:3000**.

---

## 🌍 Languages & RTL

The site supports **English** (LTR) and **Hebrew** (RTL).

- Translation files: `src/translations/en/index.ts` and `src/translations/he/index.ts`
- Language is persisted in `localStorage` under `cyberisrael-lang`
- The `<html>` element's `dir` and `lang` attributes update automatically

### Adding a new language

1. Create `src/translations/xx/index.ts` (copy EN structure)
2. Register in `src/i18n.ts`:
   ```ts
   import xxTranslations from './translations/xx'
   resources: { xx: { translation: xxTranslations } }
   ```
3. Add a button in `LangContext` / Navbar

---

## 🎨 Themes

Dark and light themes are supported via Tailwind's `class` dark mode strategy.

- Theme is persisted in `localStorage` under `cyberisrael-theme`
- Toggle via the sun/moon button in the navbar
- The `ThemeContext` provides `theme`, `toggleTheme`, `setTheme`

### Adding a new theme

1. Add new CSS custom properties to `index.css` under a new class (e.g. `.hacker-green`)
2. Extend `ThemeContext` with the new theme option
3. Map colors in `tailwind.config.js`

---

## 🔄 Replacing the Logo

The logo is a standalone SVG at `public/logo.svg`. To replace it:

1. Drop your new SVG at `public/logo.svg`
2. The `<Logo>` component (`src/components/ui/Logo.tsx`) renders it automatically
3. Adjust `size` prop throughout the app if needed

---

## 📰 Articles

Each article is a Markdown file in `public/articles/<slug>/`, with its own metadata in
YAML frontmatter. The build reads those files and generates the article index, so
`src/services/articlesData.ts` is derived rather than maintained by hand.

Articles are written and edited through Decap CMS at `/admin`. In production it signs
you in with GitHub and only active members of the CyberIsrael organisation get through;
saving opens a pull request against `dev` rather than publishing straight to the site.
Locally, `npm run cms` writes into your working tree with no sign-in at all.

See **[docs/articles.md](./docs/articles.md)** for the authoring workflow, the taxonomy,
the OAuth app setup and how to verify the access check.

---

## 🚢 Deployment

Cloudflare builds and deploys this repository automatically: `main` goes live,
every other branch only uploads a preview version. All deployment configuration lives
in `wrangler.jsonc` — **not** in the Cloudflare dashboard.

See **[docs/deployment.md](./docs/deployment.md)** before changing anything about the
build or deploy setup.

---

## 🌐 Google Form Embed

In `CollaboratePage.tsx`, find the comment block and replace the placeholder with:

```jsx
<iframe
  src="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true"
  width="100%"
  height="600"
  frameBorder="0"
  title="Partnership Application"
/>
```

---

## 🔮 Future Backend Integration

The Docker Compose file includes commented-out services for:
- **Node.js backend** (port 4000)
- **PostgreSQL** (port 5432)
- **Redis** cache

The nginx config includes a commented `location /api/` block for proxying API requests.

To activate:
1. Uncomment the services in `docker-compose.yml`
2. Create a `backend/` directory with your Node.js app
3. Uncomment the `/api/` proxy block in `nginx/nginx.conf`
4. Add `POSTGRES_PASSWORD` and `JWT_SECRET` to a `.env` file

---

## 📦 Environment Variables

Create a `.env` file at project root (copy from `.env.example`):

```env
# Future backend
POSTGRES_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret
VITE_API_URL=http://localhost:4000
```

---

## 🔒 Security

- Security headers configured in nginx (CSP, HSTS, X-Frame-Options, etc.)
- No sensitive data in frontend bundle
- All external links use `rel="noopener noreferrer"`
- Future auth: JWT via httpOnly cookies (backend responsibility)

---

## 📞 Contact

- Email: cyb3risrael@gmail.com
- Discord: https://discord.gg/Xz8gsvpBp
- Instagram: https://www.instagram.com/cyb3r.israel
- TikTok: https://www.tiktok.com/@cyb3r.israel

---

Built with ❤️ by the CyberIsrael community.
