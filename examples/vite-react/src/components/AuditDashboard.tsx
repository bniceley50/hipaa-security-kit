import { useState, useEffect } from 'react';
import { getRecentAudits, verifyAuditChain } from '../lib/audit';

export function AuditDashboard() {
  const [audits, setAudits] = useState<any[]>([]);
  const [verification, setVerification] = useState<any>(null);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    const data = await getRecentAudits(20);
    setAudits(data);
  };

  const handleVerify = async () => {
    const result = await verifyAuditChain();
    setVerification(result);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Audit Dashboard</h2>
      <button onClick={handleVerify}>Verify Chain</button>
      
      {verification && (
        <div>{verification.intact ? 'Chain Intact' : 'Chain Compromised'}</div>
      )}

      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Action</th>
            <th>Resource</th>
          </tr>
        </thead>
        <tbody>
          {audits.map((audit) => (
            <tr key={audit.id}>
              <td>{new Date(audit.timestamp).toLocaleString()}</td>
              <td>{audit.action}</td>
              <td>{audit.resource}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
