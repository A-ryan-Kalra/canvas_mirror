import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../services/use-socket-provider";

function Lobby() {
  const navigate = useNavigate();
  const [details, setDetails] = useState({ name: "", room: "" });
  const [isRoomFull, setIsRoomFull] = useState(false);
  const { socketProvider } = useSocket();

  const joinRoom = (e: FormEvent) => {
    e.preventDefault();
    if (!details.name || !details.room) {
      alert("Fields required");
      return;
    }
    // socket.emit("room:join", details);
    const socket = new WebSocket(
      `ws://localhost:8000/ws/cursor/${details.room}?name=${details.name}`
    );

    socket.onclose = () => {
      console.log(`${details.name} left the chat room.`);
    };
    socket.onmessage = (event: MessageEvent<WebSocket>) => {
      console.log(event.data);
    };
    socket.onopen = () => {
      console.log(`Successfully established the connection.`);
      socket.send(`${details.name} entered the room.`);
    };
    socketProvider.set(details.room, socket);
    // socket.onmessage=(event:Event)=>{

    // }
    handleUserJoined({ room: details.room, success: true, name: details.name });
  };

  function handleUserJoined({
    room,
    success,
    name,
  }: {
    success: boolean;
    room: string;
    name: string;
  }) {
    // sessionStorage.setItem("key", id);

    // if (success) navigate(`/room/${room}?accessId=${id}&name=${name}`);
    if (success) {
      navigate(`/room/${room}?name=${name}`);
    }
  }
  //   function handleErrorMssage({ message }) {
  //     console.error(message);
  //     setIsRoomFull(true);
  //     navigate("/");
  //   }

  //   useEffect(() => {
  //     socket.on("room:joined", handleUserJoined);
  //     socket.on("errorMessage", handleErrorMssage);

  //     return () => {
  //       socket.off("room:joined");
  //       socket.off("errorMessage", handleErrorMssage);
  //     };
  //   }, [handleUserJoined, handleErrorMssage]);
  //

  return (
    <div className="flex  w-full h-[100dvh] justify-center items-center">
      <div className="h-fit w-fit bg-gradient-to-tl from-emerald-400 via-pink-600 to-purple-400">
        <div className="flex gap-y-4 flex-col bg-white items-center p-2 m-1  w-fit h-fit border-[1px] border-zinc-200 ">
          <h1 className="text-4xl max-sm:text-3xl font-semibold text-teal-500 ">
            Welcome to the Lobby
          </h1>
          <form onSubmit={joinRoom} className="flex flex-col gap-y-2 mt-10 p-3">
            <div className=" flex gap-x-4 items-center justify-between">
              <label htmlFor="name" className="sm:text-lg text-xs">
                Enter Name
              </label>
              <input
                type="text"
                id="name"
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, name: e.target.value }))
                }
                value={details.name}
                autoComplete="username"
                className="bg-zinc-200 p-1 border-none outline-none focus-visible:ring-0"
              />
            </div>
            <div className=" flex gap-x-4 items-center justify-between">
              <label htmlFor="room" className="sm:text-lg text-xs">
                Enter Room No
              </label>
              <input
                id="room"
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev,
                    room: e.target.value,
                  }))
                }
                value={details.room}
                autoComplete="off"
                className="bg-zinc-200 p-1 border-none outline-none focus-visible:ring-0"
              />
            </div>
            {isRoomFull && (
              <h1 className="text-red-500 ml-auto">
                Oops, Room is full — check back shortly.
              </h1>
            )}
            <button className="bg-cyan-400 mt-2 w-fit ml-auto hover:scale-110 transition duration-300 px-10 cursor-pointer py-2 rounded-2xl ">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
