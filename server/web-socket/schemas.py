from fastapi import FastAPI, WebSocket
from typing import Dict, List, Any

rooms = Dict[int, List[Dict[str, WebSocket]] | str]


class User:

    def __init__(self):
        self.active_connections: rooms = {}

    async def connect(self, websocket: WebSocket, room: int, name: str):
        await websocket.accept()

        if room not in self.active_connections:
            self.active_connections[room] = []
        self.active_connections[room].append({"socket": websocket, "name": name})

    def disconnect(self, websocket: WebSocket, room: int, name: str):
        if room in self.active_connections:
            self.active_connections[room] = [
                conn
                for conn in self.active_connections[room]
                if not (conn["socket"] == websocket and conn["name"] == name)
            ]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str, room: int, name: str, websocket: WebSocket):

        if room in self.active_connections:
            for user in self.active_connections[room]:
                if user["name"] != name and user["socket"] != websocket:
                    await user["socket"].send_text(message)

        if not self.active_connections[room]:
            del self.active_connections[room]
            print("No users left")


class CursorMovement:

    def __init__(self):
        self.cursor_connections: rooms = {}

    async def connect(self, websocket: WebSocket, room: int, name: str):
        await websocket.accept()

        if room not in self.cursor_connections:
            self.cursor_connections[room] = []
        self.cursor_connections[room].append({"socket": websocket, "name": name})

    def disconnect(self, websocket: WebSocket, room: int, name: str):
        if room in self.cursor_connections:
            self.cursor_connections[room] = [
                conn
                for conn in self.cursor_connections[room]
                if not (conn["socket"] == websocket and conn["name"] == name)
            ]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str, room: int, name: str, websocket: WebSocket):

        if room in self.cursor_connections:
            for user in self.cursor_connections[room]:
                if user["name"] != name and user["socket"] != websocket:
                    await user["socket"].send_text(message)

        if not self.cursor_connections[room]:
            del self.cursor_connections[room]
            print("No users left")


class StickerMovement:

    def __init__(self):
        self.sticker_session: rooms = {}

    async def connect(self, websocket: WebSocket, room: int, name: str):
        await websocket.accept()

        if room not in self.sticker_session:
            self.sticker_session[room] = []
        self.sticker_session[room].append({"socket": websocket, "name": name})

    def disconnect(self, websocket: WebSocket, room: int, name: str):
        if room in self.sticker_session:
            self.sticker_session[room] = [
                conn
                for conn in self.sticker_session[room]
                if not (conn["socket"] == websocket and conn["name"] == name)
            ]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str, room: int, name: str, websocket: WebSocket):

        if room in self.sticker_session:
            for user in self.sticker_session[room]:
                if user["name"] != name and user["socket"] != websocket:
                    await user["socket"].send_json(message)

        if not self.sticker_session[room]:
            del self.sticker_session[room]
            print("No users left")


user = User()
cursorMovement = CursorMovement()
stickerMovement = StickerMovement()
