import { supabase } from "@/lib/supabase";
import { errorMessageIncludes, getSupabaseErrorMessage } from "@/lib/supabase-errors";
import type { ClinicSettings } from "@/lib/types";

let settingsCache: ClinicSettings | null = null;

function getDefaultClinicSettings(): ClinicSettings {
  return {
    clinic_name: process.env.NEXT_PUBLIC_APP_NAME || "OPD Clinic",
    doctor_name: "",
    specialization: "",
    registration_number: "",
    phone: "",
    email: "",
    address: "",
  };
}

async function fetchLatestClinicSettingsRow() {
  const { data, error } = await supabase
    .from("clinic_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);
  return ((data ?? [])[0] ?? null) as ClinicSettings | null;
}

async function writeClinicSettings(
  payload: Record<string, unknown>,
  currentId?: string
): Promise<ClinicSettings> {
  const query = currentId
    ? supabase.from("clinic_settings").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", currentId)
    : supabase.from("clinic_settings").insert(payload);

  const { data, error } = await query.select("*").single();

  if (error && errorMessageIncludes(error, "registration_number")) {
    const { registration_number, ...fallbackPayload } = payload;
    const fallbackQuery = currentId
      ? supabase
          .from("clinic_settings")
          .update({ ...fallbackPayload, updated_at: new Date().toISOString() })
          .eq("id", currentId)
      : supabase.from("clinic_settings").insert(fallbackPayload);

    const { data: fallbackData, error: fallbackError } = await fallbackQuery.select("*").single();

    if (fallbackError) {
      throw new Error(getSupabaseErrorMessage(fallbackError, "Failed to save clinic settings."));
    }

    return fallbackData as ClinicSettings;
  }

  if (error) {
    throw new Error(getSupabaseErrorMessage(error, "Failed to save clinic settings."));
  }

  return data as ClinicSettings;
}

export async function getClinicSettings(): Promise<ClinicSettings> {
  if (settingsCache) return settingsCache;

  try {
    const data = await fetchLatestClinicSettingsRow();
    if (!data) {
      return getDefaultClinicSettings();
    }

    settingsCache = data as ClinicSettings;
    return settingsCache;
  } catch {
    return getDefaultClinicSettings();
  }
}

export async function updateClinicSettings(
  updates: Partial<ClinicSettings>
): Promise<ClinicSettings> {
  const current = settingsCache ?? (await fetchLatestClinicSettingsRow());
  const nextSettings = await writeClinicSettings(
    {
      clinic_name: updates.clinic_name || current?.clinic_name || getDefaultClinicSettings().clinic_name,
      doctor_name: updates.doctor_name || "",
      specialization: updates.specialization || "",
      registration_number: updates.registration_number || "",
      phone: updates.phone || "",
      email: updates.email || "",
      address: updates.address || "",
      logo_url: updates.logo_url || "",
    },
    current?.id
  );

  settingsCache = nextSettings;
  return settingsCache;
}
