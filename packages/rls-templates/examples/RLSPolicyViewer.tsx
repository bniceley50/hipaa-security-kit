import { useState } from 'react';

export default function RLSPolicyViewer() {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  return (
    <div className="rls-viewer">
      <h2>Row Level Security Policies</h2>
      <p>View and test RLS policies for your Supabase tables</p>
    </div>
  );
}
