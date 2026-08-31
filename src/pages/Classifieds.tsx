import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchClassifieds } from "../lib/api";
import { RatingStars } from "../components/RatingStars";
import type { ClassifiedListing } from "../types";

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ClassifiedsPage() {
  const [classifieds, setClassifieds] = useState<ClassifiedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchClassifieds()
      .then(setClassifieds)
      .catch((err) => setErrorMsg(err.message ?? "Erro ao carregar dados"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs text-copper uppercase tracking-wide mb-2">
            classificados
          </p>
          <h1 className="font-display text-3xl font-semibold">Máquinas e peças</h1>
        </div>
        <Link
          to="/classificados/novo"
          className="bg-charcoal text-paper px-4 py-2 text-sm font-medium hover:bg-copper transition-colors"
        >
          Anunciar
        </Link>
      </div>

      {loading && <p className="text-sm text-steel mt-8">Carregando anúncios…</p>}
      {errorMsg && (
        <p className="text-sm text-signal mt-8 border border-signal/30 bg-signal/5 p-3">
          Não consegui carregar os dados: {errorMsg}
        </p>
      )}

      {!loading && !errorMsg && (
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {classifieds.map((item) => (
            <div key={item.id} className="border border-line bg-white/40">
              <div className="aspect-square bg-charcoal-soft overflow-hidden">
                {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <span className="text-[10px] font-mono uppercase tracking-wide text-steel">
                  {item.condition}
                </span>
                <h3 className="font-medium text-sm mt-1 leading-snug">{item.title}</h3>
                <p className="text-xs text-steel mt-1 line-clamp-2">{item.description}</p>
                <p className="font-display font-semibold text-lg mt-2">{formatBRL(item.price)}</p>
                <div className="flex items-center justify-between mt-2">
                  <RatingStars average={item.rating.average} count={item.rating.count} />
                  <span className="text-[11px] text-steel">{item.city}/{item.state}</span>
                </div>
                <p className="text-[11px] text-steel mt-2">Vendedor: {item.sellerName}</p>
              </div>
            </div>
          ))}
          {classifieds.length === 0 && (
            <p className="col-span-3 text-sm text-steel border border-dashed border-line p-6 text-center">
              Nenhum anúncio ainda. <Link to="/classificados/novo" className="text-copper underline">Seja o primeiro a anunciar</Link>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
