import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TreatmentType } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-IN").format(value)}`;
}

export function getTreatmentType(caseNumber?: string, storedTreatmentType?: TreatmentType | null): TreatmentType {
  if (storedTreatmentType === "Homeopathic" || storedTreatmentType === "Allopathic") {
    return storedTreatmentType;
  }

  if (!caseNumber) return "Allopathic";
  const prefix = caseNumber.charAt(0).toUpperCase();
  return prefix === "H" ? "Homeopathic" : "Allopathic";
}
