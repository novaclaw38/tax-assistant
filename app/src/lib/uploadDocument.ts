import { supabase } from "./supabaseClient";

/** Uploads a raw assessment file to private, user-scoped Storage. Returns the storage path. */
export async function uploadAssessmentFile(userId: string, file: File): Promise<string> {
  const path = `${userId}/${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from("assessment-documents").upload(path, file);
  if (error) throw error;
  return path;
}
