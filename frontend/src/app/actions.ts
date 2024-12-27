// src/app/actions.ts
'use server'

import { Connection, Client } from '@temporalio/client';

let _client: Client | null = null;

async function getTemporalClient() {
  if (!_client) {
    const connection = await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233'
    });
    _client = new Client({ connection });
  }
  return _client;
}

export async function listWorkflows() {
  const client = await getTemporalClient();
  return client.workflowService.listWorkflowExecutions({
    namespace: 'default',
    pageSize: 10
  });
}

export async function startWorkflow(workflowType: string, workflowId: string, args: any[]) {
  const client = await getTemporalClient();
  return client.workflow.start(workflowType, {
    taskQueue: 'default',
    workflowId,
    args
  });
}

export async function queryWorkflow(workflowId: string, queryType: string) {
  const client = await getTemporalClient();
  const handle = client.workflow.getHandle(workflowId);
  return handle.query(queryType);
}