import React from "react";
import ChatArea from "./ChatArea";
import SideNavChatList from "./SideNavChatList";
import Welcome from "./Welcome";
import CreateGroup from "./CreateGroup";
import UserGroups from "./Groups";
import TitleBar from "./TitleBar";
import { Outlet } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { useSelector } from "react-redux";

const MainSection = () => {
  const isSmallScreen = useMediaQuery({ maxWidth: 1150 });
  const lightTheam = useSelector((state) => state.themeKey);

  return (
    <>
      <TitleBar />
      <div
        className={`h-[calc(100vh-5.5vh)] flex ${
          lightTheam ? "bg-[#4141FF]" : "!bg-[#2A2D27]"
        }`}
      >
        {/* Side Nav Bar Chat List */}
        {!isSmallScreen && <SideNavChatList />}
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default MainSection;
