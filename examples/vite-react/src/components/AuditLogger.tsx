import { useState } from 'react';
import { auditLog } from '../lib/audit';
import { supabase } from '../lib/supabase';

export function AuditLogger() {
  const [action, setAction] = useState('CREATE');
  const [resource, setResource] = useState('patient');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) return;

    await auditLog({
      actorId: user.id,
      action,
      resource
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={action} onChange={(e) => setAction(e.target.value)}>
        <option value="CREATE">CREATE</option>
        <option value="READ">READ</option>
        <option value="UPDATE">UPDATE</option>
        <option value="DELETE">DELETE</option>
      </select>
      
      <input value={resource} onChange={(e) => setResource(e.target.value)} />
      <button type="submit">Log Entry</button>
    </form>
  );
}
