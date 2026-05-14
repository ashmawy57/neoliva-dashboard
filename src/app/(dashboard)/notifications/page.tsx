import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | SmileCare",
  description: "View and manage your system notifications",
};

export default function NotificationsPage() {
  return (
    <div className="container py-8">
      <NotificationCenter />
    </div>
  );
}
