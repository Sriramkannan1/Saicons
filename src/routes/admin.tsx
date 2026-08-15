import { createFileRoute, Outlet } from "@tanstack/react-router";

// This is just a pass-through route so all /admin routes are grouped under it.
// The actual layout is applied per-page so /admin/login can skip the sidebar.
export const Route = createFileRoute("/admin")({
  component: AdminLayoutGuard,
});

function AdminLayoutGuard() {
  return <Outlet />;
}
