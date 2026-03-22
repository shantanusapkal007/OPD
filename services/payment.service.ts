import {
  collection, doc, addDoc, getDocs, query, where, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updatePatientBalance } from "@/services/patient.service";
import type { Payment } from "@/lib/types";

const COL = "payments";

export async function getPayments(): Promise<Payment[]> {
  const snap = await getDocs(collection(db, COL));
  const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment));
  return results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export async function getPaymentsByPatient(patientId: string): Promise<Payment[]> {
  const q = query(collection(db, COL), where("patientId", "==", patientId));
  const snap = await getDocs(q);
  const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment));
  return results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export async function addPayment(data: Omit<Payment, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: Timestamp.now(),
  });
  
  // Credit the paid amount to the patient's Khata Ledger ONLY for confirmed payments
  if (data.status === "paid") {
    await updatePatientBalance(data.patientId, data.amount);
  }

  return ref.id;
}

export async function getTodayRevenue(): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const q = query(collection(db, COL), where("date", "==", today));
  const snap = await getDocs(q);
  return snap.docs.filter(d => d.data().status === "paid").reduce((sum, d) => sum + (d.data().amount || 0), 0);
}

export async function getPaymentStats(): Promise<{ total: number; count: number; pending: number }> {
  const all = await getPayments();
  const total = all.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pending = all.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  return { total, count: all.length, pending };
}
