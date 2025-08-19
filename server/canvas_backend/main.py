import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from .schemas import user, cursorMovement, removeSocket
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from typing import Dict, List
from dotenv import load_dotenv
import os
from pathlib import Path

# from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
load_dotenv()

WEBSITE_URL = os.getenv("WEBSITE_URL")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[WEBSITE_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DIST_DIR = BASE_DIR / os.getenv("STATIC_PATH") / "dist"

print("DIST_DIR =", DIST_DIR)
print("DIST_DIR exists?", DIST_DIR.exists())

app.mount(
    "/static",
    StaticFiles(directory=DIST_DIR),
    name="static",
)


@app.api_route("/{full_path:path}", methods=["GET"])
def serve_spa(full_path: str):
    requested = DIST_DIR / full_path.lstrip("/")
    if requested.is_file():
        return FileResponse(requested)
    return FileResponse(DIST_DIR / "index.html")


@app.get("/")
def healthz():
    return {"message": "Healthy..."}


@app.websocket("/ws/message/{room}")
async def track_messages(websocket: WebSocket, room: int):
    # await websocket.accept()

    name = websocket.query_params.get("name")
    await user.connect(websocket, room, name)

    try:
        while True:
            data = await websocket.receive_text()

            await user.broadcast(data, room, websocket, name)

    except Exception as error:
        print(f"\nSomething went wrong at message sockets: \n", error)
        user.disconnect(websocket, room, name)


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
        print(f"\nSomething went wrong at cursor sockets: \n", error)

        cursorMovement.disconnect(websocket, room, name)


@app.websocket("/ws/remove/{room}")
async def track_remove_sockets(websocket: WebSocket, room: int):
    # await websocket.accept()

    name = websocket.query_params.get("name")
    await removeSocket.connect(websocket, room, name)
    try:
        while True:
            data = await websocket.receive_text()
            await removeSocket.broadcast(data, room, name, websocket)

    except Exception as error:
        print(f"\nSomething went wrong at track_remove_sockets: \n", error)

        removeSocket.disconnect(websocket, room, name)
        await removeSocket.broadcast(
            {"message": f"Client Id {name} left the chat.", "name": name},
            room,
            websocket,
            name,
        )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
