'use client'

interface SerializedWorkflowExecution {
  workflowId: string;
  runId: string;
  type: string;
  status: string;
  startTime: string;
  taskQueue: string;
}

export default function WorkflowList({
  initialWorkflows,
  total,
  filtered
}: {
  initialWorkflows: SerializedWorkflowExecution[],
  total: number,
  filtered: number
}) {
  if (total !== filtered) {
    console.warn(`Some workflows were filtered out due to invalid data: ${total - filtered} workflows removed`);
  }

  if (initialWorkflows.length === 0) {
    return (
      <div className="p-4 border rounded bg-gray-50">
        <p className="text-gray-600">No valid workflows found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filtered < total && (
        <div className="p-2 bg-yellow-100 text-yellow-800 rounded">
          Note: {total - filtered} workflows were hidden due to invalid data
        </div>
      )}
      {initialWorkflows.map((workflow) => (
        <div
          key={`${workflow.workflowId}-${workflow.runId}`}
          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold">{workflow.type}</h2>
          <p className="text-sm text-gray-600">
            ID: {workflow.workflowId}
          </p>
          <p className="text-sm text-gray-600">
            Run ID: {workflow.runId}
          </p>
          <p className="text-sm text-gray-600">
            Status: {workflow.status}
          </p>
          <p className="text-sm text-gray-600">
            Started: {new Date(workflow.startTime).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Queue: {workflow.taskQueue}
          </p>
        </div>
      ))}
    </div>
  );
}