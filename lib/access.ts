import type { UserRole } from "@/lib/types";

export function canAccessPath(role: UserRole | string | undefined, pathname: string) {
  if (pathname === "/login") return true;
  
  if (!role) return false;

  // Role-based route restrictions
  if (role === "receptionist") {
    const restrictedPaths = ["/khata", "/data", "/stats", "/settings"];
    if (restrictedPaths.some(p => pathname.startsWith(p))) {
      return false;
    }
  }

  return true;
}
