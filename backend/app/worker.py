import asyncio
import signal
import sys
from typing import Set
import uuid
from datetime import datetime

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.redis_service import redis_service
from app.services.automation import get_automation_engine

class Worker:
    def __init__(self):
        self.running = True
        self.active_jobs: Set[str] = set()
        self.worker_id = str(uuid.uuid4())

    async def start(self):
        """Start the worker."""
        print(f"Starting worker {self.worker_id}")
        
        # Set up signal handlers
        for sig in (signal.SIGINT, signal.SIGTERM):
            signal.signal(sig, self.shutdown)
        
        try:
            # Main worker loop
            while self.running:
                await self.process_queues()
                await asyncio.sleep(1)  # Prevent tight loop
        finally:
            await self.cleanup()

    def shutdown(self, signum, frame):
        """Handle shutdown signals."""
        print(f"\nReceived signal {signum}. Shutting down...")
        self.running = False

    async def cleanup(self):
        """Clean up resources."""
        print("Cleaning up...")
        # Wait for active jobs to complete
        while self.active_jobs:
            print(f"Waiting for {len(self.active_jobs)} jobs to complete...")
            await asyncio.sleep(1)
        
        await redis_service.close()
        print("Cleanup complete")

    async def process_queues(self):
        """Process jobs from various queues."""
        try:
            # Process regular queue
            job = await redis_service.get_from_queue("automation_tasks")
            if job:
                await self.process_job(job)
            
            # Process delayed queue
            delayed_jobs = await redis_service.get_ready_delayed_jobs("automation_tasks")
            for job in delayed_jobs:
                await self.process_job(job)
        
        except Exception as e:
            print(f"Error processing queues: {str(e)}")

    async def process_job(self, job: dict):
        """Process a single job."""
        job_id = job.get("job_id", str(uuid.uuid4()))
        
        try:
            # Try to acquire lock for this job
            if not await redis_service.set_lock(
                f"job:{job_id}",
                self.worker_id,
                expiry_seconds=300  # 5 minutes
            ):
                print(f"Job {job_id} is already being processed")
                return
            
            self.active_jobs.add(job_id)
            print(f"Processing job {job_id}")
            
            # Get database session
            db = SessionLocal()
            try:
                # Get automation engine
                automation_engine = get_automation_engine(db)
                
                # Process job based on type
                job_type = job.get("type")
                if job_type == "execute_flow":
                    await automation_engine.execute_flow(
                        db=db,
                        flow_id=job["flow_id"],
                        trigger_data=job["trigger_data"]
                    )
                elif job_type == "process_message":
                    await automation_engine.process_message(
                        account_id=job["account_id"],
                        contact_id=job["contact_id"],
                        message_id=job["message_id"]
                    )
                else:
                    print(f"Unknown job type: {job_type}")
            
            finally:
                db.close()
            
            print(f"Completed job {job_id}")
        
        except Exception as e:
            print(f"Error processing job {job_id}: {str(e)}")
        
        finally:
            self.active_jobs.remove(job_id)
            await redis_service.release_lock(f"job:{job_id}", self.worker_id)

async def main():
    """Main entry point for the worker."""
    worker = Worker()
    await worker.start()

if __name__ == "__main__":
    asyncio.run(main()) 