export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name || typeof name !== 'string') return NextResponse.json({ error: 'name required' }, { status: 400 });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'project';
    const ROOT = process.env.WORKSPACE_DIR || path.join(process.cwd(), 'workspace');
    const dir = path.join(ROOT, slug);
    await fs.mkdir(dir, { recursive: true });
    // seed files
    await fs.writeFile(path.join(dir, 'metadata.json'), JSON.stringify({ name, slug, createdAt: new Date().toISOString() }, null, 2));
    await fs.mkdir(path.join(dir, 'snapshots'), { recursive: true });
    return NextResponse.json({ ok: true, slug, path: dir });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
