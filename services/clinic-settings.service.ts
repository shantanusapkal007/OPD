import { supabase } from "@/lib/supabase";
import type { ClinicSettings } from "@/lib/types";

let settingsCache: ClinicSettings | null = null;

export async function getClinicSettings(): Promise<ClinicSettings> {
  if (settingsCache) return settingsCache;

  const { data, error } = await supabase
    .from("clinic_settings")
    .select("*")
    .limit(1)
    .single();

  if (error || !data) {
    // Return defaults if no settings row exists
    return {
      clinic_name: process.env.NEXT_PUBLIC_APP_NAME || "OPD Clinic",
      doctor_name: "",
      specialization: "",
      phone: "",
      email: "",
      address: "",
    };
  }

  settingsCache = data as ClinicSettings;
  return settingsCache;
}

export async function updateClinicSettings(
  updates: Partial<ClinicSettings>
): Promise<void> {
  // Get the current settings row ID
  const current = await getClinicSettings();

  if (current.id) {
    const { error } = await supabase
      .from("clinic_settings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", current.id);

    if (error) throw new Error(error.message);
  } else {
    // No row exists, insert one
    const { error } = await supabase.from("clinic_settings").insert({
      clinic_name: updates.clinic_name || "OPD Clinic",
      doctor_name: updates.doctor_name || "",
      specialization: updates.specialization || "",
      phone: updates.phone || "",
      email: updates.email || "",
      address: updates.address || "",
    });
    if (error) throw new Error(error.message);
  }

  settingsCache = null; // Invalidate cache
}
