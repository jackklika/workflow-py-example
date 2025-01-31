import { listWorkflows } from '../actions';
import ClientWorkflowList from '@/components/workflows/ClientWorkflowList';
import {temporal} from "@temporalio/proto";
import ListWorkflowExecutionsResponse = temporal.api.workflowservice.v1.ListWorkflowExecutionsResponse;

export default async function WorkflowsPage() {
  const workflows: ListWorkflowExecutionsResponse = await listWorkflows();

    return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Workflows</h1>
      <ClientWorkflowList initialWorkflows={workflows.executions} />
    </main>
  );
}