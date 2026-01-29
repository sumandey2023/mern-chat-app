import React, { useState } from "react";
import { useSelector } from "react-redux";
import api from "../config/api";

const MessageSelf = ({
  text,
  time,
  isTemp,
  image,
  video,
  audio,
  file,
  messageId,
  onDelete,
  isGroupMessage = false,
}) => {
  const lightTheme = useSelector((state) => state.themeKey);
  const lines = text ? text.split("\n") : [];
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const handleFileClick = (file) => {
    window.open(file, "_blank");
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleMessageTap = () => {
    setIsSelected(!isSelected);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const path = isGroupMessage
        ? `/group/message/${messageId}`
        : `/message/${messageId}`;

      const response = await api.delete(path);
      if (response && (response.status === 200 || response.status === 204)) {
        setShowDeleteConfirm(false);
        if (onDelete) onDelete(messageId);
      } else {
        alert(
          (response?.data && response.data.message) ||
            "Failed to delete message",
        );
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert(error?.response?.data?.message || "Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine what content to show
  const hasImage = image && image.trim() !== "";
  const hasVideo = video && video.trim() !== "";
  const hasAudio = audio && audio.trim() !== "";
  const hasFile = file && file.trim() !== "";
  const hasMedia = hasImage || hasVideo || hasAudio || hasFile;
  const hasText = text && text.trim() !== "" && !hasMedia;

  return (
    <>
      <div className="flex justify-end mb-4 group relative">
        <div
          className={`max-w-[75%] px-4 pt-3 pb-7 min-w-[120px] sm:max-w-[60vw] rounded-t-xl rounded-bl-xl rounded-br-lg  relative transition-all duration-200
            ${
              hasText
                ? lightTheme
                  ? "bg-blue-500 text-white"
                  : "bg-blue-600 text-white"
                : "text-white"
            }
            ${hasMedia ? "p-0 bg-transparent border-none shadow-none" : ""}
            `}
          onClick={handleMessageTap}
        >
          {/* Media only if present, otherwise text */}
          {hasMedia && (
            <div className="flex flex-col items-end gap-1">
              {/* Image */}
              {hasImage && (
                <div className="rounded-lg overflow-hidden dark: max-w-[300px] max-h-[300px] bg-transparent">
                  <img
                    src={image}
                    alt="Message image"
                    className="w-full h-auto max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity duration-200 mb-0"
                    onClick={() => window.open(image, "_blank")}
                    loading="lazy"
                  />
                </div>
              )}
              {/* Video */}
              {hasVideo && (
                <div className="rounded-lg overflow-hidden dark:max-w-[300px] max-h-[300px] bg-transparent">
                  <video
                    controls
                    className="w-full h-auto max-h-[300px] object-cover mb-0"
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
                <div className="rounded-lg dark:p-2 w-[85vw] max-w-[220px] min-w-[100px] flex flex-col items-center bg-transparent mb-0 mx-auto">
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
                    lightTheme ? "bg-blue-500" : "bg-blue-600"
                  } text-black`}
                  onClick={() => handleFileClick(file)}
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-gray-100 flex-shrink-0"
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
                      className={`text-xs   font-medium truncate ${
                        !lightTheme ? "text-white" : "text-white"
                      }`}
                    >
                      {file.split("/").pop() || "Download File"}
                    </span>
                    <span
                      className={`text-[10px] ${
                        !lightTheme ? "text-gray-100" : "text-gray-100"
                      }`}
                    >
                      Click to download
                    </span>
                  </div>
                </div>
              )}
              {/* Timestamp for media messages in black color, compact */}
              <div className="flex items-center gap-1 mt-0.5 mb-0">
                <span
                  className={`text-[9px] opacity-60">{time} ${
                    !lightTheme ? "text-white" : "text-black"
                  } `}
                >
                  {time}
                </span>
                {isTemp && (
                  <span className="text-[9px] text-black opacity-60">
                    <span className="animate-pulse">Sending...</span>
                  </span>
                )}
              </div>
            </div>
          )}
          {hasText && (
            <div className="space-y-0.5">
              {lines.map((line, index) => (
                <p
                  key={index}
                  className="text-base leading-relaxed whitespace-pre-line"
                >
                  {line || " "} {/* Handle empty lines */}
                </p>
              ))}
            </div>
          )}
          {/* Timestamp and sending indicator absolutely positioned for text */}
          {hasText && (
            <div
              className={`absolute bottom-1 right-2.5 flex items-center gap-1 `}
            >
              <span className="text-xs opacity-70">{time}</span>
              {isTemp && (
                <span className="ml-2 text-[10px] opacity-70">
                  <span className="animate-pulse">Sending...</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Delete button - visible on hover or tap */}
        {!isTemp && messageId && (
          <button
            onClick={handleDeleteClick}
            className={`transition-opacity duration-200 ml-2 flex items-center justify-center ${
              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            title="Delete message"
          >
            <svg
              className="w-4 h-4 text-red-500 hover:text-red-700"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        // <div className="fixed inset-0  bg-opacity-20 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            className={`${
              lightTheme ? "bg-white text-black" : "bg-gray-800 text-white"
            } p-6 rounded-lg shadow-lg max-w-sm w-full mx-4`}
          >
            <h2 className="text-lg font-semibold mb-4">Delete Message?</h2>
            <p className="mb-6 text-sm opacity-80">
              Are you sure you want to delete this message? This action cannot
              be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className={`px-4 py-2 rounded transition-colors ${
                  lightTheme
                    ? "bg-gray-200 hover:bg-gray-300 text-black"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                } disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default MessageSelf;
