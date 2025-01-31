'use server'
import { Connection, Client } from '@temporalio/client';
import { temporal } from "@temporalio/proto";
import ListWorkflowExecutionsResponse = temporal.api.workflowservice.v1.ListWorkflowExecutionsResponse;

interface SerializedWorkflowExecution {
  workflowId: string;
  runId: string;
  type: string;
  status: string;
  startTime: string;
  taskQueue: string;
}

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

async function getWorkflowExecutions(): Promise<ListWorkflowExecutionsResponse> {
  const client = await getTemporalClient();
  return await client.workflowService.listWorkflowExecutions({
    namespace: 'default',
    pageSize: 10
  });

}

export async function listWorkflows() {
  const executionsResp: ListWorkflowExecutionsResponse = await getWorkflowExecutions();

  // Filter out and serialize only valid executions
  const serializedExecutions = executionsResp.executions
    .filter(workflow =>
      workflow.execution?.workflowId &&
      workflow.execution?.runId &&
      workflow.type?.name
    )
    .map(workflow => {
      const startTimeMs = workflow.startTime
        ? Number(workflow.startTime.seconds) * 1000 + Number(workflow.startTime.nanos) / 1000000
        : Date.now();

      return {
        workflowId: workflow.execution!.workflowId!,
        runId: workflow.execution!.runId!,
        type: workflow.type!.name!,
        status: workflow.status || 'UNKNOWN',
        startTime: new Date(startTimeMs).toISOString(),
        taskQueue: workflow.taskQueue || 'default'
      };
    });

  return {
    executions: serializedExecutions,
    total: response.executions.length,
    filtered: serializedExecutions.length
  };
}

export async function queryWorkflow(workflowId: string, queryType: string) {
  const client = await getTemporalClient();
  try {
    const handle = client.workflow.getHandle(workflowId);
    const result = await handle.query(queryType);
    return {
      success: true,
      result: result
    };
  } catch (error) {
    console.error('Query failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function startWorkflow(workflowType: string, workflowId: string, args: any[]) {
  const client = await getTemporalClient();
  try {
    const handle = await client.workflow.start(workflowType, {
      taskQueue: 'default',
      workflowId,
      args
    });
    return {
      success: true,
      workflowId: handle.workflowId,
      runId: handle.runId
    };
  } catch (error) {
    console.error('Start workflow failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}