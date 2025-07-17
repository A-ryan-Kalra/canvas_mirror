from fastapi import FastAPI, WebSocket
from typing import Dict, List, Any


class ConnectionManager:
    def __init__(self):
        # room:Dict[str,WebSocket]=
        self.active_connections: List[Dict[str, Any]] = []

    async def connect(self, websocket: WebSocket, client_id: int):
        await websocket.accept()
        self.active_connections.append({"id": client_id, "socket": websocket})

    def disconnect(self, websocket: WebSocket, client_id: int):
        # self.active_connections.remove(["id"]=client_id)
        self.active_connections = [
            conn
            for conn in self.active_connections
            if not (conn["id"] == client_id and conn["socket"] == websocket)
        ]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str, client_id: int):
        # print("Connection =>\n", self.active_connections)
        for connection in self.active_connections:

            if connection["id"] != client_id:
                # print("\n-----------------\n")
                await connection["socket"].send_text(message)


manager = ConnectionManager()


class CursorManager:

    def __init__(self):
        self.cursor_connections = []

    async def connect(self, websocket: WebSocket, client_id: int):
        await websocket.accept()
        self.cursor_connections.append({"id": client_id, "socket": websocket})

    def disconnect(self, websocket: WebSocket, client_id: int):
        # self.cursor_connections.remove(["id"]=client_id)
        self.cursor_connections = [
            conn
            for conn in self.cursor_connections
            if not (conn["id"] == client_id and conn["socket"] == websocket)
        ]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str, client_id: int):
        for connection in self.cursor_connections:

            if connection["id"] != client_id:
                await connection["socket"].send_text(message)


cursorManager = CursorManager()
