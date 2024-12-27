'use client'

import { useState } from 'react';
import { queryWorkflow } from '@/app/actions';

interface WorkflowExecution {
  execution: {
    workflowId: string;
    runId: string;
  };
  type: {
    name: string;
  };
  startTime: string;
  status: string;
}

export default function ClientWorkflowList({
  initialWorkflows
}: {
  initialWorkflows: WorkflowExecution[]
}) {
  const [workflows] = useState(initialWorkflows);

  const handleQuery = async (workflowId: string) => {
    try {
      const result = await queryWorkflow(workflowId, 'getCurrentState');
      console.log('Query result:', result);
    } catch (error) {
      console.error('Query failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      {workflows.map((workflow) => (
        <div
          key={workflow.execution.workflowId}
          className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold">{workflow.type.name}</h2>
          <p className="text-sm text-gray-600">
            ID: {workflow.execution.workflowId}
          </p>
          <p className="text-sm text-gray-600">
            Status: {workflow.status}
          </p>
          <p className="text-sm text-gray-600">
            Started: {new Date(workflow.startTime).toLocaleString()}
          </p>
          <button
            onClick={() => handleQuery(workflow.execution.workflowId)}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Query State
          </button>
        </div>
      ))}
    </div>
  );
}