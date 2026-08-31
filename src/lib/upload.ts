import { supabase } from "./supabase";

/**
 * Envia um arquivo para o bucket informado, dentro de uma pasta nomeada
 * com o uid do usuário (as políticas de Storage exigem isso para permitir
 * apagar depois). Retorna a URL pública do arquivo.
 */
export async function uploadFile(
  bucket: "posts" | "classifieds",
  userId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function inferMediaType(file: File): "video" | "photo" {
  return file.type.startsWith("video/") ? "video" : "photo";
}
