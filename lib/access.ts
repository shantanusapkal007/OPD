import type { UserRole } from "@/lib/types";

const AUTHENTICATED_ROUTE_PREFIXES = [
  "/",
  "/patients",
  "/appointments",
  "/payments",
  "/khata",
];

const DOCTOR_ROUTE_PREFIXES = ["/visits", "/data"];
const ADMIN_ROUTE_PREFIXES = ["/settings"];

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || (prefix !== "/" && pathname.startsWith(prefix));
}

export function canAccessPath(role: UserRole | undefined, pathname: string) {
  if (pathname === "/login") return true;
  if (!role) return false;

  if (AUTHENTICATED_ROUTE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) {
    return true;
  }

  if (DOCTOR_ROUTE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) {
    return role === "doctor" || role === "admin";
  }

  if (ADMIN_ROUTE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) {
    return role === "admin";
  }

  return role === "admin";
}
