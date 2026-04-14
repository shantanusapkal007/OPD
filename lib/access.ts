import type { UserRole } from "@/lib/types";

export function canAccessPath(role: UserRole | string | undefined, pathname: string) {
  if (pathname === "/login") return true;
  
  if (!role) return false;

  if (pathname.startsWith("/stats")) {
    return role === "admin" || role === "doctor";
  }

  // Role-based route restrictions
  if (role === "receptionist") {
    const restrictedPaths = ["/khata", "/data", "/stats", "/settings", "/payments"];
    if (restrictedPaths.some(p => pathname.startsWith(p))) {
      return false;
    }
  }

  return true;
}

/** Can the user view clinical details (vitals, prescriptions, diagnosis)? */
export function canViewClinical(role: UserRole | string | undefined): boolean {
  if (!role) return false;
  return role !== "receptionist";
}

/** Can the user view financial data (khata, payments, billing amounts)? */
export function canViewFinancial(role: UserRole | string | undefined): boolean {
  if (!role) return false;
  return role !== "receptionist";
}
