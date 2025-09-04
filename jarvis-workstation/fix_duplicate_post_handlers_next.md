# Fix: `Identifier 'POST' has already been declared` — split route handlers per file

**Root cause**: two `POST` function declarations lived in the same compiled scope (your `index.tsx` / textdoc), so the bundler threw `Identifier 'POST' has already been declared (515:22)`.

**Fix**: move each API endpoint to its own module (Next.js App Router style). Keep `POST` as the exported handler **per file**, and keep only UI/React in `index.tsx`.

Below is a clean, drop‑in rewrite you can copy into your project. I’ve also added minimal tests so we never regress.

---

## ✅ New file layout (App Router)
```
app/
  api/
    projects/
      create/route.ts
      save/route.ts
  page.tsx                 # or index.tsx — UI only (no API handlers here)
lib/
  projects.ts              # shared logic (importable by tests)
__tests__/
  api.projects.create.test.ts
  api.projects.save.test.ts
vitest.config.ts
package.json (test scripts)
```

---

## lib/projects.ts — shared pure functions (testable)
```ts
// lib/projects.ts
export type Project = {
  id: string;
  name: string;
  createdAt: string; // ISO
  status?: 'new' | 'in-progress' | 'blocked' | 'done';
  meta?: Record<string, unknown>;
};

// Very light in-memory store for the MVP/demo. Replace later with DB.
const mem: { store: Record<string, Project> } = { store: {} };

export function createProject(input: { name: string; meta?: Record<string, unknown> }) {
  if (!input || typeof input.name !== 'string' || input.name.trim().length === 0) {
    return { ok: false as const, status: 400 as const, error: 'name is required' };
  }
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const project: Project = {
    id,
    name: input.name.trim(),
    createdAt: new Date().toISOString(),
    status: 'new',
    meta: input.meta ?? {},
  };
  mem.store[id] = project;
  return { ok: true as const, status: 201 as const, data: project };
}

export function saveProject(input: Partial<Project> & { id: string }) {
  if (!input || !input.id) {
    return { ok: false as const, status: 400 as const, error: 'id is required' };
  }
  const existing = mem.store[input.id];
  if (!existing) {
    return { ok: false as const, status: 404 as const, error: 'project not found' };
  }
  const updated: Project = {
    ...existing,
    ...input,
    name: input.name?.trim() ?? existing.name,
  };
  mem.store[input.id] = updated;
  return { ok: true as const, status: 200 as const, data: updated };
}

// Small helpers for tests/demo (optional)
export function __resetStore() { mem.store = {}; }
export function __getStore() { return mem.store; }
```

---

## app/api/projects/create/route.ts — **only** this endpoint’s `POST`
```ts
// app/api/projects/create/route.ts
import { createProject } from '@/lib/projects';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = createProject({ name: body?.name, meta: body?.meta });
    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.error }), { status: result.status, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify(result.data), { status: result.status, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'unexpected error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
```

---

## app/api/projects/save/route.ts — **only** this endpoint’s `POST`
```ts
// app/api/projects/save/route.ts
import { saveProject } from '@/lib/projects';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = saveProject(body);
    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.error }), { status: result.status, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify(result.data), { status: result.status, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'unexpected error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
```

> ⚠️ **Important**: remove any `export async function POST(...) { ... }` from your `index.tsx`/`page.tsx`. Those handlers belong in the `/app/api/.../route.ts` files only.

---

## UI file stays UI‑only (example)
```tsx
// app/page.tsx (or index.tsx)
export default function DashboardPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {/* UI only. Do not declare API route handlers here. */}
    </main>
  );
}
```

---

## Tests (Vitest) — new

### package.json (scripts)
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### vitest.config.ts
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { environment: 'node' }
});
```

### __tests__/api.projects.create.test.ts
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createProject, __resetStore } from '@/lib/projects';

describe('POST /api/projects/create', () => {
  beforeEach(() => __resetStore());

  it('creates a project with a valid name', () => {
    const res = createProject({ name: 'Mon projet' });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.id).toBeTruthy();
      expect(res.data.name).toBe('Mon projet');
    }
  });

  it('rejects missing name', () => {
    const res = createProject({ name: '' });
    expect(res.ok).toBe(false);
  });
});
```

### __tests__/api.projects.save.test.ts
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createProject, saveProject, __resetStore } from '@/lib/projects';

describe('POST /api/projects/save', () => {
  beforeEach(() => __resetStore());

  it('updates an existing project name', () => {
    const created = createProject({ name: 'Initial' });
    if (!created.ok) throw new Error('setup failed');
    const res = saveProject({ id: created.data.id, name: 'Renommé' });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.name).toBe('Renommé');
  });

  it('fails if id is missing', () => {
    const res = saveProject({ id: '' } as any);
    expect(res.ok).toBe(false);
  });

  it('404 if project not found', () => {
    const res = saveProject({ id: 'does-not-exist', name: 'X' });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.status).toBe(404);
  });
});
```

---

## What changed (summary)
- Removed duplicate `POST` declarations from the UI file
- Moved each API `POST` handler into its own route module
- Extracted pure business logic to `lib/projects.ts` (importable by tests)
- Added unit tests covering OK/400/404 paths

---

## Next steps for you
1) Place each snippet in the indicated path.
2) Delete any `POST` function inside your `index.tsx` / `page.tsx`.
3) Run tests: `npm i -D vitest` then `npm run test`.

If something in the API behavior should be different (e.g., required fields, response shape), tell me the exact expected contract and I’ll align the code + tests en conséquence.

Identifier 'POST' has already been declared vient du fait que deux fonctions POST cohabitaient dans le même scope (ton index.tsx/textdoc). J’ai tout refactoré proprement :

Chaque endpoint a désormais son fichier (/api/projects/create/route.ts et /api/projects/save/route.ts).

Le fichier UI (page.tsx/index.tsx) ne contient aucun handler API.

La logique métier est extraite dans lib/projects.ts (testable).

J’ai ajouté des tests Vitest (création OK/400, sauvegarde OK/400/404).

J’ai déjà réécrit le textdoc avec l’arbo + les fichiers prêts à coller (y compris les tests) — tu le vois dans le canvas à droite.
Si tu suis exactement les chemins indiqués et que tu retires toute fonction POST de index.tsx, l’erreur disparaît.

À faire de ton côté (rapide)

Copie/colle les fichiers vers les chemins indiqués.

Supprime toute déclaration export async function POST(...) de index.tsx/page.tsx.

npm i -D vitest puis npm run test (j’ai mis les scripts dans le textdoc).

Avant d’aller plus loin, dis-moi l’attendu fonctionnel exact de tes endpoints pour que j’aligne parfaitement la spec + les tests :

/api/projects/create doit-il retourner {id,name,createdAt,...} tel que dans mon exemple ? Champs obligatoires ?

/api/projects/save : quels champs sont modifiables ? Faut-il rejeter certains changements (ex. status limité à une liste) ?

Codes HTTP attendus (201/200/400/404) — ça te va ?

Je m’aligne et j’ajuste le code + j’ajoute des tests supplémentaires si besoin.