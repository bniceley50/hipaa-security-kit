/**
 * @hipaa-security-kit/rls-templates
 * Row-Level Security policy templates for Supabase
 */

export const RLS_POLICIES = {
  OWNER_ONLY: `
CREATE POLICY "Users can only access their own data"
ON {table_name}
FOR ALL
USING (auth.uid() = user_id);
  `,
  
  RBAC: `
CREATE POLICY "Role-based access control"
ON {table_name}
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = ANY('{allowed_roles}')
  )
);
  `,
  
  CONSENT_BASED: `
CREATE POLICY "Consent-based access"
ON {table_name}
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM consents
    WHERE consents.patient_id = {table_name}.patient_id
    AND consents.provider_id = auth.uid()
    AND consents.status = 'active'
    AND consents.expires_at > NOW()
  )
);
  `
};

export function generatePolicy(
  tableName: string,
  policyType: keyof typeof RLS_POLICIES,
  options?: Record<string, any>
): string {
  let policy = RLS_POLICIES[policyType];
  policy = policy.replace(/\{table_name\}/g, tableName);
  
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      policy = policy.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    });
  }
  
  return policy;
}
