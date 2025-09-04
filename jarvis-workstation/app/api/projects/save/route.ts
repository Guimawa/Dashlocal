export const runtime2 = 'nodejs';
import { NextResponse as NextResponse2 } from 'next/server';
import { promises as fs2 } from 'fs';
import path2 from 'path';

export async function POST(req: Request) {
  try {
    const { slug, snapshot } = await req.json();
    if (!slug) return NextResponse2.json({ error: 'slug required' }, { status: 400 });
    const ROOT = process.env.WORKSPACE_DIR || path2.join(process.cwd(), 'workspace');
    const dir = path2.join(ROOT, slug, 'snapshots');
    await fs2.mkdir(dir, { recursive: true });
    const file = path2.join(dir, `${Date.now()}.json`);
    await fs2.writeFile(file, JSON.stringify(snapshot, null, 2));
    return NextResponse2.json({ ok: true, file });
  } catch (e: any) {
    return NextResponse2.json({ error: e.message }, { status: 500 });
  }
}
