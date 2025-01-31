import uuid

import pytest

from temporalio.testing import WorkflowEnvironment
from temporalio.worker import Worker

from workflowpy.hello.hello import (
    GreetingWorkflow,
    compose_greeting,
    sleep_activity,
    SleepExampleWorkflow,
    SleepExampleWorkflowInput,
)


class TestGreetingWorkflow:
    @pytest.mark.asyncio
    async def test_basic(self):
        task_queue_name = str(uuid.uuid4())
        async with await WorkflowEnvironment.start_time_skipping() as env:
            async with Worker(
                env.client,
                task_queue=task_queue_name,
                workflows=[GreetingWorkflow],
                activities=[compose_greeting],
            ):
                workflow_id: str = str(uuid.uuid4())
                assert "Hello, myname!" == await env.client.execute_workflow(
                    GreetingWorkflow.run,
                    "myname",
                    id=workflow_id,
                    task_queue=task_queue_name,
                )
                handle = env.client.get_workflow_handle(workflow_id)
                history = await handle.fetch_history()
                assert history


class TestSleepExampleWorkflow:
    @pytest.mark.asyncio
    async def test_basic(self):
        task_queue_name = str(uuid.uuid4())
        async with await WorkflowEnvironment.start_time_skipping() as env:
            async with Worker(
                env.client,
                task_queue=task_queue_name,
                workflows=[SleepExampleWorkflow],
                activities=[sleep_activity],
            ):
                workflow_id: str = str(uuid.uuid4())
                _input = SleepExampleWorkflowInput(sleep_time_s=1, sleep_quantity=5)
                handle = await env.client.start_workflow(
                    SleepExampleWorkflow.run,
                    _input,
                    id=workflow_id,
                    task_queue=task_queue_name,
                )

                assert 1 == await handle.query("CurrentIteration")
                await env.sleep(_input.sleep_time_s + 0.1)
                assert 2 == await handle.query(
                    SleepExampleWorkflow.get_current_iteration
                )
                result = await handle.result()
                assert result

                describe = await handle.describe()
                start_time = describe.start_time
                close_time = describe.close_time
                execution_duration = close_time - start_time
                assert 5 <= execution_duration.total_seconds() < 6
