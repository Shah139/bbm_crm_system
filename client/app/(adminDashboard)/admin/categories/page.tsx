
import CategoryManagementClient from "@/components/admin/CategoryManagementClient";

interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export default function Page() {
  return (
      <CategoryManagementClient />
  );
}

