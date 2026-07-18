# Deploy del frontend (Vercel o Netlify)

Este proyecto (`workspace_dos/cultural-routes-frontend`) usa Vite + SPA, por eso incluye:

- `vercel.json` (build + rewrite a `index.html`)
- `netlify.toml` (build + redirect a `index.html`)

## Opción 1: Vercel

1. En Vercel, importa el repo.
2. Configura **Root Directory**: `workspace_dos/cultural-routes-frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Deploy.

CLI (opcional):

```bash
cd workspace_dos/cultural-routes-frontend
npx vercel
```

## Opción 2: Netlify

1. En Netlify, crea sitio desde repo.
2. Base directory: `workspace_dos/cultural-routes-frontend`.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. Deploy.

CLI (opcional):

```bash
cd workspace_dos/cultural-routes-frontend
npx netlify deploy --build
```

## Variables de entorno

Si usas Supabase, define en el proveedor (Vercel/Netlify) las variables necesarias antes del deploy.
