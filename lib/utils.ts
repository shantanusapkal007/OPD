import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-IN").format(value)}`;
}

export function getTreatmentType(caseNumber?: string): "Homeopathic" | "Allopathic" {
  if (!caseNumber) return "Allopathic";
  const prefix = caseNumber.charAt(0).toUpperCase();
  return prefix === "H" ? "Homeopathic" : "Allopathic";
}
