import { supabase } from "./supabase";
import type { Category, Technician, ClassifiedListing, Post, Comment } from "../types";

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("id, name, parent_id");
  if (error) throw error;
  return (data ?? []).map((c) => ({ id: c.id, name: c.name, parentId: c.parent_id }));
}

/**
 * Busca técnicos com suas categorias e contagem/média de avaliação.
 * O filtro de raio (km) é feito no cliente com distanceKm, já que o
 * volume esperado no MVP não justifica PostGIS ainda.
 */
export async function fetchTechnicians(): Promise<Technician[]> {
  const { data, error } = await supabase
    .from("technician_profiles")
    .select(
      `id, bio, city, state, lat, lng, plan,
       profiles!inner ( full_name, phone ),
       technician_categories ( category_id ),
       posts ( id )`
    );
  if (error) throw error;

  const ids = (data ?? []).map((t) => t.id);
  const ratings = await fetchRatingSummaries("technician_profile", ids);

  return (data ?? []).map((t) => ({
    id: t.id,
    name: (t.profiles as unknown as { full_name: string }).full_name,
    bio: t.bio ?? "",
    avatarUrl: `https://i.pravatar.cc/160?u=${t.id}`,
    city: t.city,
    state: t.state,
    lat: t.lat ?? 0,
    lng: t.lng ?? 0,
    phone: (t.profiles as unknown as { phone: string }).phone ?? "",
    categoryIds: (t.technician_categories ?? []).map((c: { category_id: string }) => c.category_id),
    plan: t.plan as "free" | "premium",
    rating: ratings[t.id] ?? { average: 0, count: 0 },
    postsCount: (t.posts ?? []).length,
  }));
}

export async function fetchTechnicianById(id: string): Promise<Technician | null> {
  const { data, error } = await supabase
    .from("technician_profiles")
    .select(
      `id, bio, city, state, lat, lng, plan,
       profiles!inner ( full_name, phone ),
       technician_categories ( category_id )`
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const ratings = await fetchRatingSummaries("technician_profile", [id]);

  return {
    id: data.id,
    name: (data.profiles as unknown as { full_name: string }).full_name,
    bio: data.bio ?? "",
    avatarUrl: `https://i.pravatar.cc/160?u=${data.id}`,
    city: data.city,
    state: data.state,
    lat: data.lat ?? 0,
    lng: data.lng ?? 0,
    phone: (data.profiles as unknown as { phone: string }).phone ?? "",
    categoryIds: (data.technician_categories ?? []).map((c: { category_id: string }) => c.category_id),
    plan: data.plan as "free" | "premium",
    rating: ratings[id] ?? { average: 0, count: 0 },
    postsCount: 0,
  };
}

export async function fetchPostsByTechnician(technicianId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, technician_id, category_id, title, description, media_type, media_url, thumbnail_url")
    .eq("technician_id", technicianId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const ids = (data ?? []).map((p) => p.id);
  const ratings = await fetchRatingSummaries("post", ids);

  return (data ?? []).map((p) => ({
    id: p.id,
    technicianId: p.technician_id,
    categoryId: p.category_id,
    title: p.title,
    mediaType: p.media_type as "video" | "photo",
    mediaUrl: p.media_url,
    thumbnailUrl: p.thumbnail_url ?? p.media_url,
    description: p.description ?? "",
    rating: ratings[p.id] ?? { average: 0, count: 0 },
  }));
}

export async function fetchClassifieds(): Promise<ClassifiedListing[]> {
  const { data, error } = await supabase
    .from("classified_listings")
    .select(
      `id, seller_id, title, description, price, condition, category_id, city, state, media_url,
       profiles!inner ( full_name )`
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const ids = (data ?? []).map((c) => c.id);
  const ratings = await fetchRatingSummaries("classified_listing", ids);

  return (data ?? []).map((c) => ({
    id: c.id,
    sellerId: c.seller_id,
    sellerName: (c.profiles as unknown as { full_name: string }).full_name,
    title: c.title,
    description: c.description ?? "",
    price: Number(c.price ?? 0),
    condition: c.condition as "novo" | "usado",
    categoryId: c.category_id,
    city: c.city,
    state: c.state,
    imageUrl: c.media_url ?? "",
    rating: ratings[c.id] ?? { average: 0, count: 0 },
  }));
}

export async function fetchCommentsFor(
  targetType: "post" | "classified_listing" | "technician_profile",
  targetId: string
): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("ratings_comments")
    .select("id, comment, stars, created_at, profiles ( full_name )")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((c) => ({
    id: c.id,
    authorName: (c.profiles as unknown as { full_name: string })?.full_name ?? "Usuário",
    text: c.comment ?? "",
    stars: c.stars ?? 0,
    createdAt: (c.created_at as string).slice(0, 10),
  }));
}

async function fetchRatingSummaries(
  targetType: "post" | "classified_listing" | "technician_profile",
  targetIds: string[]
): Promise<Record<string, { average: number; count: number }>> {
  if (targetIds.length === 0) return {};
  const { data, error } = await supabase
    .from("ratings_comments")
    .select("target_id, stars")
    .eq("target_type", targetType)
    .in("target_id", targetIds);
  if (error) throw error;

  const grouped: Record<string, number[]> = {};
  for (const row of data ?? []) {
    if (row.stars == null) continue;
    (grouped[row.target_id] ??= []).push(row.stars);
  }

  const result: Record<string, { average: number; count: number }> = {};
  for (const [id, stars] of Object.entries(grouped)) {
    result[id] = { average: stars.reduce((a, b) => a + b, 0) / stars.length, count: stars.length };
  }
  return result;
}

export async function submitReport(
  targetType: "post" | "classified_listing" | "technician_profile" | "ratings_comments",
  targetId: string,
  reason?: string
) {
  const { error } = await supabase.from("reports").insert({ target_type: targetType, target_id: targetId, reason });
  if (error) throw error;
}
