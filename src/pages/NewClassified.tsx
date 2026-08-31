import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { uploadFile } from "../lib/upload";
import { useAuth } from "../lib/useAuth";
import { categories } from "../lib/mockData";
import { UploadCloud } from "lucide-react";

const subCategories = categories.filter((c) => c.parentId !== null);

export function NewClassifiedPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<"novo" | "usado">("usado");
  const [categoryId, setCategoryId] = useState(subCategories[0]?.id ?? "");
  const [city, setCity] = useState("");
  const [state, setStateUf] = useState("SP");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-5 py-24 text-center">
        <p className="text-steel text-sm">
          Você precisa <Link to="/login" className="text-copper underline">entrar</Link> ou{" "}
          <Link to="/cadastro" className="text-copper underline">criar um perfil</Link> para anunciar.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      let mediaUrl: string | null = null;
      if (file) mediaUrl = await uploadFile("classifieds", user!.id, file);

      const { error: insertError } = await supabase.from("classified_listings").insert({
        seller_id: user!.id,
        title,
        description,
        price: Number(price),
        condition,
        category_id: categoryId,
        city,
        state,
        media_url: mediaUrl,
      });
      if (insertError) throw insertError;
      navigate("/classificados");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao publicar anúncio");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-12">
      <p className="font-mono text-xs text-copper uppercase tracking-wide mb-2">classificados</p>
      <h1 className="font-display text-3xl font-semibold">Anunciar máquina ou peça</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="block text-xs font-mono text-steel mb-1.5">título</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-line bg-paper px-3 py-2.5 text-sm" placeholder="Ex: Motor de esmerilhadeira Bosch 2000W" />
        </div>

        <div>
          <label className="block text-xs font-mono text-steel mb-1.5">descrição</label>
          <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-line bg-paper px-3 py-2.5 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-steel mb-1.5">preço (R$)</label>
            <input required type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-line bg-paper px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-mono text-steel mb-1.5">condição</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value as "novo" | "usado")} className="w-full border border-line bg-paper px-3 py-2.5 text-sm">
              <option value="usado">Usado</option>
              <option value="novo">Novo</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-steel mb-1.5">categoria</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border border-line bg-paper px-3 py-2.5 text-sm">
            {subCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-steel mb-1.5">cidade</label>
            <input required value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-line bg-paper px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-mono text-steel mb-1.5">estado (UF)</label>
            <input required maxLength={2} value={state} onChange={(e) => setStateUf(e.target.value.toUpperCase())} className="w-full border border-line bg-paper px-3 py-2.5 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-steel mb-1.5">foto</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm file:mr-3 file:border-0 file:bg-charcoal file:text-paper file:px-3 file:py-2 file:text-xs" />
        </div>

        {error && <p className="text-xs text-signal">{error}</p>}

        <button disabled={sending} className="w-full inline-flex items-center justify-center gap-2 bg-charcoal text-paper px-4 py-3 text-sm font-medium hover:bg-copper transition-colors disabled:opacity-50">
          <UploadCloud size={14} strokeWidth={1.5} />
          {sending ? "Publicando…" : "Publicar anúncio"}
        </button>
      </form>
    </div>
  );
}
