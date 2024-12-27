'use client'

import { useState } from 'react';
import { WorkflowControls } from './WorkflowControls';

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

export default function WorkflowList({ 
  initialWorkflows 
}: { 
  initialWorkflows: WorkflowExecution[] 
}) {
  const [workflows, setWorkflows] = useState(initialWorkflows);

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
          <WorkflowControls workflowId={workflow.execution.workflowId} />
        </div>
      ))}
    </div>
  );
}
