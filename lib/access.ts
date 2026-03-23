import type { UserRole } from "@/lib/types";

export function canAccessPath(role: UserRole | string | undefined, pathname: string) {
  if (pathname === "/login") return true;
  // If the user has any role (i.e. they are authenticated), they have full access in the single-user system
  if (role) return true;
  return false;
}
