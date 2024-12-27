# workflowpy/integration/worker.py
import asyncio
import logging
import signal
from temporalio.client import Client
from temporalio.worker import Worker
from workflowpy.hello.hello import SleepExampleWorkflow, sleep_activity

logger = logging.getLogger(__name__)

async def run_worker():
    # Setup shutdown event
    shutdown = asyncio.Event()

    def handle_signal(sig, frame):
        logger.info("Shutdown signal received...")
        shutdown.set()

    # Register signal handlers
    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    # Start worker
    client = await Client.connect("localhost:7233")
    worker = Worker(
        client,
        task_queue="default",
        workflows=[SleepExampleWorkflow],
        activities=[sleep_activity],
    )

    logger.info("Starting worker...")
    await worker.run()

    try:
        # Keep worker running until shutdown
        await shutdown.wait()
    finally:
        logger.info("Shutting down worker...")
        await worker.shutdown()

def start_worker():
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run_worker())

if __name__ == "__main__":
    start_worker()