import React from "react";
import ForumIcon from "@mui/icons-material/Forum";
import { useSelector } from "react-redux";

const TitleBar = () => {
  const lightTheme = useSelector((state) => state.themeKey);

  return (
    <nav
      className={`h-[55px] flex items-center px-6 shadow-md ${
        lightTheme ? "bg-[#4141FF]" : "bg-[#2A2D27]"
      } transition-all duration-300`}
    >
      {/* <h1
        className={`text-2xl font-semibold flex items-center tracking-wide ${
          lightTheam ? "text-white" : "text-gray-200"
        } transition-all duration-300`}
      >
        <ForumIcon
          className={`mr-2 text-2xl ${
            lightTheam ? "text-white" : "text-gray-200"
          } transition-all duration-300`}
        />
        Adda..
      </h1> */}
      <div className="flex items-center">
        <div
          className={`p-1.5 rounded-full mr-3 ${
            lightTheme ? "bg-white/20" : "bg-white/10"
          }`}
        >
          <ForumIcon
            className={`text-2xl ${
              lightTheme ? "text-white" : "text-gray-200"
            } transition-all duration-300`}
          />
        </div>
        <h1
          className={`text-2xl font-bold tracking-wide ${
            lightTheme ? "text-white" : "text-gray-200"
          } transition-all duration-300 `}
        >
          Adda<span className="text-blue-300">.</span>
          <span className="text-blue-200">.</span>
        </h1>
      </div>
    </nav>
  );
};

export default TitleBar;
