import { supabase } from "@/lib/supabase";
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
  const patients = await getPatients();
  for (const patient of patients) {
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
  const trimmed = term.trim();
  if (!trimmed) return getPatients();

  const patients = await getPatients();
  const lower = trimmed.toLowerCase();
  const results = patients.filter(
    (p) =>
      p.full_name.toLowerCase().includes(lower) ||
      p.mobile_number.includes(trimmed) ||
      p.case_number.toLowerCase().includes(lower)
  );

  return typeof maxResults === "number" ? results.slice(0, maxResults) : results;
}

export async function addPatient(
  data: Omit<Patient, "id" | "created_at" | "updated_at">
): Promise<string> {
  const caseNumber = normalizeCaseNumber(data.case_number);
  const fullName = cleanText(data.full_name);
  const mobileNumber = cleanPhone(data.mobile_number);

  if (!caseNumber) throw new Error("Case number is required.");
  if (!fullName) throw new Error("Patient name is required.");
  if (!mobileNumber) throw new Error("Mobile number is required.");

  // Check duplicate case number
  const existing = await getPatients();
  if (existing.find((p) => normalizeCaseNumber(p.case_number) === caseNumber)) {
    throw new Error("Case number already exists.");
  }

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
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  invalidatePatientCache();
  return inserted.id;
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<void> {
  const updates: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() };
  if (data.case_number) updates.case_number = normalizeCaseNumber(data.case_number);
  if (data.full_name) updates.full_name = cleanText(data.full_name);
  if (data.mobile_number) updates.mobile_number = cleanPhone(data.mobile_number);
  if (data.current_medicines) updates.current_medicines = normalizeMedicines(data.current_medicines);

  const cleaned = stripUndefinedValues(updates);
  const { error } = await supabase.from("patients").update(cleaned).eq("id", id);
  if (error) throw new Error(error.message);
  invalidatePatientCache();
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
  const all = await getPatients();
  return all
    .filter((p) => (p.khata_balance ?? 0) !== 0)
    .sort((a, b) => (a.khata_balance || 0) - (b.khata_balance || 0));
}
