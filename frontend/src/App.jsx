import React from "react";
import { Route, Routes, useLocation, Outlet } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import MainSection from "./components/MainSection";
import Auth from "./components/Auth";
import Welcome from "./components/Welcome";
import ChatArea from "./components/ChatArea";
import CreateGroup from "./components/CreateGroup";
import Groups from "./components/Groups";
import Chats from "./components/Chats";
import SideNavChatList from "./components/SideNavChatList";
import TitleBar from "./components/TitleBar";
import { useSelector } from "react-redux";
import AIChat from "./components/AIChat";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Public from "./components/Public";
import GroupChatArea from "./components/GroupChatArea";
import ProfileShare from "./components/ProfileShare";

const App = () => {
  const isSmallScreen = useMediaQuery({ maxWidth: 1150 });
  const lightTheme = useSelector((state) => state.themeKey);
  const location = useLocation();
  const isAppRootOrWelcomeRoute =
    location.pathname === "/app" || location.pathname === "/app/welcome";

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Routes>
        <Route path="/" element={<Auth />} />

        {/* Main app routes */}
        <Route
          path="app"
          element={
            isSmallScreen && isAppRootOrWelcomeRoute ? (
              <ProtectedRoute>
                <div className="flex flex-col h-screen w-full">
                  <TitleBar />
                  <div
                    className={`flex flex-grow ${
                      lightTheme ? "bg-[#4141FF]" : "bg-[#2A2D27]"
                    }`}
                  >
                    <SideNavChatList />
                    <div className="flex-1 overflow-hidden">
                      <Outlet />
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            ) : (
              <ProtectedRoute>
                <MainSection />
              </ProtectedRoute>
            )
          }
        >
          <Route path="welcome" element={<Welcome />} />
          <Route path="chat/:id" element={<ChatArea />} />
          <Route path="groups" element={<Groups />} />
          <Route path="chats" element={<Chats />} />
          <Route path="create-group" element={<CreateGroup />} />
          <Route path="ai-chat" element={<AIChat />} />
          <Route path="profile" element={<Profile />} />
          <Route path="public" element={<Public />} />
          <Route path="group/:id" element={<GroupChatArea />} />
          <Route path="profileShare" element={<ProfileShare />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
