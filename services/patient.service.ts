import { supabase } from "@/lib/supabase";
import { getSupabaseErrorMessage } from "@/lib/supabase-errors";
import type { Medicine, Patient, TreatmentType } from "@/lib/types";

// ─── Cache ───────────────────────────────────────────────
let patientCache: Patient[] | null = null;

function invalidatePatientCache() {
  patientCache = null;
}

export function clearPatientCache() {
  invalidatePatientCache();
}

// ─── Helpers ─────────────────────────────────────────────
function cleanText(value?: string | null) {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function cleanPhone(value?: string | null) {
  return value?.trim() ?? "";
}

function normalizeCaseNumber(value?: string | null) {
  return value?.trim().toUpperCase() ?? "";
}

function sanitizeSearchTerm(value: string) {
  return cleanText(value).replace(/[,%()]/g, " ").replace(/\s+/g, " ").trim();
}

function incrementCaseNumber(caseNumber: string) {
  const normalized = normalizeCaseNumber(caseNumber);
  const match = normalized.match(/(\d+)(?!.*\d)/);

  if (!match || match.index === undefined) return "";

  const digits = match[0];
  const nextValue = String(Number.parseInt(digits, 10) + 1).padStart(digits.length, "0");
  const prefix = normalized.slice(0, match.index);
  const suffix = normalized.slice(match.index + digits.length);
  return `${prefix}${nextValue}${suffix}`;
}

function normalizeMedicines(medicines?: Medicine[] | null) {
  if (!medicines) return undefined;
  return medicines
    .map((m) => ({
      ...m,
      name: cleanText(m.name),
      potency: cleanText(m.potency),
      dosage: cleanText(m.dosage),
      frequency: cleanText(m.frequency),
      notes: cleanText(m.notes),
      days: Number.isFinite(m.days) ? m.days : 0,
    }))
    .filter((m) => Boolean(m.name || m.potency || m.dosage || m.frequency || m.notes));
}

function stripUndefinedValues<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => stripUndefinedValues(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefinedValues(v)])
    ) as T;
  }
  return value;
}

// ─── Queries ─────────────────────────────────────────────
export async function getPatients(limit?: number): Promise<Patient[]> {
  if (patientCache && !limit) return patientCache;

  let query = supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  
  if (!limit) patientCache = (data ?? []) as Patient[];
  return (data ?? []) as Patient[];
}

export async function getNextPatientCaseNumber(): Promise<string> {
  const { data, error } = await supabase
    .from("patients")
    .select("case_number")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw new Error(error.message);

  for (const patient of data ?? []) {
    const next = incrementCaseNumber(patient.case_number);
    if (next) return next;
  }
  return "CS-1001";
}

export async function getPatient(id: string): Promise<Patient | null> {
  const cached = patientCache?.find((p) => p.id === id);
  if (cached) return cached;

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Patient;
}

