import AuthGuard from "@/components/AuthGuard";
import MessageSettingsClient from "@/components/MessageSettingsClient";

export default function Page() {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <MessageSettingsClient />
    </AuthGuard>
  );
}