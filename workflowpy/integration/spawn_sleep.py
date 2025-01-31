#!/usr/bin/env python3
import asyncio
import random
from datetime import timedelta
from typing import Final

from temporalio.client import Client
from ulid import ULID

from workflowpy.hello.hello import SleepExampleWorkflow, SleepExampleWorkflowInput

WORKFLOWS_TO_START: Final[int] = 5


async def main():
    client = await Client.connect("localhost:7233")

    task_queue = "default"

    for n in range(WORKFLOWS_TO_START):
        workflow_id: str = ULID().generate()
        r = random.Random()
        sleep_time_s: float = 6 + (n / 1.3) + r.randint(0, 3)
        sleep_quantity: int = 7 + n % 2 + r.randint(0, 3)
        _input = SleepExampleWorkflowInput(
            sleep_time_s=sleep_time_s, sleep_quantity=sleep_quantity
        )
        await client.start_workflow(
            SleepExampleWorkflow.run,
            _input,
            id=workflow_id,
            task_queue=task_queue,
            execution_timeout=timedelta(seconds=1200),
        )


if __name__ == "__main__":
    asyncio.run(main())
