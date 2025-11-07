import AuthGuard from "@/components/AuthGuard";
import ReportsClient from "@/components/ReportsClient";

export default function Page() {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <ReportsClient />
    </AuthGuard>
  );
}