export async function searchPatients(term: string, maxResults?: number): Promise<Patient[]> {
  const trimmed = sanitizeSearchTerm(term);
  if (!trimmed) {
    return typeof maxResults === "number" ? getPatients(maxResults) : getPatients();
  }

  const normalizedCaseNumber = normalizeCaseNumber(trimmed);
  const phoneTerm = cleanPhone(trimmed);
  let query = supabase
    .from("patients")
    .select("*")
    .or(
      [
        `full_name.ilike.%${trimmed}%`,
        `mobile_number.ilike.%${phoneTerm}%`,
        `case_number.ilike.%${normalizedCaseNumber}%`,
      ].join(",")
    )
    .order("created_at", { ascending: false });

  if (typeof maxResults === "number") {
    query = query.limit(maxResults);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Patient[];
}

export async function addPatient(
  data: Omit<Patient, "id" | "created_at" | "updated_at">
): Promise<Patient> {
  const caseNumber = normalizeCaseNumber(data.case_number);
  const fullName = cleanText(data.full_name);
  const mobileNumber = cleanPhone(data.mobile_number);

  if (!caseNumber) throw new Error("Case number is required.");
  if (!fullName) throw new Error("Patient name is required.");
  if (!mobileNumber) throw new Error("Mobile number is required.");

  const normalized = stripUndefinedValues({
    ...data,
    case_number: caseNumber,
    full_name: fullName,
    mobile_number: mobileNumber,
    alternate_mobile: cleanPhone(data.alternate_mobile),
    email: cleanText(data.email),
    occupation: cleanText(data.occupation),
    marital_status: cleanText(data.marital_status),
    allergies: cleanText(data.allergies),
    chronic_diseases: cleanText(data.chronic_diseases),
    emergency_contact: cleanPhone(data.emergency_contact),
    notes: cleanText(data.notes),
    present_complaints: cleanText(data.present_complaints),
    bp: cleanText(data.bp),
    repetition: cleanText(data.repetition),
    current_medicines: normalizeMedicines(data.current_medicines),
  });

  const { data: inserted, error } = await supabase
    .from("patients")
    .insert(normalized)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to create patient.", {
        "23505": "Case number already exists.",
      })
    );
  }
  invalidatePatientCache();
  return inserted as Patient;
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
  const updates: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() };
  if (data.case_number) updates.case_number = normalizeCaseNumber(data.case_number);
  if (data.full_name) updates.full_name = cleanText(data.full_name);
  if (data.mobile_number) updates.mobile_number = cleanPhone(data.mobile_number);
  if ("alternate_mobile" in data) updates.alternate_mobile = cleanPhone(data.alternate_mobile);
  if ("email" in data) updates.email = cleanText(data.email);
  if ("occupation" in data) updates.occupation = cleanText(data.occupation);
  if ("marital_status" in data) updates.marital_status = cleanText(data.marital_status);
  if ("allergies" in data) updates.allergies = cleanText(data.allergies);
  if ("chronic_diseases" in data) updates.chronic_diseases = cleanText(data.chronic_diseases);
  if ("emergency_contact" in data) updates.emergency_contact = cleanPhone(data.emergency_contact);
  if ("notes" in data) updates.notes = cleanText(data.notes);
  if ("present_complaints" in data) updates.present_complaints = cleanText(data.present_complaints);
  if ("bp" in data) updates.bp = cleanText(data.bp);
  if ("repetition" in data) updates.repetition = cleanText(data.repetition);
  if ("lmp" in data) updates.lmp = data.lmp ? cleanText(data.lmp) : null;
  if (data.current_medicines) updates.current_medicines = normalizeMedicines(data.current_medicines);

  const cleaned = stripUndefinedValues(updates);
  const { data: updated, error } = await supabase
    .from("patients")
    .update(cleaned)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to update patient.", {
        "23505": "Case number already exists.",
      })
    );
  }

  invalidatePatientCache();
  return updated as Patient;
}

export async function deletePatient(id: string): Promise<void> {
  // CASCADE handles linked records (appointments, visits, payments)
  const { error } = await supabase.from("patients").delete().eq("id", id);
  if (error) throw new Error(error.message);
  invalidatePatientCache();
}

export async function getPatientLinkedRecordCounts(id: string) {
  const [a, v, p] = await Promise.all([
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("patient_id", id),
    supabase.from("visits").select("id", { count: "exact", head: true }).eq("patient_id", id),
    supabase.from("payments").select("id", { count: "exact", head: true }).eq("patient_id", id),
  ]);
  return {
    appointments: a.count ?? 0,
    visits: v.count ?? 0,
    payments: p.count ?? 0,
  };
}

export async function getPatientCount(): Promise<number> {
  const { count, error } = await supabase
    .from("patients")
    .select("*", { count: 'exact', head: true });
  if (error) return 0;
  return count ?? 0;
}

export async function updatePatientBalance(id: string, amount: number): Promise<void> {
  const { error } = await supabase.rpc("update_khata_balance", { p_id: id, p_amount: amount });
  if (error) throw new Error(error.message);
  invalidatePatientCache();
}

export async function getKhataPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .neq("khata_balance", 0)
    .order("khata_balance", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Patient[];
}
