import type { Activity } from "@/types";
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
export function learningActivity(activity: Activity[]) {
  const learned = new Set(activity.map((a) => dateKey(new Date(a.date))));
  const today = new Date();
  let streak = 0;
  const cursor = new Date(today);
  if (!learned.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (learned.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - 6 + i);
    return {
      day: date.toLocaleDateString("en", { weekday: "short" }),
      completed: activity.filter(
        (a) => dateKey(new Date(a.date)) === dateKey(date),
      ).length,
    };
  });
  return {
    streak,
    week,
    totalThisWeek: week.reduce((sum, d) => sum + d.completed, 0),
  };
}
