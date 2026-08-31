import { useState } from "react";
import { fetchCategories } from "../lib/api";
import { supabase } from "../lib/supabase";
import { signUpWithEmail } from "../lib/useAuth";
import { UploadCloud } from "lucide-react";
import { useEffect } from "react";
import type { Category } from "../types";

export function CreateProfilePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [step, setStep] = useState<"form" | "confirm-email" | "done">("form");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [state, setStateUf] = useState("SP");
  const [phone, setPhone] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories().then((cats) => setCategories(cats.filter((c) => c.parentId !== null)));
  }, []);

  function toggleCategory(id: string) {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const { data, error: signUpError } = await signUpWithEmail(email, password);
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Não foi possível criar o usuário.");

      if (!data.session) {
        // Confirmação de e-mail está ativa no projeto: o perfil técnico só
        // pode ser gravado depois que a sessão existir (RLS exige auth.uid()).
        // Guardamos os dados no localStorage para retomar o cadastro após o login.
        localStorage.setItem(
          "pendingTechnicianProfile",
          JSON.stringify({ userId: data.user.id, name, bio, city, state, phone, selectedCategories })
        );
        setStep("confirm-email");
        return;
      }

      await createTechnicianProfile(data.user.id);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar perfil");
    } finally {
      setSending(false);
    }
  }

  async function createTechnicianProfile(userId: string) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: userId, is_technician: true, full_name: name, phone });
    if (profileError) throw profileError;

    const { error: techError } = await supabase
      .from("technician_profiles")
      .insert({ id: userId, bio, city, state, plan: "free" });
    if (techError) throw techError;

    if (selectedCategories.length > 0) {
      const { error: catError } = await supabase
        .from("technician_categories")
        .insert(selectedCategories.map((category_id) => ({ technician_id: userId, category_id })));
      if (catError) throw catError;
    }
  }

  if (step === "confirm-email") {
    return (
      <div className="max-w-lg mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">Confirme seu e-mail</h1>
        <p className="text-steel mt-2 text-sm">
          Enviamos um link de confirmação para <strong>{email}</strong>. Depois de confirmar e fazer login, seu
          perfil técnico é criado automaticamente com os dados que você preencheu.
        </p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="max-w-lg mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold">Perfil criado</h1>
        <p className="text-steel mt-2 text-sm">
          Seu perfil já está gravado no banco. Agora você pode fazer login e publicar seus primeiros vídeos/fotos.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-12">
      <p className="font-mono text-xs text-copper uppercase tracking-wide mb-2">cadastro de técnico</p>
      <h1 className="font-display text-3xl font-semibold">Crie seu perfil</h1>
      <p className="text-steel text-sm mt-2">
        Perfil gratuito por padrão. Destaque nos resultados de busca é um plano premium, ativado depois.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-steel mb-1.5">e-mail</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-line bg-paper px-3 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-mono text-steel mb-1.5">senha</label>
            <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-line bg-paper px-3 py-2.5 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-steel mb-1.5">nome completo</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-line bg-paper px-3 py-2.5 text-sm" placeholder="Ex: Roberto Aquino" />
        </div>

        <div>
          <label className="block text-xs font-mono text-steel mb-1.5">bio / especialidade</label>
          <textarea required rows={3} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full border border-line bg-paper px-3 py-2.5 text-sm" placeholder="Conte sua experiência e o que você conserta" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-steel mb-1.5">cidade</label>
            <input required value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-line bg-paper px-3 py-2.5 text-sm" placeholder="Guarulhos" />
          </div>
          <div>
            <label className="block text-xs font-mono text-steel mb-1.5">estado (UF)</label>
            <input required maxLength={2} value={state} onChange={(e) => setStateUf(e.target.value.toUpperCase())} className="w-full border border-line bg-paper px-3 py-2.5 text-sm" placeholder="SP" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-steel mb-1.5">telefone</label>
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-line bg-paper px-3 py-2.5 text-sm" placeholder="(11) 90000-0000" />
        </div>

        <div>
          <label className="block text-xs font-mono text-steel mb-1.5">categorias de atuação</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-1.5 text-xs border border-line px-2 py-1.5 cursor-pointer has-checked:border-copper has-checked:bg-copper-bright/10">
                <input type="checkbox" className="accent-copper" checked={selectedCategories.includes(c.id)} onChange={() => toggleCategory(c.id)} />
                {c.name}
              </label>
            ))}
          </div>
        </div>

        <div className="border border-dashed border-line p-6 text-center">
          <UploadCloud size={20} strokeWidth={1.5} className="mx-auto text-steel" />
          <p className="text-xs text-steel mt-2">Depois de criado o perfil, você poderá enviar fotos e vídeos do seu trabalho na sua própria página.</p>
        </div>

        {error && <p className="text-xs text-signal">{error}</p>}

        <button disabled={sending} type="submit" className="w-full bg-charcoal text-paper px-4 py-3 text-sm font-medium hover:bg-copper transition-colors disabled:opacity-50">
          {sending ? "Criando…" : "Criar perfil"}
        </button>
      </form>
    </div>
  );
}
