export interface AuditChainRecord {
  id: number;
  timestamp: string;
  actor_id: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  details: Record<string, any>;
  prev_hash: string | null;
  hash: string;
  created_at: string;
}

export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'CONSENT_GRANTED'
  | 'CONSENT_REVOKED'
  | 'ACCESS_DENIED';

export type AuditResource =
  | 'patient'
  | 'session'
  | 'note'
  | 'medication'
  | 'diagnosis'
  | 'consent'
  | 'user'
  | 'report'
  | string;
