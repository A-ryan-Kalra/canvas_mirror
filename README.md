<div align="center">

# 🎨 Canvas Mirror

### Free and Real-Time collaborative platform 🦄 🚀

🎨 Canvas Mirror - It is a real-time collaborative whiteboard website. It allows multiple users to sketch together on a shared canvas, make notes and a lot more.

</div>


<div align='center'>
  
<img width="1435" height="870" alt="canvas-mirror" src="https://github.com/user-attachments/assets/dbb5bbc6-e94e-47c8-929b-a96f1b86ba93" />
<video src="https://github.com/user-attachments/assets/19ec8660-fa05-4a5d-824c-4c3842d268ed" muted />

</div>





<br/>

# Contents

- [🚀 Features](#-features)
- [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
- [⚙️🔧Installation](#%EF%B8%8F-installation)
  - [📋 Manual Installation](#-manual-installation)
    - [Clone the Repository](#1-clone-the-repository)
    - [🚧 Backend Setup (FastAPI)](#2--backend-setup-fastapi)
    - [🌅 Frontend Setup (React)](#3--frontend-setup-react)
  - [🐳 DOCKER Installation](#-docker-installation)
    - [Run Instantly with Docker (Prebuilt Image)](#run-instantly-with-docker-prebuilt-image)
    - [Or, run locally with Docker Compose](#or-run-locally-with-docker-compose)


<br/>

## 🚀 Features

- ✏️ Collaborative Drawing - Real time multiuser sketching powered by WebSockets.
- 🖼️ Canvas 2D Integration – Smooth and responsive drawing experience using the Canvas API.
- 📡 Live Sync - All strokes and updates are instantly mirrored to other connected users.
- 🗒️ Sticky Notes – Leave notes or reminders directly on the canvas.

<br/>

## 🛠️ Tech Stack

| Frontend              | Backend          | Real-Time | Drawing       | Containerization |
| --------------------- | ---------------- | --------- | ------------- | :--------------: |
| React.js (Typescript) | FastApi (Python) | Websocket | Canvas 2D API |      Docker      |

<br/>

## ⚙️ Installation
  - ### 📋 Manual Installation:

    #### 1. Clone the Repository
    
    ```
    git clone https://github.com/A-ryan-Kalra/canvas_mirror
    
    # Enter the working directory
    cd canvas-mirror
    ```
    
    #### 2. 🚧 Backend Setup (FastAPI)
    
    ```
    cd server
    python3 -m venv venv-canvas
    source venv-canvas/bin/activate
    pip install -r requirements.txt
    uvicorn canvas_backend.main:app --reload
    ```
    
    #### 3. 🌅 Frontend Setup (React)
    
    ```
    cd ../client
    npm install
    npm run start
    ```
    
    Open <a href='http://localhost:5173'>http://localhost:5173</a> in your browser to see the result.
<br>

- ### 🐳 **DOCKER** Installation
  * #### Run Instantly with Docker (Prebuilt Image)
    ```
    # Pull the prebuilt image
    docker pull aryankalra363/canvas_mirror
    
    # Run the app on port 8000
    docker run -p 8000:8000 -e STATIC_PATH=app/client aryankalra363/canvas_mirror
    ```
    🔗 Open your browser and visit: <a href='http://localhost:8000'>http://localhost:8000</a>

---
> [!IMPORTANT] 
> Make sure to include .env file for both server and client directory before the build.

  * #### Or, run locally with Docker Compose
    

    If you would like to clone the code and run locally:
  
    #### 1. Clone the repository
    ```
    https://github.com/A-ryan-Kalra/canvas_mirror.git
    cd canvas_mirror
    ```
    #### 2. Run with Docker Compose
    ```
    docker compose up --build
    ```
    🔗 Open your browser and visit: <a href='http://localhost:8000'>http://localhost:8000</a>

---

<details>
  <summary>You know what's absolutely free?</summary>

- Leaving a ⭐ star
- 🍴Forking the repository
- No hidden fees, no subscriptions - just pure open-source love 🥰!

</details>

---

<div align="center">

<br>
Powered by ☕️ & 🎧 <br>
Aryan Kalra

</div>
