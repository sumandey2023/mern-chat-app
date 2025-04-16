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

const App = () => {
  const isSmallScreen = useMediaQuery({ maxWidth: 1150 });
  const lightTheme = useSelector((state) => state.themeKey);
  const location = useLocation();
  const isAppRootOrWelcomeRoute =
    location.pathname === "/app" || location.pathname === "/app/welcome";

  return (
    <Routes>
      <Route path="/" element={<Auth />} />

      {/* Main app routes */}
      <Route
        path="app"
        element={
          isSmallScreen && isAppRootOrWelcomeRoute ? (
            <ProtectedRoute>
              <>
                <TitleBar />
                <div
                  className={`h-[calc(100vh-5.5vh)] flex bg-[#4141FF] ${
                    lightTheme ? "" : "!bg-[#2A2D27]"
                  } `}
                >
                  <SideNavChatList />
                  <div className="flex-1 overflow-hidden">
                    <Outlet />
                  </div>
                </div>
              </>
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
      </Route>
    </Routes>
  );
};

export default App;
