import asyncio
from dataclasses import dataclass
from datetime import timedelta

from temporalio import activity, workflow

from workflowpy.hello.base import BaseWorkflow


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
    sleep_time_s: float


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
    sleep_time_s: float
    sleep_quantity: int


@dataclass
class SleepExampleWorkflowOutput:
    total_sleep_time_s: float  # how long it should have slept for


@workflow.defn
class SleepExampleWorkflow(BaseWorkflow):
    def __init__(self):
        super().__init__()
        self._current_iteration = 0

    @workflow.query(name="CurrentIteration")
    def get_current_iteration(self) -> int:
        return self._current_iteration

    @workflow.query(name="CurrentDetails")
    def get_current_details(self) -> str:
        return workflow.get_current_details()

    @workflow.query(name="Foo")
    def get_foo_query(self) -> str:
        return "bar"

    @workflow.run
    async def run(self, input: SleepExampleWorkflowInput) -> SleepExampleWorkflowOutput:
        workflow.logger.info("starting workflow")
        for i in range(input.sleep_quantity):
            self._current_iteration = i + 1
            workflow.logger.info("Running iteration %s" % i)
            workflow.set_current_details(
                f"sleep number {i}, will sleep for {input.sleep_time_s} seconds"
            )
            self.append_log(
                f"sleep number {i}, will sleep for {input.sleep_time_s} seconds"
            )
            await workflow.execute_activity(
                sleep_activity,
                SleepActivityInput(
                    sleep_time_s=input.sleep_time_s,
                ),
                start_to_close_timeout=timedelta(seconds=1200),
            )
        return SleepExampleWorkflowOutput(
            total_sleep_time_s=input.sleep_time_s * input.sleep_quantity
        )
