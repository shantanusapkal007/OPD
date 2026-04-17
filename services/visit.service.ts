import { supabase } from "@/lib/supabase";
import { getSupabaseErrorMessage } from "@/lib/supabase-errors";
import { clearPatientCache } from "@/services/patient.service";
import { validateVisitBasics } from "@/lib/visit-validators";
import type { Medicine, Visit } from "@/lib/types";

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

export async function getVisits(): Promise<Visit[]> {
  const { data, error } = await supabase
    .from("visits")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Visit[];
}

export async function getVisitsByPatient(patientId: string): Promise<Visit[]> {
  const { data, error } = await supabase
    .from("visits")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Visit[];
}

/**
 * Fetch the latest visit for multiple patients.
 * No Firestore 10-item limit - PostgreSQL handles it natively.
 */
export async function getLatestVisitsForPatients(
  patientIds: string[]
): Promise<Record<string, Visit | null>> {
  const result: Record<string, Visit | null> = {};
  if (patientIds.length === 0) return result;

  for (const id of patientIds) result[id] = null;

  const applyResults = (visits: Visit[]) => {
    // Only keep the first (latest) one per patient
    for (const visit of visits) {
      if (!result[visit.patient_id]) {
        result[visit.patient_id] = visit;
      }
    }
  };

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_latest_visits_for_patients",
    { p_patient_ids: patientIds }
  );

  if (!rpcError) {
    applyResults((rpcData ?? []) as Visit[]);
    return result;
  }

  // Fallback: load visits for only the requested patient IDs (bounded set)
  const { data, error } = await supabase
    .from("visits")
    .select("id,patient_id,patient_name,complaints,diagnosis,vitals,prescriptions,created_at,follow_up_date")
    .in("patient_id", patientIds)
    .order("created_at", { ascending: false })
    .limit(Math.max(patientIds.length * 3, 100)); // reasonable upper bound

  if (error) throw new Error(error.message);
  applyResults((data ?? []) as Visit[]);
  return result;
}

export async function addVisit(data: Omit<Visit, "id" | "created_at">): Promise<Visit> {
  const patient_name = data.patient_name?.trim();
  const complaints = data.complaints?.trim();
  const diagnosis = data.diagnosis?.trim();
  const total_bill = Number(data.total_bill || 0);

  if (!data.patient_id || !patient_name || !complaints || !diagnosis) {
    throw new Error("Patient, complaints, and diagnosis are required.");
  }
  if (!Number.isFinite(total_bill) || total_bill < 0) {
    throw new Error("Total bill must be a valid amount.");
  }

  const sanitizedData = stripUndefinedValues({
    ...data,
    patient_name,
    complaints,
    diagnosis,
    total_bill,
  });

  // Insert the visit
  const { data: inserted, error } = await supabase
    .from("visits")
    .insert(sanitizedData)
    .select("*")
    .single();

  if (error) throw new Error(getSupabaseErrorMessage(error, "Failed to record visit."));

  // Handle billing
  if (total_bill > 0) {
    if (data.payment_status === "paid") {
      await supabase.from("payments").insert({
        patient_id: data.patient_id,
        patient_name,
        visit_id: inserted.id,
        amount: total_bill,
        payment_method: "cash",
        status: "paid",
        description: "Payment for Visit",
        date: new Date().toISOString().split("T")[0],
      });
    } else {
      // Unpaid visit: add the amount to khata (negative balance means due)
      await supabase.rpc("update_khata_balance", {
        p_id: data.patient_id,
        p_amount: -total_bill,
      });
    }
  }

  clearPatientCache();
  return inserted as Visit;
}

export async function getUpcomingFollowUps(limit?: number): Promise<Visit[]> {
  const today = new Date().toISOString().split("T")[0];
  let query = supabase
    .from("visits")
    .select("*")
    .gte("follow_up_date", today)
    .order("follow_up_date", { ascending: true });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return (data ?? []) as Visit[];
}

export async function updateVisitImages(visitId: string, visit_images: string[]): Promise<void> {
  if (!visitId || !Array.isArray(visit_images)) return;
  const { error } = await supabase
    .from("visits")
    .update({ visit_images })
    .eq("id", visitId);
  if (error) throw new Error(error.message);
}

export async function getVisit(visitId: string): Promise<Visit | null> {
  const { data, error } = await supabase
    .from("visits")
    .select("*")
    .eq("id", visitId)
    .single();

  if (error) return null;
  return data as Visit;
}

/**
 * Updates a visit with validation and audit trail
 */
export async function updateVisit(
  visitId: string,
  updates: Partial<Visit>,
  userId: string
): Promise<Visit> {
  if (!visitId) throw new Error("Visit ID is required");
  if (!userId) throw new Error("User ID is required for audit trail");

  const validation = validateVisitBasics(updates);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join("; ")}`);
  }

  const sanitizedUpdates = stripUndefinedValues({
    ...updates,
    complaints: updates.complaints?.trim(),
    diagnosis: updates.diagnosis?.trim(),
    advice: updates.advice?.trim(),
    past_history: updates.past_history?.trim(),
    family_history: updates.family_history?.trim(),
    examination_findings: updates.examination_findings?.trim(),
    history_of_present_illness: updates.history_of_present_illness?.trim(),
    is_edited: true,
    edited_at: new Date().toISOString(),
    edited_by: userId,
  });

  const { data, error } = await supabase
    .from("visits")
    .update(sanitizedUpdates)
    .eq("id", visitId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  clearPatientCache();
  return data as Visit;
}

export async function removeMedicineFromVisit(
  visitId: string,
  medicineIndex: number,
  userId: string
): Promise<void> {
  const visit = await getVisit(visitId);
  if (!visit) throw new Error("Visit not found");
  const updatedPrescriptions = visit.prescriptions?.filter((_, idx) => idx !== medicineIndex) || [];
  await updateVisit(visitId, { prescriptions: updatedPrescriptions }, userId);
}

export async function addMedicineToVisit(
  visitId: string,
  medicine: Medicine,
  userId: string
): Promise<void> {
  const visit = await getVisit(visitId);
  if (!visit) throw new Error("Visit not found");
  const updatedPrescriptions = [...(visit.prescriptions || []), medicine];
  await updateVisit(visitId, { prescriptions: updatedPrescriptions }, userId);
}

export async function updateMedicineInVisit(
  visitId: string,
  medicineIndex: number,
  medicine: Medicine,
  userId: string
): Promise<void> {
  const visit = await getVisit(visitId);
  if (!visit) throw new Error("Visit not found");
  const updatedPrescriptions = [...(visit.prescriptions || [])];
  if (medicineIndex >= 0 && medicineIndex < updatedPrescriptions.length) {
    updatedPrescriptions[medicineIndex] = medicine;
  } else {
    throw new Error("Invalid medicine index");
  }
  await updateVisit(visitId, { prescriptions: updatedPrescriptions }, userId);
}
