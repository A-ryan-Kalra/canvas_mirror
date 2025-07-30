import { Github } from "lucide-react";

function Footer() {
  return (
    <footer className={` w-full`}>
      <div className="flex relative justify-around items-center  text-black duration-300 py-2 border-t-[2px] border-slate-200">
        <span className="md:text-sm  text-[12px] flex items-center justify-center gap-x-1">
          Pixels speak louder than words &copy; {new Date().getFullYear()}{" "}
          Canvas Mirror
          <a
            target="__blank"
            href={"https://github.com/A-ryan-Kalra/canvas_mirror"}
            className="bg-slate-300 rounded-full p-1 hover:bg-slate-200 cursor-pointer transition"
          >
            <Github className="fill-white w-4 sm:w-4 h-4 sm:h-4" />
          </a>
        </span>
      </div>
    </footer>
  );
}

export default Footer;
