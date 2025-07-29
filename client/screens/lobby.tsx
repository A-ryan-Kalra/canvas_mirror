import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
// import { useSocket } from "../services/use-socket-provider";

function Lobby() {
  const navigate = useNavigate();
  const [details, setDetails] = useState({ name: "", room: "" });

  // const [isRoomFull, setIsRoomFull] = useState(false);
  // const { socketProvider } = useSocket();
  const imageRef = useRef<HTMLImageElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const joinRoom = (e: FormEvent) => {
    e.preventDefault();
    if (!details.name || !details.room) {
      alert("Fields required");
      return;
    }
    // socket.emit("room:join", details);

    sessionStorage.setItem("room", details.room);
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

  useEffect(() => {
    let isDragging = false,
      offsetWidth = 0,
      widthCovered = 0;

    const handleMouseDown = () => {
      if (imageRef.current) {
        isDragging = true;
        offsetWidth = imageRef.current?.offsetWidth;
      }
    };
    const handleMouseMove = (event: MouseEvent) => {
      if (imageRef.current && isDragging) {
        const offsetLeftFromMouse = event.clientX;
        widthCovered = Math.round((offsetLeftFromMouse / offsetWidth) * 100);
        const insetValues = `inset(0 ${100 - widthCovered}% 0 0)`;

        sliderRef.current!.style.right = `${Math.max(
          Math.min(100 - widthCovered, 100),
          0
        )}%`;
        imageRef.current.style.setProperty("--clip-values", insetValues);
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleTouchStart = () => {
      if (imageRef.current) {
        isDragging = true;
        offsetWidth = imageRef.current?.offsetWidth;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touches = event.touches[0];
      if (imageRef.current && isDragging) {
        const offsetLeftFromTouch = touches.clientX;
        widthCovered = Math.round((offsetLeftFromTouch / offsetWidth) * 100);
        const insetValues = `inset(0 ${100 - widthCovered}% 0 0)`;

        sliderRef.current!.style.right = `${Math.max(
          Math.min(100 - widthCovered, 100),
          0
        )}%`;
        imageRef.current.style.setProperty("--clip-values", insetValues);
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div className="flex  w-full h-[100dvh] max-md:flex-col items-center">
      <div className="w-full h-full relative flex-2  p-2 items-center ">
        <div
          ref={sliderRef}
          draggable={false}
          className={` absolute h-full w-[2px] top-0 right-[0%] z-20 before:content-[''] before:absolute before:w-12 before:bg-slate-300 hover:shadow-amber-900  shadow-2xl before:z-20 before:rounded-full before:p-1 after:w-10 after:content-[''] after:flex after:items-center after:justify-center after:text-center after:absolute after:bg-purple-400 after:h-10 after:rounded-full after:-translate-y-1/2 after:-translate-x-1/2 after:top-[50%] before:-translate-y-1/2 before:-translate-x-1/2 before:top-[50%] bg-neutral-300  after:z-30 before:h-12 transition ease-in-out  cursor-ew-resize noselect `}
        >
          <span className="top-[50%] flex  -translate-y-1/2 left-[-20px] absolute z-40  ">
            <ChevronLeft className="w-5 h-5 text-slate-100 translate-x-0.5" />
            <ChevronRight className="w-5 h-5 text-slate-100 -translate-x-0.5" />
          </span>
        </div>
        <img
          ref={imageRef}
          src="/img1.png"
          alt="img1"
          draggable={false}
          className="w-full h-full absolute transition ease-in-out top-0 z-10 left-0 aspect-auto object-contain clip-path  touch-none"
        />
        <img
          src="/img2.png"
          alt="img1"
          draggable={false}
          className="w-full h-full absolute top-0 left-0 aspect-auto object-contain clip-path  touch-none"
        />
      </div>
      <div className="flex-1  bg-slate- w-full h-full flex items-center">
        {/* <div className=" h-fit  w-fit bg-gradient-to-tl from-emerald-400 via-pink-600 to-purple-400"> */}
        <div className="flex gap-y-4 flex-col bg-white items-center p-2 m-1  w-fit h-fit   border-zinc-200 ">
          {/* <h1 className="text-4xl max-sm:text-3xl font-semibold text-teal-500 ">
              Welcome to the Lobby
            </h1> */}
          <form onSubmit={joinRoom} className="flex flex-col gap-y-2 mt-10 p-3">
            <div className=" flex gap-x-4 items-center justify-between">
              {/* <label htmlFor="name" className="sm:text-lg text-xs">
                Enter Name
              </label> */}
              <input
                placeholder="Enter Name"
                type="text"
                id="name"
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, name: e.target.value }))
                }
                value={details.name}
                autoComplete="username"
                className="placeholder:text-xs placeholder:text-slate-500 md:text-xs md:w-[180px] md:h-[30px] text-slate-600 rounded-md bg-zinc-200 p-1 border-none outline-none focus-visible:ring-0"
              />
            </div>
            <div className=" flex gap-x-4 items-center justify-between">
              {/* <label htmlFor="room" className="sm:text-lg text-xs">
                Enter Room No
              </label> */}
              <input
                id="room"
                placeholder="Enter Room No"
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev,
                    room: e.target.value,
                  }))
                }
                value={details.room}
                autoComplete="off"
                className="placeholder:text-xs placeholder:text-slate-500 md:text-xs md:w-[180px] md:h-[30px] text-slate-600 rounded-md bg-zinc-200 p-1 border-none outline-none focus-visible:ring-0"
              />
            </div>
            {/* {isRoomFull && (
              <h1 className="text-red-500 ml-auto">
                Oops, Room is full — check back shortly.
              </h1>
            )} */}
            <button className="bg-purple-600 mt-2 text-xs text-white ml-auto hover:scale-[102%] transition duration-300 w-full cursor-pointer py-2 rounded-md ">
              Submit
            </button>
          </form>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}

export default Lobby;
