import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from .schemas import manager, cursorManager
from typing import Dict, List

# from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def healthz():
    return {"message": "Healthy..."}


active_connections = []


# @app.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     # active_connections.append(websocket)

#     while True:
#         data = await websocket.receive_text()
#         await websocket.send_text(f"Message text is {data}")


@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # await manager.send_personal_message(f"You wrote: {data}", websocket)
            await manager.broadcast(data, client_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)
        await manager.broadcast(f"Client Id {client_id} left the chat.", client_id)


# rooms: Dict[str, List[WebSocket]] = {}
@app.websocket("/ws/cursor/{client_id}")
async def track_cursor(websocket: WebSocket, client_id: int):
    # await websocket.accept()
    await cursorManager.connect(websocket, client_id)

    try:
        while True:
            data = await websocket.receive_text()
            # print("data=", data)
            # print("client_id=", client_id)
            await cursorManager.broadcast(data, client_id)
    except Exception as error:
        print("\nSomething went wrong=> \n", error)
        cursorManager.disconnect(websocket, client_id)
        await cursorManager.broadcast(
            f"Client Id {client_id} left the chat.", client_id
        )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
