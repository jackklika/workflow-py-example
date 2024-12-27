#!/bin/bash
set -e  # Exit on error

# Function to check if Temporal server is ready
check_temporal() {
    temporal operator cluster health 2>/dev/null | grep -q "SERVING"
    return $?
}

# Function to check if worker is running (using ps)
check_worker() {
    ps aux | grep "[p]ython.*worker.py" > /dev/null
    return $?
}

# Start Temporal server if needed
if check_temporal; then
    echo "Temporal server is already running, using existing instance"
    TEMPORAL_PID=""
else
    echo "Starting new Temporal server..."
    temporal server start-dev &
    TEMPORAL_PID=$!

    # Wait for Temporal server to be ready
    echo "Waiting for Temporal server to be ready..."
    MAX_RETRIES=30
    RETRY_COUNT=0
    while ! check_temporal; do
        if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
            echo "Temporal server failed to start after $MAX_RETRIES attempts"
            [ ! -z "$TEMPORAL_PID" ] && kill $TEMPORAL_PID
            exit 1
        fi
        sleep 1
        ((RETRY_COUNT++))
        echo "Waiting... (attempt $RETRY_COUNT of $MAX_RETRIES)"
    done

    echo "Temporal server is ready!"
fi

# Start worker if not already running
if check_worker; then
    echo "Worker is already running, using existing instance"
    WORKER_PID=""
else
    echo "Starting new worker..."
    uv run python -m workflowpy.integration.worker &
    WORKER_PID=$!

    # Wait for worker to be ready
    echo "Waiting for worker to be ready..."
    sleep 2  # Give worker time to start
fi

# Run the workflow
echo "Running workflow..."
uv run python -m workflowpy.integration.spawn_sleep

# Cleanup function
cleanup() {
    echo "Cleaning up..."
    # Kill worker if we started it
    if [ ! -z "$WORKER_PID" ]; then
        kill $WORKER_PID 2>/dev/null || true
        wait $WORKER_PID 2>/dev/null || true
    fi
    # Kill temporal if we started it
    if [ ! -z "$TEMPORAL_PID" ]; then
        kill $TEMPORAL_PID 2>/dev/null || true
        wait $TEMPORAL_PID 2>/dev/null || true
    fi
}

# Register cleanup
trap cleanup EXIT

# Keep script running
if [ ! -z "$TEMPORAL_PID" ] || [ ! -z "$WORKER_PID" ]; then
    echo "Services running. Press Ctrl+C to stop..."
    wait $TEMPORAL_PID $WORKER_PID
fi