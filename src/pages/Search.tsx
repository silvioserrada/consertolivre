import { useEffect, useMemo, useState, useRef } from "react";
import { fetchCategories, fetchTechnicians } from "../lib/api";
import { distanceKm, getUserLocation } from "../lib/geo";
import { TechnicianCard } from "../components/TechnicianCard";
import { Search as SearchIcon, SlidersHorizontal, Video, MessageSquare } from "lucide-react";
import type { Category, Technician } from "../types";

const HOW_IT_WORKS = [
  {
    icon: SearchIcon,
    title: "Busque por categoria e proximidade",
    text: "Filtre pelo equipamento que precisa consertar e veja quem atende perto de você.",
  },
  {
    icon: Video,
    title: "Veja o serviço em vídeo antes de decidir",
    text: "Cada técnico publica vídeos e fotos reais do próprio trabalho — não é só uma nota, é prova.",
  },
  {
    icon: MessageSquare,
    title: "Combine direto, sem intermediário",
    text: "O contato (telefone) fica no perfil. Você negocia direto com o técnico, do seu jeito.",
  },
];

export function SearchPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [userLocation, setUserLocation] = useState({ lat: -23.4543, lng: -46.5337, label: "Guarulhos, SP" });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [topCategory, setTopCategory] = useState<string | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState(50);
  const [query, setQuery] = useState("");

  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUserLocation().then(setUserLocation);
    Promise.all([fetchCategories(), fetchTechnicians()])
      .then(([cats, techs]) => {
        setCategories(cats);
        setTechnicians(techs);
      })
      .catch((err) => setErrorMsg(err.message ?? "Erro ao carregar dados"))
      .finally(() => setLoading(false));
  }, []);

  const topLevel = categories.filter((c) => c.parentId === null);
  const subCategories = useMemo(
    () => categories.filter((c) => c.parentId === topCategory),
    [categories, topCategory]
  );

  const results = useMemo(() => {
    return technicians
      .map((t) => ({ t, dist: distanceKm(userLocation.lat, userLocation.lng, t.lat, t.lng) }))
      .filter(({ t, dist }) => {
        if (dist > maxDistance) return false;
        if (subCategory && !t.categoryIds.includes(subCategory)) return false;
        if (!subCategory && topCategory) {
          const subsOfTop = categories.filter((c) => c.parentId === topCategory).map((c) => c.id);
          if (!t.categoryIds.some((id) => subsOfTop.includes(id))) return false;
        }
        if (query && !t.name.toLowerCase().includes(query.toLowerCase()) && !t.bio.toLowerCase().includes(query.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const featA = a.t.plan === "premium" ? 0 : 1;
        const featB = b.t.plan === "premium" ? 0 : 1;
        if (featA !== featB) return featA - featB;
        return a.dist - b.dist;
      });
  }, [technicians, topCategory, subCategory, maxDistance, query, userLocation, categories]);

  function quickFilter(categoryId: string) {
    setTopCategory(categoryId);
    setSubCategory(null);
    searchBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="max-w-6xl mx-auto px-5 pt-14 pb-10 grid sm:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
          <div>
            <p className="font-mono text-xs text-copper uppercase tracking-wide mb-3">
              busca por categoria + proximidade
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.05] max-w-lg">
              Ache quem conserta perto de você
            </h1>
            <p className="text-steel mt-4 max-w-md">
              Vídeos e fotos reais do serviço de cada técnico. Você vê o trabalho antes de ligar,
              e combina o resto direto com quem vai consertar.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => searchBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="bg-charcoal text-paper px-5 py-2.5 text-sm font-medium hover:bg-copper transition-colors"
              >
                Buscar técnico
              </button>
              <a
                href="/cadastro"
                className="border border-line px-5 py-2.5 text-sm font-medium hover:border-charcoal transition-colors"
              >
                Sou técnico, quero divulgar meu serviço
              </a>
            </div>
          </div>

          <HeroDiagram />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 py-10">
        {/* Atalhos de categoria */}
        {topLevel.length > 0 && (
          <div className="flex flex-wrap gap-2 -mt-2 mb-8">
            {topLevel.map((c) => (
              <button
                key={c.id}
                onClick={() => quickFilter(c.id)}
                className="text-xs font-mono border border-line px-3 py-1.5 hover:border-copper hover:text-copper transition-colors"
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Caixa de busca */}
        <div ref={searchBoxRef} className="scroll-mt-6 border border-line bg-white/40 p-4 sm:p-5">
          <div className="flex items-center gap-2 border-b border-line pb-3 mb-4">
            <SearchIcon size={15} strokeWidth={1.5} className="text-steel" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou especialidade (ex: geladeira, esmerilhadeira)"
              className="w-full bg-transparent outline-none text-sm placeholder:text-steel/70"
            />
          </div>

          <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
            <div>
              <label className="block text-xs font-mono text-steel mb-1.5">nicho</label>
              <select
                value={topCategory ?? ""}
                onChange={(e) => {
                  setTopCategory(e.target.value || null);
                  setSubCategory(null);
                }}
                className="w-full border border-line bg-paper px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                {topLevel.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-steel mb-1.5">equipamento</label>
              <select
                value={subCategory ?? ""}
                onChange={(e) => setSubCategory(e.target.value || null)}
                disabled={!topCategory}
                className="w-full border border-line bg-paper px-3 py-2 text-sm disabled:opacity-40"
              >
                <option value="">Todos</option>
                {subCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="min-w-[160px]">
              <label className="flex items-center gap-1.5 text-xs font-mono text-steel mb-1.5">
                <SlidersHorizontal size={11} strokeWidth={1.5} />
                raio: {maxDistance} km
              </label>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-copper"
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-line p-5 h-32 animate-pulse bg-line/20" />
            ))}
          </div>
        )}

        {errorMsg && (
          <p className="text-sm text-signal mt-8 border border-signal/30 bg-signal/5 p-3">
            Não consegui carregar os dados: {errorMsg}
          </p>
        )}

        {!loading && !errorMsg && (
          <>
            <p className="text-xs font-mono text-steel mt-6 mb-3">
              {results.length} técnico{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""} perto de {userLocation.label}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {results.map(({ t, dist }) => (
                <TechnicianCard
                  key={t.id}
                  technician={t}
                  distanceKm={dist}
                  categoryLabels={t.categoryIds.map((id) => categories.find((c) => c.id === id)?.name ?? id)}
                />
              ))}
              {results.length === 0 && (
                <p className="col-span-2 text-sm text-steel border border-dashed border-line p-6 text-center">
                  Nenhum técnico encontrado com esses filtros. Tente aumentar o raio de busca, ou seja o primeiro a{" "}
                  <a href="/cadastro" className="text-copper underline">criar um perfil</a>.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Como funciona */}
      <section className="border-t border-line bg-charcoal text-paper">
        <div className="max-w-6xl mx-auto px-5 py-14">
          <p className="font-mono text-xs text-copper-bright uppercase tracking-wide mb-2">como funciona</p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold max-w-md mb-10">
            Sem cadastro de pedido, sem taxa por serviço
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="border-t border-charcoal-soft pt-4">
                <span className="font-mono text-xs text-steel">0{i + 1}</span>
                <step.icon size={20} strokeWidth={1.5} className="text-copper-bright mt-2 mb-3" />
                <h3 className="font-display font-medium text-base mb-1.5">{step.title}</h3>
                <p className="text-sm text-paper/70 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/** Ilustração simples em SVG no vocabulário visual da marca (linhas técnicas, sem foto de banco). */
function HeroDiagram() {
  return (
    <div className="hidden sm:block corner-ticks border border-line p-6 bg-white/30">
      <svg viewBox="0 0 280 220" className="w-full h-auto" fill="none">
        <circle cx="140" cy="90" r="46" stroke="#423D34" strokeWidth="1" strokeDasharray="3 4" />
        <circle cx="140" cy="90" r="6" fill="#E08A2C" />
        <line x1="140" y1="44" x2="140" y2="20" stroke="#423D34" strokeWidth="1" />
        <line x1="186" y1="90" x2="210" y2="90" stroke="#423D34" strokeWidth="1" />
        <line x1="140" y1="136" x2="140" y2="160" stroke="#423D34" strokeWidth="1" />
        <line x1="94" y1="90" x2="70" y2="90" stroke="#423D34" strokeWidth="1" />

        <g>
          <rect x="110" y="8" width="60" height="16" fill="none" stroke="#4B5A60" strokeWidth="1" />
          <text x="140" y="19" textAnchor="middle" fontSize="8" fontFamily="IBM Plex Mono, monospace" fill="#4B5A60">
            esmerilhadeira
          </text>
        </g>
        <g>
          <rect x="212" y="82" width="52" height="16" fill="none" stroke="#4B5A60" strokeWidth="1" />
          <text x="238" y="93" textAnchor="middle" fontSize="8" fontFamily="IBM Plex Mono, monospace" fill="#4B5A60">
            geladeira
          </text>
        </g>
        <g>
          <rect x="105" y="164" width="70" height="16" fill="none" stroke="#4B5A60" strokeWidth="1" />
          <text x="140" y="175" textAnchor="middle" fontSize="8" fontFamily="IBM Plex Mono, monospace" fill="#4B5A60">
            máq. de lavar
          </text>
        </g>
        <g>
          <rect x="4" y="82" width="66" height="16" fill="none" stroke="#4B5A60" strokeWidth="1" />
          <text x="37" y="93" textAnchor="middle" fontSize="8" fontFamily="IBM Plex Mono, monospace" fill="#4B5A60">
            furadeira
          </text>
        </g>

        <text x="140" y="94" textAnchor="middle" fontSize="9" fontFamily="Space Grotesk, sans-serif" fill="#221F1B">
          você
        </text>
      </svg>
      <p className="font-mono text-[11px] text-steel mt-4 text-center">
        raio de busca configurável — de 5 a 100 km
      </p>
    </div>
  );
}
