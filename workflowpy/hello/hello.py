import asyncio
from dataclasses import dataclass
from datetime import timedelta

from temporalio import activity, workflow


@dataclass
class ComposeGreetingInput:
    greeting: str
    name: str


@activity.defn
async def compose_greeting(input: ComposeGreetingInput) -> str:
    activity.logger.info("Running activity with parameter %s" % input)
    return f"{input.greeting}, {input.name}!"


@dataclass
class SleepActivityInput:
    sleep_time_s: int


@activity.defn
async def sleep_activity(input: SleepActivityInput) -> None:
    activity.logger.info(
        "Running sleep activity, sleeping for %s seconds" % input.sleep_time_s
    )
    await asyncio.sleep(input.sleep_time_s)


@workflow.defn
class GreetingWorkflow:
    @workflow.run
    async def run(self, name: str) -> str:
        workflow.logger.info("Running workflow with parameter %s" % name)
        workflow.set_current_details("test")
        return await workflow.execute_activity(
            compose_greeting,
            ComposeGreetingInput("Hello", name),
            start_to_close_timeout=timedelta(seconds=10),
        )


@dataclass
class SleepExampleWorkflowInput:
    sleep_time_s: int
    sleep_quantity: int


@dataclass
class SleepExampleWorkflowOutput:
    total_sleep_time_s: int  # how long it should have slept for


@workflow.defn
class SleepExampleWorkflow:
    def __init__(self):
        self._current_iteration = 0

    @workflow.query(name="current_iteration")
    def get_current_iteration(self) -> int:
        return self._current_iteration

    @workflow.run
    async def run(self, input: SleepExampleWorkflowInput) -> SleepExampleWorkflowOutput:
        workflow.logger.info("starting workflow")
        for i in range(input.sleep_quantity):
            self._current_iteration = i + 1
            workflow.logger.info("Running iteration %s" % i)
            workflow.set_current_details(
                f"sleep number {i}, will sleep for {input.sleep_time_s} seconds"
            )
            await workflow.execute_activity(
                sleep_activity,
                input,
                start_to_close_timeout=timedelta(seconds=10),
            )
        return SleepExampleWorkflowOutput(
            total_sleep_time_s=input.sleep_time_s * input.sleep_quantity
        )
