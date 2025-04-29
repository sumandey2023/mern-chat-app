import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  BrowserMultiFormatReader,
  RGBLuminanceSource,
  BinaryBitmap,
} from "@zxing/library";

const Scanner = () => {
  const lightTheme = useSelector((state) => state.themeKey);
  const [data, setData] = useState("");
  const videoRef = useRef(null);

  // Camera QR Code Scanning
  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    if (videoRef.current) {
      codeReader
        .decodeFromVideoDevice(null, videoRef.current, (result, err) => {
          if (result) {
            const text = result.getText();
            setData(text);
            if (text.startsWith("http")) {
              window.location.href = text;
            }
          }
        })
        .catch((err) => console.error(err));

      return () => {
        codeReader.reset();
      };
    }
  }, []);

  // Image Upload QR Code Scanning
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const codeReader = new BrowserMultiFormatReader();
          const luminanceSource = new RGBLuminanceSource(
            img,
            img.width,
            img.height
          );
          const binaryBitmap = new BinaryBitmap(luminanceSource);
          try {
            const result = codeReader.decode(binaryBitmap);
            const text = result.getText();
            setData(text);
            if (text.startsWith("http")) {
              window.location.href = text;
            }
          } catch (err) {
            console.error("Error decoding image: ", err);
            setData("Could not detect QR code in image. Please try again.");
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset the scanner
  const resetScanner = () => {
    setData("");
  };

  return (
    <div
      className={`bg-gray-100 grow h-full py-6 px-4 ${
        lightTheme ? "" : "!bg-[#181C14]"
      }`}
    >
      <div
        className={`flex flex-col h-[calc(100vh-10vh)] bg-white rounded-2xl shadow-xl overflow-hidden ${
          lightTheme ? "" : "!bg-[#3C3D37]"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <h2
            className={`text-2xl font-bold flex items-center ${
              lightTheme ? "text-gray-800" : "text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 mr-2 text-blue-500"
            >
              <path d="M3 4.5a2.25 2.25 0 013-2.12V2.25h2.25v2.25H6A.75.75 0 006 6h2.25v2.25H6a2.25 2.25 0 010-4.5V2.25H3v2.25zm18 0v2.25h-2.25V9a2.25 2.25 0 010 4.5v2.25H21v-2.25a2.25 2.25 0 010-4.5V4.5h-2.25V2.25H21V4.5zm-6-2.25v2.25h2.25V4.5a2.25 2.25 0 010 4.5v2.25H15V9a2.25 2.25 0 010-4.5V2.25h2.25zM3 9v2.25h2.25V9A2.25 2.25 0 015.25 6H3v2.25A.75.75 0 003 9zm18 0a.75.75 0 00-.75-.75h-2.25v4.5h2.25A.75.75 0 0021 9zm-6-2.25h-2.25v6.75H15V6.75zm-6 4.5H6v2.25h2.25v-2.25A.75.75 0 008.25 9a.75.75 0 00-.75.75v1.5zm12 .75h-2.25v2.25H21v-2.25zM3 13.5v2.25h2.25v-2.25H3zm18 0v2.25h-2.25v-2.25H21zM9 18h2.25v2.25H9V18zm6 0h2.25v2.25H15V18zm-6-6h2.25v4.5H9v-4.5zm6 0h2.25v4.5H15v-4.5z" />
            </svg>
            Adda QR Scanner
          </h2>
          <p
            className={`mt-1 ${
              lightTheme ? "text-gray-600" : "text-gray-300"
            } text-sm`}
          >
            Point your camera at a QR code or upload an image to scan
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Camera View - Always Prominent */}
          <div className="flex-1 p-4 flex flex-col items-center justify-center">
            <div className="relative bg-black rounded-xl overflow-hidden shadow-lg flex items-center justify-center w-full max-w-lg h-80 sm:h-96 md:h-80">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-4 border-blue-500 border-opacity-50 rounded-xl pointer-events-none">
                <div className="absolute inset-0 border-2 border-dashed border-white border-opacity-40 rounded-lg m-2"></div>
              </div>
            </div>

            {/* Upload Button */}
            <div className="mt-4 w-full max-w-xs">
              <label
                htmlFor="upload"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium cursor-pointer flex items-center justify-center transition w-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                    clipRule="evenodd"
                  />
                </svg>
                Upload QR Code Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                id="upload"
                className="hidden"
              />
            </div>
          </div>

          {/* Results Panel */}
          <div
            className={`p-4 ${
              lightTheme ? "bg-gray-50" : "bg-[#2E2F2A]"
            } flex flex-col items-center`}
          >
            <div className="w-full max-w-lg">
              <h3
                className={`text-lg font-semibold mb-2 ${
                  lightTheme ? "text-gray-700" : "text-gray-200"
                }`}
              >
                Scan Results
              </h3>

              <div
                className={`rounded-lg p-4 ${
                  lightTheme ? "bg-white" : "bg-[#3C3D37]"
                } shadow-md`}
              >
                {data ? (
                  <div>
                    <div
                      className={`${
                        lightTheme ? "text-gray-800" : "text-white"
                      } break-all`}
                    >
                      <p
                        className={`text-sm ${
                          lightTheme ? "text-gray-500" : "text-gray-400"
                        } mb-1`}
                      >
                        Detected Content:
                      </p>
                      <p className="font-medium">{data}</p>
                    </div>

                    {data.startsWith("http") && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <a
                          href={data}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 hover:underline break-all text-sm"
                        >
                          Open URL: {data}
                        </a>
                      </div>
                    )}

                    <div className="flex justify-center mt-3">
                      <button
                        onClick={resetScanner}
                        className={`py-2 px-3 rounded text-sm ${
                          lightTheme
                            ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                            : "bg-gray-700 hover:bg-gray-600 text-white"
                        } transition`}
                      >
                        Clear Result
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p
                      className={`${
                        lightTheme ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      No QR code detected yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
