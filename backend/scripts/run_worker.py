#!/usr/bin/env python3
import asyncio
import logging
from app.worker import Worker

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

async def main():
    try:
        worker = Worker()
        await worker.start()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt. Shutting down...")
    except Exception as e:
        logger.error(f"Error in worker: {str(e)}")
        raise
    finally:
        logger.info("Worker stopped")

if __name__ == "__main__":
    asyncio.run(main()) 