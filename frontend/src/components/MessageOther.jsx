import { Avatar } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";

const MessageOther = ({
  text,
  avatar,
  time,
  pic,
  status,
  image,
  video,
  audio,
  file,
}) => {
  const lightTheme = useSelector((state) => state.themeKey);
  const lines = text ? text.split("\n") : [];

  // Determine what content to show
  const hasImage = image && image.trim() !== "";
  const hasVideo = video && video.trim() !== "";
  const hasAudio = audio && audio.trim() !== "";
  const hasFile = file && file.trim() !== "";
  const hasMedia = hasImage || hasVideo || hasAudio || hasFile;
  const hasText = text && text.trim() !== "" && !hasMedia;

  // Dynamic styling based on theme
  const bubbleStyle = hasText
    ? lightTheme
      ? "bg-white text-gray-800 "
      : "bg-gray-700 text-gray-100 "
    : "text-gray-100";

  const timeStyle = lightTheme ? "text-gray-400" : "text-gray-400";

  const avatarBgStyle = lightTheme ? "bg-indigo-500" : "bg-indigo-600";

  const handleFileClick = (file) => {
    window.open(file, "_blank");
  };

  return (
    <div className="flex items-end gap-2 mb-3 pl-1 animate-fadeIn transition-all duration-300 ease-in-out group">
      {/* Avatar with hover effect */}
      <div className="transition-transform duration-300 ease-in-out group-hover:scale-105">
        {avatar ? (
          <div
            className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex justify-center items-center text-white text-lg lg:text-xl font-bold shadow-md ${avatarBgStyle}`}
          >
            {avatar}
          </div>
        ) : (
          <Avatar
            alt="Profile"
            src={pic}
            sx={{
              width: { xs: 32, lg: 40 },
              height: { xs: 32, lg: 40 },
              border: `2px solid ${lightTheme ? "#e5e7eb" : "#374151"}`,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
            }}
          />
        )}
      </div>

      {/* Message bubble or media */}
      <div
        className={`px-3 py-2 pb-6 min-w-[100px] max-w-[70vw] sm:max-w-[55vw] rounded-t-xl rounded-br-xl rounded-bl-lg relative transition-all duration-200
          ${bubbleStyle}
          ${hasMedia ? "p-0 bg-transparent border-none shadow-none" : ""}
          `}
      >
        {/* Media only if present, otherwise text */}
        {hasMedia && (
          <div className="flex flex-col items-start gap-2">
            {/* Image */}
            {hasImage && (
              <div className="rounded-lg overflow-hidden  max-w-[300px] max-h-[300px] bg-transparent">
                <img
                  src={image}
                  alt="Message image"
                  className="w-full h-auto max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity duration-200"
                  onClick={() => window.open(image, "_blank")}
                  loading="lazy"
                />
              </div>
            )}
            {/* Video */}
            {hasVideo && (
              <div className="rounded-lg overflow-hidden dark: max-w-[300px] max-h-[300px] bg-transparent">
                <video
                  controls
                  className="w-full h-auto max-h-[300px] object-cover"
                  preload="metadata"
                  poster=""
                >
                  <source src={video} type="video/mp4" />
                  <source src={video} type="video/webm" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
            {/* Audio */}
            {hasAudio && (
              <div className="rounded-lg dark:p-2 w-[85vw] max-w-[220px] min-w-[100px] flex flex-col items-center bg-transparent mx-auto">
                <audio controls className="w-full">
                  <source src={audio} type="audio/mpeg" />
                  <source src={audio} type="audio/wav" />
                  Your browser does not support the audio tag.
                </audio>
              </div>
            )}
            {/* File */}
            {hasFile && (
              <div
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors duration-200 dark: w-full max-w-[300px] sm:w-[300px] ${
                  lightTheme ? "bg-gray-100" : "bg-gray-700"
                } text-black`}
                onClick={() => handleFileClick(file)}
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-gray-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex flex-col min-w-0 flex-1">
                  <span
                    className={`text-xs font-medium truncate ${
                      !lightTheme ? "text-white" : "text-black"
                    }`}
                  >
                    {file.split("/").pop() || "Download File"}
                  </span>
                  <span className="text-[10px] text-blue-600">
                    Click to download
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        {hasText && (
          <div className="space-y-0.5">
            {lines.map((line, index) => (
              <p
                key={index}
                className="text-xs lg:text-sm leading-relaxed whitespace-pre-line"
              >
                {line || " "} {/* Handle empty lines */}
              </p>
            ))}
          </div>
        )}
        {/* Timestamp and status indicator */}
        <div className="absolute bottom-1 right-2.5 flex items-center gap-1">
          {status && (
            <span
              className={`text-[9px] ${
                status === "read" ? "text-blue-500" : timeStyle
              }`}
            >
              {status === "read" ? "✓✓" : "✓"}
            </span>
          )}
          <span className={`text-[9px] font-medium ${timeStyle}`}>{time}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageOther;
