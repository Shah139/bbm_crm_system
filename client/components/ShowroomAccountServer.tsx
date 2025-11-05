import React from "react";
import ShowroomAccountClient, { CustomerEntry } from "@/components/ShowroomAccountClient";

function generateTodayEntries(): CustomerEntry[] {
  const interests = [
    'OIL & GRINDING MACHINERIES',
    'PRINTING MACHINERIES',
    'PACKAGING MACHINERIES',
    'RESTAURANT MACHINERIES',
    'BAKERY MACHINERIES',
    'FOOD PROCESSING MACHINERIES',
    'ANIMAL FEED MACHINERIES',
    'BUFFET EQUIPMENT',
    'OTHER MACHINERIES',
  ];
  const statuses: CustomerEntry["feedbackStatus"][] = ['Received', 'Pending', 'No Feedback'];
  const entries: CustomerEntry[] = [];
  for (let i = 1; i <= 12; i++) {
    const hour = String(Math.floor(Math.random() * 18) + 6).padStart(2, '0');
    const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    entries.push({
      id: i,
      name: `Customer ${i}`,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      interest: interests[Math.floor(Math.random() * interests.length)],
      visitDate: `${hour}:${minute}`,
      feedbackStatus: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }
  return entries;
}

export default async function ShowroomAccountServer() {
  const todayEntries = generateTodayEntries();
  return <ShowroomAccountClient initialTodayEntries={todayEntries} />;
}
