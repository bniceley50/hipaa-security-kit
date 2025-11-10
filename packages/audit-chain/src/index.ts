/**
 * @hipaa-security-kit/audit-chain
 * Tamper-evident audit logging for Supabase applications
 * 
 * Provides cryptographically secure, HIPAA-compliant audit trails
 * using HMAC-SHA256 chain verification.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface AuditEntry {
  actorId: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'LOGIN' | 'CONSENT_GRANTED' | 'CONSENT_REVOKED' | string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
}

export interface VerificationResult {
  intact: boolean;
  verifiedEntries: number;
  brokenChain?: number;
  error?: string;
  timestamp: string;
}

export interface AuditChainConfig {
  supabase: SupabaseClient;
  tableName?: string;
  debug?: boolean;
}

export class AuditChain {
  private supabase: SupabaseClient;
  private tableName: string;
  private debug: boolean;

  constructor(config: AuditChainConfig) {
    this.supabase = config.supabase;
    this.tableName = config.tableName || 'audit_chain';
    this.debug = config.debug || false;
  }

  async log(entry: AuditEntry): Promise<void> {
    const { error } = await this.supabase.rpc('add_audit_entry', {
      p_actor_id: entry.actorId,
      p_action: entry.action,
      p_resource: entry.resource,
      p_resource_id: entry.resourceId || null,
      p_details: entry.details || {}
    });

    if (error) throw new Error(`Failed to add audit entry: ${error.message}`);
  }

  async verify(userId?: string): Promise<VerificationResult> {
    const { data, error } = await this.supabase.functions.invoke('audit-verify', {
      body: { user_id: userId }
    });

    if (error) throw new Error(`Failed to verify audit chain: ${error.message}`);

    return { ...data, timestamp: new Date().toISOString() };
  }

  async getRecent(limit: number = 100, userId?: string): Promise<any[]> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (userId) query = query.eq('actor_id', userId);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch audit entries: ${error.message}`);

    return data || [];
  }
}

export type { SupabaseClient } from '@supabase/supabase-js';
