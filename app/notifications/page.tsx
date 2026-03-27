import { NotificationsScreen } from "@/components/notifications/notifications-screen";
import { getNotificationsScreenData } from "@/lib/supabase/workspace";

export default async function NotificationsPage() {
  const data = await getNotificationsScreenData();

  return <NotificationsScreen data={data} />;
}
