import React from "react";
import ForumIcon from "@mui/icons-material/Forum";
import { useSelector } from "react-redux";

const TitleBar = () => {
  const lightTheam = useSelector((state) => state.themeKey);

  return (
    <nav
      className={`h-[55px] flex items-center px-6 shadow-md ${
        lightTheam ? "bg-[#4141FF]" : "bg-[#2A2D27]"
      } transition-all duration-300`}
    >
      <h1
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
      </h1>
    </nav>
  );
};

export default TitleBar;
