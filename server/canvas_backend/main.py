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
DIST_DIR = BASE_DIR / "client" / "dist"
print("Base from", DIST_DIR)


app.mount(
    "/static",
    StaticFiles(directory=DIST_DIR),
    name="static",
)


@app.api_route("/{full_path:path}", methods=["GET"])
def serve_spa(full_path: str):
    # If the file actually exists in /dist, serve it directly
    requested = DIST_DIR / full_path.lstrip("/")
    if requested.is_file():
        return FileResponse(requested)
    # Otherwise let React-Router handle the route
    return FileResponse(DIST_DIR / "index.html")


@app.get("/")
def healthz():
    return {"message": "Healthy..."}


@app.websocket("/ws/message/{room}")
async def track_cursor(websocket: WebSocket, room: int):
    # await websocket.accept()

    name = websocket.query_params.get("name")
    await user.connect(websocket, room, name)

    try:
        while True:
            data = await websocket.receive_text()

            await user.broadcast(data, room, websocket, name)

    except Exception as error:
        print(f"\nSomething went wrong {websocket} \n", error)
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
        print(f"\nSomething went wrong {websocket} \n", error)

        cursorMovement.disconnect(websocket, room, name)


@app.websocket("/ws/remove/{room}")
async def track_cursor(websocket: WebSocket, room: int):
    # await websocket.accept()

    name = websocket.query_params.get("name")
    await removeSocket.connect(websocket, room, name)
    try:
        while True:
            data = await websocket.receive_text()
            print("Remove Socket\n ", data)

            await removeSocket.broadcast(data, room, name, websocket)

    except Exception as error:
        print(f"\nSomething went wrong {websocket} \n", error)
        print("Remove Socket Error\n ", error)

        removeSocket.disconnect(websocket, room, name)
        await removeSocket.broadcast(
            {"message": f"Client Id {name} left the chat.", "name": name},
            room,
            websocket,
            name,
        )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
