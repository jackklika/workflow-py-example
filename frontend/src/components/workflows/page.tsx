http://localhost:3000import { listWorkflows } from '@/lib/temporal';
import WorkflowList from '@/components/workflows/WorkflowList';

export default async function WorkflowsPage() {
  const workflows = await listWorkflows();
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Workflows</h1>
      <WorkflowList initialWorkflows={workflows.executions} />
    </main>
  );
}
