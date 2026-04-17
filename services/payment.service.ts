import { supabase } from "@/lib/supabase";
import { getSupabaseErrorMessage } from "@/lib/supabase-errors";
import { clearPatientCache } from "@/services/patient.service";
import type { Payment } from "@/lib/types";

export async function getPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Payment[];
}

export async function getPaymentsByPatient(patientId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Payment[];
}

export async function addPayment(data: Omit<Payment, "id" | "created_at">): Promise<Payment> {
  const amount = Number(data.amount);
  const patient_name = data.patient_name?.trim();
  const date = data.date?.trim();

  if (!data.patient_id || !patient_name || !date || !Number.isFinite(amount) || amount <= 0) {
    throw new Error("Please enter a valid payment.");
  }

  const { data: inserted, error } = await supabase
    .from("payments")
    .insert({ ...data, amount, patient_name, date })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Failed to record payment.", {
        "23503": "Patient not found.",
      })
    );
  }

  // Update Khata balance if paid
  if (data.status === "paid") {
    const { error: balanceError } = await supabase.rpc("update_khata_balance", {
      p_id: data.patient_id,
      p_amount: amount,
    });

    if (balanceError) {
      throw new Error("Payment was saved, but khata balance could not be updated.");
    }
  }

  clearPatientCache();
  return inserted as Payment;
}

export async function getTodayRevenue(): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("payments")
    .select("amount")
    .eq("date", today)
    .eq("status", "paid");

  if (error) throw new Error(error.message);
  return (data ?? []).reduce((sum, p) => sum + (p.amount || 0), 0);
}

export async function getPaymentStats(): Promise<{ total: number; count: number; pending: number }> {
  const all = await getPayments();
  const total = all.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pending = all.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  return { total, count: all.length, pending };
}
