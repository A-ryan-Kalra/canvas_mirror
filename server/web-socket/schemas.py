from fastapi import FastAPI, WebSocket
from typing import Dict, List, Any

rooms = Dict[int, List[Dict[str, Dict[str, WebSocket] | str]]]


class User:

    def __init__(self):
        self.active_connections: rooms = {}

    async def connect(
        self, websocket: WebSocket, room: int, name: str, socketType: str
    ):
        await websocket.accept()

        if room not in self.active_connections:
            self.active_connections[room] = []
        self.active_connections[room].append(
            {"socket": {socketType: websocket}, "name": name}
        )

    async def add_socket(
        self, websocket: WebSocket, room: int, name: str, socketType: str
    ):
        await websocket.accept()

        if room not in self.active_connections:
            self.active_connections = []

        for user in self.active_connections[room]:
            if user["name"] == name:
                user["socket"][socketType] = websocket
                return

        self.active_connections[room].append(
            {"socket": {socketType: websocket}, "name": name}
        )

    def disconnect(self, websocket: WebSocket, room: int, name: str, socketType: str):
        if room in self.active_connections:
            self.active_connections[room] = [
                conn
                for conn in self.active_connections[room]
                if not (
                    conn["socket"][socketType] == websocket and conn["name"] == name
                )
            ]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(
        self, message: str, room: int, name: str, websocket: WebSocket, socketType: str
    ):

        if room in self.active_connections:
            for user in self.active_connections[room]:
                if user["name"] != name and user["socket"][socketType] != websocket:
                    await user["socket"][socketType].send_text(message)
        # print("\nself.active_connections\n", self.active_connections)
        if not self.active_connections[room]:
            del self.active_connections[room]
            print("No users left")


user = User()
