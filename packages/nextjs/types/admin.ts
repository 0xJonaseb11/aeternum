export interface AuditLogEntry {
  id: string;
  event_type: string;
  at: string;
  user_id: string | null;
  organization_id: string | null;
  file_hash: string | null;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "down";
  details: {
    supabase: "ok" | "error" | "unconfigured";
    stripe: "ok" | "error" | "unconfigured";
    arweave: "ok" | "error" | "unconfigured";
    ipfs: "ok" | "error" | "unconfigured";
    userCount?: number;
  };
}

export interface BroadcastMessage {
  id: string;
  content: string;
  type: "info" | "warning" | "error" | "success";
  active: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface AdminStats {
  totalProofs: number;
  totalOrgs: number;
  totalUsers: number;
  activeSubscriptions: number;
  mrr: number;
  irysBalance: string;
  pendingInvites: number;
  planDistribution: Record<string, number>;
  recentActivity: AuditLogEntry[];
}

export interface GlobalSettings {
  maintenance_mode: boolean;
  signup_enabled: boolean;
  max_file_size_mb: number;
  allowed_networks: string[];
  primary_storage?: "arweave" | "ipfs";
}

export interface SubscriptionInfo {
  id: string;
  status: string;
  plan: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface BlockedItem {
  address: string;
  reason: string | null;
  created_at: string;
}

export interface BroadcastItem {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "error" | "success";
  status: "draft" | "sent";
  created_at: string;
  sent_at: string | null;
}
