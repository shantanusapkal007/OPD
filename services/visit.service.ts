import {
  collection, doc, getDocs, query, where, Timestamp, runTransaction, increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { clearPatientCache } from "@/services/patient.service";
import type { Visit } from "@/lib/types";

const COL = "visits";

function stripUndefinedValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedValues(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, stripUndefinedValues(entryValue)])
    ) as T;
  }

  return value;
}

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
  const patientName = data.patientName?.trim();
  const complaints = data.complaints?.trim();
  const diagnosis = data.diagnosis?.trim();
  const totalBill = Number(data.totalBill || 0);
  const sanitizedData = stripUndefinedValues({
    ...data,
    patientName,
    complaints,
    diagnosis,
    totalBill,
  });

  if (!data.patientId || !patientName || !complaints || !diagnosis) {
    throw new Error("Patient, complaints, and diagnosis are required.");
  }

  if (!Number.isFinite(totalBill) || totalBill < 0) {
    throw new Error("Total bill must be a valid amount.");
  }

  const visitRef = doc(collection(db, COL));
  const patientRef = doc(db, "patients", data.patientId);

  await runTransaction(db, async (transaction) => {
    const patientSnap = await transaction.get(patientRef);
    if (!patientSnap.exists()) {
      throw new Error("Patient not found.");
    }

    transaction.set(visitRef, {
      ...sanitizedData,
      createdAt: Timestamp.now(),
    });

    if (totalBill > 0) {
      transaction.update(patientRef, {
        khataBalance: increment(-totalBill),
        updatedAt: Timestamp.now(),
      });
    }
  });

  clearPatientCache();
  return visitRef.id;
}

export async function getUpcomingFollowUps(): Promise<Visit[]> {
  const snap = await getDocs(collection(db, COL));
  const today = new Date().toISOString().split("T")[0];
  const results = snap.docs.map(d => ({ id: d.id, ...d.data() } as Visit));
  return results
    .filter(v => v.followUpDate && v.followUpDate >= today)
    .sort((a, b) => (a.followUpDate || "").localeCompare(b.followUpDate || ""));
}

export async function updateVisitImages(visitId: string, visitImages: string[]): Promise<void> {
  if (!visitId || !Array.isArray(visitImages)) return;
  const visitRef = doc(db, COL, visitId);
  await runTransaction(db, async (transaction) => {
    transaction.update(visitRef, { visitImages });
  });
}
