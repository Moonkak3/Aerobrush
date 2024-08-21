import asyncio
import websockets
import json

connected = set()

async def server(websocket, path):
    # Register the new client
    connected.add(websocket)
    print(f"New client connected: {websocket.remote_address}")
    
    try:
        async for message in websocket:
            data = json.loads(message)
            address = {"ID": websocket.remote_address[1]}
            data.update(address)
            print(f"Received data: {data}")

            # Create tasks to send the message to all other connected clients
            tasks = [
                asyncio.create_task(client.send(json.dumps(data)))
                for client in connected 
                if client != websocket
            ]
            await asyncio.gather(*tasks)  # Run all tasks concurrently
    except websockets.exceptions.ConnectionClosed:
        print(f"Client {websocket.remote_address} disconnected")
    finally:
        # Unregister the client
        connected.remove(websocket)

start_server = websockets.serve(server, "localhost", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
print("WebSocket server started on ws://localhost:8765")
asyncio.get_event_loop().run_forever()
