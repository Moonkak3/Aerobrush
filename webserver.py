import asyncio
import websockets
import json

connected = set()
history = []

async def server(websocket, path):
    # Register the new client
    connected.add(websocket)
    print(f"New client connected: {websocket.remote_address}")
    for entry in history:
        asyncio.create_task(websocket.send(json.dumps(entry)))
    try:
        async for message in websocket:
            data = json.loads(message)
            address = {"ID": websocket.remote_address[1]}
            data.update(address)
            history.append(data)
            # print(f"Received data: {data}")

            # Create tasks to send the message to all other connected clients
            tasks = [
                asyncio.create_task(client.send(json.dumps(data)))
                for client in connected 
                # if client != websocket
            ]
            await asyncio.gather(*tasks)  # Run all tasks concurrently
    except websockets.exceptions.ConnectionClosed:
        print(f"Client {websocket.remote_address} disconnected")
    finally:
        # Unregister the client
        connected.remove(websocket)

start_server = websockets.serve(server, "192.168.10.189", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
print("WebSocket server started on ws://192.168.10.189:8765")
asyncio.get_event_loop().run_forever()
