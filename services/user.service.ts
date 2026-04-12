import { supabase } from "@/lib/supabase";
import type { AppUser, UserRole } from "@/lib/types";

export async function getOrCreateUser(
  uid: string,
  name: string,
  email: string,
  photoURL?: string
): Promise<AppUser> {
  // Try to fetch existing user
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("id", uid)
    .single();

  if (existing) return existing as AppUser;

  // First-time sign-in → create user record
  const newUser = {
    id: uid,
    name,
    email,
    role: "admin" as UserRole,
    photo_url: photoURL || "",
    is_active: true,
  };

  const { data: created, error } = await supabase
    .from("users")
    .insert(newUser)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return created as AppUser;
}

export async function updateUserRole(uid: string, role: UserRole) {
  const { error } = await supabase
    .from("users")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", uid);

  if (error) throw new Error(error.message);
}
