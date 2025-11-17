import OfficeShowroomActivityClient from '@/components/officeAdmin/OfficeShowroomActivityClient';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default async function ShowroomActivityPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }

  try {
    const res = await fetch(`${baseUrl}/api/user/analytics/showroom-summary`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    const data = res.ok ? await res.json() : { items: [] };
    const items: any[] = Array.isArray(data.items) ? data.items : [];

    const activityData = items.map((it, idx) => {
      const showroomName = it.showroom || it.showroomName || 'Showroom';
      // Prefer raw totalEntries so admin/showroom matches admin total customers (option A)
      const visitorCount = Number(it.totalEntries || it.uniqueCustomers || it.visitorsToday || 0);
      const accuracy = Number(it.accuracy || 0);
      const performance = Number(it.performance || 0);
      const lastActivity = it.lastActivity ? String(it.lastActivity) : new Date().toISOString();
      const status: 'Active' | 'Inactive' = it.status === 'Active' ? 'Active' : 'Inactive';

      return {
        id: idx + 1,
        showroomName,
        visitorCount,
        accuracy,
        performance,
        date: lastActivity,
        status,
        customers: [],
      };
    });

    return <OfficeShowroomActivityClient initialActivityData={activityData} />;
  } catch {
    return <OfficeShowroomActivityClient initialActivityData={[]} />;
  }
}

