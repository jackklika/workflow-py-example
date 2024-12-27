'use client'

import { useState } from 'react';
import { getWorkflowById } from '@/lib/temporal';

export function WorkflowControls({ workflowId }: { workflowId: string }) {
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);

  const handleQuery = async () => {
    setIsQuerying(true);
    try {
      const handle = await getWorkflowById(workflowId);
      const result = await handle.query('getCurrentState');
      setQueryResult(result);
    } catch (error) {
      console.error('Query failed:', error);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleQuery}
        disabled={isQuerying}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isQuerying ? 'Querying...' : 'Query State'}
      </button>
      
      {queryResult && (
        <pre className="mt-2 p-2 bg-gray-100 rounded">
          {JSON.stringify(queryResult, null, 2)}
        </pre>
      )}
    </div>
  );
}
