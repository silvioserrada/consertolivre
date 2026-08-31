import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmail } from "../lib/useAuth";
import { supabase } from "../lib/supabase";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const { data, error: signInError } = await signInWithEmail(email, password);
      if (signInError) throw signInError;
      if (!data.user) throw new Error("Login falhou.");

      await finishPendingTechnicianProfile(data.user.id);
      navigate(`/tecnico/${data.user.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="font-display text-2xl font-semibold">Entrar</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-mono text-steel mb-1.5">e-mail</label>
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-line bg-paper px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-mono text-steel mb-1.5">senha</label>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-line bg-paper px-3 py-2.5 text-sm" />
        </div>
        {error && <p className="text-xs text-signal">{error}</p>}
        <button disabled={sending} className="w-full bg-charcoal text-paper px-4 py-2.5 text-sm font-medium hover:bg-copper transition-colors disabled:opacity-50">
          {sending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

/**
 * Se o usuário fez o cadastro de técnico antes de confirmar o e-mail
 * (ver CreateProfile.tsx), os dados ficaram no localStorage. No primeiro
 * login, gravamos o perfil técnico de fato — só então auth.uid() bate com
 * o RLS das tabelas technician_profiles / technician_categories.
 */
async function finishPendingTechnicianProfile(userId: string) {
  const raw = localStorage.getItem("pendingTechnicianProfile");
  if (!raw) return;
  const pending = JSON.parse(raw);
  if (pending.userId !== userId) return;

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId, is_technician: true, full_name: pending.name, phone: pending.phone });
  if (profileError) throw profileError;

  const { error: techError } = await supabase
    .from("technician_profiles")
    .upsert({ id: userId, bio: pending.bio, city: pending.city, state: pending.state, plan: "free" });
  if (techError) throw techError;

  if (pending.selectedCategories?.length > 0) {
    const { error: catError } = await supabase
      .from("technician_categories")
      .upsert(pending.selectedCategories.map((category_id: string) => ({ technician_id: userId, category_id })));
    if (catError) throw catError;
  }

  localStorage.removeItem("pendingTechnicianProfile");
}
