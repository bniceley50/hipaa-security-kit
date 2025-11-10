import { AuditChain } from '@hipaa-security-kit/audit-chain';
import { supabase } from './supabase';

const auditChain = new AuditChain({ supabase });

export async function auditLog(entry: any) {
  await auditChain.log(entry);
}

export async function verifyAuditChain(userId?: string) {
  return await auditChain.verify(userId);
}

export async function getRecentAudits(limit = 100, userId?: string) {
  return await auditChain.getRecent(limit, userId);
}
