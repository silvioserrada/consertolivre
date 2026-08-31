import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Phone, MapPin, PlayCircle, Heart, Share2, UploadCloud } from "lucide-react";
import { fetchTechnicianById, fetchPostsByTechnician, fetchCommentsFor, submitReport } from "../lib/api";
import { supabase } from "../lib/supabase";
import { uploadFile, inferMediaType } from "../lib/upload";
import { useAuth } from "../lib/useAuth";
import { categories } from "../lib/mockData";
import { RatingStars } from "../components/RatingStars";
import { ReportButton } from "../components/ReportButton";
import type { Technician, Post, Comment } from "../types";

export function TechnicianProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [technician, setTechnician] = useState<Technician | null | undefined>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetchTechnicianById(id).then(setTechnician);
    fetchPostsByTechnician(id).then(setPosts);
    fetchCommentsFor("technician_profile", id).then(setComments);
  }, [id, reloadKey]);

  if (technician === undefined) {
    return <div className="max-w-4xl mx-auto px-5 py-16 text-sm text-steel">Carregando…</div>;
  }

  if (technician === null) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-16 text-center">
        <p className="text-steel">Técnico não encontrado.</p>
        <Link to="/" className="text-copper underline text-sm">Voltar para a busca</Link>
      </div>
    );
  }

  const isOwner = user?.id === technician.id;

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex flex-col sm:flex-row gap-6 border-b border-line pb-8">
        <img src={technician.avatarUrl} alt={technician.name} className="w-24 h-24 object-cover" />
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display text-2xl font-semibold">{technician.name}</h1>
            {technician.plan === "premium" && (
              <span className="text-[10px] font-mono uppercase tracking-wide bg-copper-bright/20 text-copper px-1.5 py-0.5">
                destaque
              </span>
            )}
          </div>
          <p className="text-sm text-steel flex items-center gap-1 mt-1">
            <MapPin size={12} strokeWidth={1.5} /> {technician.city}/{technician.state}
          </p>
          <div className="mt-2"><RatingStars average={technician.rating.average} count={technician.rating.count} size={16} /></div>
          <p className="text-sm text-charcoal-soft mt-3 max-w-xl">{technician.bio}</p>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {technician.categoryIds.map((cid) => (
              <span key={cid} className="text-[11px] font-mono text-steel border border-line px-1.5 py-0.5">
                {categories.find((c) => c.id === cid)?.name ?? cid}
              </span>
            ))}
          </div>

          {technician.phone && (
            <a
              href={`tel:${technician.phone.replace(/\D/g, "")}`}
              className="inline-flex items-center gap-2 mt-4 bg-charcoal text-paper px-4 py-2 text-sm font-medium hover:bg-copper transition-colors"
            >
              <Phone size={14} strokeWidth={1.5} /> {technician.phone}
            </a>
          )}
          <p className="text-xs text-steel mt-2">Contato e negociação acontecem diretamente com o técnico, fora da plataforma.</p>
        </div>
      </div>

      {isOwner && <NewPostForm technicianId={technician.id} onCreated={() => setReloadKey((k) => k + 1)} />}

      <section className="mt-8">
        <h2 className="font-display font-semibold text-lg mb-4">Portfólio ({posts.length})</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="border border-line bg-white/40">
              <div className="relative aspect-video bg-charcoal-soft overflow-hidden">
                <img src={post.thumbnailUrl} alt={post.title} className="w-full h-full object-cover opacity-90" />
                {post.mediaType === "video" && (
                  <PlayCircle className="absolute inset-0 m-auto text-paper drop-shadow" size={36} strokeWidth={1.3} />
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium leading-snug">{post.title}</h3>
                <p className="text-xs text-steel mt-1 line-clamp-2">{post.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <RatingStars average={post.rating.average} count={post.rating.count} />
                  <div className="flex items-center gap-2 text-steel">
                    <Heart size={13} strokeWidth={1.5} className="hover:text-signal cursor-pointer" />
                    <Share2 size={13} strokeWidth={1.5} className="hover:text-copper cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="col-span-3 text-sm text-steel border border-dashed border-line p-6 text-center">
              {isOwner ? "Você ainda não publicou vídeos ou fotos. Use o formulário acima." : "Este técnico ainda não publicou vídeos ou fotos."}
            </p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display font-semibold text-lg mb-4">Avaliações</h2>
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="border border-line p-4 bg-white/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{c.authorName}</span>
                <RatingStars average={c.stars} count={0} />
              </div>
              <p className="text-sm text-charcoal-soft mt-1">{c.text}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] font-mono text-steel">{c.createdAt}</span>
                <ReportButton
                  targetLabel="comentário"
                  onReport={() => submitReport("ratings_comments", c.id)}
                />
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-steel border border-dashed border-line p-6 text-center">
              Ainda sem avaliações.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function NewPostForm({ technicianId, onCreated }: { technicianId: string; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Selecione um vídeo ou foto.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const mediaUrl = await uploadFile("posts", technicianId, file);
      const { error: insertError } = await supabase.from("posts").insert({
        technician_id: technicianId,
        title,
        description,
        media_type: inferMediaType(file),
        media_url: mediaUrl,
        thumbnail_url: inferMediaType(file) === "photo" ? mediaUrl : null,
      });
      if (insertError) throw insertError;
      setTitle("");
      setDescription("");
      setFile(null);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao publicar");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 border border-line bg-white/40 p-4">
      <p className="font-mono text-xs text-copper uppercase tracking-wide mb-3">novo post do portfólio</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título (ex: Troca de escova de carvão)"
          className="border border-line bg-paper px-3 py-2 text-sm"
        />
        <input
          type="file"
          accept="video/*,image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm file:mr-3 file:border-0 file:bg-charcoal file:text-paper file:px-3 file:py-2 file:text-xs"
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição do serviço mostrado"
        rows={2}
        className="w-full border border-line bg-paper px-3 py-2 text-sm mt-3"
      />
      {error && <p className="text-xs text-signal mt-2">{error}</p>}
      <button
        disabled={sending}
        className="inline-flex items-center gap-2 mt-3 bg-charcoal text-paper px-4 py-2 text-sm font-medium hover:bg-copper transition-colors disabled:opacity-50"
      >
        <UploadCloud size={14} strokeWidth={1.5} />
        {sending ? "Publicando…" : "Publicar"}
      </button>
    </form>
  );
}
