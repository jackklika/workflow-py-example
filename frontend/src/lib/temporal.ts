import { Connection, Client } from '@temporalio/client';

let _client: Client | null = null;

export async function getTemporalClient() {
  if (!_client) {
    const connection = await Connection.connect({
      address: process.env.NEXT_PUBLIC_TEMPORAL_ADDRESS || 'localhost:7233'
    });
    _client = new Client({ connection });
  }
  return _client;
}

export async function listWorkflows(pageSize = 10) {
  const client = await getTemporalClient();
  return client.workflowService.listWorkflowExecutions({
    namespace: 'default',
    pageSize
  });
}

export async function getWorkflowById(workflowId: string) {
  const client = await getTemporalClient();
  return client.workflow.getHandle(workflowId);
}

export async function startWorkflow(
  workflowType: string, 
  workflowId: string, 
  args: any[]
) {
  const client = await getTemporalClient();
  return client.workflow.start(workflowType, {
    taskQueue: 'default',
    workflowId,
    args
  });
}
