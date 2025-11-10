# Quick Start - HIPAA Security Kit

## Installation

\\\ash
npm install @hipaa-security-kit/audit-chain
npm install @hipaa-security-kit/rls-templates
npm install @hipaa-security-kit/csp-strict
\\\

## Audit Chain Setup

1. Run the SQL migration in your Supabase project
2. Use in your app:

\\\	ypescript
import { AuditChain } from '@hipaa-security-kit/audit-chain';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);
const auditChain = new AuditChain({ supabase });

await auditChain.log({
  actorId: 'user-123',
  action: 'READ',
  resource: 'patient'
});
\\\

## Next Steps

- Check package READMEs for detailed docs
- See examples/ for working demos
