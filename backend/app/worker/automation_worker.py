import asyncio
import json
import logging
from typing import Dict, Any
from app.services.redis_service import redis_service
from app.services.automation import AutomationService
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)

class AutomationWorker:
    def __init__(self):
        self.automation_service = AutomationService()
        self.queue_name = "automation_tasks"
        self.running = False

    async def process_task(self, task_data: Dict[str, Any]):
        """Process a single automation task."""
        try:
            db = SessionLocal()
            flow_id = task_data.get("flow_id")
            trigger_data = task_data.get("trigger_data", {})
            
            if not flow_id:
                logger.error("Invalid task data: missing flow_id")
                return

            await self.automation_service.execute_flow(
                db=db,
                flow_id=flow_id,
                trigger_data=trigger_data
            )
        except Exception as e:
            logger.error(f"Error processing task: {str(e)}")
        finally:
            db.close()

    async def start(self):
        """Start the worker process."""
        self.running = True
        logger.info("Starting automation worker...")
        
        while self.running:
            try:
                # Get task from queue
                task = await redis_service.get_from_queue(self.queue_name)
                
                if task:
                    logger.info(f"Processing task: {task}")
                    await self.process_task(task)
                else:
                    # If no task, wait a bit before checking again
                    await asyncio.sleep(1)
                    
            except Exception as e:
                logger.error(f"Error in worker loop: {str(e)}")
                await asyncio.sleep(5)  # Wait longer on error

    def stop(self):
        """Stop the worker process."""
        self.running = False
        logger.info("Stopping automation worker...")

async def run_worker():
    """Run the automation worker."""
    worker = AutomationWorker()
    await worker.start()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run_worker()) 