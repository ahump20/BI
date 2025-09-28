"""
WebSocket Bridge for Blaze Intelligence Unreal MCP Integration
Bridges web client WebSocket connections to Unreal Engine MCP server
"""

import asyncio
import json
import websockets
from typing import Dict, Set
import logging
from datetime import datetime
from blaze_config import BlazeConfig

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('BlazeWebSocketBridge')

class WebSocketBridge:
    """Bridges WebSocket connections from web clients to Unreal MCP"""

    def __init__(self):
        self.clients: Set[websockets.WebSocketServerProtocol] = set()
        self.unreal_connection = None
        self.render_queue = asyncio.Queue()
        self.active_jobs: Dict[str, dict] = {}
        self.config = BlazeConfig()

    async def register_client(self, websocket):
        """Register a new web client connection"""
        self.clients.add(websocket)
        logger.info(f"Client connected. Total clients: {len(self.clients)}")

        # Send connection status
        await self.send_to_client(websocket, {
            "type": "connection",
            "status": "connected",
            "serverVersion": "2.0.0",
            "features": ["render", "preview", "live-data", "monte-carlo"]
        })

    async def unregister_client(self, websocket):
        """Unregister a disconnected client"""
        self.clients.discard(websocket)
        logger.info(f"Client disconnected. Total clients: {len(self.clients)}")

    async def send_to_client(self, websocket, data):
        """Send data to a specific client"""
        try:
            await websocket.send(json.dumps(data))
        except Exception as e:
            logger.error(f"Error sending to client: {e}")

    async def broadcast_to_clients(self, data):
        """Broadcast data to all connected clients"""
        if self.clients:
            await asyncio.gather(
                *[self.send_to_client(client, data) for client in self.clients],
                return_exceptions=True
            )

    async def handle_client_message(self, websocket, message):
        """Process message from web client"""
        try:
            data = json.loads(message)
            message_type = data.get('type')

            if message_type == 'render':
                await self.handle_render_request(websocket, data)
            elif message_type == 'preview':
                await self.handle_preview_request(websocket, data)
            elif message_type == 'status':
                await self.handle_status_request(websocket, data)
            elif message_type == 'cancel':
                await self.handle_cancel_request(websocket, data)
            elif message_type == 'live-data':
                await self.handle_live_data_request(websocket, data)
            else:
                await self.send_to_client(websocket, {
                    "type": "error",
                    "message": f"Unknown message type: {message_type}"
                })

        except json.JSONDecodeError:
            await self.send_to_client(websocket, {
                "type": "error",
                "message": "Invalid JSON format"
            })
        except Exception as e:
            logger.error(f"Error handling client message: {e}")
            await self.send_to_client(websocket, {
                "type": "error",
                "message": str(e)
            })

    async def handle_render_request(self, websocket, data):
        """Process render request from web client"""
        job_id = f"blaze_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{len(self.active_jobs)}"

        render_spec = {
            "id": job_id,
            "type": data.get('renderType', 'title-card'),
            "team": data.get('team', 'cardinals'),
            "quality": data.get('quality', 'production'),
            "resolution": data.get('resolution', '3840x2160'),
            "requestTime": datetime.now().isoformat()
        }

        # Add sports-specific parameters
        if render_spec['type'] == 'championship-stadium':
            render_spec['stadium'] = data.get('stadium', 'busch_stadium')
            render_spec['weather'] = data.get('weather', 'clear')
            render_spec['timeOfDay'] = data.get('timeOfDay', 'night')
            render_spec['crowdDensity'] = data.get('crowdDensity', 0.85)
        elif render_spec['type'] == 'player-spotlight':
            render_spec['playerName'] = data.get('playerName', 'Player')
            render_spec['stats'] = data.get('stats', {})
            render_spec['action'] = data.get('action', 'hero_pose')
        elif render_spec['type'] == 'monte-carlo':
            render_spec['simulations'] = data.get('simulations', 10000)
            render_spec['scenario'] = data.get('scenario', 'playoff_odds')
            render_spec['teams'] = data.get('teams', ['Cardinals', 'Yankees'])

        # Store job
        self.active_jobs[job_id] = {
            "spec": render_spec,
            "status": "queued",
            "progress": 0,
            "client": websocket
        }

        # Send confirmation to client
        await self.send_to_client(websocket, {
            "type": "render_queued",
            "jobId": job_id,
            "spec": render_spec,
            "queuePosition": len(self.active_jobs)
        })

        # Add to render queue
        await self.render_queue.put(render_spec)

        # Process the render (would connect to actual Unreal Engine here)
        asyncio.create_task(self.process_render_job(job_id))

    async def handle_preview_request(self, websocket, data):
        """Generate quick preview render"""
        # Use lower quality settings for quick preview
        preview_data = data.copy()
        preview_data['quality'] = 'preview'
        preview_data['resolution'] = '1920x1080'
        await self.handle_render_request(websocket, preview_data)

    async def handle_status_request(self, websocket, data):
        """Check render job status"""
        job_id = data.get('jobId')
        if job_id in self.active_jobs:
            job = self.active_jobs[job_id]
            await self.send_to_client(websocket, {
                "type": "status",
                "jobId": job_id,
                "status": job['status'],
                "progress": job['progress']
            })
        else:
            await self.send_to_client(websocket, {
                "type": "error",
                "message": f"Job {job_id} not found"
            })

    async def handle_cancel_request(self, websocket, data):
        """Cancel a render job"""
        job_id = data.get('jobId')
        if job_id in self.active_jobs:
            self.active_jobs[job_id]['status'] = 'cancelled'
            await self.send_to_client(websocket, {
                "type": "cancelled",
                "jobId": job_id
            })
        else:
            await self.send_to_client(websocket, {
                "type": "error",
                "message": f"Job {job_id} not found"
            })

    async def handle_live_data_request(self, websocket, data):
        """Stream live sports data to Unreal for dynamic rendering"""
        data_type = data.get('dataType', 'scores')
        teams = data.get('teams', self.config.SUPPORTED_TEAMS)

        # This would fetch real data from championship-dashboard-integration.js
        live_data = {
            "type": "live_data",
            "dataType": data_type,
            "timestamp": datetime.now().isoformat(),
            "data": {
                "Cardinals": {"score": 7, "hits": 12, "errors": 1},
                "Yankees": {"score": 4, "hits": 8, "errors": 0}
            }
        }

        await self.send_to_client(websocket, live_data)

    async def process_render_job(self, job_id):
        """Simulate render processing (replace with actual Unreal MCP calls)"""
        if job_id not in self.active_jobs:
            return

        job = self.active_jobs[job_id]
        client = job['client']

        # Update status to processing
        job['status'] = 'processing'
        await self.send_to_client(client, {
            "type": "render_started",
            "jobId": job_id
        })

        # Simulate progress updates
        for progress in range(0, 101, 10):
            if job['status'] == 'cancelled':
                break

            job['progress'] = progress
            await self.send_to_client(client, {
                "type": "progress",
                "jobId": job_id,
                "progress": progress,
                "stage": self.get_render_stage(progress)
            })
            await asyncio.sleep(1)  # Simulate processing time

        if job['status'] != 'cancelled':
            # Mark as complete
            job['status'] = 'complete'
            job['progress'] = 100

            # Generate mock output URL
            output_url = f"https://media.blazesportsintel.com/renders/{job_id}.mp4"

            await self.send_to_client(client, {
                "type": "render_complete",
                "jobId": job_id,
                "outputUrl": output_url,
                "duration": 10.5,
                "format": "mp4",
                "resolution": job['spec'].get('resolution', '3840x2160')
            })

    def get_render_stage(self, progress):
        """Get render stage description based on progress"""
        if progress < 20:
            return "Initializing Unreal Engine scene"
        elif progress < 40:
            return "Loading stadium and team assets"
        elif progress < 60:
            return "Applying materials and lighting"
        elif progress < 80:
            return "Rendering frames"
        else:
            return "Finalizing and encoding"

    async def client_handler(self, websocket, path):
        """Handle individual client connection"""
        await self.register_client(websocket)
        try:
            async for message in websocket:
                await self.handle_client_message(websocket, message)
        except websockets.ConnectionClosed:
            logger.info("Client connection closed")
        finally:
            await self.unregister_client(websocket)

    async def start_server(self, host='localhost', port=8765):
        """Start the WebSocket server"""
        logger.info(f"Starting WebSocket bridge on {host}:{port}")
        async with websockets.serve(self.client_handler, host, port):
            logger.info(f"🚀 Blaze WebSocket Bridge running on ws://{host}:{port}")
            await asyncio.Future()  # Run forever

def main():
    """Main entry point"""
    bridge = WebSocketBridge()
    asyncio.run(bridge.start_server())

if __name__ == "__main__":
    main()