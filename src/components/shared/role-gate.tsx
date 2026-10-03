import { getCurrentUser, type Role } from "@/lib/auth";

/** Renders children only for the given roles. UI convenience only: pages and actions also call requireRole. */
export async function RoleGate({ roles, children }: { roles: readonly Role[]; children: React.ReactNode }) {
  const user = await getCurrentUser();
  return user && roles.includes(user.role) ? <>{children}</> : null;
}
