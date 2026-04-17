import { supabase } from "@/lib/supabase";
import { getSupabaseErrorMessage } from "@/lib/supabase-errors";
import type { Appointment, AppointmentStatus } from "@/lib/types";

export async function getAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("appointment_date", { ascending: false })
    .order("time_slot", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Appointment[];
}

export async function getAppointmentsByDate(date: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("appointment_date", date)
    .order("time_slot", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Appointment[];
}

export async function getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", patientId)
    .order("appointment_date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Appointment[];
}

export async function addAppointment(
  data: Omit<Appointment, "id" | "created_at">
): Promise<Appointment> {
  const appointment_date = data.appointment_date?.trim();
  const time_slot = data.time_slot?.trim();
  const patient_name = data.patient_name?.trim();

  if (!data.patient_id || !patient_name || !appointment_date || !time_slot || !data.type?.trim()) {
    throw new Error("Please complete all required appointment fields.");
  }

  // Check for duplicate
  const { data: existing } = await supabase
    .from("appointments")
    .select("id")
    .eq("patient_id", data.patient_id)
    .eq("appointment_date", appointment_date)
    .eq("time_slot", time_slot)
    .limit(1);

  if (existing && existing.length > 0) {
    throw new Error("This patient already has an appointment for the selected date and time.");
  }

  const { data: inserted, error } = await supabase
    .from("appointments")
    .insert({ ...data, patient_name, appointment_date, time_slot })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to book appointment.", {
        "23505": "This patient already has an appointment for the selected date and time.",
      })
    );
  }

  return inserted as Appointment;
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<Appointment> {
  if (!id) throw new Error("Appointment not found.");
  const { data, error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as Appointment;
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getTodayAppointmentCount(): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const { count, error } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("appointment_date", today);

  if (error) throw new Error(error.message);
  return count ?? 0;
}
