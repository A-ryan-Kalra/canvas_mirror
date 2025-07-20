import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from .schemas import user
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


async def handle_data(websocket: WebSocket, room: int, socketType: str):
    name = websocket.query_params.get("name")
    # await user.connect(websocket, room, name, socketType)
    await user.add_socket(websocket, room, name, socketType)

    try:
        while True:
            data = await websocket.receive_text()
            await user.broadcast(data, room, name, websocket, socketType)

    except Exception as error:
        print(f"\nSomething went wrong {websocket} \n", error)
        user.disconnect(websocket, room, name, socketType)
        await user.broadcast(
            f"Client Id {name} left the chat.", room, websocket, name, socketType
        )


@app.websocket("/ws/{room}")
async def websocket_endpoint(websocket: WebSocket, room: int):

    name = websocket.query_params.get("name")
    await user.connect(websocket, room, name, "connection")

    try:
        while True:
            data = await websocket.receive_text()
            print(f"\nData= {data}\n")

            if room in user.active_connections:
                print("\nExecuted \n", user.active_connections[room])

                for conn in user.active_connections[room]:
                    if (
                        conn["name"] != name
                        and conn["socket"]["connection"] != websocket
                    ):
                        await conn["socket"]["connection"].send_text(data)

    except Exception as error:
        print(f"\nSomething went wrong {websocket} \n", error)
        user.disconnect(websocket, room, name, "connection")

        await user.broadcast(
            f"Client Id {name} left the chat.", room, name, websocket, "connection"
        )


@app.websocket("/ws/message/{room}/{socketType}")
async def track_message(websocket: WebSocket, room: int, socketType: str):
    await handle_data(websocket, room, socketType)


@app.websocket("/ws/cursor/{room}/{socketType}")
async def track_cursor(websocket: WebSocket, room: int, socketType: str):
    await handle_data(websocket, room, socketType)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
