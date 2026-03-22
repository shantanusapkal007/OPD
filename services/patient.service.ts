import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, orderBy, where, Timestamp, limit, increment
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Patient } from "@/lib/types";

const COL = "patients";

export async function getPatients(): Promise<Patient[]> {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Patient));
}

export async function getPatient(id: string): Promise<Patient | null> {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Patient) : null;
}

export async function searchPatients(term: string): Promise<Patient[]> {
  // Firestore does not support full-text search natively.
  // We fetch all patients and filter client-side for simplicity.
  // For production at scale, use Algolia / Typesense / Meilisearch.
  const all = await getPatients();
  const lower = term.toLowerCase();
  return all.filter(
    p =>
      p.fullName.toLowerCase().includes(lower) ||
      p.mobileNumber.includes(term) ||
      p.caseNumber.toLowerCase().includes(lower)
  );
}

export async function addPatient(data: Omit<Patient, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: Timestamp.now() });
}

export async function deletePatient(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export async function getPatientCount(): Promise<number> {
  const snap = await getDocs(collection(db, COL));
  return snap.size;
}

export async function updatePatientBalance(id: string, amount: number): Promise<void> {
  // Uses atomic increment to avoid write race conditions
  await updateDoc(doc(db, COL, id), { khataBalance: increment(amount) });
}

export async function getKhataPatients(): Promise<Patient[]> {
  const all = await getPatients();
  // Negative balance means they owe money. 
  // Positive means they paid advance.
  return all.filter(p => (p.khataBalance ?? 0) !== 0).sort((a,b) => (a.khataBalance || 0) - (b.khataBalance || 0));
}
