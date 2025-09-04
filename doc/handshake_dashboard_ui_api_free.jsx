"use client";
import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Search, Star, ChevronDown, ChevronRight, Plus, Minus, Globe, SlidersHorizontal, FolderPlus, Save } from "lucide-react";

// ====================== Force-Graph (client only) ======================
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

// ====================== Deterministic utils ==============================
function mulberry(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashToAngle(id: string, modulo = 1) {
  // Stable angle [0, 2π) per id (good for deterministic orbit ordering)
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  const u = ((h >>> 0) / 4294967295) % modulo;
  return u * Math.PI * 2;
}

// Seed initial projects (big bubbles)
function seedProjects(count = 6) {
  const rnd = mulberry(13);
  return Array.from({ length: count }).map((_, i) => ({
    id: `proj-${i + 1}`,
    name: [
      "Project App Mobile",
      "Cockpit IA Local",
      "Graph Navigator",
      "Coffre-fort Clés",
      "Table Ronde IA",
      "Metrics & KPI",
    ][i % 6],
    size: 28 + Math.floor(rnd() * 6),
    group: i,
    isProject: true,
    score: 40 + Math.floor(rnd() * 60),
    slug: `project-${i + 1}`,
  }));
}

// Generate nested details on demand (stable ordering by name)
function genChildrenFor(node: any, depth = 1) {
  const rnd = mulberry(node.id.length + (node.score || 1) + depth * 71);
  const kinds = depth === 1
    ? ["Module", "Feature", "Actor", "Dataset", "Service"]
    : ["Task", "File", "Doc", "API", "Check"];
  const n = 5 + Math.floor(rnd() * 4); // tighter variance for stability
  const nodes: any[] = [];
  const links: any[] = [];
  for (let i = 0; i < n; i++) {
    const kind = kinds[i % kinds.length];
    const id = `${node.id}-${kind}-${i}`;
    const child = {
      id,
      parentId: node.id,
      name: `${kind} ${i + 1}`,
      type: kind.toLowerCase(),
      group: node.group,
      size: Math.max(6, Math.floor((node.size || 16) * (depth === 1 ? 0.48 : 0.36)) + (i % 2)),
      depth,
      score: 20 + Math.floor(rnd() * 80),
    };
    nodes.push(child);
    links.push({ source: node.id, target: id, value: 1.5 });
  }
  nodes.sort((a, b) => a.name.localeCompare(b.name));
  return { nodes, links };
}

// ====================== Badges & UI bits =================================
function Badge({ children, active = false }: any) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
      active ? "bg-slate-800/80 text-slate-100 border-slate-700" : "bg-slate-900/40 text-slate-300 border-slate-800 hover:border-slate-700"
    }`}>{children}</span>
  );
}

function Trend({ v }: any) {
  const up = v >= 0;
  return (
    <div className={`flex items-center gap-1 ${up ? "text-emerald-400" : "text-rose-400"}`}>
      <span>{up ? "↑" : "↓"}</span>
      <span className="text-xs">{up ? "+" : ""}{v.toFixed(2)}%</span>
    </div>
  );
}

// ====================== Main ==================================================
export default function HandshakeDashboardUI() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<any>(null);

  // Layout / filters
  const [dims, setDims] = useState({ w: 1000, h: 640 });
  const [score, setScore] = useState(40);
  const [actors, setActors] = useState("All");
  const [geo, setGeo] = useState("USA, Canada");
  const [query, setQuery] = useState("");
  const [activeNav, setActiveNav] = useState("Vue d’ensemble");
  const [mode, setMode] = useState<"Stack" | "Date" | "Outil">("Stack");
  const [layoutMode, setLayoutMode] = useState<"orbit" | "force">("orbit"); // NEW: deterministic by default

  // Data (dynamic, expandable)
  const [data, setData] = useState<{nodes: any[]; links: any[]}>({ nodes: [], links: [] });
  const [expanded, setExpanded] = useState<Record<string, number>>( {} ); // nodeId -> deepest expanded depth
  const [selected, setSelected] = useState<any>(null);

  // Projects list (right panel)
  const projects = useMemo(() => seedProjects(12), []);

  // Init root projects → data
  useEffect(() => {
    const nodes = projects.map(p => ({ ...p }));
    setData({ nodes, links: [] });
  }, [projects]);

  // Resize observer
  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setDims({ w: e.contentRect.width, h: e.contentRect.height });
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // === Deterministic layout helpers ======================================
  const applyProjectOrbit = useCallback((nodes: any[]) => {
    const cx = dims.w / 2, cy = dims.h / 2;
    const R = Math.min(dims.w, dims.h) * 0.32;
    const projectsOnly = nodes.filter(n => n.isProject);
    projectsOnly.sort((a, b) => a.id.localeCompare(b.id)); // stable order
    const N = Math.max(1, projectsOnly.length);
    for (let i = 0; i < projectsOnly.length; i++) {
      const n = projectsOnly[i];
      const theta = (i / N) * Math.PI * 2; // even spacing
      n.fx = cx + R * Math.cos(theta);
      n.fy = cy + R * Math.sin(theta);
    }
  }, [dims.w, dims.h]);

  const applyChildrenOrbit = useCallback((parent: any, children: any[]) => {
    const px = (parent.fx ?? parent.x ?? dims.w / 2);
    const py = (parent.fy ?? parent.y ?? dims.h / 2);
    const count = Math.max(1, children.length);
    const r = Math.min(Math.max(72, 36 + 12 * count), 180); // clamp ring radius
    children.sort((a, b) => a.id.localeCompare(b.id));
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const c = children[i];
      c.fx = px + r * Math.cos(theta);
      c.fy = py + r * Math.sin(theta);
    }
  }, [dims.w, dims.h]);

  const reheat = useCallback(() => {
    const g = graphRef.current; if (!g) return;
    try { g.d3ReheatSimulation(); } catch { /* noop */ }
  }, []);

  // Apply deterministic layout whenever data/layout changes
  useEffect(() => {
    if (layoutMode !== "orbit") return;
    // Projects orbit
    applyProjectOrbit(data.nodes);
    // Children orbits (for any expanded parent)
    const byParent: Record<string, any[]> = {};
    for (const n of data.nodes) {
      if (n.parentId) {
        (byParent[n.parentId] ||= []).push(n);
      }
    }
    for (const pid of Object.keys(byParent)) {
      const parent = data.nodes.find(n => n.id === pid);
      if (parent) applyChildrenOrbit(parent, byParent[pid]);
    }
    reheat();
  }, [data.nodes, data.links, dims, layoutMode, applyProjectOrbit, applyChildrenOrbit, reheat]);

  // Configure forces: disable chaos in orbit mode
  useEffect(() => {
    const g = graphRef.current; if (!g) return;
    const charge = g.d3Force("charge");
    const link = g.d3Force("link");
    if (layoutMode === "orbit") {
      if (charge) charge.strength(0);
      if (link) link.distance(40).strength(0.9);
      g.enableNodeDrag(false);
    } else {
      if (charge) charge.strength(-60);
      if (link) link.distance(60).strength(0.7);
      g.enableNodeDrag(true);
    }
    reheat();
  }, [layoutMode, reheat]);

  // Filtering (score + query)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const nodes = data.nodes.filter(n => {
      const passScore = (n.score ?? 0) >= (n.isProject ? 0 : score);
      const passQuery = !q || n.name.toLowerCase().includes(q);
      return passScore && passQuery;
    });
    const keep = new Set(nodes.map(n => n.id));
    const links = data.links.filter(l => {
      const sid = typeof l.source === 'object' ? (l.source as any).id : (l as any).source;
      const tid = typeof l.target === 'object' ? (l.target as any).id : (l as any).target;
      return keep.has(sid) && keep.has(tid);
    });
    return { nodes, links };
  }, [data, score, query]);

  // Hover highlight
  const [hoverId, setHoverId] = useState<string | null>(null);
  const highlightNodes = new Set<any>();
  const highlightLinks = new Set<any>();
  if (hoverId) {
    filtered.links.forEach((l: any) => {
      const sid = typeof l.source === 'object' ? l.source.id : l.source;
      const tid = typeof l.target === 'object' ? l.target.id : l.target;
      if (sid === hoverId || tid === hoverId) highlightLinks.add(l);
    });
    filtered.links.forEach((l: any) => {
      if (highlightLinks.has(l)) { highlightNodes.add(l.source); highlightNodes.add(l.target); }
    });
  }

  // ====================== Actions ======================
  const zoomBy = useCallback((factor: number) => {
    const g = graphRef.current; if (!g) return;
    g.zoom(Math.max(0.1, Math.min(12, g.zoom() * factor)), 250);
  }, []);

  const zoomToFit = useCallback(() => {
    const g = graphRef.current; if (!g) return;
    g.zoomToFit(600, 60);
  }, []);

  const focusNode = useCallback((id: string, z = 2.4) => {
    const g = graphRef.current; if (!g) return;
    const n = filtered.nodes.find(x => x.id === id);
    const x = (n?.fx ?? n?.x ?? dims.w / 2);
    const y = (n?.fy ?? n?.y ?? dims.h / 2);
    g.centerAt(x, y, 600); g.zoom(z, 600);
  }, [filtered.nodes, dims.w, dims.h]);

  const toggleExpand = useCallback((node: any) => {
    setData((prev) => {
      const already = (expanded[node.id] || 0);
      const nextDepth = already >= (node.depth || 0 ? 2 : 1) ? 0 : already + 1; // cycles 0 → 1 → 2 → 0
      const newExpanded = { ...expanded, [node.id]: nextDepth };

      // Remove existing descendants
      const toRemove = new Set<string>();
      prev.nodes.forEach(n => { if (n.parentId === node.id || n.parentId?.startsWith(node.id+"-")) toRemove.add(n.id); });
      const nodes = prev.nodes.filter(n => !toRemove.has(n.id));
      const links = prev.links.filter(l => {
        const sid = typeof l.source === 'object' ? (l.source as any).id : (l as any).source;
        const tid = typeof l.target === 'object' ? (l.target as any).id : (l as any).target;
        return !(toRemove.has(sid) || toRemove.has(tid));
      });

      // Add children up to nextDepth
      let accNodes = [...nodes];
      let accLinks = [...links];
      if (nextDepth > 0) {
        const lvl1 = genChildrenFor(node, 1);
        accNodes.push(...lvl1.nodes);
        accLinks.push(...lvl1.links);
        if (layoutMode === 'orbit') applyChildrenOrbit(node, lvl1.nodes);
        if (nextDepth > 1) {
          lvl1.nodes.slice(0, Math.min(6, lvl1.nodes.length)).forEach((c) => {
            const lvl2 = genChildrenFor(c, 2);
            accNodes.push(...lvl2.nodes);
            accLinks.push(...lvl2.links);
            if (layoutMode === 'orbit') applyChildrenOrbit(c, lvl2.nodes);
          });
        }
      }
      setExpanded(newExpanded);
      return { nodes: accNodes, links: accLinks };
    });
    reheat();
  }, [expanded, applyChildrenOrbit, layoutMode, reheat]);

  // Project CRUD (UI hits API routes; UI stays API-free)
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const apiCreateProject = useCallback(async (name: string) => {
    const res = await fetch("/api/projects/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }, []);

  const apiSaveSnapshot = useCallback(async (slug: string, payload: any) => {
    const res = await fetch("/api/projects/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: slug, snapshot: payload }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }, []);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    try {
      const out = await apiCreateProject(newName.trim());
      setToast(`Projet créé: ${out.id || out.slug || newName.trim()}`);
      const proj = { id: out.id || `proj-${out.slug || newName.trim()}`, name: newName.trim(), size: 30, group: data.nodes.length+1, isProject: true, score: 50 + Math.floor(Math.random()*40), slug: out.id || out.slug };
      setData(d => ({ nodes: [...d.nodes, proj], links: d.links }));
      setCreating(false); setNewName("");
    } catch (e: any) {
      setToast(`Erreur création: ${e.message}`);
    }
  }, [apiCreateProject, newName, data.nodes.length]);

  const handleSaveSelected = useCallback(async () => {
    if (!selected?.isProject) { setToast("Sélectionne un projet pour sauvegarder"); return; }
    try {
      const subgraph = extractSubgraph(data, selected.id);
      await apiSaveSnapshot(selected.slug || selected.id, subgraph);
      setToast(`Snapshot sauvegardé`);
    } catch (e: any) {
      setToast(`Erreur snapshot: ${e.message}`);
    }
  }, [selected, data, apiSaveSnapshot]);

  // Helpers
  function extractSubgraph(all: {nodes:any[];links:any[]}, rootId: string) {
    const nodes = all.nodes.filter(n => n.id === rootId || n.parentId?.startsWith(rootId));
    const keep = new Set(nodes.map(n=>n.id));
    const links = all.links.filter((l: any) => {
      const sid = typeof l.source === 'object' ? l.source.id : l.source;
      const tid = typeof l.target === 'object' ? l.target.id : l.target;
      return keep.has(sid) && keep.has(tid);
    });
    return { nodes, links };
  }

  // ====================== Render ======================
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-200">
      {/* Top bar */}
      <div className="border-b border-slate-800/60 px-5 py-3 flex items-center justify-between sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-slate-800 grid place-content-center text-xs">🤝</div>
          <div>
            <div className="text-slate-300 text-xs">Select Navigator</div>
            <div className="font-semibold">Gestion de Projets Numériques</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Badge active>3 Grouped</Badge>
          <Badge><Star className="inline -mt-0.5 mr-1" size={14}/>3 Favorites</Badge>
        </div>
      </div>

      <div className="grid grid-cols-[220px_1fr_420px] gap-0">
        {/* Sidebar */}
        <aside className="border-r border-slate-800/60 p-4 space-y-3">
          {[
            "Vue d’ensemble",
            "Coffre-fort",
            "Sécurité",
            "Table Ronde IA",
            "Suivi performances",
          ].map((item) => (
            <button
              key={item}
              onClick={() => setActiveNav(item)}
              className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${activeNav===item ? "bg-slate-900/60 border border-slate-800" : "hover:bg-slate-900/40"}`}
            >{item}</button>
          ))}
        </aside>

        {/* Graph area */}
        <section className="relative">
          {/* Filter bar */}
          <div className="px-4 py-3 border-b border-slate-800/60 flex items-center gap-2">
            <div className="flex items-center gap-2">
              {['Stack','Date','Outil'].map((m) => (
                <button key={m} onClick={() => { setMode(m as any); if (m==='Stack') zoomToFit(); }}
                  className={`px-3 py-1.5 rounded-full text-sm ${mode===m ? 'bg-slate-800 text-slate-100' : 'bg-slate-900/50 hover:bg-slate-900'}`}
                >{m}</button>
              ))}
            </div>
            <div className="mx-4 h-6 w-px bg-slate-800"/>
            <div className="flex items-center gap-2 text-sm">
              <SlidersHorizontal size={16} className="opacity-70"/>
              <span>Score</span>
              <input className="w-40 accent-indigo-400" type="range" min={0} max={100} value={score} onChange={(e)=>setScore(parseInt(e.target.value))}/>
              <span className="tabular-nums text-slate-300">{score}</span>
            </div>
            <div className="mx-4 h-6 w-px bg-slate-800"/>
            <div className="relative">
              <button className="px-3 py-1.5 rounded-xl bg-slate-900/50 text-sm hover:bg-slate-900 flex items-center gap-2">
                Actors: <span className="font-medium text-slate-100">{actors}</span> <ChevronDown size={14}/>
              </button>
            </div>
            <div className="relative">
              <button className="px-3 py-1.5 rounded-xl bg-slate-900/50 text-sm hover:bg-slate-900 flex items-center gap-2">
                <Globe size={16}/> <span>{geo}</span> <ChevronDown size={14}/>
              </button>
            </div>

            {/* Layout toggle */}
            <div className="ml-auto flex items-center gap-2">
              <div className="text-xs text-slate-400 mr-2">Layout</div>
              <button onClick={()=>setLayoutMode('orbit')} className={`px-2 py-1 rounded-lg text-xs ${layoutMode==='orbit'?'bg-slate-800 text-slate-100':'bg-slate-900/50 hover:bg-slate-900'}`}>Orbit</button>
              <button onClick={()=>setLayoutMode('force')} className={`px-2 py-1 rounded-lg text-xs ${layoutMode==='force'?'bg-slate-800 text-slate-100':'bg-slate-900/50 hover:bg-slate-900'}`}>Force</button>
              <button onClick={()=>zoomBy(1.2)} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-900"><Plus size={16}/></button>
              <button onClick={()=>zoomBy(0.8)} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:bg-slate-900"><Minus size={16}/></button>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-500"/>
                <input value={query} onChange={(e)=>setQuery(e.target.value)} className="bg-slate-900/60 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Rechercher…"/>
              </div>
            </div>
          </div>

          {/* Graph */}
          <div ref={containerRef} className="relative h-[calc(100vh-140px)]">
            <ForceGraph2D
              ref={graphRef}
              graphData={filtered}
              width={dims.w}
              height={dims.h}
              backgroundColor="#0b1220"
              linkColor={() => "rgba(148,163,184,0.35)"}
              linkWidth={(l:any) => (highlightLinks.has(l) ? 2.2 : 0.6)}
              nodeCanvasObject={(node:any, ctx:any, scale:number) => {
                const N = node;
                const label = N.name;
                const r = (N.size || 8) * (highlightNodes.has(node) ? 1.25 : 1);
                ctx.beginPath();
                ctx.arc(N.x, N.y, r, 0, 2 * Math.PI, false);
                const colors = ["#7dd3fc","#60a5fa","#34d399","#f472b6","#f59e0b","#22d3ee","#a78bfa","#fb7185"];
                ctx.fillStyle = colors[N.group % colors.length];
                ctx.globalAlpha = N.isProject ? 1 : 0.92;
                ctx.fill();
                ctx.globalAlpha = 1;
                if (scale > 1.0) {
                  ctx.font = `${Math.max(10, 12/scale)}px Inter,system-ui,Segoe UI`;
                  ctx.fillStyle = "#cbd5e1";
                  ctx.fillText(label, N.x + r + 4, N.y + 3);
                }
              }}
              nodePointerAreaPaint={(node:any, color:string, ctx:any) => { const N = node; ctx.beginPath(); ctx.arc(N.x, N.y, (N.size||6)+4, 0, 2*Math.PI, false); ctx.fillStyle = color; ctx.fill(); }}
              onNodeHover={(n:any) => setHoverId(n ? n.id : null)}
              onNodeClick={(n:any) => { setSelected(n); if (n.isProject || n.depth < 2) toggleExpand(n); focusNode(n.id); }}
              cooldownTicks={layoutMode==='orbit' ? 10 : 50}
              onEngineStop={() => { if (!graphRef.current) return; if (mode==='Stack' && layoutMode==='force') graphRef.current.zoomToFit(0,60); }}
            />
          </div>
        </section>

        {/* Right panel: Projects + Details + Actions */}
        <aside className="border-l border-slate-800/60 h-[calc(100vh-64px)] overflow-auto">
          <div className="px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Command Center</div>
              <div className="font-semibold">Projects & Details</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>setCreating(v=>!v)} className="px-2 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-xs flex items-center gap-1"><FolderPlus size={14}/>New</button>
              <button onClick={handleSaveSelected} className="px-2 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs flex items-center gap-1"><Save size={14}/>Snapshot</button>
            </div>
          </div>

          {/* Create new project */}
          {creating && (
            <div className="p-4 border-b border-slate-800/60">
              <label className="block text-xs text-slate-400 mb-1">Project name</label>
              <input value={newName} onChange={(e)=>setNewName(e.target.value)} className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2 text-sm" placeholder="Ex: Copilote Code IA"/>
              <div className="mt-2 flex gap-2">
                <button onClick={handleCreate} className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-sm">Create</button>
                <button onClick={()=>setCreating(false)} className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-sm">Cancel</button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Les handlers API sont dans <code>app/api/projects/*/route.ts</code>.</p>
            </div>
          )}

          {/* Selected details */}
          {selected && (
            <div className="p-4 border-b border-slate-800/60">
              <div className="text-xs text-slate-400 mb-1">Selected</div>
              <div className="font-semibold mb-1">{selected.name}</div>
              <div className="text-sm text-slate-300 space-y-1">
                {selected.isProject && <div><span className="text-slate-400">Type:</span> Project</div>}
                {!selected.isProject && <div><span className="text-slate-400">Type:</span> {selected.type}</div>}
                <div><span className="text-slate-400">Score:</span> {selected.score ?? '—'}</div>
                <div><span className="text-slate-400">Depth:</span> {selected.depth ?? 0}</div>
                {selected.slug && <div><span className="text-slate-400">Slug:</span> {selected.slug}</div>}
              </div>
              {selected.isProject && (
                <div className="mt-3 flex gap-2">
                  <button onClick={()=>toggleExpand(selected)} className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-sm">Expand/Collapse</button>
                  <button onClick={handleSaveSelected} className="px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-sm">Save Snapshot</button>
                </div>
              )}
            </div>
          )}

          {/* Ranking / list */}
          <ol className="divide-y divide-slate-800/60">
            {projects
              .filter(p => !query || p.name.toLowerCase().includes(query.toLowerCase()))
              .map((p, i) => (
                <li key={p.id} onClick={()=>{ setSelected(p); focusNode(p.id); }} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-900/40 cursor-pointer">
                  <div className="w-6 text-sm text-slate-500 tabular-nums">{i + 1}</div>
                  <div className="flex-1">
                    <div className="font-medium leading-tight">{p.name}</div>
                    <div className="text-xs text-slate-400">Score {p.score}</div>
                  </div>
                  <Trend v={(i % 2 ? -1 : 1) * (0.4 + (i * 0.137) % 3.5)} />
                  <ChevronRight size={16} className="text-slate-500"/>
                </li>
              ))}
          </ol>

          {/* Toast */}
          {toast && (
            <div className="m-4 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-sm" onAnimationEnd={()=>setToast(null)}>{toast}</div>
          )}
        </aside>
      </div>
    </div>
  );
}

// API handlers are in dedicated files:
//  - app/api/projects/create/route.ts
//  - app/api/projects/save/route.ts
