import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from .schemas import user, cursorMovement, stickerMovement
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
        user.disconnect(websocket, room, name)
        cursorMovement.disconnect(websocket, room, name)
        await stickerMovement.broadcast(
            {"message": f"Client Id {name} left the chat.", "name": name},
            room,
            websocket,
            name,
        )


@app.websocket("/ws/cursor/{room}")
async def track_cursor(websocket: WebSocket, room: int):
    # await websocket.accept()

    name = websocket.query_params.get("name")
    await cursorMovement.connect(websocket, room, name)
    try:
        while True:
            data = await websocket.receive_text()

            await cursorMovement.broadcast(data, room, name, websocket)

    except Exception as error:
        print(f"\nSomething went wrong {websocket} \n", error)
        user.disconnect(websocket, room, name)
        cursorMovement.disconnect(websocket, room, name)
        await stickerMovement.broadcast(
            {"message": f"Client Id {name} left the chat.", "name": name},
            room,
            websocket,
            name,
        )


@app.websocket("/ws/remove/{room}")
async def track_cursor(websocket: WebSocket, room: int):
    # await websocket.accept()

    name = websocket.query_params.get("name")
    await stickerMovement.connect(websocket, room, name)
    try:
        while True:
            data = await websocket.receive_text()
            print("Remove Socket\n ", data)

            await stickerMovement.broadcast(data, room, name, websocket)

    except Exception as error:
        print(f"\nSomething went wrong {websocket} \n", error)
        print("Remove Socket Error\n ", error)

        user.disconnect(websocket, room, name)
        stickerMovement.disconnect(websocket, room, name)
        await stickerMovement.broadcast(
            {"message": f"Client Id {name} left the chat.", "name": name},
            room,
            websocket,
            name,
        )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
