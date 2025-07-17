import uvicorn
from fastapi import FastAPI, WebSocket

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


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # active_connections.append(websocket)

    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message text is {data}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
