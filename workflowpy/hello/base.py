from dataclasses import dataclass, field

from temporalio import workflow


@dataclass(frozen=True)
class WorkflowLogEntry:
    message: str
    timestamp: float = field(
        default_factory=lambda: workflow.now().timestamp()
    )  # utc POSIX float timestamp
    level: int = 0


class BaseWorkflow:
    def __init__(self):
        self.log: list[WorkflowLogEntry] = []

    def append_log(self, message: str, level: int = 0):
        self.log.append(WorkflowLogEntry(message, level=level))

    @workflow.query(name="LogEntries")
    def get_log_entries(self) -> list[WorkflowLogEntry]:
        return self.log

    @workflow.query(name="LogStrings")
    def get_log_strings(self) -> list[str]:
        return [entry.message for entry in self.log]

    @workflow.query(name="MostRecentLogEntry")
    def get_most_recent_log_entry(self) -> WorkflowLogEntry | None:
        return self.log[-1] if self.log else None

    @workflow.query(name="MostRecentLogString")
    def get_most_recent_log_string(self) -> str | None:
        return self.log[-1].message if self.log else None
