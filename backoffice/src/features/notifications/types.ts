export interface NotificationDraft {
  title: string;
  body: string;
  target_audience: "all" | "specific_users";
  target_user_ids?: string; // Comma separated IDs for simplicity in UI
  action_url?: string;
}

export interface NotificationLog {
  id: number;
  title: string;
  sent_at: string;
  recipient_count: number;
  status: "sent" | "failed";
}
