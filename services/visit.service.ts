import {
  collection, doc, addDoc, getDocs, query, where, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updatePatientBalance } from "@/services/patient.service";
import type { Visit } from "@/lib/types";

const COL = "visits";

export async function getVisits(): Promise<Visit[]> {
  const snap = await getDocs(collection(db, COL));
  const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as Visit));
  return results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export async function getVisitsByPatient(patientId: string): Promise<Visit[]> {
  const q = query(collection(db, COL), where("patientId", "==", patientId));
  const snap = await getDocs(q);
  const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as Visit));
  return results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

export async function addVisit(data: Omit<Visit, "id" | "createdAt">): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: Timestamp.now(),
  });
  
  // Deduct the standard bill charge from the patient's Khata (Ledger)
  if (data.totalBill) {
    await updatePatientBalance(data.patientId, -data.totalBill);
  }
  
  return ref.id;
}

export async function getUpcomingFollowUps(): Promise<Visit[]> {
  const snap = await getDocs(collection(db, COL));
  const today = new Date().toISOString().split("T")[0];
  const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as Visit));
  return results
    .filter(v => v.followUpDate && v.followUpDate >= today)
    .sort((a, b) => (a.followUpDate || "").localeCompare(b.followUpDate || ""));
}
